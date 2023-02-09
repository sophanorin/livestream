const EventEmitter = require("events").EventEmitter;
const { AwaitQueue } = require("awaitqueue");
const throttle = require("lodash.throttle");
const axios = require("axios");
const Logger = require("./logger/Logger");
const Lobby = require("./Lobby");
const BreakoutRoom = require("./BreakoutRoom");
const { SocketTimeoutError } = require("./helpers/errors");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const userRoles = require("./access/userRoles");

// mongoose models
const Document = require("../models/Document");
const LaTeX = require("../models/LaTeX");

const config = require("../config/config");

// Record
const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");
// Set the client to be used for the upload.
// AWS S3 global config
AWS.config.update({
    region: config.s3_config.region,
    accessKeyId: config.s3_config.accessKeyId,
    secretAccessKey: config.s3_config.secretAccessKey,
});
const s3Stream = require("s3-upload-stream")(new AWS.S3());

const { BYPASS_ROOM_LOCK, BYPASS_LOBBY } = require("./access/access");
const {
    REMOVE_BREAKOUT_ROOMS,
    JOIN_BREAKOUT_ROOM,
    ADD_BREAKOUT_ROOMS,
    ACCESS_QUIZ,
    SEND_QUIZ,
    SYNC_DATA,
    MARK_PRESENTATION_FILE,
} = require("./access/permissions");

const permissions = require("./access/permissions"),
    {
        CHANGE_ROOM_LOCK,
        PROMOTE_PEER,
        MODIFY_ROLE,
        SEND_CHAT,
        MODERATE_CHAT,
        SHARE_AUDIO,
        SHARE_VIDEO,
        SHARE_SCREEN,
        EXTRA_VIDEO,
        SHARE_FILE,
        MODERATE_FILES,
        MODERATE_ROOM,
        RECORD_ROOM,
        SHARED_YOUTUBE_VIDEO,
        CLASS_DOCUMENT,
        SAVE_CLASS_DOCUMENT,
        WHITEBOARD,
        LATEX,
        SAVE_LATEX,
        LOAD_LATEX,
        ACCESS_BREAKOUT_ROOMS,
    } = permissions;

const {
    SYNC_ROOM_DATA_INTERVAL_MS,
    SYNC_PEER_ACTIVITY_INTERVAL_MS,
    ActivityCode,
    SELF_DESTRUCT_COUNT_DOWN_TIMEOUT,
    UNLINKSYNC_TIME,
    ROUTER_SCALE_SIZE,
} = require("../constants/constants");

const syncPolicy = require("./access/syncPolicy");
const policy = require("./access/policy");

const logger = new Logger("Room");

// In case they are not configured properly
const roomAccess = {
    [BYPASS_ROOM_LOCK]: [userRoles.ADMIN],
    [BYPASS_LOBBY]: [userRoles.NORMAL],
    ...config.accessFromRoles,
};

const roomPermissions = {
    [CHANGE_ROOM_LOCK]: [userRoles.NORMAL],
    [PROMOTE_PEER]: [userRoles.NORMAL],
    [MODIFY_ROLE]: [userRoles.MODERATOR],
    [SEND_CHAT]: [userRoles.NORMAL],
    [MODERATE_CHAT]: [userRoles.MODERATOR],
    [SHARE_AUDIO]: [userRoles.NORMAL],
    [SHARE_VIDEO]: [userRoles.NORMAL],
    [SHARE_SCREEN]: [userRoles.NORMAL],
    [EXTRA_VIDEO]: [userRoles.NORMAL],
    [SHARE_FILE]: [userRoles.NORMAL],
    [MODERATE_FILES]: [userRoles.MODERATOR],
    [MODERATE_ROOM]: [userRoles.MODERATOR],
    ...config.permissionsFromRoles,
};

const roomAllowWhenRoleMissing = config.allowWhenRoleMissing || [];

class Room extends EventEmitter {
    static getLeastLoadedRouter(
        allMediasoupWorkersOnServer,
        allPeersOnServer,
        mediasoupRoutersOfRoom
    ) {
        const routerLoads = new Map();
        const workerLoads = new Map();
        const pipedRoutersIds = new Set();

        for (const peer of allPeersOnServer.values()) {
            const routerId = peer.routerId;

            if (routerId) {
                // checking which routers of this room are piped
                if (mediasoupRoutersOfRoom.has(routerId)) {
                    pipedRoutersIds.add(routerId);
                }

                // calculating the routers loads of all routers in use by peers
                if (routerLoads.has(routerId)) {
                    routerLoads.set(routerId, routerLoads.get(routerId) + 1);
                } else {
                    routerLoads.set(routerId, 1);
                }
            }
        }

        // calculating the worker loads of all workers based on router loads
        for (const worker of allMediasoupWorkersOnServer.values()) {
            for (const routerId of worker.appData.routers.keys()) {
                if (workerLoads.has(worker.pid)) {
                    workerLoads.set(
                        worker.pid,
                        workerLoads.get(worker.pid) +
                            (routerLoads.has(routerId)
                                ? routerLoads.get(routerId)
                                : 0)
                    );
                } else {
                    workerLoads.set(
                        worker.pid,
                        routerLoads.has(routerId)
                            ? routerLoads.get(routerId)
                            : 0
                    );
                }
            }
        }

        const sortedWorkerLoads = new Map(
            [...workerLoads.entries()].sort((a, b) => a[1] - b[1])
        );

        // we don't care if router is piped, just choose the least loaded worker
        if (
            pipedRoutersIds.size === 0 ||
            pipedRoutersIds.size === mediasoupRoutersOfRoom.size
        ) {
            const workerId = sortedWorkerLoads.keys().next().value;
            const worker = allMediasoupWorkersOnServer.get(workerId);

            for (const routerId of worker.appData.routers.keys()) {
                if (mediasoupRoutersOfRoom.has(routerId)) {
                    return routerId;
                }
            }
        } else {
            // find if there is a piped router that is on a worker that is below limit
            for (const [workerId, workerLoad] of sortedWorkerLoads.entries()) {
                const worker = allMediasoupWorkersOnServer.get(workerId);

                for (const routerId of worker.appData.routers.keys()) {
                    // we check if there is a piped router
                    // on a worker with its load below the limit,
                    if (
                        mediasoupRoutersOfRoom.has(routerId) &&
                        pipedRoutersIds.has(routerId) &&
                        workerLoad < ROUTER_SCALE_SIZE
                    ) {
                        return routerId;
                    }
                }
            }

            // no piped router found, we need to return the router
            // from least loaded worker
            const workerId = sortedWorkerLoads.keys().next().value;
            const worker = allMediasoupWorkersOnServer.get(workerId);

            for (const routerId of worker.appData.routers.keys()) {
                if (mediasoupRoutersOfRoom.has(routerId)) {
                    return routerId;
                }
            }
        }
    }
    /**
     * Factory function that creates and returns Room instance.
     *
     * @async
     *
     * @param {mediasoup.Worker} mediasoupWorkers - The mediasoup Worker in which a new
     *   mediasoup Router must be created.
     * @param {String} roomId - Id of the Room instance.
     */
    static async create({
        mediasoupWorkers,
        roomId,
        peers,
        io,
        // history,
    }) {
        logger.info('create() [roomId:"%s"]', roomId);

        // Router media codecs.
        const mediaCodecs = config.mediasoup.router.mediaCodecs;

        const mediasoupRouters = new Map();

        const audioLevelObservers = new Map();

        for (const worker of mediasoupWorkers.values()) {
            const router = await worker.createRouter({ mediaCodecs });

            mediasoupRouters.set(router.id, router);

            const audioLevelObserver = await router.createAudioLevelObserver({
                maxEntries: 1,
                threshold: -80,
                interval: 800,
            });

            audioLevelObservers.set(router.id, {
                audioLevelObserver: audioLevelObserver,
                peerId: null,
                volume: -1000,
            });
        }

        const room = new Room({
            roomId,
            mediasoupRouters,
            audioLevelObservers,
            mediasoupWorkers,
            peers,
            io,
            // history,
        });

        return room;
    }

    constructor({
        roomId,
        mediasoupRouters,
        audioLevelObservers,
        mediasoupWorkers,
        peers,
        io,
        history,
    }) {
        logger.info('constructor() [roomId:"%s"]', roomId);

        super();
        this.setMaxListeners(Infinity);

        this._uuid = uuidv4();

        this._mediasoupWorkers = mediasoupWorkers;

        this._allPeers = peers;

        // SocketIO Server
        this._io = io;

        // Room ID.
        this._roomId = roomId;

        // Room Encryption Key
        this._roomkey = null;

        // Token
        this._moderatorToken = null;

        this._moderatorId = null;

        // Closed flag.
        this._closed = false;

        // Joining queue
        this._queue = new AwaitQueue();

        // Locked flag.
        this._locked = false;

        // if true: accessCode is a possibility to open the room
        this._joinByAccesCode = true;

        // access code to the room,
        // applicable if ( _locked == true and _joinByAccessCode == true )
        this._accessCode = "";

        this._lobby = new Lobby();

        this._holdOn = new Lobby();

        this._chatHistory = history?.chats || [];

        this._fileHistory = history?.files || [];

        this._quizHistory = history?.quizzes || [];

        this._youtubeLinksHistory = history?.youtubeLinks || [];

        this._currentYoutubeLink = {
            url: null,
            progress: null,
            ownerId: null,
            status: null,
        };

        this._lastN = [];

        this._peers = {};

        this._joiningPeersLength = 0;

        this._selfDestructTimeout = null;

        // Array of mediasoup Router instances.
        this._mediasoupRouters = mediasoupRouters;

        // mediasoup AudioLevelObserver.
        this._audioLevelObservers = audioLevelObservers;

        // Current active speaker.
        this._currentActiveSpeaker = null;

        // Breakout rooms
        this._breakoutRooms = new Map();

        if (history?.breakoutRooms) {
            history?.breakoutRooms?.forEach((breakoutRoomHistory) => {
                this._addBreakoutRoom({
                    id: breakoutRoomHistory.id,
                    name: breakoutRoomHistory.name,
                    number: breakoutRoomHistory.number,
                    history: {
                        classDocument: breakoutRoomHistory.classDocument,
                        latex: breakoutRoomHistory.latex,
                        whiteboard: breakoutRoomHistory.whiteboard,
                        chats: breakoutRoomHistory.chats,
                        files: breakoutRoomHistory.files,
                        youtubeLinks: breakoutRoomHistory.youtubeLinks,
                        quizzes: breakoutRoomHistory.quizzes,
                    },
                });
            });
        }

        // Class Document
        this._delta = history?.classDocument || null;

        // Latex
        this._latex = history?.latex || "";

        // Whiteboard
        this._whiteboard = history?.whiteboard || null;

        // Record
        this._streamRecorder = null;
        this._s3Uploader = null;
        this._fileExtension = "webm";
        this._fileName = uuidv4();
        this._tmpRecordFilePath = null;
        this._url = null;
        this._key = this._fileName + "." + this._fileExtension;
        this._basePathRecordFiles =
            config.basePathRecordFiles || "./files/tmps";

        this._handleLobby();
        this._handleAudioLevelObserver();
        this._tokens = new Map();

        this.on("closeMeeting", () => {
            this.closeMeeting();
        });
    }

    breakoutRoomDatas() {
        const breakoutRoomDatas = [];

        this._breakoutRooms.forEach((value) => {
            breakoutRoomDatas.push(value.getBreakoutRoomDatas());
        });

        return breakoutRoomDatas;
    }

    isLocked() {
        return this._locked;
    }

    /**
     * Moderator Close Meeting
     *
     * @async
     */

    closeMeeting() {
        const rooms = this._io.sockets.adapter.rooms;

        rooms.forEach((value, key) => {
            if (key.includes(this._roomId)) {
                this._io.to(key).emit("notification", {
                    method: "moderator:kick",
                });
            }
        });

        this.close();
    }

    close() {
        logger.debug("close()");

        this._closed = true;

        this._queue.close();

        this._queue = null;

        if (this._selfDestructTimeout) clearTimeout(this._selfDestructTimeout);

        this._selfDestructTimeout = null;

        this._chatHistory = null;

        this._fileHistory = null;

        this._lobby.close();

        this._lobby = null;

        this._roomkey = null;

        this._breakoutRooms.clear();

        // Close the peers.
        for (const peer in this._peers) {
            if (!this._peers[peer].closed) this._peers[peer].close();
        }

        this._peers = null;

        // Close the mediasoup Routers.
        for (const router of this._mediasoupRouters.values()) {
            this._audioLevelObservers.get(router.id).audioLevelObserver.close();
            this._audioLevelObservers.get(router.id).audioLevelObserver = null;
            router.close();
        }

        this._allPeers = null;

        this._mediasoupWorkers = null;

        this._audioLevelObservers.clear();

        this._mediasoupRouters.clear();

        this._tokens.clear();

        this.unlinkSync(this._tmpRecordFilePathx);

        // Emit 'close' event.
        this.emit("close");
    }

    unlinkSync(path) {
        try {
            if (path) fs.unlinkSync(path);
        } catch (error) {
            logger.error("unlinkSync() error: %o", error);
        }
    }

    getToken(peerId) {
        return this._tokens.get(peerId);
    }

    verifyPeer({ id, token }) {
        try {
            const decoded = jwt.verify(token, this._uuid);

            logger.info('verifyPeer() [decoded:"%o"]', decoded);

            return decoded.id === id;
        } catch (err) {
            logger.warn("verifyPeer() | invalid token");
        }

        return false;
    }

    setModeratorAuth(id, token) {
        this._moderatorId = id;
        this._moderatorToken = token;
    }

    handlePeer({ peer, returning }) {
        logger.info(
            'handlePeer() [peer:"%s", roles:"%o", returning:"%s"]',
            peer.id,
            peer.roles,
            returning
        );

        // Should not happen
        if (this._peers[peer.id]) {
            logger.warn(
                'handleConnection() | there is already a peer with same peerId [peer:"%s"]',
                peer.id
            );
        }

        // Returning user
        if (returning) this._peerJoining(peer, returning);
        // Has a role that is allowed to bypass room lock
        else if (this._hasAccess(peer, BYPASS_ROOM_LOCK)) {
            this._peerJoining(peer);
        } else if (
            "maxUsersPerRoom" in config &&
            Object.keys(this._peers).length + this._lobby.peerList().length >=
                config.maxUsersPerRoom
        ) {
            this._handleOverRoomLimit(peer);
        } else if (this._locked) {
            this._parkPeer(peer);
        } else {
            this._hasAccess(peer, BYPASS_LOBBY)
                ? this._peerJoining(peer)
                : this._handleGuest(peer);
        }
    }

    _handleOverRoomLimit(peer) {
        this._sNotification(peer, "overRoomLimit");
    }

    _handleGuest(peer) {
        if (config.activateOnHostJoin && !this.checkEmpty())
            this._peerJoining(peer);
        else {
            this._parkPeer(peer);
            this._sNotification(peer, "signInRequired");
        }
    }

    _handleLobby() {
        this._lobby.on("promotePeer", (promotedPeer) => {
            logger.info('promotePeer() [promotedPeer:"%s"]', promotedPeer.id);

            const { id } = promotedPeer;

            this._peerJoining(promotedPeer);

            for (const peer of this._getAllowedPeers(PROMOTE_PEER)) {
                this._sNotification(peer, "lobby:promotedPeer", { peerId: id });
            }
            // this._holdPeer(promotedPeer);
        });

        this._lobby.on("peerRolesChanged", (peer) => {
            // Has a role that is allowed to bypass room lock
            if (this._hasAccess(peer, BYPASS_ROOM_LOCK)) {
                this._lobby.promotePeer(peer.id);

                return;
            }

            if (
                // Has a role that is allowed to bypass lobby
                !this._locked &&
                this._hasAccess(peer, BYPASS_LOBBY)
            ) {
                this._lobby.promotePeer(peer.id);

                return;
            }
        });

        this._lobby.on("changeDisplayName", (changedPeer) => {
            const { id, displayName } = changedPeer;

            for (const peer of this._getAllowedPeers(PROMOTE_PEER)) {
                this._sNotification(peer, "lobby:changeDisplayName", {
                    peerId: id,
                    displayName,
                });
            }
        });

        this._lobby.on("changePicture", (changedPeer) => {
            const { id, picture } = changedPeer;

            for (const peer of this._getAllowedPeers(PROMOTE_PEER)) {
                this._sNotification(peer, "lobby:changePicture", {
                    peerId: id,
                    picture,
                });
            }
        });

        this._lobby.on("peerClosed", (closedPeer) => {
            logger.info('peerClosed() [closedPeer:"%s"]', closedPeer.id);

            const { id } = closedPeer;

            for (const peer of this._getAllowedPeers(PROMOTE_PEER)) {
                this._sNotification(peer, "lobby:peerClosed", { peerId: id });
            }
        });

        // If nobody left in lobby we should check if room is empty too and initiating
        // rooms selfdestruction sequence
        this._lobby.on("lobbyEmpty", () => {
            if (this.checkEmpty()) {
                this.selfDestructCountdown();
            }
        });
    }

    _handleAudioLevelObserver() {
        this._audioLevelObservers.forEach((audioLevelObject, routerId) => {
            // Set audioLevelObserver events.
            audioLevelObject.audioLevelObserver.on("volumes", (volumes) => {
                const { producer, volume } = volumes[0];

                const audioLevelObj = this._audioLevelObservers.get(routerId);

                audioLevelObj.peerId = producer.appData.peerId;
                audioLevelObj.volume = volume;
                this._sendActiveSpeakerInfo();
            });

            audioLevelObject.audioLevelObserver.on("silence", () => {
                const audioLevelObj = this._audioLevelObservers.get(routerId);

                audioLevelObj.peerId = null;
                audioLevelObj.volume = -1000;
                this._sendActiveSpeakerInfo();
            });
        });
    }

    logStatus() {
        logger.info(
            'logStatus() [room id:"%s", peers:"%s"]',
            this._roomId,
            Object.keys(this._peers).length
        );
    }

    dump() {
        return {
            roomId: this._roomId,
            roomKey: this._roomkey,
            peers: Object.keys(this._peers).length,
            peerJoining: this._joiningPeersLength,
        };
    }

    get id() {
        return this._roomId;
    }

    selfDestructCountdown() {
        logger.debug("selfDestructCountdown() started");

        if (this._selfDestructTimeout) clearTimeout(this._selfDestructTimeout);

        this._selfDestructTimeout = setTimeout(() => {
            if (this._closed) return;

            if (
                this.checkEmpty() &&
                this._lobby.checkEmpty() &&
                this.checkBreakoutRoomEmpty()
            ) {
                logger.info(
                    'Room deserted for some time, closing the room [roomId:"%s"]',
                    this._roomId
                );
                this.close();
            } else
                logger.debug(
                    "selfDestructCountdown() aborted; room is not empty!"
                );
        }, SELF_DESTRUCT_COUNT_DOWN_TIMEOUT);
    }

    checkBreakoutRoomEmpty() {
        return Array.from(this._breakoutRooms.values()).some((breakoutRoom) =>
            breakoutRoom.checkEmpty()
        );
    }

    checkEmpty() {
        return Object.keys(this._peers).length === 0;
    }

    _holdPeer(peer, returning = false) {
        this._holdOn.holdPeer(peer, () => {
            this._peerJoining(peer, returning);
        });
    }

    _parkPeer(parkPeer) {
        this._lobby.parkPeer(parkPeer);

        for (const peer of this._getAllowedPeers(PROMOTE_PEER)) {
            this._sNotification(peer, "parkedPeer", {
                peerId: parkPeer.id,
                displayName: parkPeer.displayName,
                picture: parkPeer.picture,
            });
        }
    }

    _peerJoining(peer, returning = false) {
        this._queue
            .push(async () => {
                peer.socket.join(this._roomId);

                // If we don't have this peer, add to end
                !this._lastN.includes(peer.id) && this._lastN.push(peer.id);

                this._peers[peer.id] = peer;

                // Assign routerId
                peer.routerId = await this._getRouterId();

                this._handlePeer(peer);

                if (returning) {
                    this._sNotification(peer, "roomBack");
                } else {
                    const token = jwt.sign({ id: peer.id }, this._uuid, {
                        noTimestamp: true,
                    });

                    this._tokens.set(peer.id, token);

                    let turnServers;

                    if ("turnAPIURI" in config) {
                        try {
                            const { data } = await axios.get(
                                config.turnAPIURI,
                                {
                                    timeout: config.turnAPITimeout || 2000,
                                    proxy: config.turnAPIProxy
                                        ? config.turnAPIProxy
                                        : null,
                                    params: {
                                        ...config.turnAPIparams,
                                        api_key: config.turnAPIKey,
                                        ip: peer.socket.request.connection
                                            .remoteAddress,
                                    },
                                }
                            );

                            turnServers = [
                                {
                                    urls: data.uris,
                                    username: data.username,
                                    credential: data.password,
                                },
                            ];
                        } catch (error) {
                            if ("backupTurnServers" in config)
                                turnServers = config.backupTurnServers;

                            logger.error(
                                '_peerJoining() | error on REST turn [error:"%o"]',
                                error
                            );
                        }
                    } else if ("backupTurnServers" in config) {
                        turnServers = config.backupTurnServers;
                    }

                    this._sNotification(peer, "roomReady", {
                        turnServers: turnServers,
                    });

                    // Mark the new Peer as joined.
                    // peer.joined = true;

                    if (
                        config.activateOnHostJoin &&
                        this._lobby.peerList().length > 0 &&
                        !this._locked &&
                        peer.roles.some((role) =>
                            config.permissionsFromRoles.PROMOTE_PEER.includes(
                                role
                            )
                        )
                    ) {
                        this._lobby.promoteAllPeers();
                    }
                }
            })
            .catch((error) => {
                logger.error('_peerJoining() [error:"%o"]', error);
            });
    }

    _handlePeer(peer) {
        logger.debug('_handlePeer() [peer:"%s"]', peer.id);

        peer.on("close", () => {
            this._handlePeerClose(peer);
        });

        peer.on("displayNameChanged", ({ oldDisplayName }) => {
            // Ensure the Peer is joined.
            if (!peer.joined) return;

            // Spread to others
            this._sNotification(
                peer,
                "changeDisplayName",
                {
                    peerId: peer.id,
                    displayName: peer.displayName,
                    oldDisplayName: oldDisplayName,
                },
                true
            );
        });

        peer.on("pictureChanged", () => {
            // Ensure the Peer is joined.
            if (!peer.joined) return;

            // Spread to others
            this._sNotification(
                peer,
                "changePicture",
                {
                    peerId: peer.id,
                    picture: peer.picture,
                },
                true
            );
        });

        peer.on("gotRole", ({ newRole }) => {
            // Ensure the Peer is joined.
            if (!peer.joined) return;

            // Spread to others
            this._sNotification(
                peer,
                "gotRole",
                {
                    peerId: peer.id,
                    roleId: newRole.id,
                },
                true,
                true
            );

            // Got permission to promote peers, notify peer of
            // peers in lobby
            if (
                roomPermissions.PROMOTE_PEER.some(
                    (role) => role.id === newRole.id
                )
            ) {
                const lobbyPeers = this._lobby.peerList();

                lobbyPeers.length > 0 &&
                    this._sNotification(peer, "parkedPeers", {
                        lobbyPeers,
                    });
            }
        });

        peer.on("lostRole", ({ oldRole }) => {
            // Ensure the Peer is joined.
            if (!peer.joined) return;

            // Spread to others
            this._sNotification(
                peer,
                "lostRole",
                {
                    peerId: peer.id,
                    roleId: oldRole.id,
                },
                true,
                true
            );
        });

        peer.socket.on("request", (request, cb) => {
            logger.debug(
                'Peer "request" event [method:"%s", peerId:"%s"]',
                request.method,
                peer.id
            );

            this._handleSocketRequest(peer, request, cb).catch((error) => {
                logger.error('"request" failed [error:"%o"]', error);

                cb(error);
            });
        });

        peer.socket.on("join-room", (roomID) => {
            if (this._io.sockets.adapter.rooms.get(roomID).size <= 1) {
                this._io.to(`${peer.socket.id}`).emit("first-in-room");
            } else {
                peer.socket.broadcast
                    .to(roomID)
                    .emit("new-user", peer.socket.id);
            }

            this._io
                .in(roomID)
                .emit(
                    "room-user-change",
                    Array.from(this._io.sockets.adapter.rooms.get(roomID))
                );
        });

        peer.socket.on("server-broadcast", (roomID, encryptedData, iv) => {
            peer.socket.broadcast
                .to(roomID)
                .emit("client-broadcast", encryptedData, iv);
        });

        peer.socket.on(
            "server-volatile-broadcast",
            (roomID, encryptedData, iv) => {
                peer.socket.broadcast
                    .to(roomID)
                    .emit("client-broadcast", encryptedData, iv);
            }
        );

        // Peer left before we were done joining
        if (peer.closed) this._handlePeerClose(peer);
    }

    _handlePeerClose(peer) {
        logger.debug('_handlePeerClose() [peer:"%s"]', peer.id);

        if (peer.joinedBreakoutRoom) {
            this.leaveBreakoutRoom(peer.breakoutRoomId, peer);
        }

        if (this._closed) return;

        // If the Peer was joined, notify all Peers.
        if (peer.joined)
            this._sNotification(peer, "peerClosed", { peerId: peer.id }, true);

        // Remove from lastN
        if (peer.joinedBreakoutRoom) {
            this._breakoutRooms.get(peer.breakoutRoomId).removeLastN(peer.id);
        } else {
            this._lastN = this._lastN.filter((id) => id !== peer.id);
        }

        // Need this to know if this peer was the last with PROMOTE_PEER
        const hasPromotePeer = peer.roles.some((role) =>
            roomPermissions[PROMOTE_PEER].some(
                (roomRole) => role.id === roomRole.id
            )
        );

        delete this._peers[peer.id];

        // No peers left with PROMOTE_PEER, might need to give
        // lobbyPeers to peers that are left.
        if (
            hasPromotePeer &&
            !this._lobby.checkEmpty() &&
            roomAllowWhenRoleMissing.includes(PROMOTE_PEER) &&
            this._getPeersWithPermission(PROMOTE_PEER).length === 0
        ) {
            const lobbyPeers = this._lobby.peerList();

            for (const allowedPeer of this._getAllowedPeers(PROMOTE_PEER)) {
                this._sNotification(allowedPeer, "parkedPeers", { lobbyPeers });
            }
        }

        // If this is the last Peer in the room and
        // lobby is empty, close the room after a while.
        if (
            this.checkEmpty() &&
            this._lobby.checkEmpty() &&
            this.checkBreakoutRoomEmpty()
        )
            this.selfDestructCountdown();
    }

    async _handleSocketRequest(peer, request, cb) {
        const router = this._mediasoupRouters.get(peer.routerId);
        let peerBreakoutRoom = null;

        if (peer.joinedBreakoutRoom) {
            peerBreakoutRoom = this._breakoutRooms.get(peer.breakoutRoomId);
        }

        switch (request.method) {
            case "getRouterRtpCapabilities": {
                cb(null, router.rtpCapabilities);

                break;
            }

            case "join": {
                // Ensure the Peer is not already joined.
                // if (peer.joined) throw new Error("Peer already joined");

                const { rtpCapabilities, returning, userInfo } = request.data;

                //update peer info
                peer.setPeerInfo(userInfo);

                // Store client data into the Peer data object.
                peer.rtpCapabilities = rtpCapabilities;

                // Breakout rooms
                let breakoutRooms = {};

                for (const [key, value] of this._breakoutRooms) {
                    breakoutRooms[key] = value.breakoutRoomInfo;
                }

                // Tell the new Peer about already joined Peers.
                // And also create Consumers for existing Producers.

                const joinedPeers = this.getJoinedPeers(peer);

                const peerInfos = joinedPeers.map(
                    (joinedPeer) => joinedPeer.peerInfo
                );

                let lobbyPeers = [];

                // Allowed to promote peers, notify about lobbypeers
                if (this._hasPermission(peer, PROMOTE_PEER))
                    lobbyPeers = this._lobby.peerList();

                logger.debug("breakoutRooms %s", breakoutRooms);

                let quizHistory = this.getQuizHistory(peer, this._quizHistory);

                cb(null, {
                    peerId: peer.id,
                    roles: peer.roles.map((role) => role.id),
                    peers: peerInfos,
                    tracker: config.fileTracker,
                    authenticated: peer.authenticated,
                    roomPermissions: roomPermissions,
                    userRoles: userRoles,
                    allowWhenRoleMissing: roomAllowWhenRoleMissing,
                    chatHistory: this._chatHistory,
                    fileHistory: this._fileHistory,
                    lastNHistory: this._lastN,
                    quizHistory: quizHistory,
                    locked: this._locked,
                    lobbyPeers: lobbyPeers,
                    accessCode: this._accessCode,
                    currentYoutubeLink: this._currentYoutubeLink,
                    breakoutRooms: breakoutRooms,
                    roomKey: this._roomkey,
                    picture: peer.picture,
                });

                // Mark the new Peer as joined.
                peer.joined = true;

                // for other self
                for (const joinedPeer of joinedPeers) {
                    // Create Consumers for existing Producers.
                    for (const producer of joinedPeer.producers.values()) {
                        this._createConsumer({
                            consumerPeer: peer,
                            producerPeer: joinedPeer,
                            producer,
                        });
                    }
                }

                // for other peers
                // Optimization: Create a server-side Consumer for each Peer.
                // for (const joinedPeer of joinedPeers) {
                //     for (const producer of peer.producers.values()) {
                //         this._createConsumer({
                //             consumerPeer: joinedPeer,
                //             producerPeer: peer,
                //             producer,
                //         });
                //     }
                // }

                // Notify the new Peer to all other Peers.
                for (const otherPeer of this.getJoinedPeers(peer)) {
                    this._sNotification(otherPeer, "newPeer", {
                        ...peer.peerInfo,
                        returning,
                    });
                }

                logger.debug(
                    'peer joined [peer: "%s", displayName: "%s"',
                    peer.id,
                    peer.displayName
                );

                break;
            }

            case "createWebRtcTransport": {
                // NOTE: Don't require that the Peer is joined here, so the client can
                // initiate mediasoup Transports and be ready when he later joins.

                const { forceTcp, producing, consuming } = request.data;

                const webRtcTransportOptions = {
                    ...config.mediasoup.webRtcTransport,
                    appData: { producing, consuming },
                };

                webRtcTransportOptions.enableTcp = true;

                if (forceTcp) webRtcTransportOptions.enableUdp = false;
                else {
                    webRtcTransportOptions.enableUdp = true;
                    webRtcTransportOptions.preferUdp = true;
                }

                const transport = await router.createWebRtcTransport(
                    webRtcTransportOptions
                );

                transport.on("dtlsstatechange", (dtlsState) => {
                    if (dtlsState === "failed" || dtlsState === "closed")
                        logger.warn(
                            'WebRtcTransport "dtlsstatechange" event [dtlsState:%s]',
                            dtlsState
                        );
                });

                // Store the WebRtcTransport into the Peer data Object.
                peer.addTransport(transport.id, transport);

                cb(null, {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                });

                const { maxIncomingBitrate } = config.mediasoup.webRtcTransport;

                // If set, apply max incoming bitrate limit.
                if (maxIncomingBitrate) {
                    try {
                        await transport.setMaxIncomingBitrate(
                            maxIncomingBitrate
                        );
                    } catch (error) {
                        logger.error(
                            'CreateWebRtcTransport transport.setMaxIncomingBitrate ERROR [roomId:"%s", maxIncomingBitrate:"%s", transportId:"%s", error:"%o"]',
                            this._roomId,
                            maxIncomingBitrate,
                            transport.id,
                            error
                        );
                    }
                }

                break;
            }

            case "connectWebRtcTransport": {
                const { transportId, dtlsParameters } = request.data;
                const transport = peer.getTransport(transportId);

                if (!transport)
                    throw new Error(
                        `transport with id "${transportId}" not found`
                    );

                await transport.connect({ dtlsParameters });

                cb();

                break;
            }

            case "restartIce": {
                const { transportId } = request.data;
                const transport = peer.getTransport(transportId);

                if (!transport)
                    throw new Error(
                        `transport with id "${transportId}" not found`
                    );

                const iceParameters = await transport.restartIce();

                cb(null, iceParameters);

                break;
            }

            case "produce": {
                let { appData } = request.data;

                if (
                    !appData.source ||
                    !["mic", "webcam", "screen", "extravideo"].includes(
                        appData.source
                    )
                )
                    throw new Error("invalid producer source");

                if (
                    appData.source === "mic" &&
                    !this._hasPermission(peer, SHARE_AUDIO)
                )
                    throw new Error("peer not authorized");

                if (
                    appData.source === "webcam" &&
                    !this._hasPermission(peer, SHARE_VIDEO)
                )
                    throw new Error("peer not authorized");

                if (
                    appData.source === "screen" &&
                    !this._hasPermission(peer, SHARE_SCREEN)
                )
                    throw new Error("peer not authorized");

                if (
                    appData.source === "extravideo" &&
                    !this._hasPermission(peer, EXTRA_VIDEO)
                )
                    throw new Error("peer not authorized");

                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { transportId, kind, rtpParameters } = request.data;
                const transport = peer.getTransport(transportId);

                if (!transport)
                    throw new Error(
                        `transport with id "${transportId}" not found`
                    );

                // Add peerId into appData to later get the associated Peer during
                // the 'loudest' event of the audioLevelObserver.
                appData = { ...appData, peerId: peer.id };

                const producer = await transport.produce({
                    kind,
                    rtpParameters,
                    appData,
                });

                const pipeRouters = this._getRoutersToPipeTo(peer.routerId);

                for (const [routerId, destinationRouter] of this
                    ._mediasoupRouters) {
                    if (pipeRouters.includes(routerId)) {
                        await router.pipeToRouter({
                            producerId: producer.id,
                            router: destinationRouter,
                        });
                    }
                }

                // Store the Producer into the Peer data Object.
                peer.addProducer(producer.id, producer);

                // Set Producer events.
                producer.on("score", (score) => {
                    this._sNotification(peer, "producerScore", {
                        producerId: producer.id,
                        score,
                    });
                });

                producer.on("videoorientationchange", (videoOrientation) => {
                    logger.debug(
                        'producer "videoorientationchange" event [producerId:"%s", videoOrientation:"%o"]',
                        producer.id,
                        videoOrientation
                    );
                });

                cb(null, { id: producer.id });

                let otherPeers = this.getJoinedPeers(peer);

                if (peer.joinedBreakoutRoom) {
                    otherPeers = this.getJoinedBreakoutRoomPeers(
                        peer.breakoutRoomId,
                        peer
                    );
                }

                // Optimization: Create a server-side Consumer for each Peer.
                for (const otherPeer of otherPeers) {
                    this._createConsumer({
                        consumerPeer: otherPeer,
                        producerPeer: peer,
                        producer,
                    });
                }

                // Add into the audioLevelObserver.
                if (kind === "audio") {
                    this._audioLevelObservers
                        .get(peer.routerId)
                        .audioLevelObserver.addProducer({
                            producerId: producer.id,
                        })
                        .catch((error) => {
                            logger.error(
                                'audioLevelObserver addProducer ERROR [roomId:"%s", peerId:"%s", routerId:"%s", producerId:"%s", error:"%o"]',
                                this._roomId,
                                peer.id,
                                peer.routerId,
                                producer.id,
                                error
                            );
                        });
                }

                break;
            }

            case "closeProducer": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { producerId } = request.data;
                const producer = peer.getProducer(producerId);

                if (!producer)
                    throw new Error(
                        `producer with id "${producerId}" not found`
                    );

                this._audioLevelObservers
                    .get(peer.routerId)
                    .audioLevelObserver.removeProducer({
                        producerId: producer.id,
                    })
                    .catch((error) => {
                        logger.error(
                            'audioLevelObserver removeProducer ERROR [roomId:"%s", peerId:"%s", routerId:"%s", producerId:"%s", error:"%o"]',
                            this._roomId,
                            peer.id,
                            peer.routerId,
                            producer.id,
                            error
                        );
                    });

                producer.close();

                // Remove from its map.
                peer.removeProducer(producer.id);

                cb();

                break;
            }

            case "pauseProducer": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { producerId } = request.data;
                const producer = peer.getProducer(producerId);

                if (!producer)
                    throw new Error(
                        `producer with id "${producerId}" not found`
                    );

                await producer.pause();

                cb();

                break;
            }

            case "resumeProducer": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { producerId } = request.data;
                const producer = peer.getProducer(producerId);

                if (!producer)
                    throw new Error(
                        `producer with id "${producerId}" not found`
                    );

                await producer.resume();

                cb();

                break;
            }

            case "pauseConsumer": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { consumerId } = request.data;
                const consumer = peer.getConsumer(consumerId);

                if (!consumer)
                    throw new Error(
                        `consumer with id "${consumerId}" not found`
                    );

                await consumer.pause();

                cb();

                break;
            }

            case "resumeConsumer": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { consumerId } = request.data;
                const consumer = peer.getConsumer(consumerId);

                if (!consumer)
                    throw new Error(
                        `consumer with id "${consumerId}" not found`
                    );

                await consumer.resume();

                cb();

                break;
            }

            case "setConsumerPreferedLayers": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { consumerId, spatialLayer, temporalLayer } =
                    request.data;
                const consumer = peer.getConsumer(consumerId);

                if (!consumer)
                    throw new Error(
                        `consumer with id "${consumerId}" not found`
                    );

                await consumer.setPreferredLayers({
                    spatialLayer,
                    temporalLayer,
                });

                cb();

                break;
            }

            case "setConsumerPriority": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { consumerId, priority } = request.data;
                const consumer = peer.getConsumer(consumerId);

                if (!consumer)
                    throw new Error(
                        `consumer with id "${consumerId}" not found`
                    );

                await consumer.setPriority(priority);

                cb();

                break;
            }

            case "requestConsumerKeyFrame": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { consumerId } = request.data;
                const consumer = peer.getConsumer(consumerId);

                if (!consumer)
                    throw new Error(
                        `consumer with id "${consumerId}" not found`
                    );

                await consumer.requestKeyFrame();

                cb();

                break;
            }

            case "getTransportStats": {
                const { transportId } = request.data;
                const transport = peer.getTransport(transportId);

                if (!transport)
                    throw new Error(
                        `transport with id "${transportId}" not found`
                    );

                const stats = await transport.getStats();

                cb(null, stats);

                break;
            }

            case "getProducerStats": {
                const { producerId } = request.data;
                const producer = peer.getProducer(producerId);

                if (!producer)
                    throw new Error(
                        `producer with id "${producerId}" not found`
                    );

                const stats = await producer.getStats();

                cb(null, stats);

                break;
            }

            case "getConsumerStats": {
                const { consumerId } = request.data;
                const consumer = peer.getConsumer(consumerId);

                if (!consumer)
                    throw new Error(
                        `consumer with id "${consumerId}" not found`
                    );

                const stats = await consumer.getStats();

                cb(null, stats);

                break;
            }

            case "changeDisplayName": {
                // Ensure the Peer is joined.
                if (!peer.joined) throw new Error("Peer not yet joined");

                const { displayName } = request.data;

                peer.displayName = displayName;

                // This will be spread through events from the peer object

                // Return no error
                cb();

                break;
            }

            case "chatMessage": {
                if (!this._hasPermission(peer, SEND_CHAT))
                    throw new Error("peer not authorized");

                const { chatMessage } = request.data;

                if (peer.joinedBreakoutRoom) {
                    this._breakoutRooms
                        .get(peer.breakoutRoomId)
                        .addChat(chatMessage);
                } else {
                    this._chatHistory.push(chatMessage);
                }

                // Spread to others
                this._sNotification(
                    peer,
                    "chatMessage",
                    {
                        peerId: peer.id,
                        chatMessage: chatMessage,
                    },
                    true
                );

                // Return no error
                cb();

                break;
            }

            case "moderator:giveRole": {
                if (!this._hasPermission(peer, MODIFY_ROLE))
                    throw new Error("peer not authorized");

                const { peerId, roleId } = request.data;

                const userRole = Object.values(userRoles).find(
                    (role) => role.id === roleId
                );

                if (!userRole || !userRole.promotable)
                    throw new Error("no such role");

                if (!peer.roles.some((role) => role.level >= userRole.level))
                    throw new Error("peer not authorized for this level");

                const giveRolePeer = this._peers[peerId];

                if (!giveRolePeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                // This will propagate the event automatically
                giveRolePeer.addRole(userRole);

                // Return no error
                cb();

                break;
            }

            case "moderator:removeRole": {
                if (!this._hasPermission(peer, MODIFY_ROLE))
                    throw new Error("peer not authorized");

                const { peerId, roleId } = request.data;

                const userRole = Object.values(userRoles).find(
                    (role) => role.id === roleId
                );

                if (!userRole || !userRole.promotable)
                    throw new Error("no such role");

                if (!peer.roles.some((role) => role.level >= userRole.level))
                    throw new Error("peer not authorized for this level");

                const removeRolePeer = this._peers[peerId];

                if (!removeRolePeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                // This will propagate the event automatically
                removeRolePeer.removeRole(userRole);

                // Return no error
                cb();

                break;
            }

            case "moderator:clearChat": {
                if (!this._hasPermission(peer, MODERATE_CHAT))
                    throw new Error("peer not authorized");

                if (peer.joinedBreakoutRoom) {
                    this._breakoutRooms.get(peer.breakoutRoomId).clearChat();
                } else {
                    this._chatHistory = [];
                }

                // Spread to others
                this._sNotification(peer, "moderator:clearChat", null, true);

                // Return no error
                cb();

                break;
            }

            case "lockRoom": {
                if (!this._hasPermission(peer, CHANGE_ROOM_LOCK))
                    throw new Error("peer not authorized");

                this._locked = true;

                // Spread to others
                this._sNotification(
                    peer,
                    "lockRoom",
                    {
                        peerId: peer.id,
                    },
                    true
                );

                // Return no error
                cb();

                break;
            }

            case "unlockRoom": {
                if (!this._hasPermission(peer, CHANGE_ROOM_LOCK))
                    throw new Error("peer not authorized");

                this._locked = false;

                // Spread to others
                this._sNotification(
                    peer,
                    "unlockRoom",
                    {
                        peerId: peer.id,
                    },
                    true
                );

                // Return no error
                cb();

                break;
            }

            case "setAccessCode": {
                const { accessCode } = request.data;

                this._accessCode = accessCode;

                // Spread to others
                // if (request.public) {
                this._sNotification(
                    peer,
                    "setAccessCode",
                    {
                        peerId: peer.id,
                        accessCode: accessCode,
                    },
                    true
                );
                // }

                // Return no error
                cb();

                break;
            }

            case "setJoinByAccessCode": {
                const { joinByAccessCode } = request.data;

                this._joinByAccessCode = joinByAccessCode;

                // Spread to others
                this._sNotification(
                    peer,
                    "setJoinByAccessCode",
                    {
                        peerId: peer.id,
                        joinByAccessCode: joinByAccessCode,
                    },
                    true
                );

                // Return no error
                cb();

                break;
            }

            case "promotePeer": {
                if (!this._hasPermission(peer, PROMOTE_PEER))
                    throw new Error("peer not authorized");

                const { peerId } = request.data;

                this._lobby.promotePeer(peerId);

                // Return no error
                cb();

                break;
            }

            case "promoteAllPeers": {
                if (!this._hasPermission(peer, PROMOTE_PEER))
                    throw new Error("peer not authorized");

                this._lobby.promoteAllPeers();

                // Return no error
                cb();

                break;
            }

            case "sendFile": {
                if (!this._hasPermission(peer, SHARE_FILE))
                    throw new Error("peer not authorized");

                // const { magnetUri, time } = request.data;
                const file = request.data;

                if (peer.joinedBreakoutRoom) {
                    this._breakoutRooms
                        .get(peer.breakoutRoomId)
                        .addFile({ ...file });
                } else {
                    this._fileHistory.push({ ...file });
                }

                // Spread to others
                this._sNotification(peer, "sendFile", { ...file }, true);

                // Return no error
                cb();

                break;
            }

            case "raisedHand": {
                const { raisedHand } = request.data;

                peer.raisedHand = raisedHand;

                // Spread to others
                this._sNotification(
                    peer,
                    "raisedHand",
                    {
                        peerId: peer.id,
                        raisedHand: raisedHand,
                        raisedHandTimestamp: peer.raisedHandTimestamp,
                    },
                    true
                );

                if (this._hasPermission(peer, SYNC_DATA)) {
                    logger.debug("raisedHand syncing");
                }

                logger.debug("raisedHand");

                cb();

                break;
            }

            case "moderator:mute": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                const { peerId } = request.data;

                const mutePeer = this._peers[peerId];

                if (!mutePeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                this._sNotification(mutePeer, "moderator:mute");

                cb();

                break;
            }

            case "moderator:muteAll": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                // Spread to others
                this._sNotification(peer, "moderator:mute", null, true);

                cb();

                break;
            }

            case "moderator:stopVideo": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                const { peerId } = request.data;

                const stopVideoPeer = this._peers[peerId];

                if (!stopVideoPeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                this._sNotification(stopVideoPeer, "moderator:stopVideo");

                cb();

                break;
            }

            case "moderator:stopAllVideo": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                // Spread to others
                this._sNotification(peer, "moderator:stopVideo", null, true);

                cb();

                break;
            }

            case "moderator:stopAllScreenSharing": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                // Spread to others
                this._sNotification(
                    peer,
                    "moderator:stopScreenSharing",
                    null,
                    true
                );

                cb();

                break;
            }

            case "moderator:stopScreenSharing": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                const { peerId } = request.data;

                const stopVideoPeer = this._peers[peerId];

                if (!stopVideoPeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                this._sNotification(
                    stopVideoPeer,
                    "moderator:stopScreenSharing"
                );

                cb();

                break;
            }

            case "moderator:closeMeeting": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                this._sNotification(peer, "moderator:kick", null, true, true);

                cb();

                // gateway.closeMeeting(this._roomId);

                // Close the room
                this.close();

                break;
            }

            case "moderator:kickPeer": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                const { peerId } = request.data;

                const kickPeer = this._peers[peerId];

                if (!kickPeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                this._sNotification(kickPeer, "moderator:kick");

                kickPeer.close();

                cb();

                break;
            }

            case "moderator:lowerHand": {
                if (!this._hasPermission(peer, MODERATE_ROOM))
                    throw new Error("peer not authorized");

                const { peerId } = request.data;

                const lowerPeer = this._peers[peerId];

                if (!lowerPeer)
                    throw new Error(`peer with id "${peerId}" not found`);

                this._sNotification(lowerPeer, "moderator:lowerHand");

                cb();

                break;
            }

            case "moderator:recording": {
                const { method, data } = request.data;

                if (!this._hasPermission(peer, RECORD_ROOM))
                    throw new Error("peer not authorized");

                logger.debug("record state changed to state: %O", method);

                if (!peer) {
                    throw new Error(`Peer with id "${peer.id}" not found`);
                }

                switch (method) {
                    case "start":
                        this._fileExtension = data.extension;
                        this._fileName = this._roomId;

                        // S3 bucket key
                        this._key = this._fileName + "." + this._fileExtension;

                        // tmp data store
                        this._tmpRecordFilePath = path.join(
                            this._basePathRecordFiles,
                            this._key
                        );

                        this._sNotification(
                            peer,
                            "moderator:recording",
                            {
                                peerId: peer.id,
                                recordingState: method,
                            },
                            true
                        );

                        break;
                    case "stop":
                        await this._stopRecord();

                        this._sNotification(
                            peer,
                            "moderator:recording",
                            {
                                peerId: peer.id,
                                recordingState: method,
                            },
                            true
                        );

                        break;
                    case "pause":
                        this._pauseRecord();

                        this._sNotification(
                            peer,
                            "moderator:recording",
                            {
                                peerId: peer.id,
                                recordingState: method,
                            },
                            true
                        );
                        break;
                    case "resume":
                        this._resumeRecord();

                        this._sNotification(
                            peer,
                            "moderator:recording",
                            {
                                peerId: peer.id,
                                recordingState: method,
                            },
                            true
                        );
                        break;
                    case "buffer":
                        const fileBuffer = Buffer.from(
                            data.buffer.b64,
                            "base64"
                        );
                        this._bufferRecord(fileBuffer);
                        break;

                    default:
                        break;
                }
                cb();
                break;
            }

            case "shareScreen": {
                const { disable } = request.data;

                this._sNotification(
                    peer,
                    disable ? "unpin" : "pin",
                    {
                        peerId: peer.id,
                    },
                    true
                );
                cb();
                break;
            }

            case "classDocument": {
                try {
                    const { method } = request.data;

                    if (!this._hasPermission(peer, CLASS_DOCUMENT))
                        throw new Error("peer not authorized");

                    logger.debug("Document state changed to state: %O", method);

                    if (!peer) {
                        throw new Error(`Peer with id "${peer.id}" not found`);
                    }

                    switch (method) {
                        case "open": {
                            this._sNotification(
                                peer,
                                "classDocument",
                                {
                                    method: "open",
                                },
                                true
                            );
                            break;
                        }
                        case "close": {
                            this._sNotification(
                                peer,
                                "classDocument",
                                {
                                    method: "close",
                                    peerId: peer.id,
                                },
                                true
                            );
                            break;
                        }

                        case "load": {
                            this._sNotification(peer, "classDocument", {
                                method: "load",
                                delta: this._delta,
                            });
                            break;
                        }

                        case "text-change": {
                            const { delta, source } = request.data;

                            this._sNotification(
                                peer,
                                "classDocument",
                                {
                                    method: "text-change",
                                    delta: delta,
                                },
                                true
                            );

                            // caching on server
                            this._delta = source;
                            break;
                        }

                        case "selection-change": {
                            const { range, peer: peerInfo } = request.data;
                            this._sNotification(
                                peer,
                                "classDocument",
                                {
                                    method: "selection-change",
                                    range: range,
                                    peer: peerInfo,
                                },
                                true
                            );
                            break;
                        }

                        default:
                            logger.error("Unknown method requested");
                            break;
                    }
                } catch (error) {
                    logger.error(
                        "Unable to send classDocument notification %O",
                        error
                    );
                }
                cb();


                break;
            }

            case "whiteboard": {
                try {
                    const { method } = request.data;

                    if (!this._hasPermission(peer, WHITEBOARD))
                        throw new Error("peer not authorized");

                    logger.debug(
                        "Whiteboard state changed to state: %O",
                        method
                    );

                    if (!peer) {
                        throw new Error(`Peer with id "${peer.id}" not found`);
                    }

                    switch (method) {
                        case "open":
                            //TODO: Refector
                            this._io.to(peer.socket).emit("init-room");
                            break;
                        case "close":
                            const rooms = this._io.sockets.adapter.rooms;

                            for (const roomID of peer.socket.rooms) {
                                const clients = Array.from(
                                    rooms.get(roomID)
                                ).filter((id) => id !== peer.socket.id);

                                if (clients.length > 0) {
                                    peer.socket.broadcast
                                        .to(roomID)
                                        .emit("room-user-change", clients);
                                }
                            }
                            break;
                        default:
                            logger.error("Unknown method requested");
                            break;
                    }
                } catch (error) {
                    logger.error(
                        "Unable to send Whiteboard notification %O",
                        error
                    );
                }

                cb();
                break;
            }

            case "LaTeX": {
                try {
                    const { method, value: data } = request.data;

                    if (!this._hasPermission(peer, LATEX))
                        throw new Error("peer not authorized");

                    logger.debug("LaTeX state changed to state: %O", method);

                    if (!peer) {
                        throw new Error(`Peer with id "${peer.id}" not found`);
                    }

                    switch (method) {
                        case "open":
                        case "close": {
                            this._sNotification(
                                peer,
                                "LaTeX",
                                {
                                    method: method,
                                },
                                true
                            );
                            break;
                        }
                        case "load": {
                            // let data = this._latex;

                            // if (data === null) {
                            //     const latex = await this.findOrCreateLaTeX(
                            //         this._roomId
                            //     );

                            //     data = this._latex = latex.data;
                            // }

                            this._sNotification(peer, "LaTeX", {
                                method: "load",
                                data: this._latex,
                            });
                            break;
                        }
                        case "change": {
                            this._sNotification(
                                peer,
                                "LaTeX",
                                {
                                    method: "change",
                                    data: data,
                                },
                                true
                            );

                            // caching on server
                            this._latex = data;

                            break;
                        }
                        default:
                            logger.error("Unknown method requested");
                            break;
                    }
                } catch (error) {
                    logger.error("Unable to send LaTeX notification %O", error);
                }

                cb();
                break;
            }

            case "youtube": {
                try {
                    const { method, data } = request.data;

                    if (!this._hasPermission(peer, SHARED_YOUTUBE_VIDEO))
                        throw new Error("peer not authorized");

                    logger.debug(
                        "YoutubeStreaming state changed to state: %O",
                        method
                    );

                    if (!peer) {
                        throw new Error(`Peer with id "${peer.id}" not found`);
                    }

                    this._sNotification(
                        peer,
                        "youtube",
                        {
                            method,
                            data,
                        },
                        true
                    );

                    switch (method) {
                        case "start":
                            const ytData = {
                                ...this._currentYoutubeLink,
                                ownerId: data.ownerId,
                                url: data.youtubeUrl,
                                status: data.status,
                            };

                            if (peer.joinedBreakoutRoom) {
                                peerBreakoutRoom.currentYoutubeLink = ytData;
                            } else {
                                this._currentYoutubeLink = ytData;
                            }

                            break;
                        case "pause":
                            if (peer.joinedBreakoutRoom) {
                                peerBreakoutRoom.currentYoutubeLink = {
                                    ...peerBreakoutRoom.currentYoutubeLink,
                                    status: "pause",
                                };
                            } else {
                                this._currentYoutubeLink = {
                                    ...this._currentYoutubeLink,
                                    status: "pause",
                                };
                            }

                            break;
                        case "progress":
                            if (peer.joinedBreakoutRoom) {
                                if (
                                    peerBreakoutRoom.currentYoutubeLink !== null
                                )
                                    peerBreakoutRoom.currentYoutubeLink.progress =
                                        data.currentTime;
                            } else {
                                if (this._currentYoutubeLink !== null)
                                    this._currentYoutubeLink.progress =
                                        data.currentTime;
                            }

                            break;
                        case "close":
                            if (peer.joinedBreakoutRoom) {
                                peerBreakoutRoom.currentYoutubeLink.status =
                                    "closed";
                                peerBreakoutRoom.youtubeLinksHistory.push(
                                    peerBreakoutRoom.currentYoutubeLink
                                );
                                peerBreakoutRoom.currentYoutubeLink = null;
                            } else {
                                this._youtubeLinksHistory.push(
                                    this._currentYoutubeLink
                                );
                                this._currentYoutubeLink = null;
                            }

                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    logger.error(
                        "Unable to send youtube notification %O",
                        error
                    );
                }
                cb();


                break;
            }

            case "breakoutRooms": {
                try {
                    const { method, data } = request.data;

                    // if (!this._hasPermission(peer, ACCESS_BREAKOUT_ROOMS))
                    //   throw new Error("peer not authorized");

                    // logger.debug("BREAKOUT ROOMS state changed to state: %O", method);

                    if (!peer) {
                        throw new Error(`Peer with id "${peer.id}" not found`);
                    }

                    switch (method) {
                        case "addBreakoutRooms":
                            this.createBreakRoom(peer);
                            break;
                        case "removeBreakoutRooms":
                            this.removeBreakRooms(data.breakoutRoomId, peer);
                            break;
                        case "joinBreakoutRoom":
                            this.joinBreakoutRoom(data.breakoutRoomId, peer);
                            break;
                        case "leaveBreakoutRoom":
                            this.leaveBreakoutRoom(data.breakoutRoomId, peer);
                            break;

                        default:
                            logger.error("Unknown method requested");
                            break;
                    }
                } catch (error) {
                    logger.error(
                        "Unable to send breakoutRoom notification %O",
                        error
                    );
                }

                cb();
                break;
            }

            case "quiz": {
                try {
                    const { method, data } = request.data;

                    if (!this._hasPermission(peer, ACCESS_QUIZ))
                        throw new Error("peer not authorized");

                    logger.debug("Quiz state changed to state: %O", method);

                    switch (method) {
                        case "moderator:sendQuiz": {
                            const { quiz } = data;

                            if (peer.joinedBreakoutRoom) {
                                peerBreakoutRoom.quizHistory.push(quiz);
                            } else {
                                this._quizHistory.push(quiz);
                            }

                            const { correctIndex, ...newQuiz } = quiz;

                            this._sNotification(
                                peer,
                                "quiz",
                                {
                                    method: "sendQuiz",
                                    data: {
                                        quiz: newQuiz,
                                    },
                                },
                                true
                            );
                            break;
                        }

                        case "submitQuiz": {
                            const { time, peerAnswerIndexs } = data;

                            const peerInfo = peer.peerInfo;

                            const answeredPeer = {
                                id: peerInfo.id,
                                name: peerInfo.displayName,
                                picture: peerInfo.picture,
                                email: peerInfo.email,
                                peerAnswerIndexs,
                            };

                            let quiz;
                            let quizCreator;

                            if (peer.joinedBreakoutRoom) {
                                quiz = peerBreakoutRoom.quizHistory.find(
                                    (quiz) => quiz.time === time
                                );
                                quizCreator = peerBreakoutRoom.peers.find(
                                    (peer) => peer.id === quiz.peerId
                                );
                            } else {
                                quiz = this._quizHistory.find(
                                    (quiz) => quiz.time === time
                                );
                                quizCreator = this._peers[quiz.peerId];
                            }

                            quiz.answeredPeers.push(answeredPeer);

                            this._sNotification(quizCreator, "quiz", {
                                method: "peerSubmitQuiz",
                                data: {
                                    time: time,
                                    peer: {
                                        peerId: peerInfo.id,
                                        name: peerInfo.displayName,
                                        picture: peerInfo.picture,
                                        email: peerInfo.email,
                                        peerAnswerIndexs,
                                    },
                                },
                            });

                            if (this._hasPermission(peer, SYNC_DATA)) {
                                logger.debug("peer submit quiz syncing");
                            }

                            logger.debug(
                                "%s submitted the quiz",
                                peer.displayName
                            );
                            break;
                        }

                        case "publicQuizResult": {
                            const { result } = data;

                            let quiz;

                            if (peer.joinedBreakoutRoom) {
                                quiz = peerBreakoutRoom.quizHistory.find(
                                    (quiz) => quiz.time === result.time
                                );
                                quiz.isPublicResult = true;
                                quiz.status = "closed";
                            } else {
                                quiz = this._quizHistory.find(
                                    (quiz) => quiz.time === result.time
                                );
                                quiz.isPublicResult = true;
                                quiz.status = "closed";
                            }

                            quiz.maxAnsweredPeers = result.maxAnsweredPeers;

                            this._sNotification(
                                peer,
                                "quiz",
                                {
                                    method: "publicQuizResult",
                                    data: {
                                        time: result.time,
                                        correctIndexs: quiz.correctIndexs,
                                        maxAnsweredPeers:
                                            result.maxAnsweredPeers,
                                        answeredPeers: quiz.answeredPeers,
                                        answerColors: quiz.answerColors,
                                    },
                                },
                                true
                            );
                            break;
                        }
                        default:
                            logger.error("Unknown method requested");
                            break;
                    }
                } catch (error) {
                    logger.error("Unable to send quiz notification %O", error);
                }
                cb();

                break;
            }

            case "presentFile": {
                try {
                    const { method, data } = request.data;

                    if (!this._hasPermission(peer, MARK_PRESENTATION_FILE))
                        throw new Error("peer not authorized");

                    logger.debug(
                        "presentFile state changed to state: %O",
                        method
                    );

                    if (!peer) {
                        throw new Error(`Peer with id "${peer.id}" not found`);
                    }

                    switch (method) {
                        case "open": {
                            this._sNotification(
                                peer,
                                "presentFile",
                                {
                                    method: "open",
                                    data: data,
                                },
                                true
                            );
                            break;
                        }
                        case "close": {
                            this._sNotification(
                                peer,
                                "presentFile",
                                {
                                    method: "close",
                                },
                                true
                            );
                            break;
                        }
                        case "minimize": {
                            this._sNotification(
                                peer,
                                "presentFile",
                                {
                                    method: "minimize",
                                    data: data,
                                },
                                true
                            );
                            break;
                        }
                        case "pageChange": {
                            this._sNotification(
                                peer,
                                "presentFile",
                                {
                                    method: "pageChange",
                                    data: data,
                                },
                                true
                            );
                            break;
                        }
                        default:
                            logger.error("Unknown method requested");
                            break;
                    }
                } catch (error) {
                    logger.error(
                        "Unable to send presentFile notification %O",
                        error
                    );
                }

                cb();
                break;
            }

            default: {
                logger.error('unknown request.method "%s"', request.method);

                cb(500, `unknown request.method "${request.method}"`);
            }
        }
    }

    _bufferRecord(buffer) {
        fs.appendFileSync(this._tmpRecordFilePath, buffer);

        this._streamRecorder = fs.createReadStream(this._tmpRecordFilePath);
        // var read = fs.createReadStream(this._tmpRecordFilePath);
        // var compress = zlib.createGzip();

        var upload = s3Stream.upload({
            Bucket: config.s3_config.bucketName,
            Key: this._key,
            ACL: "public-read",
            StorageClass: "REDUCED_REDUNDANCY",
            ContentType: "video/webm",
        });

        upload.on("error", function (error) {
            logger.error("Error ::: %o", error);
        });

        upload.on("part", function (details) {
            logger.debug("part ::: %o", details);
        });

        upload.once("uploaded", function (details) {
            logger.debug("uploaded ::: %o", details);
        });

        this._streamRecorder.pipe(upload);
    }

    async _startRecord() {}

    async _stopRecord() {
        return new Promise((resolve, reject) => {
            try {
                if (this._streamRecorder) {
                    this._streamRecorder = null;
                    this._s3Uploader = null;

                    const unlinkSyncTime = setTimeout(() => {
                        this.unlinkSync(this._tmpRecordFilePath);

                        return clearInterval(unlinkSyncTime);
                    }, UNLINKSYNC_TIME);

                    resolve({ status: "ok" });
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async _pauseRecord() {
        return new Promise((resolve, reject) => {
            try {
                if (this._streamRecorder) this._streamRecorder.pause();
                resolve({ status: "paused" });
            } catch (error) {
                reject(error);
            }
        });
    }

    async _resumeRecord() {
        return new Promise((resolve, reject) => {
            try {
                if (this._streamRecorder) this._streamRecorder.resume();
                resolve({ status: "resumed" });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Creates a mediasoup Consumer for the given mediasoup Producer.
     *
     * @async
     */
    async _createConsumer({ consumerPeer, producerPeer, producer }) {
        logger.debug(
            '_createConsumer() [consumerPeer:"%s", producerPeer:"%s", producer:"%s"]',
            consumerPeer.id,
            producerPeer.id,
            producer.id
        );

        const router = this._mediasoupRouters.get(producerPeer.routerId);

        // Optimization:
        // - Create the server-side Consumer. If video, do it paused.
        // - Tell its Peer about it and wait for its response.
        // - Upon receipt of the response, resume the server-side Consumer.
        // - If video, this will mean a single key frame requested by the
        //   server-side Consumer (when resuming it).

        // NOTE: Don't create the Consumer if the remote Peer cannot consume it.
        if (
            !consumerPeer.rtpCapabilities ||
            !router.canConsume({
                producerId: producer.id,
                rtpCapabilities: consumerPeer.rtpCapabilities,
            })
        ) {
            return;
        }

        // Must take the Transport the remote Peer is using for consuming.
        const transport = consumerPeer.getConsumerTransport();

        // This should not happen.
        if (!transport) {
            logger.warn(
                "_createConsumer() | Transport for consuming not found"
            );

            return;
        }

        // Create the Consumer in paused mode.
        let consumer;

        try {
            consumer = await transport.consume({
                producerId: producer.id,
                rtpCapabilities: consumerPeer.rtpCapabilities,
                paused: producer.kind === "video",
            });

            if (producer.kind === "audio") await consumer.setPriority(255);
        } catch (error) {
            logger.warn('_createConsumer() | [error:"%o"]', error);

            return;
        }

        // Store the Consumer into the consumerPeer data Object.
        consumerPeer.addConsumer(consumer.id, consumer);

        // Set Consumer events.
        consumer.on("transportclose", () => {
            // Remove from its map.
            consumerPeer.removeConsumer(consumer.id);
        });

        consumer.on("producerclose", () => {
            // Remove from its map.
            consumerPeer.removeConsumer(consumer.id);

            this._sNotification(consumerPeer, "consumerClosed", {
                consumerId: consumer.id,
            });
        });

        consumer.on("producerpause", () => {
            this._sNotification(consumerPeer, "consumerPaused", {
                consumerId: consumer.id,
            });
        });

        consumer.on("producerresume", () => {
            this._sNotification(consumerPeer, "consumerResumed", {
                consumerId: consumer.id,
            });
        });

        consumer.on("score", (score) => {
            this._sNotification(consumerPeer, "consumerScore", {
                consumerId: consumer.id,
                score,
            });
        });

        consumer.on("layerschange", (layers) => {
            this._sNotification(consumerPeer, "consumerLayersChanged", {
                consumerId: consumer.id,
                spatialLayer: layers ? layers.spatialLayer : null,
                temporalLayer: layers ? layers.temporalLayer : null,
            });
        });

        // Send a request to the remote Peer with Consumer parameters.
        try {
            await this._sNotification(consumerPeer, "newConsumer", {
                peerId: producerPeer.id,
                kind: consumer.kind,
                producerId: producer.id,
                id: consumer.id,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
                appData: producer.appData,
                producerPaused: consumer.producerPaused,
            });

            // Now that we got the positive response from the remote Peer and, if
            // video, resume the Consumer to ask for an efficient key frame.
            await consumer.resume();

            this._sNotification(consumerPeer, "consumerScore", {
                consumerId: consumer.id,
                score: consumer.score,
            });
        } catch (error) {
            logger.warn('_createConsumer() | [error:"%o"]', error);
        }
    }

    async _syncRequest(roomId, data) {
        try {
            await gateway.saveRoomData({
                roomId: roomId,
                data: data,
            });

            logger.debug("_syncRequest successfully");
        } catch (error) {
            logger.error("_syncRequest %o", error.error);
        }
    }

    _hasPermission(peer, permission) {
        const hasPermission = peer.roles.some((role) =>
            roomPermissions[permission].some(
                (roomRole) => role.id === roomRole.id
            )
        );

        if (hasPermission) return true;

        // Allow if config is set, and no one is present
        if (
            roomAllowWhenRoleMissing.includes(permission) &&
            this._getPeersWithPermission(permission).length === 0
        )
            return true;

        return false;
    }

    _hasAccess(peer, access) {
        return peer.roles.some((role) =>
            roomAccess[access].some((roomRole) => role.id === roomRole.id)
        );
    }

    /**
     * Get the list of joined peers.
     */
    getJoinedPeers(excludePeer = undefined) {
        return Object.values(this._peers).filter(
            (peer) => peer.joined && peer !== excludePeer
        );
    }

    getJoinedBreakoutRoomPeers(breakoutRoomId, excludePeer = undefined) {
        const room = this._breakoutRooms.get(breakoutRoomId);
        return room.peers.filter(
            (peer) => peer.joinedBreakoutRoom && peer !== excludePeer
        );
    }

    getQuizHistory(peer, quizHistory) {
        let collaborateQuizHistory = [];
        let sender = this._hasPermission(peer, SEND_QUIZ);

        quizHistory.forEach((sentQuiz) => {
            // destruct answer
            const { correctIndexs, answeredPeers, answerColors, ...quiz } =
                sentQuiz;

            // finds peer is answered
            const answeredPeer = answeredPeers.find(
                (answeredPeer) => answeredPeer.id === peer.id
            );

            const answered = Boolean(answeredPeer);

            let peerQuiz = {
                ...quiz,
                answered: answered,
                peerAnswerIndexs: answeredPeer?.peerAnswerIndexs,
            };

            if (sender || quiz.isPublicResult) {
                peerQuiz = {
                    ...peerQuiz,
                    answered: true,
                    correctIndexs: correctIndexs,
                    answeredPeers: answeredPeers,
                    answerColors: answerColors,
                };
            } else {
                if (quiz.status === "closed")
                    peerQuiz = {
                        ...peerQuiz,
                        correctIndexs: correctIndexs,
                        answeredPeers: answeredPeers,
                        answerColors: answerColors,
                    };
            }

            collaborateQuizHistory.push(peerQuiz);
        });

        return collaborateQuizHistory;
    }

    _getAllowedPeers(
        permission = null,
        excludePeer = undefined,
        joined = true
    ) {
        const peers = this._getPeersWithPermission(
            permission,
            excludePeer,
            joined
        );

        if (peers.length > 0) return peers;

        // Allow if config is set, and no one is present
        if (roomAllowWhenRoleMissing.includes(permission))
            return Object.values(this._peers);

        return peers;
    }

    _getPeersWithPermission(
        permission = null,
        excludePeer = undefined,
        joined = true
    ) {
        return Object.values(this._peers).filter(
            (peer) =>
                peer.joined === joined &&
                peer !== excludePeer &&
                peer.roles.some((role) =>
                    roomPermissions[permission].some(
                        (roomRole) => role.id === roomRole.id
                    )
                )
        );
    }

    _timeoutCallback(callback) {
        let called = false;

        const interval = setTimeout(() => {
            if (called) return;
            called = true;
            callback(new SocketTimeoutError("Request timed out"));
        }, config.requestTimeout || 20000);

        return (...args) => {
            if (called) return;
            called = true;
            clearTimeout(interval);

            callback(...args);
        };
    }

    _sendRequest(socket, method, data = {}) {
        return new Promise((resolve, reject) => {
            socket.emit(
                "request",
                { method, data },
                this._timeoutCallback((err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response);
                    }
                })
            );
        });
    }

    async _request(socket, method, data) {
        logger.debug('_request() [method:"%s", data:"%o"]', method, data);

        const { requestRetries = 3 } = config;

        for (let tries = 0; tries < requestRetries; tries++) {
            try {
                return await this._sendRequest(socket, method, data);
            } catch (error) {
                if (
                    error instanceof SocketTimeoutError &&
                    tries < requestRetries
                )
                    logger.warn(
                        '_request() | timeout, retrying [attempt:"%s"]',
                        tries
                    );
                else throw error;
            }
        }
    }

    _sNotification(
        peer,
        method,
        data = {},
        broadcast = false,
        includeSender = false,
        acrossRoom = false
    ) {
        if (peer.joinedBreakoutRoom)
            this._breakoutRoomNotification(
                peer.socket,
                peer.breakoutRoomId,
                method,
                data,
                broadcast,
                includeSender
            );

        if (!peer.joinedBreakoutRoom || acrossRoom)
            this._notification(
                peer.socket,
                method,
                data,
                broadcast,
                includeSender
            );
    }

    _breakoutRoomNotification(
        socket,
        breakoutRoomId,
        method,
        data = {},
        broadcast = false,
        includeSender = false
    ) {
        if (broadcast) {
            socket.broadcast
                .to(breakoutRoomId)
                .emit("notification", { method, data });

            if (includeSender) socket.emit("notification", { method, data });
        } else {
            socket.emit("notification", { method, data });
        }
    }

    _notification(
        socket,
        method,
        data = {},
        broadcast = false,
        includeSender = false
    ) {
        if (broadcast) {
            socket.broadcast
                .to(this._roomId)
                .emit("notification", { method, data });

            if (includeSender) socket.emit("notification", { method, data });
        } else {
            socket.emit("notification", { method, data });
        }
    }

    async _pipeProducersToRouter(routerId) {
        const router = this._mediasoupRouters.get(routerId);

        const peersToPipe = Object.values(this._peers).filter(
            (peer) => peer.routerId !== routerId && peer.routerId !== null
        );

        for (const peer of peersToPipe) {
            const srcRouter = this._mediasoupRouters.get(peer.routerId);

            for (const producerId of peer.producers.keys()) {
                if (router._producers.has(producerId)) {
                    continue;
                }

                await srcRouter.pipeToRouter({
                    producerId: producerId,
                    router: router,
                });
            }
        }
    }

    async _getRouterId() {
        const routerId = Room.getLeastLoadedRouter(
            this._mediasoupWorkers,
            this._allPeers,
            this._mediasoupRouters
        );

        await this._pipeProducersToRouter(routerId);

        return routerId;
    }

    // Returns an array of router ids we need to pipe to
    _getRoutersToPipeTo(originRouterId) {
        return Object.values(this._peers)
            .map((peer) => peer.routerId)
            .filter(
                (routerId, index, self) =>
                    routerId !== originRouterId &&
                    self.indexOf(routerId) === index
            );
    }

    async findOrCreateDocument(id) {
        if (id === null) return;

        const document = await Document.findById(id);
        if (document) return document;
        return await Document.create({ _id: id, data: "" });
    }
    async findOrCreateLaTeX(id) {
        if (id === null) return;

        const latex = await LaTeX.findById(id);
        if (latex) return latex;
        return await LaTeX.create({ _id: id, data: "" });
    }

    createBreakRoom(peer) {
        if (!this._hasPermission(peer, ADD_BREAKOUT_ROOMS))
            throw new Error("peer not authorized");

        const lastRoom = Array.from(this._breakoutRooms.values()).pop();

        let breakoutRoomNumber = this._breakoutRooms.size + 1;

        if (lastRoom) breakoutRoomNumber = lastRoom.number + 1;

        const breakoutRoomId = this._roomId + "," + breakoutRoomNumber;
        const breakoutRoomName =
            config.breakout_rooms.nameStrategy + breakoutRoomNumber; // Breakout room #{breakoutRoomNumber}

        const breakoutRoom = this._addBreakoutRoom({
            id: breakoutRoomId,
            name: breakoutRoomName,
            number: breakoutRoomNumber,
        });

        this._sNotification(
            peer,
            "breakoutRooms",
            {
                method: "addBreakoutRooms",
                data: breakoutRoom.breakoutRoomInfo,
            },
            true,
            true
        );
    }

    _addBreakoutRoom({
        id,
        name,
        number,
        history = {
            classDocument: null,
            latex: null,
            whiteboard: null,
            chats: [],
            files: [],
            youtubeLinks: [],
            quizzes: [],
            quizResults: [],
        },
    }) {
        const breakoutRoom = new BreakoutRoom({
            id: id,
            name: name,
            number: number,
            history: history,
        });

        this._breakoutRooms.set(id, breakoutRoom);

        logger.debug("addBreakoutRoom %s", breakoutRoom);

        return breakoutRoom;
    }

    removeBreakRooms(breakoutRoomId, peer) {
        // TODO:  Get all peers in this room and add to the main room

        if (!this._hasPermission(peer, REMOVE_BREAKOUT_ROOMS))
            throw new Error("peer not authorized");

        const breakoutRoom = this._breakoutRooms.get(breakoutRoomId);

        if (breakoutRoom && breakoutRoom.peers.length > 0) {
            const joinedBreakoutRoomPeers = breakoutRoom.peers;
            for (const joinedPeer of joinedBreakoutRoomPeers) {
                logger.debug(
                    "PeerId %s leaved breakoutRoomID %s",
                    joinedPeer.id,
                    breakoutRoomId
                );

                this.leaveBreakoutRoom(breakoutRoomId, joinedPeer);
            }
        }

        this._breakoutRooms.delete(breakoutRoomId);

        this._sNotification(
            peer,
            "breakoutRooms",
            {
                method: "removeBreakoutRooms",
                data: breakoutRoomId,
            },
            true,
            true
        );

        // const joinedBreakoutRoomPeers = breakoutRoom.peers;

        // for (const peer of joinedBreakoutRoomPeers) {
        //     this._peerJoining(peer);
        // }
    }

    joinBreakoutRoom(breakoutRoomId, peer) {
        try {
            if (!this._hasPermission(peer, JOIN_BREAKOUT_ROOM))
                throw new Error("peer not autherized");

            const currentRoom = this._breakoutRooms.get(breakoutRoomId);

            // Add peer to the breakoutRoom
            currentRoom.addPeer(peer);
            currentRoom.addLastN(peer.id);

            // Remove lastN from the main room
            this._lastN = this._lastN.filter((id) => id !== peer.id);

            // Delete peer from the main room
            delete this._peers[peer.id];

            logger.debug(
                "BreakoutRoom [PeerId: %s joined breakoutRoomId: %s]",
                peer.id,
                breakoutRoomId
            );
            logger.debug(
                "BreakoutRoom [Id: %s total peers: %s]",
                breakoutRoomId,
                currentRoom.peers.length
            );

            peer.socket.join(breakoutRoomId);
            peer.socket.leave(this._roomId);
            peer.joinedBreakoutRoom = true;
            peer.breakoutRoomId = breakoutRoomId;

            const joinedPeers = this.getJoinedBreakoutRoomPeers(
                breakoutRoomId,
                peer
            );

            const peerInfos = joinedPeers.map(
                (otherPeer) => otherPeer.peerInfo
            );

            let quizHistory = this.getQuizHistory(
                peer,
                currentRoom.quizHistory
            );

            this._sNotification(peer, "breakoutRooms", {
                method: "joinBreakoutRoom",
                data: {
                    breakoutRoomId: breakoutRoomId,
                    otherPeers: peerInfos,
                    chatHistory: currentRoom.chatHistory,
                    fileHistory: currentRoom.fileHistory,
                    lastNHistory: currentRoom.lastN,
                    quizHistory: quizHistory,
                    quizResultHistory: currentRoom.quizResultHistory,
                    currentYoutubeLink: currentRoom.currentYoutubeLink,
                    //youtubelink
                },
            });

            this._sNotification(
                peer,
                "breakoutRooms",
                {
                    method: "peerJoinedBreakoutRoom",
                    data: {
                        breakoutRoomId: breakoutRoomId,
                        joinedPeer: peer.peerInfo,
                    },
                },
                true
            );

            this._notification(
                peer.socket,
                "breakoutRooms",
                {
                    method: "main:peerJoinedBreakoutRoom",
                    data: {
                        breakoutRoomId: breakoutRoomId,
                        joinedPeer: peer.peerInfo,
                    },
                },
                true
            );

            for (const joinedPeer of joinedPeers) {
                // Create Consumers for existing Producers.
                for (const producer of joinedPeer.producers.values()) {
                    this._createConsumer({
                        consumerPeer: peer,
                        producerPeer: joinedPeer,
                        producer,
                    });
                }
            }

            // Notify the new Peer to all other Peers.
            for (const otherPeer of joinedPeers) {
                this._sNotification(otherPeer, "newPeer", peer.peerInfo);
            }

            logger.debug(
                'peer joined breakout room [breakoutRoomId: "%s", peer: "%s", displayName: "%s"]',
                breakoutRoomId,
                peer.id,
                peer.displayName
            );
        } catch (error) {
            throw new Error(
                `Unable to join breakoutRoomId: ${breakoutRoomId} [Error: ${error}]`
            );
        }
    }

    leaveBreakoutRoom(breakoutRoomId, peer) {
        const currentRoom = this._breakoutRooms.get(breakoutRoomId);

        if (!currentRoom)
            throw `Breakout room Id ${breakoutRoomId} could not found`;

        currentRoom.removePeer(peer);
        currentRoom.removeLastN(peer.id);

        //Todo 1: notify to self
        //Todo 2: notify to otherPeers in the same room
        //Todo 3: notify to the main room in order to update UI
        //Todo 4: peer emit join main room back
        //Todo 5: send history datas on the main room back to leavedPeer

        this._sNotification(peer, "breakoutRooms", {
            method: "leaveBreakoutRoom",
        });

        this._sNotification(
            peer,
            "breakoutRooms",
            {
                method: "peerLeavedBreakoutRoom",
                data: {
                    peerId: peer.id,
                    breakoutRoomId: breakoutRoomId,
                },
            },
            true
        );

        peer.socket.join(this._roomId);
        peer.socket.leave(breakoutRoomId);
        peer.joinedBreakoutRoom = false;
        peer.breakoutRoomId = null;
        peer.joined = false;

        logger.debug(
            "PeerId: %s has leaved breakoutRoom [breakoutRoomId: %s, room name: %s]",
            peer.id,
            breakoutRoomId,
            currentRoom.name
        );

        this._sNotification(
            peer,
            "breakoutRooms",
            {
                method: "main:peerLeavedBreakoutRoom",
                data: {
                    breakoutRoomId: breakoutRoomId,
                    peerId: peer.peerInfo.id,
                },
            },
            true
        );
    }

    async syncPeerActivity({ roomId, peerId, activityCode }) {
        return gateway.addPeerActivity({ roomId, peerId, activityCode });
    }
}

module.exports = Room;
