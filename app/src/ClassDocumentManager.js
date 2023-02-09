import Logger from "./Logger";

import * as documentActions from "./store/actions/documentActions";
import * as roomActions from "./store/actions/roomActions";
import * as dockActions from "./store/actions/dockActions";
import randomColor from "randomcolor";
import { debounce } from "./utils";
import {
    CLASS_DOCUMENT_CURSOR_LATENCY,
    CLASS_DOCUMENT_TEXT_LATENCY,
    CLASS_DOCUMENT_CURSOR_FLAG_TIMEOUT,
} from "./constances";

const logger = new Logger("ClassDocumentManager");

const CLASS_DOCUMENT = "classDocument";

export default class ClassDocumentManager {
    constructor(roomClient, store) {
        this.roomClient = roomClient;
        this.store = store;
        this._color = randomColor();
        this._quill = null;
        this._cursors = null;
    }

    get quill() {
        return this._quill;
    }

    set quill(quill) {
        this._quill = quill;
        this._cursors = quill.getModule("cursors");

        this.notify("load");
    }

    dispose() {
        // nothing todo
    }

    updateQuill(delta) {
        this.quill?.updateContents(delta);
    }

    setContents(delta) {
        this.quill?.setContents(delta);
    }

    moveCursor(peer, range) {
        if (!this._cursors) {return;}

        this._cursors.createCursor(peer.id, peer.name, peer.color);
        this._cursors.moveCursor(peer.id, range);
        this._cursors.toggleFlag(peer.id, true);
        setTimeout(() => {
            this._cursors.toggleFlag(peer.id, false);
        }, CLASS_DOCUMENT_CURSOR_FLAG_TIMEOUT);
    }

    removeCursor(id) {
        if (!this._cursors) {return;}

        this._cursors.removeCursor(id);
    }

    enable() {
        this.quill?.enable();
    }

    async notify(method, data = null) {
        try {
            switch (method) {
            case "load":
                await this._notifyLoad();
                break;

            case "text-change": {
                const debounceUpdate = debounce(
                    this._notifyTextChange,
                    CLASS_DOCUMENT_TEXT_LATENCY
                ).bind(this);
                await debounceUpdate(data, this._quill.getContents());
                break;
            }

            case "selection-change": {
                const debounceUpdate = debounce(
                    this._notifySelectionChange,
                    CLASS_DOCUMENT_CURSOR_LATENCY
                ).bind(this);
                await debounceUpdate(data);
                break;
            }

            case "close":
                await this._notifyCloseUI();
                break;

            case "open":
                await this._notifyOpenUI();
                break;

            default:
                logger.debug(
                    `ClassDocumentManager notify ${method} not found`
                );
                break;
            }
        } catch (error) {
            logger.error('Error "%s"', error);
        }
    }

    // async _notifySave(delta) {
    //     await this.roomClient._sendRequest("classDocument", {
    //         method: "save",
    //         delta: delta,
    //     });
    // }

    async _notifyLoad() {
        await this.roomClient._sendRequest("classDocument", { method: "load" });
    }

    async _notifyTextChange(delta, source) {
        await this.roomClient._sendRequest("classDocument", {
            method : "text-change",
            delta,
            source,
        });
    }

    async _notifySelectionChange(range) {
        const peer = {
            id    : this.store.getState().me.id,
            name  : this.store.getState().settings.displayName,
            color : this._color,
        };

        await this.roomClient._sendRequest("classDocument", {
            method : "selection-change",
            range,
            peer,
        });
    }

    async _notifyOpenUI() {
        await this.roomClient._sendRequest("classDocument", { method: "open" });
    }
    async _notifyCloseUI() {
        await this.roomClient._sendRequest("classDocument", {
            method : "close",
        });
    }

    minimize() {
        this.store.dispatch(
            dockActions.addDockItem({
                id   : CLASS_DOCUMENT,
                type : CLASS_DOCUMENT,
                name : "Class document",
                open : () => {
                    this.openUI();
                    this.store.dispatch(
                        dockActions.removeDockItem(CLASS_DOCUMENT)
                    );
                },
            })
        );
        this.closeUI();
    }

    openUI() {
        this.store.dispatch(documentActions.setOnlineDocumentOpen(true));

        const { latexOpen } = this.store.getState().document;
        const { whiteboardOpen } = this.store.getState().whiteboard;
        const { selectedFile } = this.store.getState().presentation;

        if (selectedFile) {
            this.roomClient.minimizePresentationFile();
        }

        if (whiteboardOpen) {
            this.roomClient.getWhiteboardManager().minimize();
        }

        this.roomClient.getYoutubeManager().dispose();

        this.store.dispatch(roomActions.setEnableEventListenerKeys(false));

        this.store.dispatch(roomActions.setDisplayMode("filmstrip"));

        this.store.dispatch(dockActions.removeDockItem(CLASS_DOCUMENT));
    }

    closeUI() {
        this.store.dispatch(documentActions.setOnlineDocumentOpen(false));
        this.store.dispatch(roomActions.setEnableEventListenerKeys(true));

        this.dispose();

        this.notify("close").catch();
    }
}
