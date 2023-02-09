import * as roomActions from "./store/actions/roomActions";

const REQUEST_METHOD = "breakoutRooms";
export class BreakoutRoomsManager {
    constructor(roomClient, store) {
        this.roomClient = roomClient;
        this.store = store;
    }

    async addBreakoutRooms() {
        await this.roomClient._sendRequest(REQUEST_METHOD, {
            method : "addBreakoutRooms",
        });
    }

    async removeBreakoutRoom(breakoutRoomId) {
        await this.roomClient._sendRequest(REQUEST_METHOD, {
            method : "removeBreakoutRooms",
            data   : {
                breakoutRoomId,
            },
        });
    }

    async joinBreakoutRoom() {
        const breakoutRoomId = this.store.getState().room.myBreakoutRoomId;
        await this.roomClient._sendRequest(REQUEST_METHOD, {
            method : "joinBreakoutRoom",
            data   : {
                breakoutRoomId,
            },
        });
    }

    async leaveBreakoutRoom() {
        const breakoutRoomId = this.store.getState().room.myBreakoutRoomId;
        if (!breakoutRoomId) {return;}

        await this.roomClient._sendRequest(REQUEST_METHOD, {
            method : "leaveBreakoutRoom",
            data   : {
                breakoutRoomId,
            },
        });
    }

    preJoinBreakoutRoom(breakoutRoomId) {
        this.store.dispatch(
            roomActions.setCurrentJoiningBreakoutRoom(breakoutRoomId)
        );
        this.store.dispatch(roomActions.setPreJoinBreakoutRoom(true));
        this.store.dispatch(roomActions.setDevicePermissionOpen(true));
    }
}
