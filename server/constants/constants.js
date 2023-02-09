const config = require("../config/config");

const MAIN_CHANNEL = "manager-notify";
const PAYLOADS = {
    CLOSE_MEETING_ROOM: "close-meeting-room",
};

const SAVE_CLASS_DOCUMENT_LATENCY = 20000; //ms
const SAVE_LATEX_LATENCY = 20000; //ms

const SYNC_ROOM_DATA_INTERVAL_MS = 5000; //ms
const SYNC_PEER_ACTIVITY_INTERVAL_MS = 2000; //ms

const UNLINKSYNC_TIME = 3000; //ms
const SELF_DESTRUCT_COUNT_DOWN_TIMEOUT = 60000; //ms

const ROUTER_SCALE_SIZE = config.routerScaleSize || 40; //router numbers

const ActivityCode = {
    RAISED_HAND: "raised hand",
    ANSWERING: "answering",
    DISCONNECT: "disconnect",
    REJOIN: "rejoin",
};

module.exports = {
    MAIN_CHANNEL,
    PAYLOADS,
    SAVE_CLASS_DOCUMENT_LATENCY,
    SAVE_LATEX_LATENCY,
    SYNC_ROOM_DATA_INTERVAL_MS,
    SYNC_PEER_ACTIVITY_INTERVAL_MS,
    UNLINKSYNC_TIME,
    SELF_DESTRUCT_COUNT_DOWN_TIMEOUT,
    ROUTER_SCALE_SIZE,
    ActivityCode,
};
