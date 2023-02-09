import React from "react";
import Logger from "./Logger";
import * as whiteboardActions from "./store/actions/whiteboardActions";
import * as roomActions from "./store/actions/roomActions";
import * as dockActions from "./store/actions/dockActions";

const logger = new Logger("WhiteboardManager");

const WHITEBOARD = "whiteboard";

export default class whiteboardManager {
    constructor(roomClient, store) {
        this.roomClient = roomClient;
        this.store = store;

        this._whiteboardRef = React.createRef();
    }

    get whiteboardRef() {
        return this._whiteboardRef;
    }

    set whiteboardRef(ref) {
        this._whiteboardRef = ref;
    }

    get whiteboard() {
        return this._whiteboardRef.current;
    }

    set whiteboard(whiteboard) {
        this._whiteboardRef.current = whiteboard;
    }

    async notify(method, data = null) {
        logger.debug("notify method: data, data: %o", data);
        try {
            switch (method) {
            case "open":
                await this._notifyOpenUI();
                break;
            case "close":
                await this._notifyCloseUI();
                break;
            default:
                logger.debug(`Method ${method} not found`);
                break;
            }
        } catch (error) {
            logger.error('Error "%s"', error);
        }
    }

    async _notifyOpenUI() {
        await this.roomClient._sendRequest("whiteboard", { method: "open" });
    }

    async _notifyCloseUI() {
        await this.roomClient._sendRequest("whiteboard", { method: "close" });
    }

    onPointerUpdate(payload) {
        logger.debug("onPointerUpdate payload: %o",payload)
    }

    onChange(element, state) {
        logger.debug("onChange element: %o, state: %o", element, state);
    }

    minimize() {
        this.store.dispatch(
            dockActions.addDockItem({
                id   : WHITEBOARD,
                type : WHITEBOARD,
                name : "Whiteboard",
                open : () => {
                    this.openUI();
                    this.store.dispatch(dockActions.removeDockItem(WHITEBOARD));
                },
            })
        );
        this.closeUI();
    }

    openUI() {
        this.store.dispatch(whiteboardActions.setWhiteboardOpen(true));

        const { latexOpen, documentOpen } = this.store.getState().document;
        const { selectedFile } = this.store.getState().presentation;

        if (selectedFile) {
            this.roomClient.minimizePresentationFile();
        }

        if (documentOpen) {
            this.roomClient.getClassDocumentManager().minimize();
        }

        this.roomClient.getYoutubeManager().dispose();

        this.store.dispatch(roomActions.setEnableEventListenerKeys(false));

        this.store.dispatch(roomActions.setDisplayMode("filmstrip"));

        this.store.dispatch(dockActions.removeDockItem(WHITEBOARD));

        this.notify("open").catch();
    }

    closeUI() {
        this.store.dispatch(whiteboardActions.setWhiteboardOpen(false));

        this.store.dispatch(roomActions.setEnableEventListenerKeys(true));

        this.notify("close").catch();
    }
}
