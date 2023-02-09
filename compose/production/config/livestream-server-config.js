const os = require("os");

const userRoles = require("../userRoles");

const { BYPASS_ROOM_LOCK, BYPASS_LOBBY } = require("../access");

const {
    CHANGE_ROOM_LOCK,
    PROMOTE_PEER,
    SEND_CHAT,
    MODERATE_CHAT,
    SHARE_SCREEN,
    EXTRA_VIDEO,
    SHARE_FILE,
    MODERATE_FILES,
    MODERATE_ROOM,
    RECORD_ROOM,
    STUDENT_ROOM,
    PRESENTER_ROOM,
    SHARED_YOUTUBE_VIDEO,
    LATEX,
    SAVE_LATEX,
    LOAD_LATEX,
    CLASS_DOCUMENT,
    WHITEBOARD,
    SAVE_CLASS_DOCUMENT,
    ADD_BREAKOUT_ROOMS,
    REMOVE_BREAKOUT_ROOMS,
    JOIN_BREAKOUT_ROOM,
    LEAVE_BREAKOUT_ROOM,
    ACCESS_BREAKOUT_ROOMS,
    ACCESS_QUIZ,
    SEND_QUIZ,
    SUBMIT_QUIZ,
    PUBLIC_QUIZ_RESULT,
    CLASS_ACTIVITIES,
    SYNC_DATA,
} = require("../permissions");

const IP = process.env.IP || "192.168.1.121";

// const AwaitQueue = require('awaitqueue');
// const axios = require('axios');

// To gather ip address only on interface like eth0, enp0s3
const ifaceWhiteListRegex = "^(eth.*)|(ens.*)|(br.*)|(wl.*)|(ww.*)|(en*)";

// add automatic IP detection
function getListenIps() {
    const listenIP = [];
    const ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(function (ifname) {
        if (ifname.match(ifaceWhiteListRegex)) {
            ifaces[ifname].forEach(function (iface) {
                if (
                    (iface.family !== "IPv4" &&
                        (iface.family !== "IPv6" || iface.scopeid !== 0)) ||
                    iface.internal !== false
                ) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 or ipv6 non global addresses
                    return;
                }
                listenIP.push({
                    ip: iface.address,
                    announcedIp: iface.address,
                });
            });
        }
    });

    return listenIP;
}

module.exports = {
    // Auth conf

    auth: {
        // Always enabled if configured
        lti: {
            consumerKey: "key",
            consumerSecret: "secret",
        },
        // Auth strategy to use (default oidc)
        strategy: "oidc",
        oidc: {
            // The issuer URL for OpenID Connect discovery
            // The OpenID Provider Configuration Document
            // could be discovered on:
            // issuerURL + '/.well-known/openid-configuration'
            // e.g. google OIDC config
            // Follow this guide to get credential:
            // https://developers.google.com/identity/protocols/oauth2/openid-connect
            // use this issuerURL
            // issuerURL     : 'https://accounts.google.com/',

            issuerURL: "https://accounts.google.com/",
            clientOptions: {
                client_id:
                    "1020084182606-80186gvra6t3khbpdj8thdobjnqfr5nq.apps.googleusercontent.com",
                client_secret: "U7r1syrku8VE7opVyzG0DP3j",
                scope: "openid email profile",
                // where client.example.com is your livestream server
                redirect_uri: "https://meet.camemis-learn.com/auth/callback",
            },
        },
        local: {
            users: [
                {
                    id: 1,
                    username: "alice",
                    passwordHash:
                        "$2b$10$PAXXw.6cL3zJLd7ZX.AnL.sFg2nxjQPDmMmGSOQYIJSa0TrZ9azG6",
                    displayName: "Alice",
                    emails: [{ value: "alice@atlanta.com" }],
                },
                {
                    id: 2,
                    username: "bob",
                    passwordHash:
                        "$2b$10$BzAkXcZ54JxhHTqCQcFn8.H6klY/G48t4jDBeTE2d2lZJk/.tvv0G",
                    displayName: "Bob",
                    emails: [{ value: "bob@biloxi.com" }],
                },
            ],
        },
    },

    // URI and key for requesting geoip-based TURN server closest to the client
    turnAPIKey: "0xb80648545a30e0999892b517127c0e17",
    turnAPIURI: "turn:numb.viagenie.ca",
    turnAPIparams: {
        uri_schema: "turn",
        transport: "tcp",
        ip_ver: "ipv4",
        servercount: "2",
    },

    // Backup turnservers if REST fails or is not configured
    backupTurnServers: [
        {
            urls: ["turn:turn.camemis-learn.com"],
            credential: "UEBzc3dvcmQxMjM0NQo=",
            username: "camemis",
        },
        {
            urls: ["turn:numb.viagenie.ca"],
            credential: "muazkh",
            username: "webrtc@live.com",
        },
    ],
    fileTracker: "wss://spacetradersapi-chatbox.herokuapp.com:443/announce",
    redisOptions: {
        // host     : "redis-service.redis.svc.cluster.local",
        // port     : 6344,
        // username : "default",
        // password : "7P8v!gg#Z8%K"
    },
    mongodbOptions: {
        connection: null,
    },
    integration: {
        api: {
            endpoints: {
                dev: "http://localhost:3000/api/v1",
            },
        },
    },
    // session cookie secret
    cookieSecret: "T0P-S3cR3t_cook!e",
    cookieName: "livestream.sid",
    // if you use encrypted private key the set the passphrase
    tls: {
        localhost: {
            cert: `${__dirname}/../certs/localhost/cert.crt`,
            // passphrase: 'key_password'
            key: `${__dirname}/../certs/localhost/privkey.key`,
        },
    },
    // listening Host or IP
    // If omitted listens on every IP. ("0.0.0.0" and "::")
    listeningHost: "0.0.0.0",
    // Listening port for https server.
    listeningPort: 80,
    // Any http request is redirected to https.
    // Listening port for http server.
    listeningRedirectPort: 8081,
    // Listens only on http, only on listeningPort
    // listeningRedirectPort disabled
    // use case: loadbalancer backend
    httpOnly: true,
    // WebServer/Express trust proxy config for httpOnly mode
    // You can find more info:
    //  - https://expressjs.com/en/guide/behind-proxies.html
    //  - https://www.npmjs.com/package/proxy-addr
    // use case: loadbalancer backend
    trustProxy: [],
    // This logger class will have the log function
    // called every time there is a room created or destroyed,
    // or peer created or destroyed. This would then be able
    // to log to a file or external service.
    /* StatusLogger          : class
	{
		constructor()
		{
			this._queue = new AwaitQueue();
		}
		// rooms: rooms object
		// peers: peers object
		// eslint-disable-next-line no-unused-vars
		async log({ rooms, peers })
		{
			this._queue.push(async () =>
			{
				// Do your logging in here, use queue to keep correct order
				// eslint-disable-next-line no-console
				console.log('Number of rooms: ', rooms.size);
				// eslint-disable-next-line no-console
				console.log('Number of peers: ', peers.size);
			})
				.catch((error) =>
				{
					// eslint-disable-next-line no-console
					console.log('error in log', error);
				});
		}
	}, */
    // This function will be called on successful login through oidc.
    // Use this function to map your oidc userinfo to the Peer object.
    // The roomId is equal to the room name.
    // See examples below.
    // Examples:

    // All authenicated users will be MODERATOR and AUTHENTICATED
    // userMapping: async ({ peer, roomId, userinfo }) => {
    //   peer.addRole(userRoles.MODERATOR);
    //   peer.addRole(userRoles.AUTHENTICATED);
    // },
    // All authenicated users will be AUTHENTICATED,
    // and those with the moderator role set in the userinfo
    // will also be MODERATOR
    // userMapping: async ({ peer, room, roomId, peerInfo }) => {
    //     if (peerInfo.roleId) {
    //         Object.values(userRoles).map((userRole) => {
    //             if (userRole.id == peerInfo.roleId) {
    //                 peer.addRole(userRole);
    //             }
    //         });
    //     }

    //     if (peerInfo?.email) {
    //         peer.email = peerInfo.email;
    //     }

    //     if (peerInfo?.picture) {
    //         peer.picture = peerInfo.picture;
    //     }
    // },
    userMapping: async ({ peer, room, roomId, roleIds, userinfo }) => {
        if (typeof roleIds === "object" || roleIds?.length > 0) {
            roleIds.forEach((roleId) => {
                Object.values(userRoles).map((userRole) => {
                    if (userRole.id == roleId) {
                        peer.addRole(userRole);
                    }
                });
            });
        }

        if (userinfo) {
            peer.addRole(userRoles.AUTHENTICATED);

            if (userinfo.picture != null) {
                peer.picture = userinfo.picture;
            }

            if (userinfo.name != null) {
                peer.displayName = userinfo.name;
            }

            if (userinfo.email != null) {
                peer.email = userinfo.email;
            }
        }
    },
    // All authenicated users will be AUTHENTICATED,
    // and those with email ending with @example.com
    // will also be MODERATOR
    // userMapping: async ({ peer, roomId, userinfo }) => {
    //   if (userinfo.email && userinfo.email.endsWith("@example.com")) {
    //     peer.addRole(userRoles.MODERATOR);
    //   }
    //   peer.addRole(userRoles.AUTHENTICATED);
    // },
    // All authenicated users will be AUTHENTICATED,
    // and those with email ending with @example.com
    // will also be MODERATOR
    // userMapping: async ({ peer, roomId, userinfo }) => {
    //   if (userinfo.email && userinfo.email.endsWith("@gmail.com")) {
    //     peer.addRole(userRoles.MODERATOR);
    //   }
    //   peer.addRole(userRoles.AUTHENTICATED);
    // },

    // eslint-disable-next-line no-unused-vars
    // userMapping: async ({peer, roomId, userinfo}) => {
    //   if (userinfo.picture != null) {
    //     if (!userinfo.picture.match(/^http/g)) {
    //       peer.picture = `data:image/jpeg;base64, ${userinfo.picture}`;
    //     } else {
    //       peer.picture = userinfo.picture;
    //     }
    //   }

    //   if (userinfo.email && userinfo.email.endsWith("@gmail.com")) {
    //     peer.addRole(userRoles.MODERATOR);
    //   }
    //   peer.addRole(userRoles.AUTHENTICATED);

    //   if (userinfo.nickname != null) {
    //     peer.displayName = userinfo.nickname;
    //   }

    //   if (userinfo.name != null) {
    //     peer.displayName = userinfo.name;
    //   }

    //   if (userinfo.email != null) {
    //     peer.email = userinfo.email;
    //   }
    // },

    // All users have the role "NORMAL" by default. Other roles need to be
    // added in the "userMapping" function. The following accesses and
    // permissions are arrays of roles. Roles can be changed in userRoles.js
    //
    // Example:
    // [ userRoles.MODERATOR, userRoles.AUTHENTICATED ]
    accessFromRoles: {
        // The role(s) will gain access to the room
        // even if it is locked (!)
        [BYPASS_ROOM_LOCK]: [userRoles.ADMIN, userRoles.MODERATOR],
        // The role(s) will gain access to the room without
        // going into the lobby. If you want to restrict access to your
        // server to only directly allow authenticated users, you could
        // add the userRoles.AUTHENTICATED to the user in the userMapping
        // function, and change to BYPASS_LOBBY : [ userRoles.AUTHENTICATED ]
        [BYPASS_LOBBY]: [userRoles.NORMAL],
    },
    permissionsFromRoles: {
        // The role(s) have permission to lock/unlock a room
        [CHANGE_ROOM_LOCK]: [userRoles.MODERATOR],
        // The role(s) have permission to promote a peer from the lobby
        [PROMOTE_PEER]: [userRoles.MODERATOR],
        // The role(s) have permission to send chat messages
        [SEND_CHAT]: [userRoles.NORMAL],
        // The role(s) have permission to moderate chat
        [MODERATE_CHAT]: [],
        // The role(s) have permission to share screen
        [SHARE_SCREEN]: [
            userRoles.PRESENTER,
            userRoles.MODERATOR,
            userRoles.NORMAL,
        ],
        // The role(s) have permission to produce extra video
        [EXTRA_VIDEO]: [userRoles.NORMAL],
        // The role(s) have permission to share files
        [SHARE_FILE]: [userRoles.NORMAL],
        // The role(s) have permission to moderate files
        [MODERATE_FILES]: [userRoles.MODERATOR],
        // The role(s) have permission to moderate room (e.g. kick user)
        [MODERATE_ROOM]: [userRoles.MODERATOR],
        // The role(s) have permission to presenter room (e.g. share screen)
        [PRESENTER_ROOM]: [userRoles.PRESENTER],
        // The role(s) have permission to student room
        [STUDENT_ROOM]: [userRoles.STUDENT],
        // The role(s) have permission to local record room
        [RECORD_ROOM]: [userRoles.MODERATOR],
        // The role has permission to stream youtube video
        [SHARED_YOUTUBE_VIDEO]: [userRoles.MODERATOR],
        // The role(s) have permission to use whiteboard
        [WHITEBOARD]: [userRoles.NORMAL],
        // The role(s) have permission to use LaTeX
        [LATEX]: [userRoles.NORMAL],
        [SAVE_LATEX]: [userRoles.MODERATOR],
        [LOAD_LATEX]: [userRoles.MODERATOR, userRoles.NORMAL],
        // The role(s) have permission to class document
        [CLASS_DOCUMENT]: [userRoles.MODERATOR, userRoles.NORMAL],
        [SAVE_CLASS_DOCUMENT]: [userRoles.MODERATOR],
        // The role(s) have permission to controll breakout room
        [ACCESS_BREAKOUT_ROOMS]: [userRoles.MODERATOR, userRoles.NORMAL],
        [ADD_BREAKOUT_ROOMS]: [userRoles.MODERATOR],
        [REMOVE_BREAKOUT_ROOMS]: [userRoles.MODERATOR],
        [JOIN_BREAKOUT_ROOM]: [userRoles.MODERATOR, userRoles.NORMAL],
        [LEAVE_BREAKOUT_ROOM]: [userRoles.MODERATOR, userRoles.NORMAL],
        [ACCESS_QUIZ]: [userRoles.MODERATOR, userRoles.NORMAL],
        [SEND_QUIZ]: [userRoles.MODERATOR],
        [SUBMIT_QUIZ]: [userRoles.MODERATOR, userRoles.NORMAL],
        [PUBLIC_QUIZ_RESULT]: [userRoles.MODERATOR],
        [CLASS_ACTIVITIES]: [userRoles.NORMAL],
        [SYNC_DATA]: [
            userRoles.MODERATOR,
            userRoles.PRESENTER,
            userRoles.STUDENT,
        ],
    },
    // Array of permissions. If no peer with the permission in question
    // is in the room, all peers are permitted to do the action. The peers
    // that are allowed because of this rule will not be able to do this
    // action as soon as a peer with the permission joins. In this example
    // everyone will be able to lock/unlock room until a MODERATOR joins.
    allowWhenRoleMissing: [CHANGE_ROOM_LOCK],
    //allowWhenRoleMissing: [],
    // When truthy, the room will be open to all users when as long as there
    // are already users in the room
    activateOnHostJoin: true,
    // When set, maxUsersPerRoom defines how many users can join
    // a single room. If not set, there is no limit.
    // maxUsersPerRoom    : 20,
    // Allow access from multiple devices
    allowMultipleDevices: true,
    // Room size before spreading to new router
    routerScaleSize: 40,
    // Socket timout value
    requestTimeout: 20000,
    // Socket retries when timeout
    requestRetries: 3,
    // Record path
    basePathRecordFiles: "./files/tmps",
    // S3 config
    s3_config: {
        region: "ap-southeast-1",
        accessKeyId: "AKIAVWQASM55R7VVDWID",
        secretAccessKey: "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",
        bucketName: "cmc-record-dev",
    },
    breakout_rooms: {
        nameStrategy: "Breakout room #",
    },
    // Mediasoup settings
    mediasoup: {
        numWorkers: Object.keys(os.cpus()).length,
        // mediasoup Worker settings.
        worker: {
            logLevel: "debug",
            logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
        },
        // mediasoup Router settings.
        router: {
            // Router media codecs.
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2,
                    parameters: {
                        minptime: 10,
                        useinbandfec: 1,
                    },
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 90000,
                    parameters: {
                        "x-google-start-bitrate": 1000,
                    },
                },
                {
                    kind: "video",
                    mimeType: "video/VP9",
                    clockRate: 90000,
                    parameters: {
                        "profile-id": 2,
                        "x-google-start-bitrate": 1000,
                    },
                },
                {
                    kind: "video",
                    mimeType: "video/H264",
                    clockRate: 90000,
                    parameters: {
                        "packetization-mode": 1,
                        "profile-level-id": "4d0032",
                        "level-asymmetry-allowed": 1,
                        "x-google-start-bitrate": 1000,
                    },
                },
            ],
        },
        // mediasoup WebRtcTransport settings.
        webRtcTransport: {
            listenIps: getListenIps(),
            initialAvailableOutgoingBitrate: 1000000,
            minimumAvailableOutgoingBitrate: 600000,
            // Additional options that are not part of WebRtcTransportOptions.
            maxIncomingBitrate: 1000000,
        },
        plainRtpTransport: {
            listenIp: { ip: "0.0.0.0", announcedIp: null }, // TODO: Change announcedIp to your external IP or domain name
            rtcpMux: true,
            comedia: false,
        },
    },

    // Prometheus exporter
    prometheus: {
        deidentify: false, // deidentify IP addresses
        numeric: false, // show numeric IP addresses
        listen: "0.0.0.0",
        port: 9300, // allocated port
        quiet: false, // include fewer labels
    },
};
