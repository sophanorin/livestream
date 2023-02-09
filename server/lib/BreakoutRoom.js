const Logger = require("./logger/Logger");

const logger = new Logger("BreakoutRoom");

class BreakoutRoom {
    constructor({ id, name, number, history }) {
        logger.info('constructor() [id:"%s", name:"%s"]', id, name);

        this._id = id;
        this._name = name;
        this._number = number;

        this._delta = history.classDocument || null;
        this._latex = history.latex || "";
        this._whiteboard = history.whiteboard || null;

        this._peers = [];
        this._lastN = [];

        this._chatHistory = history.chats || [];
        this._fileHistory = history.files || [];
        this._youtubeLinksHistory = history.youtubeLinks || [];
        this._quizHistory = history.quizzes || [];
        this._currentYoutubeLink = {
            url: null,
            progress: null,
            ownerId: null,
            status: null,
        };
    }

    set whiteboard(value) {
        return (this._whiteboard = value);
    }

    get whiteboard() {
        return this._whiteboard;
    }

    get delta() {
        return this._delta;
    }

    set delta(value) {
        return (this._delta = value);
    }

    get latex() {
        return this._latex;
    }

    set latex(value) {
        return (this._latex = value);
    }

    get youtubeLinksHistory() {
        return this._youtubeLinksHistory;
    }

    set youtubeLinksHistory(value) {
        return (this._youtubeLinksHistory = value);
    }

    get quizHistory() {
        return this._quizHistory;
    }

    set quizHistory(value) {
        return (this._quizHistory = value);
    }

    get quizResultHistory() {
        return this._quizResultHistory;
    }

    set quizResultHistory(value) {
        return (this._quizResultHistory = value);
    }

    get currentYoutubeLink() {
        return this._currentYoutubeLink;
    }

    set currentYoutubeLink(value) {
        return (this._currentYoutubeLink = value);
    }

    get id() {
        return this._id;
    }

    set id(value) {
        return (this._id = value);
    }

    get name() {
        return this._name;
    }

    set name(value) {
        return (this._name = value);
    }

    get number() {
        return this._number;
    }

    set number(value) {
        return (this._number = value);
    }

    get peers() {
        return this._peers;
    }

    set peers(value) {
        return (this._peers = value);
    }

    get chatHistory() {
        return this._chatHistory;
    }

    set chatHistory(value) {
        return (this._chatHistory = value);
    }

    get fileHistory() {
        return this._fileHistory;
    }

    set fileHistory(value) {
        return (this._fileHistory = value);
    }

    get lastN() {
        return this._lastN;
    }

    set lastN(value) {
        return (this._lastN = value);
    }

    get peerInfos() {
        const peers = [...this.peers];
        const peerInfos = peers.map((peer) => peer.peerInfo);
        return peerInfos;
    }

    checkEmpty() {
        return Object.keys(this._peers).length === 0;
    }

    addPeer(peer) {
        return this.peers.push(peer);
    }

    removePeer(peer) {
        return (this.peers = this.peers.filter(
            (joinedPeer) => joinedPeer.id != peer.id
        ));
    }

    addChat(chatMessage) {
        return this.chatHistory.push(chatMessage);
    }

    clearChat() {
        this.chatHistory = [];
    }

    addFile(file) {
        return this.fileHistory.push({ ...file });
    }

    addLastN(peerId) {
        // If we don't have this peer, add to end
        !this.lastN.includes(peerId) && this.lastN.push(peerId);
    }

    removeLastN(peerId) {
        this.lastN = this.lastN.filter((id) => id !== peerId);
    }

    get breakoutRoomInfo() {
        return {
            id: this.id,
            name: this.name,
            peers: this.peerInfos,
        };
    }

    getBreakoutRoomDatas() {
        return {
            id: this.id,
            name: this.name,
            number: this.number,
            files: this.fileHistory,
            chats: this.chatHistory,
            youtubeLinks: this.youtubeLinksHistory,
            quizzes: this._quizHistory,
            classDocument: this._delta,
            latex: this.latex,
            whiteboard: this.whiteboard,
        };
    }
}

module.exports = BreakoutRoom;
