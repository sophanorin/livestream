const {
    YOUTUBE,
    CHATS,
    FILES,
    QUIZZES,
    BREAKOUT_ROOMS,
    CLASS_DOCUMENT,
    WHITEBOARD,
    LATEX,
} = require("./policy");

module.exports = {
    [YOUTUBE]: {
        name: "youtube",
        fileds: "youtubeLinks",
        method: "youtube",
        sync: true,
    },
    [FILES]: { name: "file", fileds: "files", method: "sendFile", sync: true },
    [CHATS]: {
        name: "chat",
        fileds: "chats",
        method: "chatMessage",
        sync: true,
    },
    [QUIZZES]: { name: "quiz", fileds: "quiz", method: "quiz", sync: true },
    [BREAKOUT_ROOMS]: {
        name: "breakoutRoom",
        fileds: "breakoutRooms",
        method: "breakoutRooms",
        sync: true,
    },
    [CLASS_DOCUMENT]: {
        name: "classDocument",
        fileds: "classDocument",
        method: "classDocument",
        sync: true,
    },
    [WHITEBOARD]: {
        name: "whiteboard",
        fileds: "whiteboard",
        method: "whiteboard",
        sync: true,
    },
    [LATEX]: { name: "latex", fileds: "latex", method: "LaTeX", sync: true },
};
