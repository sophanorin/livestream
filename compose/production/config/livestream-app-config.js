// eslint-disable-next-line
var config = {
    loginEnabled: true,
    developmentPort: 3443,
    productionPort: 80,

    /**
     * Supported browsers version
     * in bowser satisfy format.
     * See more:
     * https://www.npmjs.com/package/bowser#filtering-browsers
     * Otherwise you got a unsupported browser page
     */
    supportedBrowsers: {
        windows: {
            "internet explorer": ">12",
            "microsoft edge": ">18",
        },
        safari: ">12",
        firefox: ">=60",
        chrome: ">=74",
        chromium: ">=74",
        opera: ">=62",
        "samsung internet for android": ">=11.1.1.52",
    },

    // Network priorities.
    networkPriorities: {
        audio: "high",
        mainVideo: "high",
        additionalVideos: "medium",
        screenShare: "medium",
    },

    /**
     * Resolutions:
     *
     * low ~ 320x240
     * medium ~ 640x480
     * high ~ 1280x720
     * veryhigh ~ 1920x1080
     * ultra ~ 3840x2560
     *
     **/

    /**
     * Frame rates:
     *
     * 1, 5, 10, 15, 20, 25, 30
     *
     **/
    // The aspect ratio of the videos as shown on
    // the screen. This is changeable in client settings.
    // This value must match one of the defined values in
    // viewAspectRatios EXACTLY (e.g. 1.333)
    viewAspectRatio: 1.777,
    // These are the selectable aspect ratios in the settings
    viewAspectRatios: [
        {
            value: 1.333, // 4 / 3
            label: "4 : 3",
        },
        {
            value: 1.777, // 16 / 9
            label: "16 : 9",
        },
    ],
    // The aspect ratio of the video from the camera
    // this is not changeable in settings, only config
    videoAspectRatio: 1.777,
    defaultResolution: "high",
    defaultFrameRate: 30,
    defaultScreenResolution: "veryhigh",
    defaultScreenSharingFrameRate: 30,
    // Enable or disable simulcast for webcam video
    simulcast: true,
    // Enable or disable simulcast for screen sharing video
    simulcastSharing: false,
    // Simulcast encoding layers and levels
    simulcastEncodings: [
        { scaleResolutionDownBy: 4 },
        { scaleResolutionDownBy: 2 },
        { scaleResolutionDownBy: 1 },
    ],

    // Define different encodings for various resolutions of the video.
    simulcastProfiles: {
        320: [
            {
                scaleResolutionDownBy: 1,
                maxBitRate: 150000,
            },
        ],
        640: [
            {
                scaleResolutionDownBy: 2,
                maxBitRate: 150000,
            },
            {
                scaleResolutionDownBy: 1,
                maxBitRate: 500000,
            },
        ],
        1280: [
            {
                scaleResolutionDownBy: 4,
                maxBitRate: 150000,
            },
            {
                scaleResolutionDownBy: 2,
                maxBitRate: 500000,
            },
            {
                scaleResolutionDownBy: 1,
                maxBitRate: 1200000,
            },
        ],
        1920: [
            {
                scaleResolutionDownBy: 6,
                maxBitRate: 150000,
            },
            {
                scaleResolutionDownBy: 3,
                maxBitRate: 500000,
            },
            {
                scaleResolutionDownBy: 1,
                maxBitRate: 3500000,
            },
        ],
        3840: [
            {
                scaleResolutionDownBy: 12,
                maxBitRate: 150000,
            },
            {
                scaleResolutionDownBy: 6,
                maxBitRate: 500000,
            },
            {
                scaleResolutionDownBy: 1,
                maxBitRate: 10000000,
            },
        ],
    },

    /**
     * Alternative simulcast setting:
     * [
     *   { maxBitRate: 50000 },
     *	 { maxBitRate: 1000000 },
     *	 { maxBitRate: 4800000 }
     *],
     **/

    /**
     * White listing browsers that support audio output device selection.
     * It is not yet fully implemented in Firefox.
     * See: https://bugzilla.mozilla.org/show_bug.cgi?id=1498512
     */
    audioOutputSupportedBrowsers: ["chrome", "opera"],
    // Socket.io request timeout
    requestTimeout: 20000,
    requestRetries: 3,
    transportOptions: {
        tcp: true,
    },
    // Auto gain control enabled.
    autoGainControl: true,

    // Echo cancellation enabled.
    echoCancellation: true,

    // Noise suppression enabled.
    noiseSuppression: true,

    // Automatically unmute speaking above noiseThreshold.
    voiceActivatedUnmute: false,

    // This is only for voiceActivatedUnmute and audio-indicator.
    noiseThreshold: -60,

    // The audio sample rate.
    sampleRate: 48000,

    // The audio channels count.
    channelCount: 1,

    // The audio sample size count.
    sampleSize: 16,

    // If OPUS FEC stereo be enabled.
    opusStereo: false,

    // If OPUS DTX should be enabled.
    opusDtx: true,

    // If OPUS FEC should be enabled.
    opusFec: true,

    // The OPUS packet time.
    opusPtime: 20,

    // The OPUS playback rate.
    opusMaxPlaybackRate: 48000,

    // The audio preset
    audioPreset: "conference",

    // The audio presets.
    audioPresets: {
        conference: {
            name: "Conference audio",
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
            voiceActivatedUnmute: false,
            noiseThreshold: -60,
            sampleRate: 48000,
            channelCount: 1,
            sampleSize: 16,
            opusStereo: false,
            opusDtx: true,
            opusFec: true,
            opusPtime: 20,
            opusMaxPlaybackRate: 48000,
        },
        hifi: {
            name: "HiFi streaming",
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
            voiceActivatedUnmute: false,
            noiseThreshold: -60,
            sampleRate: 48000,
            channelCount: 2,
            sampleSize: 16,
            opusStereo: true,
            opusDtx: false,
            opusFec: true,
            opusPtime: 60,
            opusMaxPlaybackRate: 48000,
        },
    },
    // Audio options for now only centrally from config file:
    centralAudioOptions: {
        sampleRate: 96000, // default : 96khz / will not eat that much bandwith thanks to opus
        channelCount: 1, // default : 1 / usually mics are mono so this saves bandwidth
        volume: 1.0, // default : 1.0
        sampleSize: 16, // default : 16
        opusStereo: false, // default : false / usually mics are mono so this saves bandwidth
        opusDtx: true, // default : true / will save bandwidth
        opusFec: true, // default : true / forward error correction
        opusPtime: "20", // default : 20 / minimum packet time (3, 5, 10, 20, 40, 60, 120)
        opusMaxPlaybackRate: 96000,
    },
    /**
     * Set max number participants in one room that join
     * unmuted. Next participant will join automatically muted
     * Default value is 4
     *
     * Set it to 0 to auto mute all,
     * Set it to negative (-1) to never automatically auto mute
     * but use it with caution
     * full mesh audio strongly decrease room capacity!
     */
    autoMuteThreshold: 4,
    defaultLayout: "democratic", // democratic, filmstrip
    // If true, will show media control buttons in separate
    // control bar, not in the ME container.
    buttonControlBar: true,
    // If false, will push videos away to make room for side
    // drawer. If true, will overlay side drawer over videos
    drawerOverlayed: false,
    // Position of notifications
    notificationPosition: "right",
    notificationVertical: "top",

    // It sets the notifications sounds.
    // Valid keys are: 'parkedPeer', 'parkedPeers', 'raisedHand',
    // 'chatMessage', 'sendFile', 'newPeer' and 'default'.
    // Not defining a key is equivalent to using the default notification sound.
    // Setting 'play' to null disables the sound notification.
    //
    notificationSounds: {
        chatMessage: {
            play: "/sounds/notify-chat.mp3",
        },
        raisedHand: {
            play: "/sounds/notify-hand.mp3",
        },
        default: {
            delay: 5000,
            play: "/sounds/notify.mp3",
        },
    },
    testSound: {
        play: "/sounds/speaker-test.mp3",
    },

    // Timeout for autohiding topbar and button control bar
    hideTimeout: 3000,
    // max number of participant that will be visible in
    // as speaker
    lastN: 4,
    mobileLastN: 1,
    // Highest number of lastN the user can select manually in
    // userinteface
    maxLastN: 40,
    // If truthy, users can NOT change number of speakers visible
    lockLastN: false,
    // Show logo if "logo" is not null, else show title
    // Set logo file name using logo.* pattern like "logo.png" to not track it by git
    logo: "images/logo.svg",
    title: "Livestream",
    background: "images/background.jpg",
    backgroundSplines: {
        default: "images/background.svg",
        splines: "images/splines.svg",
    },
    // Service & Support URL
    // if not set then not displayed on the about modals
    supportUrl: "https://support.livestream.com",
    // Privacy and dataprotection URL or path
    // by default privacy/privacy.html
    // that is a placeholder for your policies
    //
    // but an external url could be also used here
    privacyUrl: "privacy/privacy.html",
    // Notistack Max Snack
    notistack: {
        maxSnack: 3,
    },
    // Recorder formats
    recordContainnt: {
        video: {
            displaySurface: "browser",
            width: 1280,
            height: 720,
            frameRate: 20,
            aspectRatio: { ideal: 1.7777777778 },
            facingMode: "user",
        },
        audio: {
            sampleSize: 16,
            channelCount: 2,
            echoCancellation: true,
        },
        audioBitsPerSecond: 96000,
        videoBitsPerSecond: 960000,
    },
    recordSliceSize: 10000,
};
