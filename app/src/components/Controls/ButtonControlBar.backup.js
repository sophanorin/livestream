import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    meProducersSelector,
    lobbyPeersKeySelector,
    peersLengthSelector,
    raisedHandsSelector,
    makePermissionSelector,
    recordingInProgressSelector,
} from "../../store/selectors";
import { withStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import classnames from "classnames";
import * as whiteboardActions from "../../store/actions/whiteboardActions";
import * as youtubeManagerActions from "../../store/actions/youtubeManagerActions";
import * as notificationActions from "../../store/actions/notificationActions";
import * as meActions from "../../store/actions/meActions";
import * as roomActions from "../../store/actions/roomActions";
import * as appPropTypes from "../appPropTypes";
import * as toolareaActions from "../../store/actions/toolareaActions";
import * as documentActions from "../../store/actions/documentActions";
import { withRoomContext } from "../../RoomContext";
import { useIntl, FormattedMessage } from "react-intl";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideoIcon from "@material-ui/icons/Videocam";
import VideoOffIcon from "@material-ui/icons/VideocamOff";
import ScreenIcon from "@material-ui/icons/ScreenShare";
import LogoutIcon from "@material-ui/icons/ExitToApp";
import PanIcon from "@material-ui/icons/PanTool";
import MoreIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@material-ui/core/MenuItem";
import Badge from "@material-ui/core/Badge";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import SelfViewOnIcon from "@material-ui/icons/Videocam";
import SelfViewOffIcon from "@material-ui/icons/VideocamOff";
import HelpIcon from "@material-ui/icons/Help";
import InfoIcon from "@material-ui/icons/Info";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import VideoCallIcon from "@material-ui/icons/VideoCall";
import SettingsIcon from "@material-ui/icons/Settings";
import SecurityIcon from "@material-ui/icons/Security";
import PeopleIcon from "@material-ui/icons/People";
import ChatIcon from "@material-ui/icons/QuestionAnswer";
import AttachmentIcon from "@material-ui/icons/AttachFile";
import FullScreenIcon from "@material-ui/icons/Fullscreen";
import FullScreenExitIcon from "@material-ui/icons/FullscreenExit";
import AccountCircle from "@material-ui/icons/AccountCircle";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import DescriptionIcon from "@material-ui/icons/Description";
import StopIcon from "@material-ui/icons/Stop";
import FunctionsIcon from "@material-ui/icons/Functions";
import SvgIcon from "@material-ui/core/SvgIcon";
import { store } from "../../store/store";

import {
    recorder,
    RECORDING_START,
    RECORDING_PAUSE,
    RECORDING_RESUME,
} from "../../store/actions/recorderActions";

import {
    YOUTUBE_START,
    YOUTUBE_PLAYING,
    YOUTUBE_PAUSE,
} from "../../store/actions/youtubeManagerActions";

import { permissions } from "../../permissions";

import Logger from "../../Logger";

const logger = new Logger("Recorder");

const styles = (theme) => ({
    root : {
        position                     : "fixed",
        display                      : "flex",
        zIndex                       : 30,
        background                   : "rgba(73, 75, 94, 0.2)",
        backdropFilter               : `blur(${theme.spacing(1.5)}px)`,
        borderTopRightRadius         : "var(--peer-border-radius-sm)",
        borderTopLeftRadius          : "var(--peer-border-radius-sm)",
        width                        : "100%",
        [theme.breakpoints.up("md")] : {
            justifyContent : "center",
            alignItems     : "center",
            bottom         : 0,
            // left: theme.spacing(8),
            // right: theme.spacing(8),
        },
        [theme.breakpoints.down("sm")] : {
            flexDirection  : "row",
            justifyContent : "center",
            alignItems     : "center",
            bottom         : 0,
            // left: theme.spacing(1),
            // right: theme.spacing(1),
        },
    },
    persistentDrawerOpen : {
        width                          : "calc(100% - 20vw)",
        marginRight                    : "20vw",
        [theme.breakpoints.down("lg")] : {
            width       : "calc(100% - 30vw)",
            marginRight : "30vw",
        },
        [theme.breakpoints.down("md")] : {
            width       : "calc(100% - 35vw)",
            marginRight : "50vw",
        },
        [theme.breakpoints.down("sm")] : {
            width       : "calc(100% - 40vw)",
            marginRight : "70vw",
        },
        [theme.breakpoints.down("xs")] : {
            width       : "calc(100% - 90vw)",
            marginRight : "90vw",
        },
    },
    fab : {
        margin                         : theme.spacing(1.5),
        borderRadius                   : "var(--peer-border-radius-sm)",
        backgroundColor                : "white",
        [theme.breakpoints.down("sm")] : {
            margin : theme.spacing(1),
        },
    },
    fabLogout : {
        margin                         : theme.spacing(1.5),
        borderRadius                   : "var(--peer-border-radius-sm)",
        [theme.breakpoints.down("sm")] : {
            margin : theme.spacing(1),
        },
    },
    show : {
        opacity    : 1,
        transition : "opacity .5s",
    },
    hide : {
        opacity    : 0,
        transition : "opacity .5s",
    },
    move : {
        justifyContent                 : "center",
        alignItems                     : "center",
        marginLeft                     : theme.spacing(5),
        marginRight                    : theme.spacing(5),
        left                           : "20vw",
        right                          : 0,
        [theme.breakpoints.down("lg")] : {
            left : "30vw",
        },
        [theme.breakpoints.down("md")] : {
            left : "35vw",
        },
        [theme.breakpoints.down("sm")] : {
            left : "40vw",
        },
        [theme.breakpoints.down("xs")] : {
            left : "90vw",
        },
    },
    defaultIcon : {
        color   : "#555A63",
        opacity : 0.9,
    },

    transparentBackgroud : {
        backgroundColor : "transparent",
        boxShadow       : "none",
    },
    menuButton : {
        margin  : 0,
        padding : 0,
    },
    logo : {
        display                        : "block",
        width                          : "64px",
        marginLeft                     : 20,
        [theme.breakpoints.down("md")] : {
            marginLeft : "30%",
        },
    },
    divider : {
        marginLeft : theme.spacing(3),
    },
    show : {
        opacity    : 1,
        transition : "opacity .5s",
    },
    hide : {
        opacity    : 0,
        transition : "opacity .5s",
    },
    grow : {
        flexGrow : 1,
    },
    title : {
        display                      : "none",
        marginLeft                   : 20,
        [theme.breakpoints.up("sm")] : {
            display : "block",
        },
    },
    sectionDesktop : {
        display                      : "none",
        alignItems                   : "center",
        [theme.breakpoints.up("md")] : {
            display    : "flex",
            alignItems : "center",
        },
    },
    sectionMobile : {
        display                      : "flex",
        [theme.breakpoints.up("md")] : {
            display : "none",
        },
    },
    actionButton : {
        // margin: theme.spacing(1, 0),
        // padding: theme.spacing(0, 1),
    },
    disabledButton : {
        margin : theme.spacing(1, 0),
    },
    green : {
        color : "rgba(0, 153, 0, 1)",
    },
    moreAction : {
        margin : theme.spacing(0.5, 0, 0.5, 1.5),
    },
});

const ButtonControlBar = (props) => {
    const intl = useIntl();
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMenu, setCurrentMenu] = useState(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const {
        peersLength,
        lobbyPeers,
        document,
        room,
        youtube,
        isMobile,
        isSafari,
        roomClient,
        toolbarsVisible,
        hiddenControls,
        permanentTopBar,
        drawerOverlayed,
        toolAreaOpen,
        me,
        micProducer,
        webcamProducer,
        screenProducer,
        classes,
        theme,
        recordingState,
        producers,
        consumers,
        setSettingsOpen,
        setEnableEventListenerKeys,
        setShareVideoDialogOpen,
        setWhiteboardOpen,
        setExtraVideoOpen,
        setHelpOpen,
        setAboutOpen,
        setHideSelfView,
        loggedIn,
        loginEnabled,
        fullscreenEnabled,
        fullscreen,
        onFullscreen,
        unread,
        unreadMessages,
        unreadFiles,
        canProduceExtraVideo,
        canLock,
        canRecord,
        canUseWhiteboard,
        canUseLaTeX,
        canUseClassDocument,
        canSharedYoutubeVideo,
        openUsersTab,
        openChatTab,
        openFileSharingTab,
        setOnlineDocumentOpen,
        setLatexOpen,
    } = props;

    // did it change?
    recorder.checkMicProducer(producers);
    recorder.checkAudioConsumer(consumers);

    const lockTooltip = room.locked
        ? intl.formatMessage({
            id             : "tooltip.unLockRoom",
            defaultMessage : "Unlock room",
        })
        : intl.formatMessage({
            id             : "tooltip.lockRoom",
            defaultMessage : "Lock room",
        });

    const fullscreenTooltip = fullscreen
        ? intl.formatMessage({
            id             : "tooltip.leaveFullscreen",
            defaultMessage : "Leave fullscreen",
        })
        : intl.formatMessage({
            id             : "tooltip.enterFullscreen",
            defaultMessage : "Enter fullscreen",
        });

    const loginTooltip = loggedIn
        ? intl.formatMessage({
            id             : "tooltip.logout",
            defaultMessage : "Log out",
        })
        : intl.formatMessage({
            id             : "tooltip.login",
            defaultMessage : "Log in",
        });

    const recordingTooltip =
        recordingState === RECORDING_START ||
        recordingState === RECORDING_RESUME
            ? intl.formatMessage({
                id             : "tooltip.stopRecording",
                defaultMessage : "Stop recording",
            })
            : intl.formatMessage({
                id             : "tooltip.startRecording",
                defaultMessage : "Start recording",
            });

    const recordingPausedTooltip =
        recordingState === RECORDING_PAUSE
            ? intl.formatMessage({
                id             : "tooltip.resumeRecording",
                defaultMessage : "Resume recording",
            })
            : intl.formatMessage({
                id             : "tooltip.pauseRecording",
                defaultMessage : "Pause recording",
            });

    let raisedHandTip;
    if (me.raisedHand) {
        raisedHandTip = intl.formatMessage({
            id             : "device.lowerHand",
            defaultMessage : "Lower Hand",
        });
    } else {
        raisedHandTip = intl.formatMessage({
            id             : "device.raiseHand",
            defaultMessage : "Raise Hand",
        });
    }

    let micState;

    let micTip;

    if (!me.canSendMic) {
        micState = "unsupported";
        micTip = intl.formatMessage({
            id             : "device.audioUnsupported",
            defaultMessage : "Audio unsupported",
        });
    } else if (!micProducer) {
        micState = "off";
        micTip = intl.formatMessage({
            id             : "device.activateAudio",
            defaultMessage : "Activate audio",
        });
    } else if (!micProducer.locallyPaused && !micProducer.remotelyPaused) {
        micState = "on";
        micTip = intl.formatMessage({
            id             : "device.muteAudio",
            defaultMessage : "Mute audio",
        });
    } else {
        micState = "muted";
        micTip = intl.formatMessage({
            id             : "device.unMuteAudio",
            defaultMessage : "Unmute audio",
        });
    }

    let webcamState;

    let webcamTip;

    if (!me.canSendWebcam) {
        webcamState = "unsupported";
        webcamTip = intl.formatMessage({
            id             : "device.videoUnsupported",
            defaultMessage : "Video unsupported",
        });
    } else if (webcamProducer) {
        webcamState = "on";
        webcamTip = intl.formatMessage({
            id             : "device.stopVideo",
            defaultMessage : "Stop video",
        });
    } else {
        webcamState = "off";
        webcamTip = intl.formatMessage({
            id             : "device.startVideo",
            defaultMessage : "Start video",
        });
    }

    let screenState;

    let screenTip;

    if (!me.canShareScreen) {
        screenState = "unsupported";
        screenTip = intl.formatMessage({
            id             : "device.screenSharingUnsupported",
            defaultMessage : "Screen sharing not supported",
        });
    } else if (screenProducer) {
        screenState = "on";
        screenTip = intl.formatMessage({
            id             : "device.stopScreenSharing",
            defaultMessage : "Stop screen sharing",
        });
    } else {
        screenState = "off";
        screenTip = intl.formatMessage({
            id             : "device.startScreenSharing",
            defaultMessage : "Start screen sharing",
        });
    }

    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const mediumScreen = useMediaQuery(theme.breakpoints.down("md"));

    const handleExited = () => {
        setCurrentMenu(null);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuOpen = (event, menu) => {
        setAnchorEl(event.currentTarget);
        setCurrentMenu(menu);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);

        handleMobileMenuClose();
    };

    return (
        <div
            className={classnames(
                classes.root,
                room.toolbarsVisible || permanentTopBar
                    ? classes.show
                    : classes.hide,
                !(isMobile || drawerOverlayed) && toolAreaOpen
                    ? classes.persistentDrawerOpen
                    : null
            )}
        >
            <Tooltip
                title={raisedHandTip}
                placement={smallScreen ? "top" : "right"}
            >
                <Fab
                    aria-label={raisedHandTip}
                    className={classes.fab}
                    size={smallScreen ? "small" : "medium"}
                    onClick={(e) => {
                        e.stopPropagation();
                        roomClient.setRaisedHand(!me.raisedHand);
                    }}
                >
                    <PanIcon
                        fontSize={smallScreen ? "small" : "medium"}
                        color={me.raisedHand ? "secondary" : "primary"}
                    />
                </Fab>
            </Tooltip>
            <Tooltip title={micTip} placement={smallScreen ? "top" : "right"}>
                <Fab
                    aria-label={intl.formatMessage({
                        id             : "device.muteAudio",
                        defaultMessage : "Mute audio",
                    })}
                    className={classes.fab}
                    disabled={!me.canSendMic || me.audioInProgress}
                    size={smallScreen ? "small" : "medium"}
                    onClick={() => {
                        if (micState === "off") {
                            roomClient.updateMic({ start: true });
                        } else if (micState === "on") {
                            roomClient.muteMic();
                        } else {
                            roomClient.unmuteMic();
                        }
                    }}
                >
                    {micState === "on" ? (
                        <MicIcon
                            fontSize={smallScreen ? "small" : "medium"}
                            color="primary"
                        />
                    ) : (
                        <MicOffIcon
                            fontSize={smallScreen ? "small" : "medium"}
                            color="secondary"
                        />
                    )}
                </Fab>
            </Tooltip>
            <Tooltip
                title={webcamTip}
                placement={smallScreen ? "top" : "right"}
            >
                <Fab
                    aria-label={intl.formatMessage({
                        id             : "device.startVideo",
                        defaultMessage : "Start video",
                    })}
                    className={classes.fab}
                    disabled={!me.canSendWebcam || me.webcamInProgress}
                    size={smallScreen ? "small" : "medium"}
                    onClick={() => {
                        webcamState === "on"
                            ? roomClient.disableWebcam()
                            : roomClient.updateWebcam({ start: true });
                    }}
                >
                    {webcamState === "on" ? (
                        <VideoIcon
                            fontSize={smallScreen ? "small" : "medium"}
                            color="primary"
                        />
                    ) : (
                        <VideoOffIcon
                            fontSize={smallScreen ? "small" : "medium"}
                            color="secondary"
                        />
                    )}
                </Fab>
            </Tooltip>
            {me.browser.platform !== "mobile" && (
                <Tooltip
                    title={screenTip}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Fab
                        aria-label={intl.formatMessage({
                            id             : "device.startScreenSharing",
                            defaultMessage : "Start screen sharing",
                        })}
                        className={classes.fab}
                        disabled={
                            !me.canShareScreen || me.screenShareInProgress
                        }
                        size={smallScreen ? "small" : "medium"}
                        onClick={() => {
                            if (screenState === "off") {
                                roomClient.updateScreenSharing({ start: true });
                            } else if (screenState === "on") {
                                roomClient.disableScreenSharing();
                            }
                        }}
                    >
                        {screenState === "off" ? (
                            <ScreenIcon
                                fontSize={smallScreen ? "small" : "medium"}
                                color="primary"
                            />
                        ) : (
                            <ScreenIcon
                                fontSize={smallScreen ? "small" : "medium"}
                                color="secondary"
                            />
                        )}
                    </Fab>
                </Tooltip>
            )}
            <Tooltip
                title={intl.formatMessage({
                    id             : "label.moreOptions",
                    defaultMessage : "More options",
                })}
                placement={smallScreen ? "top" : "right"}
            >
                <Fab
                    aria-label={intl.formatMessage({
                        id             : "label.moreOptions",
                        defaultMessage : "More options",
                    })}
                    className={classes.fab}
                    size={smallScreen ? "small" : "medium"}
                    onClick={(event) => handleMenuOpen(event, "moreActions")}
                >
                    <MoreIcon
                        fontSize={smallScreen ? "small" : "medium"}
                        color="primary"
                    />
                </Fab>
            </Tooltip>

            <Tooltip
                title={intl.formatMessage({
                    id             : "label.leave",
                    defaultMessage : "Leave",
                })}
                placement={smallScreen ? "top" : "right"}
            >
                <Fab
                    aria-label={intl.formatMessage({
                        id             : "label.leave",
                        defaultMessage : "Leave",
                    })}
                    className={classes.fabLogout}
                    color="secondary"
                    size={smallScreen ? "small" : "medium"}
                    onClick={() => roomClient.close()}
                >
                    <LogoutIcon fontSize={smallScreen ? "small" : "medium"} />
                </Fab>
            </Tooltip>

            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onExited={handleExited}
                getContentAnchorEl={null}
            >
                {currentMenu === "moreActions" && (
                    <div>
                        {smallScreen && (
                            <>
                                <MenuItem
                                    aria-label={lockTooltip}
                                    disabled={!canLock}
                                    onClick={() => {
                                        handleMenuClose();

                                        if (room.locked) {
                                            roomClient.unlockRoom();
                                        } else {
                                            roomClient.lockRoom();
                                        }
                                    }}
                                >
                                    {room.locked ? (
                                        <LockIcon />
                                    ) : (
                                        <LockOpenIcon />
                                    )}
                                    {room.locked ? (
                                        <p className={classes.moreAction}>
                                            <FormattedMessage
                                                id="tooltip.unLockRoom"
                                                defaultMessage="Unlock room"
                                            />
                                        </p>
                                    ) : (
                                        <p className={classes.moreAction}>
                                            <FormattedMessage
                                                id="tooltip.lockRoom"
                                                defaultMessage="Lock room"
                                            />
                                        </p>
                                    )}
                                </MenuItem>
                                {canUseWhiteboard && (
                                    <MenuItem
                                        aria-label={intl.formatMessage({
                                            id             : "label.whiteboard",
                                            defaultMessage : "Whiteboard",
                                        })}
                                        onClick={() => {
                                            if (room.whiteboardOpen) {
                                                roomClient
                                                    .getWhiteboardManager()
                                                    .closeUI();
                                            } else {
                                                roomClient
                                                    .getWhiteboardManager()
                                                    .openUI();
                                            }
                                            handleMenuClose();
                                        }}
                                    >
                                        <BorderColorIcon />
                                        <p className={classes.moreAction}>
                                            {room.whiteboardOpen ? (
                                                <FormattedMessage
                                                    id="label.closeWhiteboard"
                                                    defaultMessage="Close Whiteboard"
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id="label.whiteboard"
                                                    defaultMessage="Whiteboard"
                                                />
                                            )}
                                        </p>
                                    </MenuItem>
                                )}

                                {canUseClassDocument && (
                                    <MenuItem
                                        aria-label={intl.formatMessage({
                                            id             : "label.openDocument",
                                            defaultMessage : "Document",
                                        })}
                                        onClick={() => {
                                            if (document.documentOpen) {
                                                roomClient
                                                    .getClassDocumentManager()
                                                    .closeUI();
                                            } else {
                                                roomClient
                                                    .getClassDocumentManager()
                                                    .openUI();
                                            }
                                            handleMenuClose();
                                        }}
                                    >
                                        <DescriptionIcon />
                                        <p className={classes.moreAction}>
                                            {document.documentOpen ? (
                                                <FormattedMessage
                                                    id="label.closeDocument"
                                                    defaultMessage="Close Online Document"
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id="label.openDocument"
                                                    defaultMessage="Online Document"
                                                />
                                            )}
                                        </p>
                                    </MenuItem>
                                )}

                                <MenuItem
                                    aria-label={intl.formatMessage({
                                        id             : "tooltip.fileSharing",
                                        defaultMessage : "Show file sharing",
                                    })}
                                    onClick={() => {
                                        handleMenuClose();
                                        openFileSharingTab();
                                    }}
                                >
                                    <Badge
                                        color="secondary"
                                        overlap="rectangular"
                                        badgeContent={unreadFiles}
                                    >
                                        <AttachmentIcon />
                                    </Badge>
                                    <p className={classes.moreAction}>
                                        <FormattedMessage
                                            id="tooltip.fileSharing"
                                            defaultMessage="Show file sharing"
                                        />
                                    </p>
                                </MenuItem>
                                <MenuItem
                                    aria-label={intl.formatMessage({
                                        id             : "tooltip.chat",
                                        defaultMessage : "Show chat",
                                    })}
                                    onClick={() => {
                                        handleMenuClose();
                                        openChatTab();
                                    }}
                                >
                                    <Badge
                                        color="secondary"
                                        overlap="rectangular"
                                        badgeContent={unreadMessages}
                                    >
                                        <ChatIcon />
                                    </Badge>
                                    <p className={classes.moreAction}>
                                        <FormattedMessage
                                            id="tooltip.chat"
                                            defaultMessage="Show chat"
                                        />
                                    </p>
                                </MenuItem>
                                <MenuItem
                                    aria-label={intl.formatMessage({
                                        id             : "tooltip.participants",
                                        defaultMessage : "Show participants",
                                    })}
                                    onClick={() => {
                                        handleMenuClose();
                                        openUsersTab();
                                    }}
                                >
                                    <Badge
                                        color="secondary"
                                        overlap="rectangular"
                                        badgeContent={peersLength + 1}
                                    >
                                        <PeopleIcon />
                                    </Badge>
                                    <p className={classes.moreAction}>
                                        <FormattedMessage
                                            id="tooltip.participants"
                                            defaultMessage="Show participants"
                                        />
                                    </p>
                                </MenuItem>
                            </>
                        )}

                        {me.browser.platform !== "mobile" &&
                            canRecord &&
                            (recordingState === RECORDING_START ||
                                recordingState === RECORDING_RESUME ||
                                recordingState === RECORDING_PAUSE) && (
                            <MenuItem
                                aria-label={recordingPausedTooltip}
                                onClick={async () => {
                                    handleMenuClose();
                                    if (
                                        recordingState === RECORDING_PAUSE
                                    ) {
                                        await recorder.resumeRecording();
                                    } else {
                                        await recorder.pauseRecording();
                                    }
                                }}
                            >
                                <Badge
                                    overlap="rectangular"
                                    color="primary"
                                >
                                    {recordingState === RECORDING_PAUSE ? (
                                        <PauseCircleFilledIcon />
                                    ) : (
                                        <PauseCircleOutlineIcon />
                                    )}
                                </Badge>
                                {recordingState === RECORDING_PAUSE ? (
                                    <p className={classes.moreAction}>
                                        <FormattedMessage
                                            id="tooltip.resumeRecording"
                                            defaultMessage="Resume recording"
                                        />
                                    </p>
                                ) : (
                                    <p className={classes.moreAction}>
                                        <FormattedMessage
                                            id="tooltip.pauseRecording"
                                            defaultMessage="Pause recording"
                                        />
                                    </p>
                                )}
                            </MenuItem>
                        )}

                        {me.browser.platform !== "mobile" &&
                            canRecord &&
                            isSafari && (
                            <MenuItem
                                aria-label={recordingTooltip}
                                onClick={async () => {
                                    handleMenuClose();
                                    if (
                                        recordingState ===
                                                RECORDING_START ||
                                            recordingState ===
                                                RECORDING_PAUSE ||
                                            recordingState === RECORDING_RESUME
                                    ) {
                                        await recorder.stopRecording();
                                    } else {
                                        try {
                                            const recordingMimeType =
                                                    store.getState().settings
                                                        .recorderPreferredMimeType;
                                            const additionalAudioTracks =
                                                    [];

                                            const micProducer =
                                                    Object.values(
                                                        producers
                                                    ).find(
                                                        (p) =>
                                                            p.source === "mic"
                                                    );

                                            if (micProducer) {
                                                additionalAudioTracks.push(
                                                    micProducer.track
                                                );
                                            }
                                            await recorder.startRecording({
                                                roomClient,
                                                additionalAudioTracks,
                                                recordingMimeType,
                                            });

                                            recorder.checkAudioConsumer(
                                                consumers
                                            );

                                            roomActions.setRecordingState(
                                                RECORDING_START
                                            );
                                        } catch (err) {
                                            logger.error(
                                                "Error during starting the recording! error:%O",
                                                err.message
                                            );
                                        }
                                    }
                                }}
                            >
                                <Badge
                                    overlap="rectangular"
                                    color="primary"
                                >
                                    {recordingState === RECORDING_START ||
                                        recordingState === RECORDING_PAUSE ||
                                        recordingState === RECORDING_RESUME ? (
                                            <StopIcon />
                                        ) : (
                                            <FiberManualRecordIcon />
                                        )}
                                </Badge>

                                {recordingState === RECORDING_START ||
                                    recordingState === RECORDING_PAUSE ||
                                    recordingState === RECORDING_RESUME ? (
                                        <p className={classes.moreAction}>
                                            <FormattedMessage
                                                id="tooltip.stopRecording"
                                                defaultMessage="Stop recording"
                                            />
                                        </p>
                                    ) : (
                                        <p className={classes.moreAction}>
                                            <FormattedMessage
                                                id="tooltip.startRecording"
                                                defaultMessage="Start recording"
                                            />
                                        </p>
                                    )}
                            </MenuItem>
                        )}

                        {canSharedYoutubeVideo && (
                            <MenuItem
                                onClick={() => {
                                    handleMenuClose();
                                    if (
                                        youtube.status === YOUTUBE_START ||
                                        youtube.status === YOUTUBE_PLAYING ||
                                        youtube.status === YOUTUBE_PAUSE
                                    ) {
                                        roomClient
                                            .getYoutubeManager()
                                            .dispose();
                                    } else {
                                        setShareVideoDialogOpen(true);
                                    }
                                }}
                            >
                                <PlayCircleOutlineIcon
                                    aria-label={intl.formatMessage({
                                        id             : "label.shareVideo",
                                        defaultMessage : "Share video",
                                    })}
                                />
                                <p className={classes.moreAction}>
                                    {youtube.status === YOUTUBE_START ||
                                    youtube.status === YOUTUBE_PLAYING ||
                                    youtube.status === YOUTUBE_PAUSE ? (
                                            <FormattedMessage
                                                id="label.closeVideoSharing"
                                                defaultMessage="Close video sharing"
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id="label.shareVideo"
                                                defaultMessage="Share video"
                                            />
                                        )}
                                </p>
                            </MenuItem>
                        )}
                        {fullscreenEnabled && (
                            <MenuItem
                                aria-label={intl.formatMessage({
                                    id             : "tooltip.enterFullscreen",
                                    defaultMessage : "Enter fullscreen",
                                })}
                                onClick={() => {
                                    handleMenuClose();
                                    onFullscreen();
                                }}
                            >
                                {fullscreen ? (
                                    <FullScreenExitIcon />
                                ) : (
                                    <FullScreenIcon />
                                )}
                                <p className={classes.moreAction}>
                                    <FormattedMessage
                                        id="tooltip.enterFullscreen"
                                        defaultMessage="Enter fullscreen"
                                    />
                                </p>
                            </MenuItem>
                        )}
                        <MenuItem
                            disabled={!canProduceExtraVideo}
                            onClick={() => {
                                handleMenuClose();
                                setExtraVideoOpen(!room.extraVideoOpen);
                            }}
                        >
                            <VideoCallIcon
                                aria-label={intl.formatMessage({
                                    id             : "label.addVideo",
                                    defaultMessage : "Add video",
                                })}
                            />
                            <p className={classes.moreAction}>
                                <FormattedMessage
                                    id="label.addVideo"
                                    defaultMessage="Add video"
                                />
                            </p>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setHideSelfView(!room.hideSelfView);
                            }}
                        >
                            {room.hideSelfView ? (
                                <SelfViewOnIcon
                                    aria-label={intl.formatMessage({
                                        id             : "room.showSelfView",
                                        defaultMessage : "Show self view video",
                                    })}
                                />
                            ) : (
                                <SelfViewOffIcon
                                    aria-label={intl.formatMessage({
                                        id             : "room.hideSelfView",
                                        defaultMessage : "Hide self view video",
                                    })}
                                />
                            )}
                            {room.hideSelfView ? (
                                <p className={classes.moreAction}>
                                    <FormattedMessage
                                        id="room.showSelfView"
                                        defaultMessage="Show self view video"
                                    />
                                </p>
                            ) : (
                                <p className={classes.moreAction}>
                                    <FormattedMessage
                                        id="room.hideSelfView"
                                        defaultMessage="Hide self view video"
                                    />
                                </p>
                            )}
                        </MenuItem>
                        <MenuItem
                            aria-label={intl.formatMessage({
                                id             : "tooltip.settings",
                                defaultMessage : "Show settings",
                            })}
                            onClick={() => {
                                handleMenuClose();
                                setSettingsOpen(!room.settingsOpen);
                            }}
                        >
                            <SettingsIcon />
                            <p className={classes.moreAction}>
                                <FormattedMessage
                                    id="tooltip.settings"
                                    defaultMessage="Show settings"
                                />
                            </p>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setHelpOpen(!room.helpOpen);
                            }}
                        >
                            <HelpIcon
                                aria-label={intl.formatMessage({
                                    id             : "room.help",
                                    defaultMessage : "Help",
                                })}
                            />
                            <p className={classes.moreAction}>
                                <FormattedMessage
                                    id="room.help"
                                    defaultMessage="Help"
                                />
                            </p>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setAboutOpen(!room.aboutOpen);
                            }}
                        >
                            <InfoIcon
                                aria-label={intl.formatMessage({
                                    id             : "room.about",
                                    defaultMessage : "About",
                                })}
                            />
                            <p className={classes.moreAction}>
                                <FormattedMessage
                                    id="room.about"
                                    defaultMessage="About"
                                />
                            </p>
                        </MenuItem>
                    </div>
                )}
            </Popover>
        </div>
    );
};

ButtonControlBar.propTypes = {
    roomClient                 : PropTypes.any.isRequired,
    toolbarsVisible            : PropTypes.bool.isRequired,
    hiddenControls             : PropTypes.bool.isRequired,
    drawerOverlayed            : PropTypes.bool.isRequired,
    toolAreaOpen               : PropTypes.bool.isRequired,
    me                         : appPropTypes.Me.isRequired,
    micProducer                : appPropTypes.Producer,
    webcamProducer             : appPropTypes.Producer,
    screenProducer             : appPropTypes.Producer,
    classes                    : PropTypes.object.isRequired,
    theme                      : PropTypes.object.isRequired,
    canRecord                  : PropTypes.bool.isRequired,
    canSharedYoutubeVideo      : PropTypes.bool.isRequired,
    setEnableEventListenerKeys : PropTypes.func.isRequired,
    setShareVideoDialogOpen    : PropTypes.func,
    setHideSelfView            : PropTypes.func.isRequired,
    closeShareVideo            : PropTypes.func.isRequired,
    setHelpOpen                : PropTypes.func.isRequired,
    setAboutOpen               : PropTypes.func.isRequired,
    setExtraVideoOpen          : PropTypes.func.isRequired,
    setWhiteboardOpen          : PropTypes.func.isRequired,
    canUseWhiteboard           : PropTypes.bool.isRequired,
    canUseClassDocument        : PropTypes.bool.isRequired,
    canUseLaTeX                : PropTypes.bool.isRequired,
};

const makeMapStateToProps = () => {
    const hasExtraVideoPermission = makePermissionSelector(
        permissions.EXTRA_VIDEO
    );

    const hasClassDocumentPermission = makePermissionSelector(
        permissions.CLASS_DOCUMENT
    );

    const hasLaTeXPermission = makePermissionSelector(permissions.LATEX);

    const hasWhiteboardPermission = makePermissionSelector(
        permissions.WHITEBOARD
    );

    const hasRocordPermission = makePermissionSelector(permissions.RECORD_ROOM);

    const hasLockPermission = makePermissionSelector(
        permissions.CHANGE_ROOM_LOCK
    );

    const hasSharedYoutubeVideoPermission = makePermissionSelector(
        permissions.SHARED_YOUTUBE_VIDEO
    );

    const hasPromotionPermission = makePermissionSelector(
        permissions.PROMOTE_PEER
    );

    const mapStateToProps = (state) => ({
        toolbarsVisible : state.room.toolbarsVisible,
        hiddenControls  : state.settings.hiddenControls,
        drawerOverlayed : state.settings.drawerOverlayed,
        toolAreaOpen    : state.toolarea.toolAreaOpen,
        ...meProducersSelector(state),
        me              : state.me,
        youtube         : state.youtube,
        room            : state.room,
        isMobile        : state.me.browser.platform === "mobile",
        isSafari        : state.me.browser.name !== "safari",
        peersLength     : peersLengthSelector(state),
        lobbyPeers      : lobbyPeersKeySelector(state),
        permanentTopBar : state.settings.permanentTopBar,
        drawerOverlayed : state.settings.drawerOverlayed,
        loggedIn        : state.me.loggedIn,
        loginEnabled    : state.me.loginEnabled,
        myPicture       : state.me.picture,
        unread          :
            state.toolarea.unreadMessages +
            state.toolarea.unreadFiles +
            raisedHandsSelector(state),
        unreadMessages        : state.toolarea.unreadMessages,
        unreadFiles           : state.toolarea.unreadFiles,
        canProduceExtraVideo  : hasExtraVideoPermission(state),
        canLock               : hasLockPermission(state),
        canPromote            : hasPromotionPermission(state),
        canSharedYoutubeVideo : hasSharedYoutubeVideoPermission(state),
        canRecord             : hasRocordPermission(state),
        canUseWhiteboard      : hasWhiteboardPermission(state),
        canUseLaTeX           : hasLaTeXPermission(state),
        canUseClassDocument   : hasClassDocumentPermission(state),
        locale                : state.intl.locale,
        localesList           : state.intl.list,
        recordingState        : state.me.recordingState,
        recordingMimeType     : state.settings.recordingMimeType,
        recordingInProgress   : recordingInProgressSelector(state),
        producers             : state.producers,
        consumers             : state.consumers,
        document              : state.document,
    });
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch) => ({
    setToolbarsVisible : (visible) => {
        dispatch(roomActions.setToolbarsVisible(visible));
    },
    setSettingsOpen : (settingsOpen) => {
        dispatch(roomActions.setSettingsOpen(settingsOpen));
    },
    setExtraVideoOpen : (extraVideoOpen) => {
        dispatch(roomActions.setExtraVideoOpen(extraVideoOpen));
    },
    setHelpOpen : (helpOpen) => {
        dispatch(roomActions.setHelpOpen(helpOpen));
    },
    setAboutOpen : (aboutOpen) => {
        dispatch(roomActions.setAboutOpen(aboutOpen));
    },
    setLockDialogOpen : (lockDialogOpen) => {
        dispatch(roomActions.setLockDialogOpen(lockDialogOpen));
    },
    setHideSelfView : (hideSelfView) => {
        dispatch(roomActions.setHideSelfView(hideSelfView));
    },
    toggleToolArea : () => {
        dispatch(toolareaActions.toggleToolArea());
    },
    openUsersTab : () => {
        dispatch(toolareaActions.openToolArea());
        dispatch(toolareaActions.setToolTab("users"));
    },
    openChatTab : () => {
        dispatch(toolareaActions.openToolArea());
        dispatch(toolareaActions.setToolTab("chat"));
    },
    openFileSharingTab : () => {
        dispatch(toolareaActions.openToolArea());
        dispatch(toolareaActions.setToolTab("files"));
    },
    setWhiteboardOpen : (whiteboardOpen) => {
        dispatch(whiteboardActions.setWhiteboardOpen(whiteboardOpen));
    },
    setOnlineDocumentOpen : (documentOpen) => {
        dispatch(documentActions.setOnlineDocumentOpen(documentOpen));
    },
    setLatexOpen : (latexOpen) => {
        dispatch(documentActions.setLatexOpen(latexOpen));
    },
    setEnableEventListenerKeys : (enableEventListenerKeys) => {
        dispatch(
            roomActions.setEnableEventListenerKeys(enableEventListenerKeys)
        );
    },
    setShareVideoDialogOpen : (shareVideoDialogOpen) => {
        dispatch(
            youtubeManagerActions.setVideoYoutubeOpen(shareVideoDialogOpen)
        );
    },
    closeShareVideo : () => {
        dispatch(youtubeManagerActions.closeShareVideo());
    },
    addNotification : (notification) => {
        dispatch(notificationActions.addNotification(notification));
    },
    closeNotification : (notification) => {
        dispatch(notificationActions.closeNotification(notification));
    },
});

export default withRoomContext(
    connect(makeMapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                Math.round(prev.peerVolumes[prev.me.id]) ===
                    Math.round(next.peerVolumes[prev.me.id]) &&
                prev.room.toolbarsVisible === next.room.toolbarsVisible &&
                prev.settings.hiddenControls === next.settings.hiddenControls &&
                prev.settings.drawerOverlayed ===
                    next.settings.drawerOverlayed &&
                prev.toolarea.toolAreaOpen === next.toolarea.toolAreaOpen &&
                prev.producers === next.producers &&
                prev.me === next.me &&
                prev.youtube === next.youtube &&
                prev.whiteboard === next.whiteboard &&
                prev.document === next.document &&
                prev.room === next.room &&
                prev.peers === next.peers &&
                prev.lobbyPeers === next.lobbyPeers &&
                prev.settings.permanentTopBar ===
                    next.settings.permanentTopBar &&
                prev.me.loggedIn === next.me.loggedIn &&
                prev.me.browser === next.me.browser &&
                prev.me.loginEnabled === next.me.loginEnabled &&
                prev.me.picture === next.me.picture &&
                prev.me.roles === next.me.roles &&
                prev.me.recordingState === next.me.recordingState &&
                prev.toolarea.unreadMessages === next.toolarea.unreadMessages &&
                prev.toolarea.unreadFiles === next.toolarea.unreadFiles &&
                prev.intl.locale === next.intl.locale &&
                prev.intl.localesList === next.intl.localesList
            );
        },
    })(withStyles(styles, { withTheme: true })(ButtonControlBar))
);
