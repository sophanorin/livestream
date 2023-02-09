const initialState = {
    name                                : "",
    // new/connecting/connected/disconnected/closed,
    state                               : "new",
    locked                              : false,
    inLobby                             : false,
    signInRequired                      : false,
    overRoomLimit                       : false,
    enableEventListenerKeys             : true,
    // access code to the room if locked and joinByAccessCode == true
    accessCode                          : "",
    // if true: accessCode is a possibility to open the room
    joinByAccessCode                    : true,
    activeSpeakerId                     : null,
    torrentSupport                      : false,
    showSettings                        : false,
    fullScreenConsumer                  : null, // ConsumerID
    windowConsumer                      : null, // ConsumerID
    toolbarsVisible                     : true,
    mode                                : window.config.defaultLayout || "democratic",
    selectedPeers                       : [],
    spotlights                          : [],
    rolesManagerPeer                    : null, // peerId
    settingsOpen                        : false,
    extraVideoOpen                      : false,
    hideSelfView                        : false,
    rolesManagerOpen                    : false,
    helpOpen                            : false,
    aboutOpen                           : false,
    currentSettingsTab                  : "video", // media, appearance, advanced
    lockDialogOpen                      : false,
    joined                              : false,
    closed                              : false,
    muteAllInProgress                   : false,
    lobbyPeersPromotionInProgress       : false,
    stopAllVideoInProgress              : false,
    closeMeetingInProgress              : false,
    clearChatInProgress                 : false,
    clearFileSharingInProgress          : false,
    roomPermissions                     : null,
    userRoles                           : null,
    allowWhenRoleMissing                : null,
    whiteboardOpen                      : false,
    devicePermissionOpen                : false,
    breakoutRooms                       : {},
    myBreakoutRoomId                    : null,
    groupMode                           : false,
    removeBreakoutRoomDialogMessageOpen : false,
    removingBreakoutRoomInfo            : {},
    mediaLoading                        : false,
    loading                             : false,
    moderatorLeaveDialogOpen            : false,
    canJoin                             : true,
    enableAnonymouseMode                : false,
    recordingState                      : null,
};

const room = (state = initialState, action) => {
    switch (action.type) {
    case "SET_ROOM_NAME": {
        const { name } = action.payload;

        return { ...state, name };
    }

    case "SET_ROOM_STATE": {
        const roomState = action.payload.state;

        if (roomState === "connected") {
            return { ...state, state: roomState };
        }
        return { ...state, state: roomState, activeSpeakerId: null };
    }

    case "SET_ROOM_LOCKED": {
        return { ...state, locked: true };
    }

    case "SET_ROOM_UNLOCKED": {
        return { ...state, locked: false };
    }

    case "SET_IN_LOBBY": {
        const { inLobby } = action.payload;

        return { ...state, inLobby };
    }

    case "SET_SIGN_IN_REQUIRED": {
        const { signInRequired } = action.payload;

        return { ...state, signInRequired };
    }
    case "SET_OVER_ROOM_LIMIT": {
        const { overRoomLimit } = action.payload;

        return { ...state, overRoomLimit };
    }
    case "SET_ACCESS_CODE": {
        const { accessCode } = action.payload;

        return { ...state, accessCode };
    }

    case "SET_JOIN_BY_ACCESS_CODE": {
        const { joinByAccessCode } = action.payload;

        return { ...state, joinByAccessCode };
    }

    case "SET_LOCK_DIALOG_OPEN": {
        const { lockDialogOpen } = action.payload;

        return { ...state, lockDialogOpen };
    }

    case "SET_SETTINGS_OPEN": {
        const { settingsOpen } = action.payload;

        return { ...state, settingsOpen };
    }

    case "SET_EXTRA_VIDEO_OPEN": {
        const { extraVideoOpen } = action.payload;

        return { ...state, extraVideoOpen };
    }

    case "SET_ROLES_MANAGER_PEER": {
        const { rolesManagerPeer } = action.payload;

        return { ...state, rolesManagerPeer };
    }

    case "SET_ROLES_MANAGER_OPEN": {
        const { rolesManagerOpen } = action.payload;

        return { ...state, rolesManagerOpen };
    }

    case "SET_HELP_OPEN": {
        const { helpOpen } = action.payload;

        return { ...state, helpOpen };
    }

    case "SET_ABOUT_OPEN": {
        const { aboutOpen } = action.payload;

        return { ...state, aboutOpen };
    }

    case "SET_SETTINGS_TAB": {
        const { tab } = action.payload;

        return { ...state, currentSettingsTab: tab };
    }

    case "SET_ROOM_ACTIVE_SPEAKER": {
        const { peerId } = action.payload;

        return { ...state, activeSpeakerId: peerId };
    }

    case "FILE_SHARING_SUPPORTED": {
        const { supported } = action.payload;

        return { ...state, torrentSupport: supported };
    }

    case "TOGGLE_JOINED": {
        const joined = true;

        return { ...state, joined };
    }

    case "TOGGLE_FULLSCREEN_CONSUMER": {
        const { consumerId } = action.payload;
        const currentConsumer = state.fullScreenConsumer;

        return {
            ...state,
            fullScreenConsumer : currentConsumer ? null : consumerId,
        };
    }

    case "TOGGLE_WINDOW_CONSUMER": {
        const { consumerId } = action.payload;
        const currentConsumer = state.windowConsumer;

        if (currentConsumer === consumerId) {
            return { ...state, windowConsumer: null };
        }
        return { ...state, windowConsumer: consumerId };
    }

    case "SET_TOOLBARS_VISIBLE": {
        const { toolbarsVisible } = action.payload;

        return { ...state, toolbarsVisible };
    }

    case "SET_DISPLAY_MODE":
        return { ...state, mode: action.payload.mode };

    case "ADD_SELECTED_PEER": {
        const { peerId } = action.payload;

        const selectedPeers = [...state.selectedPeers, peerId];

        return { ...state, selectedPeers };
    }

    // Also listen for peers leaving
    case "REMOVE_PEER":
    case "REMOVE_SELECTED_PEER": {
        const { peerId } = action.payload;

        const selectedPeers = state.selectedPeers.filter(
            (peer) => peer !== peerId
        );

        return { ...state, selectedPeers };
    }

    case "CLEAR_SELECTED_PEERS": {
        return { ...state, selectedPeers: [] };
    }

    case "SET_SPOTLIGHTS": {
        const { spotlights } = action.payload;

        return { ...state, spotlights };
    }

    case "CLEAR_SPOTLIGHTS": {
        return { ...state, spotlights: [] };
    }

    case "SET_LOBBY_PEERS_PROMOTION_IN_PROGRESS":
        return {
            ...state,
            lobbyPeersPromotionInProgress : action.payload.flag,
        };

    case "MUTE_ALL_IN_PROGRESS":
        return { ...state, muteAllInProgress: action.payload.flag };

    case "STOP_ALL_VIDEO_IN_PROGRESS":
        return { ...state, stopAllVideoInProgress: action.payload.flag };

    case "STOP_ALL_SCREEN_SHARING_IN_PROGRESS":
        return {
            ...state,
            stopAllScreenSharingInProgress : action.payload.flag,
        };

    case "CLOSE_MEETING_IN_PROGRESS":
        return { ...state, closeMeetingInProgress: action.payload.flag };

    case "CLEAR_CHAT_IN_PROGRESS":
        return { ...state, clearChatInProgress: action.payload.flag };

    case "CLEAR_FILE_SHARING_IN_PROGRESS":
        return {
            ...state,
            clearFileSharingInProgress : action.payload.flag,
        };

    case "SET_ROOM_PERMISSIONS": {
        const { roomPermissions } = action.payload;

        return { ...state, roomPermissions };
    }

    case "SET_USER_ROLES": {
        const { userRoles } = action.payload;

        return { ...state, userRoles };
    }

    case "SET_ALLOW_WHEN_ROLE_MISSING": {
        const { allowWhenRoleMissing } = action.payload;

        return { ...state, allowWhenRoleMissing };
    }

    case "SET_HIDE_SELF_VIEW": {
        const { hideSelfView } = action.payload;

        return { ...state, hideSelfView };
    }

    case "SET_WHITEBOARD_OPEN": {
        const { whiteboardOpen } = action.payload;

        return { ...state, whiteboardOpen };
    }

    case "SET_EVENT_LISTENER_KEYS": {
        const { enableEventListenerKeys } = action.payload;
        return { ...state, enableEventListenerKeys };
    }

    case "SET_DEVICE_PERMISSION_OPEN": {
        const { devicePermissionOpen } = action.payload;

        return { ...state, devicePermissionOpen };
    }

    case "SET_CURRENT_JOINING_BREAKOUT_ROOM": {
        const { breakoutRoomId } = action.payload;

        return {
            ...state,
            myBreakoutRoomId : breakoutRoomId,
        };
    }

    case "SET_BREAKOUT_ROOMS": {
        const { breakoutRooms } = action.payload;

        return { ...state, breakoutRooms };
    }

    case "ADD_BREAKOUT_ROOM": {
        const { breakoutRoom } = action.payload;
        return {
            ...state,
            breakoutRooms : {
                ...state.breakoutRooms,
                [breakoutRoom.id] : breakoutRoom,
            },
        };
    }

    case "REMOVE_BREAKOUT_ROOM": {
        const { breakoutRoomId } = action.payload;

        const breakoutRooms = state.breakoutRooms;

        delete breakoutRooms[breakoutRoomId];

        return { ...state, breakoutRooms: { ...breakoutRooms } };
    }

    case "ADD_PEER_TO_BREAKOUT_ROOM": {
        const { breakoutRoomId, peer } = action.payload;

        const breakoutRoom = state.breakoutRooms[breakoutRoomId];

        breakoutRoom.peers.push(peer);

        return {
            ...state,
            breakoutRooms : {
                ...state.breakoutRooms,
                [breakoutRoom.id] : breakoutRoom,
            },
        };
    }

    case "REMOVE_PEER_FROM_BREAKOUT_ROOM": {
        const { breakoutRoomId, peerId } = action.payload;

        const breakoutRoom = state.breakoutRooms[breakoutRoomId];

        breakoutRoom.peers = breakoutRoom.peers.filter(
            (peer) => peer.id !== peerId
        );

        return {
            ...state,
            breakoutRooms : {
                ...state.breakoutRooms,
                [breakoutRoomId] : breakoutRoom,
            },
        };
    }

    case "SET_PEER_BREAKOUT_ROOM": {
        const { peer_breakout_room } = action.payload;
        return { ...state, peer_breakout_room };
    }
    case "SET_GROUP_MODE": {
        const { groupMode } = action.payload;

        return { ...state, groupMode };
    }

    case "SET_PRE_JOIN_BREAKOUT_ROOM": {
        const value = action.payload;

        return { ...state, isPreJoinBreakoutRoom: value };
    }

    case "REMOVE_BREAKOUT_ROOM_DIALOG_MESSAGE": {
        const value = action.payload;

        return { ...state, removeBreakoutRoomDialogMessageOpen: value };
    }

    case "SET_REMOVING_BREAKOUT_ROOM_INFO": {
        const info = action.payload;

        return { ...state, removingBreakoutRoomInfo: info };
    }

    case "CLEAR_BREAKOUT_ROOM": {
        return {
            ...state,
            breakoutRooms                       : {},
            myBreakoutRoomId                    : null,
            groupMode                           : false,
            removeBreakoutRoomDialogMessageOpen : false,
            removingBreakoutRoomInfo            : {},
        };
    }

    case "SET_MEDIA_LOADING": {
        const { flag } = action.payload;
        return { ...state, mediaLoading: flag };
    }

    case "SET_ROOM_LOADING": {
        const { flag } = action.payload;
        return { ...state, loading: flag };
    }

    case "MODERATOR_LEAVE_DIALOG_OPEN": {
        const { flag } = action.payload;
        return { ...state, moderatorLeaveDialogOpen: flag };
    }

    case "TOGGLE_CAN_JOIN": {
        const { flag } = action.payload;

        return { ...state, canJoin: flag };
    }

    case "SET_ENABLE_ANONYMOUSE_MODE": {
        const { flag } = action.payload;

        return { ...state, enableAnonymouseMode: flag };
    }

    case "SET_RECORDING_STATE": {
        const { recordingState } = action.payload;

        return { ...state, recordingState };
    }

    default:
        return state;
    }
};

export default room;
