export const setRoomName = (name) => ({
    type    : "SET_ROOM_NAME",
    payload : { name },
});

export const setRoomState = (state) => ({
    type    : "SET_ROOM_STATE",
    payload : { state },
});

export const setRoomActiveSpeaker = (peerId) => ({
    type    : "SET_ROOM_ACTIVE_SPEAKER",
    payload : { peerId },
});

export const setRoomLocked = () => ({
    type : "SET_ROOM_LOCKED",
});

export const setRoomUnLocked = () => ({
    type : "SET_ROOM_UNLOCKED",
});

export const setInLobby = (inLobby) => ({
    type    : "SET_IN_LOBBY",
    payload : { inLobby },
});

export const setSignInRequired = (signInRequired) => ({
    type    : "SET_SIGN_IN_REQUIRED",
    payload : { signInRequired },
});

export const setOverRoomLimit = (overRoomLimit) => ({
    type    : "SET_OVER_ROOM_LIMIT",
    payload : { overRoomLimit },
});

export const setAccessCode = (accessCode) => ({
    type    : "SET_ACCESS_CODE",
    payload : { accessCode },
});

export const setJoinByAccessCode = (joinByAccessCode) => ({
    type    : "SET_JOIN_BY_ACCESS_CODE",
    payload : { joinByAccessCode },
});

export const setSettingsOpen = (settingsOpen) => ({
    type    : "SET_SETTINGS_OPEN",
    payload : { settingsOpen },
});

export const setExtraVideoOpen = (extraVideoOpen) => ({
    type    : "SET_EXTRA_VIDEO_OPEN",
    payload : { extraVideoOpen },
});

export const setRolesManagerOpen = (rolesManagerOpen) => ({
    type    : "SET_ROLES_MANAGER_OPEN",
    payload : { rolesManagerOpen },
});

export const setRolesManagerPeer = (rolesManagerPeer) => ({
    type    : "SET_ROLES_MANAGER_PEER",
    payload : { rolesManagerPeer },
});

export const setHelpOpen = (helpOpen) => ({
    type    : "SET_HELP_OPEN",
    payload : { helpOpen },
});

export const setAboutOpen = (aboutOpen) => ({
    type    : "SET_ABOUT_OPEN",
    payload : { aboutOpen },
});

export const setSettingsTab = (tab) => ({
    type    : "SET_SETTINGS_TAB",
    payload : { tab },
});

export const setLockDialogOpen = (lockDialogOpen) => ({
    type    : "SET_LOCK_DIALOG_OPEN",
    payload : { lockDialogOpen },
});

export const setFileSharingSupported = (supported) => ({
    type    : "FILE_SHARING_SUPPORTED",
    payload : { supported },
});

export const toggleConsumerWindow = (consumerId) => ({
    type    : "TOGGLE_WINDOW_CONSUMER",
    payload : { consumerId },
});

export const setToolbarsVisible = (toolbarsVisible) => ({
    type    : "SET_TOOLBARS_VISIBLE",
    payload : { toolbarsVisible },
});

export const setDisplayMode = (mode) => ({
    type    : "SET_DISPLAY_MODE",
    payload : { mode },
});

export const addSelectedPeer = (peerId) => ({
    type    : "ADD_SELECTED_PEER",
    payload : { peerId },
});

export const removeSelectedPeer = (peerId) => ({
    type    : "REMOVE_SELECTED_PEER",
    payload : { peerId },
});

export const clearSelectedPeers = () => ({
    type : "CLEAR_SELECTED_PEERS",
});

export const setSpotlights = (spotlights) => ({
    type    : "SET_SPOTLIGHTS",
    payload : { spotlights },
});

export const clearSpotlights = () => ({
    type : "CLEAR_SPOTLIGHTS",
});

export const toggleJoined = () => ({
    type : "TOGGLE_JOINED",
});

export const toggleConsumerFullscreen = (consumerId) => ({
    type    : "TOGGLE_FULLSCREEN_CONSUMER",
    payload : { consumerId },
});

export const setLobbyPeersPromotionInProgress = (flag) => ({
    type    : "SET_LOBBY_PEERS_PROMOTION_IN_PROGRESS",
    payload : { flag },
});

export const setMuteAllInProgress = (flag) => ({
    type    : "MUTE_ALL_IN_PROGRESS",
    payload : { flag },
});

export const setStopAllVideoInProgress = (flag) => ({
    type    : "STOP_ALL_VIDEO_IN_PROGRESS",
    payload : { flag },
});

export const setStopAllScreenSharingInProgress = (flag) => ({
    type    : "STOP_ALL_SCREEN_SHARING_IN_PROGRESS",
    payload : { flag },
});

export const setCloseMeetingInProgress = (flag) => ({
    type    : "CLOSE_MEETING_IN_PROGRESS",
    payload : { flag },
});

export const setClearChatInProgress = (flag) => ({
    type    : "CLEAR_CHAT_IN_PROGRESS",
    payload : { flag },
});

export const setClearFileSharingInProgress = (flag) => ({
    type    : "CLEAR_FILE_SHARING_IN_PROGRESS",
    payload : { flag },
});

export const setRoomPermissions = (roomPermissions) => ({
    type    : "SET_ROOM_PERMISSIONS",
    payload : { roomPermissions },
});

export const setUserRoles = (userRoles) => ({
    type    : "SET_USER_ROLES",
    payload : { userRoles },
});

export const setAllowWhenRoleMissing = (allowWhenRoleMissing) => ({
    type    : "SET_ALLOW_WHEN_ROLE_MISSING",
    payload : { allowWhenRoleMissing },
});

export const setHideSelfView = (hideSelfView) => ({
    type    : "SET_HIDE_SELF_VIEW",
    payload : { hideSelfView },
});

export const setEnableEventListenerKeys = (enableEventListenerKeys) => ({
    type    : "SET_EVENT_LISTENER_KEYS",
    payload : { enableEventListenerKeys },
});

export const setDevicePermissionOpen = (devicePermissionOpen) => ({
    type    : "SET_DEVICE_PERMISSION_OPEN",
    payload : { devicePermissionOpen },
});

export const setBreakoutRooms = (breakoutRooms) => ({
    type    : "SET_BREAKOUT_ROOMS",
    payload : { breakoutRooms },
});

export const addBreakoutRoom = (breakoutRoom) => ({
    type    : "ADD_BREAKOUT_ROOM",
    payload : { breakoutRoom },
});

export const removeBreakoutRoom = (breakoutRoomId) => ({
    type    : "REMOVE_BREAKOUT_ROOM",
    payload : { breakoutRoomId },
});

export const addPeerToBreakoutRoom = (breakoutRoomId, peer) => ({
    type    : "ADD_PEER_TO_BREAKOUT_ROOM",
    payload : {
        breakoutRoomId,
        peer,
    },
});

export const removePeerFromBreakoutRoom = (breakoutRoomId, peerId) => ({
    type    : "REMOVE_PEER_FROM_BREAKOUT_ROOM",
    payload : {
        breakoutRoomId,
        peerId,
    },
});

export const setCurrentJoiningBreakoutRoom = (breakoutRoomId) => ({
    type    : "SET_CURRENT_JOINING_BREAKOUT_ROOM",
    payload : { breakoutRoomId },
});

export const setGroupMode = (groupMode) => ({
    type    : "SET_GROUP_MODE",
    payload : {
        groupMode,
    },
});

export const setPreJoinBreakoutRoom = (value) => ({
    type    : "SET_PRE_JOIN_BREAKOUT_ROOM",
    payload : value,
});

export const setBreakoutRoomRemoveConfirmationDialogOpen = (value) => ({
    type    : "REMOVE_BREAKOUT_ROOM_DIALOG_MESSAGE",
    payload : value,
});

export const setRemovingBreakoutRoomInfo = (info) => ({
    type    : "SET_REMOVING_BREAKOUT_ROOM_INFO",
    payload : info,
});

export const clearBreakoutRoom = () => ({
    type : "CLEAR_BREAKOUT_ROOM",
});

export const setMediaLoading = (flag) => ({
    type    : "SET_MEDIA_LOADING",
    payload : { flag },
});

export const setRoomLoading = (flag) => ({
    type    : "SET_ROOM_LOADING",
    payload : { flag },
});

export const setModeratorLeaveDialogOpen = (flag) => ({
    type    : "MODERATOR_LEAVE_DIALOG_OPEN",
    payload : { flag },
});

export const toggleCanJoin = (flag) => ({
    type    : "TOGGLE_CAN_JOIN",
    payload : { flag },
});

export const setAnonymouseMode = (flag) => ({
    type    : "SET_ENABLE_ANONYMOUSE_MODE",
    payload : { flag },
});

export const setRecordingState = (recordingState) => ({
    type    : "SET_RECORDING_STATE",
    payload : { recordingState },
});
