#!/usr/bin/env node

process.title = "livestream";

// using .env file
require("dotenv").config();

const config = require("./config/config");

const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const compression = require("compression");
const mediasoup = require("mediasoup");
const { AwaitQueue } = require("awaitqueue");
const base64 = require("base-64");
// const helmet = require("helmet");

const passport = require("passport");
// redis
const { createAdapter } = require("@socket.io/redis-adapter");
const redis = require("redis");
const pubClient = redis.createClient(config.redisOptions);
const subClient = pubClient.duplicate();
// auth
const { Issuer, Strategy, custom } = require("openid-client");
const sharedSession = require("express-socket.io-session");
const { v4: uuidv4 } = require("uuid");

const { loginHelper, logoutHelper } = require("./lib/helpers/httpHelper");
const { MAIN_CHANNEL, PAYLOADS } = require("./constants/constants");
const interactiveServer = require("./lib/interactive/Server");
const promExporter = require("./lib/stats/promExporter");

const userRoles = require("./lib/access/userRoles");
const Logger = require("./lib/logger/Logger");
const Room = require("./lib/Room");
const Peer = require("./lib/Peer");

// api integration
const { middleware } = require("./middleware");

/* eslint-disable no-console */
console.log("- process.env.DEBUG:", process.env.DEBUG);
console.log(
    "- config.mediasoup.worker.logLevel:",
    config.mediasoup.worker.logLevel
);
console.log(
    "- config.mediasoup.worker.logTags:",
    config.mediasoup.worker.logTags
);
/* eslint-enable no-console */

const logger = new Logger("server");

const queue = new AwaitQueue();

let statusLogger = null;

if ("StatusLogger" in config) statusLogger = new config.StatusLogger();

// mediasoup Workers Map.
const mediasoupWorkers = new Map();

// Map of Room instances indexed by roomId.
const rooms = new Map();

// Map of Peer instances indexed by peerId.
const peers = new Map();

const app = express();

const { session, sharedCookieParser } = middleware(app, { store: pubClient });

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

let mainListener;
let io;
let oidcClient;
let oidcStrategy;

async function run() {
    try {
        // Open the interactive server.
        await interactiveServer(rooms, peers);

        // start Prometheus exporter
        if (config.prometheus) {
            await promExporter(rooms, peers, config.prometheus);
        }

        if (typeof config.auth === "undefined") {
            logger.warn("Auth is not configured properly!");
        } else {
            await setupAuth();
        }

        // Run a runSubscriber
        runSubscriber();

        // Run a mediasoup Worker.
        await runMediasoupWorkers();

        // Run HTTPS server.
        await runHttpsServer();

        // Run WebSocketServer.
        await runWebSocketServer();

        let dir = config.basePathRecordFiles || "./files/tmps";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // eslint-disable-next-line no-unused-vars
        const errorHandler = (err, req, res, next) => {
            const trackingId = uuidv4();

            res.status(500).send(
                `<h1>Internal Server Error</h1>
				<p>If you report this error, please also report this 
				<i>tracking ID</i> which makes it possible to locate your session
				in the logs which are available to the system administrator: 
				<b>${trackingId}</b></p>`
            );
            logger.error(
                "Express error handler dump with tracking ID: %s, error dump: %o",
                trackingId,
                err
            );
        };

        // eslint-disable-next-line no-unused-vars
        app.use(errorHandler);
    } catch (error) {
        console.log("Catched =>", error);
        logger.error('run() [error:"%o"]', error);
    }
}

function statusLog() {
    if (statusLogger) {
        statusLogger.log({
            rooms: rooms,
            peers: peers,
        });
    }
}

function runSubscriber() {
    /**
     * @param {string} message
     * @param {function(channel: string, message: {id: string, type: string})} callback
     */
    subClient.on("message", (channel, message) => {
        const payload = JSON.parse(message);

        switch (payload.type) {
            case PAYLOADS.CLOSE_MEETING_ROOM:
                const room = rooms.get(payload.roomId);
                if (room) room.emit("closeMeeting");
                break;
            default:
                logger.info("SubClient payload type not found");
                break;
        }
    });

    subClient.subscribe(MAIN_CHANNEL);
}

function setupOIDC(oidcIssuer) {
    oidcClient = new oidcIssuer.Client(config.auth.oidc.clientOptions);

    // ... any authorization request parameters go here
    // client_id defaults to client.client_id
    // redirect_uri defaults to client.redirect_uris[0]
    // response type defaults to client.response_types[0], then 'code'
    // scope defaults to 'openid'

    /* eslint-disable camelcase */
    const params = (({ client_id, redirect_uri, scope }) => ({
        client_id,
        redirect_uri,
        scope,
    }))(config.auth.oidc.clientOptions);
    /* eslint-enable camelcase */

    // optional, defaults to false, when true req is passed as a first
    // argument to verify fn
    const passReqToCallback = false;

    // optional, defaults to false, when true the code_challenge_method will be
    // resolved from the issuer configuration, instead of true you may provide
    // any of the supported values directly, i.e. "S256" (recommended) or "plain"
    const usePKCE = false;

    oidcStrategy = new Strategy(
        { client: oidcClient, params, passReqToCallback, usePKCE },
        (tokenset, userinfo, done) => {
            if (userinfo && tokenset) {
                // eslint-disable-next-line camelcase
                userinfo._tokenset_claims = tokenset.claims();
            }

            const user = {
                id: tokenset.claims.sub,
                provider: tokenset.claims.iss,
                _userinfo: userinfo,
            };

            return done(null, user);
        }
    );

    passport.use("oidc", oidcStrategy);
}

async function setupAuth() {
    // OIDC
    if (
        typeof config.auth !== "undefined" &&
        ((typeof config.auth.strategy !== "undefined" &&
            config.auth.strategy === "oidc") ||
            // it is default strategy
            typeof config.auth.strategy === "undefined") &&
        typeof config.auth.oidc !== "undefined" &&
        typeof config.auth.oidc.issuerURL !== "undefined" &&
        typeof config.auth.oidc.clientOptions !== "undefined"
    ) {
        if (config.auth.oidc.HttpOptions) {
            // Set http options to allow e.g. http proxy
            // TODO check with Misi what this is about
            custom.setHttpOptionsDefaults(config.auth.oidc.HttpOptions);
        }

        const oidcIssuer = await Issuer.discover(config.auth.oidc.issuerURL);

        // Setup authentication
        setupOIDC(oidcIssuer);
    }

    app.use(passport.initialize());
    app.use(passport.session());

    // Auth strategy (by default oidc)
    const authStrategy =
        config.auth && config.auth.strategy ? config.auth.strategy : "oidc";

    // loginparams
    app.get("/auth/login", (req, res, next) => {
        logger.debug("/auth/login");

        let state;

        if (req.query.peerId && req.query.roomId) {
            state = {
                peerId: req.query.peerId,
                roomId: req.query.roomId,
            };
        }

        passport.authenticate(authStrategy, {
            state: base64.encode(JSON.stringify(state)),
        })(req, res, next);
    });

    app.get("/auth/check_login_status", (req, res) => {
        let loggedIn = false;

        if (
            Boolean(req.session.passport) &&
            Boolean(req.session.passport.user)
        ) {
            loggedIn = true;
        }

        res.send({ loggedIn: loggedIn });
    });

    // logout
    app.get("/auth/logout", (req, res) => {
        logger.debug("/auth/logout");
        const { peerId } = req.session;

        const peer = peers.get(peerId);

        if (peer) {
            for (const role of peer.roles) {
                if (role.id !== userRoles.NORMAL.id) peer.removeRole(role);
            }
        }

        req.logout();
        req.session.passport = undefined;
        req.session.touch();
        req.session.save();
        req.session.destroy(() => res.send(logoutHelper()));
    });
    // SAML metadata
    app.get("/auth/metadata", (req, res) => {
        logger.debug("/auth/metadata");
        if (
            config.auth &&
            config.auth.saml &&
            config.auth.saml.decryptionCert &&
            config.auth.saml.signingCert
        ) {
            const metadata = samlStrategy.generateServiceProviderMetadata(
                config.auth.saml.decryptionCert,
                config.auth.saml.signingCert
            );

            if (metadata) {
                res.set("Content-Type", "text/xml");
                res.send(metadata);
            } else {
                res.status("Error generating SAML metadata", 500);
            }
        } else
            res.status(
                "Missing SAML decryptionCert or signingKey from config",
                500
            );
    });

    // callback
    app.all(
        "/auth/callback",
        passport.authenticate(authStrategy, { failureRedirect: "/auth/login" }),
        async (req, res, next) => {
            logger.debug("/auth/callback");
            try {
                let state;

                if (authStrategy == "saml" || authStrategy == "local")
                    state = req.session.authState;
                else {
                    if (req.method === "GET")
                        state = JSON.parse(base64.decode(req.query.state));
                    if (req.method === "POST")
                        state = JSON.parse(base64.decode(req.body.state));
                }

                if (!state || !state.peerId || !state.roomId) {
                    res.redirect("/auth/login");
                    logger.debug(
                        "Empty state or state.peerId or state.roomId in auth/callback"
                    );
                }

                const { peerId, roomId } = state;

                req.session.peerId = peerId;
                req.session.roomId = roomId;

                let peer = peers.get(peerId);
                const room = rooms.get(roomId);

                if (!peer)
                    // User has no socket session yet, make temporary
                    peer = new Peer({ id: peerId, roomId });

                if (peer.roomId !== roomId)
                    // The peer is mischievous
                    throw new Error("peer authenticated with wrong room");

                if (typeof config.userMapping === "function") {
                    await config.userMapping({
                        peer,
                        room,
                        roomId,
                        userinfo: req.user._userinfo,
                    });
                }

                peer.authenticated = true;

                res.send(
                    loginHelper({
                        displayName: peer.displayName,
                        picture: peer.picture,
                        email: peer.email,
                        peerId: peer.id
                    })
                );
            } catch (error) {
                return next(error);
            }
        }
    );
}

async function runHttpsServer() {
    app.use(compression());

    app.use(
        "/.well-known/acme-challenge",
        express.static("public/.well-known/acme-challenge")
    );

    app.all("*", async (req, res, next) => {
        if (req.secure || config.httpOnly) {
            let ltiURL;

            try {
                ltiURL = new URL(
                    `${req.protocol}://${req.get("host")}${req.originalUrl}`
                );
            } catch (error) {
                logger.error("Error parsing LTI url: %o", error);
            }

            if (
                req.isAuthenticated &&
                req.user &&
                req.user.displayName &&
                !ltiURL.searchParams.get("displayName") &&
                !isPathAlreadyTaken(req.url)
            ) {
                ltiURL.searchParams.append("displayName", req.user.displayName);

                res.redirect(ltiURL);
            } else {
                // const specialChars = "<>@!^*()[]{}:;|'\"\\,~`";

                // for (let i = 0; i < specialChars.length; i++) {
                //     if (req.url.substring(1).indexOf(specialChars[i]) > -1) {
                //         req.url = `/${encodeURIComponent(
                //             encodeURI(req.url.substring(1))
                //         )}`;
                //         res.redirect(`${req.url}`);
                //     }
                // }

                return next();
            }
        } else {
            res.redirect(`https://${req.hostname}${req.url}`);
        }
    });

    // Serve all files in the public folder as static files.
    app.use(express.static("public"));

    app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

    if (config.httpOnly === true) {
        // http
        mainListener = http.createServer(app);
    } else {
        const { options } = require("./utils/tls");

        // https
        mainListener = https.createServer(options, app);

        // http
        const redirectListener = http.createServer(app);

        if (config.listeningHost)
            redirectListener.listen(
                config.listeningRedirectPort,
                config.listeningHost
            );
        else redirectListener.listen(config.listeningRedirectPort);
    }

    // https or http
    if (config.listeningHost) {
        mainListener.listen(
            process.env.PORT || config.listeningPort,
            config.listeningHost
        );

        logger.debug(
            "Server start listening at %s",
            `${config.listeningHost}:${
                process.env.PORT || config.listeningPort
            }`
        );
    } else {
        mainListener.listen(process.env.PORT || config.listeningPort);

        logger.debug(
            "Server start listening at %s",
            `[::]:${process.env.PORT || config.listeningPort}`
        );
    }
}

function isPathAlreadyTaken(actualUrl) {
    const alreadyTakenPath = [
        "/config/",
        "/static/",
        "/images/",
        "/sounds/",
        "/favicon.",
        "/auth/",
    ];

    alreadyTakenPath.forEach((path) => {
        if (actualUrl.toString().startsWith(path)) return true;
    });

    return false;
}

/**
 * Create a WebSocketServer to allow WebSocket connections from browsers.
 */
async function runWebSocketServer() {
    const { instrument } = require("@socket.io/admin-ui");

    io = require("socket.io")(mainListener, { cookie: false });

    // io = require("socket.io")(mainListener, {
    //     transports: ["websocket"],
    //     cors: {
    //         origin: "*",
    //         methods: ["GET", "POST"],
    //         credentials: true,
    //     },
    //     secure: false,
    //     cookie: false,
    // });

    io.adapter(createAdapter(pubClient, subClient));

    io.use(sharedSession(session, sharedCookieParser, { autoSave: true }));

    instrument(io, {
        auth: false,
    });

    // Handle connections from clients.
    io.on("connection", async (socket) => {
        try {
            const { data64 } = socket.handshake.query;

            console.log(data64)

            const { roomId, peerId, roleIds, displayName, picture, email } = JSON.parse(Buffer.from(data64, 'base64'));
            
            logger.info(
                'connection request [roomId:"%s", peerId:"%s", displayName:"%s", email:%s, roleIds:%o]',
                roomId,
                peerId,
                displayName,
                email,
                roleIds,
            );

            let roles = [];

            if (roleIds) {
                roles = roleIds.split(",");
            }

            if (!roomId || !peerId) {
                logger.warn("connection request without roomId and/or peerId");

                _sendRoomMessage(socket, "query", {
                    message: "Connection Error",
                });

                socket.disconnect(true);

                return;
            }

            queue
                .push(async () => {
                    let room;
                    let returning;
                    let peer;
                    let token = null;

                    room = await getOrCreateRoom({
                        roomId,
                        io,
                    });

                    if (socket.handshake.session.peerId === peerId) {
                        token = room.getToken(peerId);
                    }

                    peer = peers.get(peerId);

                    returning = false;

                    // allow to join only one access
                    if (!config.allowMultipleDevices && peer && !token) {
                        _sendRoomMessage(socket, "multipleDevices", {
                            message: "You are already joined",
                        });

                        // Don't allow hijacking sessions
                        socket.disconnect(true);

                        logger.debug(
                            `Disconnect reason peerId: ${peer.id}, name; ${peerInfo.name} already existed`
                        );

                        return;
                    } else if (
                        token &&
                        room.verifyPeer({ id: peerId, token })
                    ) {
                        // Returning user, remove if old peer exists

                        if (peer) peer.close();

                        returning = true;
                    }

                    peer = new Peer({
                        id: peerId,
                        roomId,
                        socket,
                    });

                    // set peer info
                    peer.displayName = displayName;
                    peer.picture = picture;
                    peer.authenticated = true;

                    const userinfo = {
                        email: email,
                        name: displayName,
                        picture: picture
                    }

                    //Custom Permissions in Config file ./config/config:230
                    if (typeof config.userMapping === "function") {
                        await config.userMapping({
                            peer: peer,
                            roleIds: roles,
                            userinfo: userinfo
                        });
                    }

                    peers.set(peerId, peer);

                    peer.on("close", () => {
                        peers.delete(peerId);

                        statusLog();
                    });

                    room.handlePeer({ peer, returning });

                    socket.handshake.session.peerId = peer.id;
                    socket.handshake.session.touch();
                    socket.handshake.session.save();

                    statusLog();
                })
                .catch((error) => {
                    logger.error(
                        'room creation or room joining failed [error:"%o"]',
                        error
                    );

                    throw { error: error };

                    // if (socket) socket.disconnect(true);

                    // return;
                });
        } catch (exception) {
            switch (exception.method) {
                case "api": {
                    _sendRoomMessage(socket, "api", exception.error);
                    break;
                }
                default:
                    _sendRoomMessage(socket, "error", {
                        error: exception.error,
                        message: "Room joining failed",
                    });
                    break;
            }
        }
    });
}

/**
 * Launch as many mediasoup Workers as given in the configuration file.
 */
async function runMediasoupWorkers() {
    mediasoup.observer.on("newworker", (worker) => {
        worker.appData.routers = new Map();
        worker.appData.transports = new Map();
        worker.appData.producers = new Map();
        worker.appData.consumers = new Map();
        worker.appData.dataProducers = new Map();
        worker.appData.dataConsumers = new Map();

        worker.observer.on("close", () => {
            // not needed as we have 'died' listiner below
            logger.debug("worker closed [worker.pid:%d]", worker.pid);
        });

        worker.observer.on("newrouter", (router) => {
            router.appData.transports = new Map();
            router.appData.producers = new Map();
            router.appData.consumers = new Map();
            router.appData.dataProducers = new Map();
            router.appData.dataConsumers = new Map();
            router.appData.worker = worker;
            worker.appData.routers.set(router.id, router);

            router.observer.on("close", () => {
                worker.appData.routers.delete(router.id);
            });

            router.observer.on("newtransport", (transport) => {
                transport.appData.producers = new Map();
                transport.appData.consumers = new Map();
                transport.appData.dataProducers = new Map();
                transport.appData.dataConsumers = new Map();
                transport.appData.router = router;
                router.appData.transports.set(transport.id, transport);

                transport.observer.on("close", () => {
                    router.appData.transports.delete(transport.id);
                });

                transport.observer.on("newproducer", (producer) => {
                    producer.appData.transport = transport;
                    transport.appData.producers.set(producer.id, producer);
                    router.appData.producers.set(producer.id, producer);
                    worker.appData.producers.set(producer.id, producer);

                    producer.observer.on("close", () => {
                        transport.appData.producers.delete(producer.id);
                        router.appData.producers.delete(producer.id);
                        worker.appData.producers.delete(producer.id);
                    });
                });

                transport.observer.on("newconsumer", (consumer) => {
                    consumer.appData.transport = transport;
                    transport.appData.consumers.set(consumer.id, consumer);
                    router.appData.consumers.set(consumer.id, consumer);
                    worker.appData.consumers.set(consumer.id, consumer);

                    consumer.observer.on("close", () => {
                        transport.appData.consumers.delete(consumer.id);
                        router.appData.consumers.delete(consumer.id);
                        worker.appData.consumers.delete(consumer.id);
                    });
                });

                transport.observer.on("newdataproducer", (dataProducer) => {
                    dataProducer.appData.transport = transport;
                    transport.appData.dataProducers.set(
                        dataProducer.id,
                        dataProducer
                    );
                    router.appData.dataProducers.set(
                        dataProducer.id,
                        dataProducer
                    );
                    worker.appData.dataProducers.set(
                        dataProducer.id,
                        dataProducer
                    );

                    dataProducer.observer.on("close", () => {
                        transport.appData.dataProducers.delete(dataProducer.id);
                        router.appData.dataProducers.delete(dataProducer.id);
                        worker.appData.dataProducers.delete(dataProducer.id);
                    });
                });

                transport.observer.on("newdataconsumer", (dataConsumer) => {
                    dataConsumer.appData.transport = transport;
                    transport.appData.dataConsumers.set(
                        dataConsumer.id,
                        dataConsumer
                    );
                    router.appData.dataConsumers.set(
                        dataConsumer.id,
                        dataConsumer
                    );
                    worker.appData.dataConsumers.set(
                        dataConsumer.id,
                        dataConsumer
                    );

                    dataConsumer.observer.on("close", () => {
                        transport.appData.dataConsumers.delete(dataConsumer.id);
                        router.appData.dataConsumers.delete(dataConsumer.id);
                        worker.appData.dataConsumers.delete(dataConsumer.id);
                    });
                });
            });
        });
    });

    const { numWorkers } = config.mediasoup;

    logger.info("running %d mediasoup Workers...", numWorkers);

    const { logLevel, logTags, rtcMinPort, rtcMaxPort } =
        config.mediasoup.worker;
    const portInterval = Math.floor((rtcMaxPort - rtcMinPort) / numWorkers);

    for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            logLevel,
            logTags,
            rtcMinPort: rtcMinPort + i * portInterval,
            rtcMaxPort:
                i === numWorkers - 1
                    ? rtcMaxPort
                    : rtcMinPort + (i + 1) * portInterval - 1,
        });

        worker.on("died", () => {
            logger.error(
                "mediasoup Worker died, exiting  in 2 seconds... [pid:%d]",
                worker.pid
            );

            setTimeout(() => process.exit(1), 2000);
        });

        mediasoupWorkers.set(worker.pid, worker);
    }
}

/**
 * Get a Room instance (or create one if it does not exist).
 */
async function getOrCreateRoom({ roomId, roomKey, io }) {
    let room = rooms.get(roomId);

    // If the Room does not exist create a new one.
    if (!room) {
        logger.info('creating a new Room [roomId:"%s"]', roomId);

        room = await Room.create({
            mediasoupWorkers,
            roomId,
            peers,
            io,
            // history: roomDatas,
        });

        rooms.set(roomId, room);

        statusLog();

        room.on("close", () => {
            rooms.delete(roomId);

            statusLog();
        });
    }

    return room;
}

function _sendRoomMessage(socket, method, data = {}) {
    socket.emit("room-message", { method, data });
}

run();
