const initialState = {
    displayName             : "",
    selectedWebcam          : null,
    selectedAudioDevice     : null,
    advancedMode            : false,
    autoGainControl         : window.config.autoGainControl,
    echoCancellation        : window.config.echoCancellation,
    noiseSuppression        : window.config.noiseSuppression,
    voiceActivatedUnmute    : window.config.voiceActivatedUnmute,
    noiseThreshold          : window.config.noiseThreshold,
    audioMuted              : false,
    videoMuted              : false,
    // low, medium, high, veryhigh, ultra
    resolution              : window.config.defaultResolution || "medium",
    frameRate               : window.config.defaultFrameRate || 15,
    screenSharingResolution :
        window.config.defaultScreenResolution || "veryhigh",
    screenSharingFrameRate    : window.config.defaultScreenSharingFrameRate || 5,
    recorderPreferredMimeType :
        window.window.config.defaultRecorderMimeType || "video/webm",
    lastN                   : 4,
    permanentTopBar         : window.config.permanentTopBar,
    hiddenControls          : false,
    showNotifications       : true,
    notificationSounds      : true,
    mirrorOwnVideo          : true,
    hideNoVideoParticipants : false,
    buttonControlBar        : window.config.buttonControlBar,
    drawerOverlayed         : window.config.drawerOverlayed,
    aspectRatio             : window.config.viewAspectRatio || 1.777, // 16 : 9
    mediaPerms              : { audio: true, video: true },
    localPicture            : null,
    audioPreset             : window.config.audioPreset,
    audioPresets            : window.config.audioPresets,
    sampleRate              : window.config.sampleRate,
    channelCount            : window.config.channelCount,
    sampleSize              : window.config.sampleSize,
    opusStereo              : window.config.opusStereo,
    opusDtx                 : window.config.opusDtx,
    opusFec                 : window.config.opusFec,
    opusPtime               : window.config.opusPtime,
    opusMaxPlaybackRate     : window.config.opusMaxPlaybackRate,
    enableOpusDetails       : false,
    speakerTestPlaying      : false,
};

const settings = (state = initialState, action) => {
    switch (action.type) {
    case "CHANGE_WEBCAM": {
        return { ...state, selectedWebcam: action.payload.deviceId };
    }

    case "CHANGE_AUDIO_DEVICE": {
        return { ...state, selectedAudioDevice: action.payload.deviceId };
    }

    case "CHANGE_AUDIO_OUTPUT_DEVICE": {
        return {
            ...state,
            selectedAudioOutputDevice : action.payload.deviceId,
        };
    }

    case "SET_DISPLAY_NAME": {
        const { displayName } = action.payload;

        return { ...state, displayName };
    }

    case "TOGGLE_ADVANCED_MODE": {
        const advancedMode = !state.advancedMode;

        return { ...state, advancedMode };
    }

    case "SET_SAMPLE_RATE": {
        const { sampleRate } = action.payload;

        return { ...state, sampleRate, opusMaxPlaybackRate: sampleRate };
    }

    case "SET_CHANNEL_COUNT": {
        const { channelCount } = action.payload;

        return { ...state, channelCount, opusStereo: channelCount > 1 };
    }

    case "SET_VOLUME": {
        const { volume } = action.payload;

        return { ...state, volume };
    }

    case "SET_AUTO_GAIN_CONTROL": {
        const { autoGainControl } = action.payload;

        return { ...state, autoGainControl };
    }

    case "SET_AUDIO_PRESET": {
        const { audioPreset } = action.payload;

        return { ...state, audioPreset };
    }

    case "SET_ECHO_CANCELLATION": {
        const { echoCancellation } = action.payload;

        return { ...state, echoCancellation };
    }

    case "SET_NOISE_SUPPRESSION": {
        const { noiseSuppression } = action.payload;

        return { ...state, noiseSuppression };
    }

    case "SET_VOICE_ACTIVATED_UNMUTE": {
        const { voiceActivatedUnmute } = action.payload;

        return { ...state, voiceActivatedUnmute };
    }

    case "SET_NOISE_THRESHOLD": {
        const { noiseThreshold } = action.payload;

        return { ...state, noiseThreshold };
    }

    case "SET_OPUS_STEREO": {
        const { opusStereo } = action.payload;

        return { ...state, opusStereo };
    }

    case "SET_OPUS_DTX": {
        const { opusDtx } = action.payload;

        return { ...state, opusDtx };
    }

    case "SET_OPUS_FEC": {
        const { opusFec } = action.payload;

        return { ...state, opusFec };
    }

    case "SET_OPUS_PTIME": {
        const { opusPtime } = action.payload;

        return { ...state, opusPtime };
    }

    case "SET_OPUS_MAX_PLAYBACK_RATE": {
        const { opusMaxPlaybackRate } = action.payload;

        return { ...state, opusMaxPlaybackRate };
    }

    case "SET_ENABLE_OPUS_DETAILS": {
        const { enableOpusDetails } = action.payload;

        return { ...state, enableOpusDetails };
    }

    case "SET_DEFAULT_AUDIO": {
        const { audio } = action.payload;

        return { ...state, audio };
    }

    case "SET_SAMPLE_SIZE": {
        const { sampleSize } = action.payload;

        return { ...state, sampleSize };
    }

    case "SET_ASPECT_RATIO": {
        const { aspectRatio } = action.payload;

        return { ...state, aspectRatio };
    }

    case "SET_LAST_N": {
        const { lastN } = action.payload;

        return { ...state, lastN };
    }

    case "TOGGLE_PERMANENT_TOPBAR": {
        const permanentTopBar = !state.permanentTopBar;

        return { ...state, permanentTopBar };
    }

    case "TOGGLE_BUTTON_CONTROL_BAR": {
        const buttonControlBar = !state.buttonControlBar;

        return { ...state, buttonControlBar };
    }

    case "TOGGLE_DRAWER_OVERLAYED": {
        const drawerOverlayed = !state.drawerOverlayed;

        return { ...state, drawerOverlayed };
    }

    case "TOGGLE_HIDDEN_CONTROLS": {
        const hiddenControls = !state.hiddenControls;

        return { ...state, hiddenControls };
    }

    case "TOGGLE_NOTIFICATION_SOUNDS": {
        const notificationSounds = !state.notificationSounds;

        return { ...state, notificationSounds };
    }

    case "TOGGLE_SHOW_NOTIFICATIONS": {
        const showNotifications = !state.showNotifications;

        return { ...state, showNotifications };
    }

    case "SET_VIDEO_RESOLUTION": {
        const { resolution } = action.payload;

        return { ...state, resolution };
    }

    case "SET_VIDEO_FRAME_RATE": {
        const { frameRate } = action.payload;

        return { ...state, frameRate };
    }

    case "SET_SCREEN_SHARING_RESOLUTION": {
        const { screenSharingResolution } = action.payload;

        return { ...state, screenSharingResolution };
    }

    case "SET_SCREEN_SHARING_FRAME_RATE": {
        const { screenSharingFrameRate } = action.payload;

        return { ...state, screenSharingFrameRate };
    }

    case "TOGGLE_MIRROR_OWN_VIDEO": {
        const mirrorOwnVideo = !state.mirrorOwnVideo;

        return { ...state, mirrorOwnVideo };
    }

    case "TOGGLE_HIDE_NO_VIDEO_PARTICIPANTS": {
        const hideNoVideoParticipants = !state.hideNoVideoParticipants;

        return { ...state, hideNoVideoParticipants };
    }

    case "SET_MEDIA_PERMS": {
        const { mediaPerms } = action.payload;

        return { ...state, mediaPerms };
    }

    case "SET_AUDIO_MUTED": {
        const { audioMuted } = action.payload;

        return { ...state, audioMuted };
    }

    case "SET_VIDEO_MUTED": {
        const { videoMuted } = action.payload;

        return { ...state, videoMuted };
    }

    case "SET_LOCAL_PICTURE": {
        const { localPicture } = action.payload;

        return { ...state, localPicture };
    }

    case "SET_RECORDER_SUPPORTED_MIME_TYPES": {
        const { recorderSupportedMimeTypes } = action.payload;

        return { ...state, recorderSupportedMimeTypes };
    }

    case "SET_RECORDER_PREFERRED_MIME_TYPE": {
        const { recorderPreferredMimeType } = action.payload;

        return { ...state, recorderPreferredMimeType };
    }

    case "SET_SPEAKER_TEST_PLAYING": {
        const { flag } = action.payload;
        return { ...state, speakerTestPlaying: flag };
    }

    default:
        return state;
    }
};

export default settings;
