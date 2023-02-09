import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    meProducersSelector,
    lobbyPeersKeySelector,
    peersLengthSelector,
    raisedHandsSelector,
    makePermissionSelector,
} from "../../store/selectors";
import { withStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import classnames from "classnames";
import * as whiteboardActions from "../../store/actions/whiteboardActions";
import * as youtubeManagerActions from "../../store/actions/youtubeManagerActions";
import * as notificationActions from "../../store/actions/notificationActions";
import * as roomActions from "../../store/actions/roomActions";
import * as appPropTypes from "../appPropTypes";
import * as toolareaActions from "../../store/actions/toolareaActions";
import * as documentActions from "../../store/actions/documentActions";
import * as quizActions from "../../store/actions/quizActions";
import { withRoomContext } from "../../RoomContext";
import { useIntl, FormattedMessage } from "react-intl";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@material-ui/core/MenuItem";
import Badge from "@material-ui/core/Badge";
import SelfViewOnIcon from "@material-ui/icons/VideocamOutlined";
import SelfViewOffIcon from "@material-ui/icons/VideocamOffOutlined";
import FullScreenExitIcon from "@material-ui/icons/FullscreenExit";
import { Grid, Button, Typography, Avatar } from "@material-ui/core";
import palette from "../../theme/palette";

import {
    LogoutIcon,
    RaiseHandIcon,
    MicOffIcon,
    MicOnIcon,
    MoreIcon,
    ScreenMirroringIcon,
    RecordIcon,
    ChatIcon,
    UsersIcon,
    VideoOffIcon,
    VideoOnIcon,
    ActivityIcon,
    BoardIcon,
    FilesIcon,
    LaTeXIcon,
    QuizIcon,
    LockIcon,
    UnlockIcon,
    YoutubeCircleIcon,
    SettingIcon,
    HelpIcon,
    InfoIcon,
    SecurityIcon,
    FullScreenIcon,
    LayoutIcon,
    FilmstripIcon,
    DemocraticIcon,
    ScreenMirroringDisableIcon,
} from "../../assets/icons";

import { PulsingBadge } from "../../core/components";

import { store } from "../../store/store";

import {
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

import { getFlag } from "../../utils";

import Logger from "../../Logger";

const logger = new Logger("Recorder");

const styles = (theme) => ({
    root : {
        position             : "fixed",
        zIndex               : 30,
        // background: "rgba(73, 75, 94, 0.2)",
        background           : "rgba(255, 255, 255, 0.3)",
        backdropFilter       : `blur(${theme.spacing(1.5)}px)`,
        borderTopRightRadius : "var(--peer-border-radius-sm)",
        borderTopLeftRadius  : "var(--peer-border-radius-sm)",
        width                : "100%",
        bottom               : 0,
        padding              : theme.spacing(1),
    },
    persistentDrawerOpen : {
        width                          : "calc(100% - 20vw)",
        marginRight                    : "20vw",
        [theme.breakpoints.down("lg")] : {
            width       : "calc(100% - 25vw)",
            marginRight : "25vw",
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
        color           : palette.basic.white,
        backgroundColor : palette.basic.dark,
        // margin: theme.spacing(1.5),
        // borderRadius: "var(--peer-border-radius-sm)",

        // [theme.breakpoints.down("sm")]: {
        //     margin: theme.spacing(1),
        // },
        "&:hover" : {
            backgroundColor : `rgba(255,255,255,0.2)`,
        },
    },
    fabLogout : {
        background   : palette.status.red.primary,
        color        : palette.basic.white,
        borderRadius : theme.spacing(5),
        "&:hover"    : {
            background : palette.status.red.secondary,
            color      : palette.basic.dark,
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
        margin : theme.spacing(0, 0, 0, 1),
    },
    buttonGap : {
        gap : theme.spacing(2),
    },
    localeButton : {
        textTransform : "uppercase",
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
        setLockDialogOpen,
        setModeratorLeaveDialogOpen,
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
        canPromote,
        canUseLaTeX,
        canUseClassDocument,
        canSharedYoutubeVideo,
        canUseClassActivities,
        openUsersTab,
        openChatTab,
        openFileSharingTab,
        toggleToolArea,
        setOnlineDocumentOpen,
        setLatexOpen,
        locale,
        localesList,
        quizDashboardDialogOpen,
        handleQuizDialogOpen,
        unReadQuiz,
        isModerator,
        setDisplayMode,
    } = props;

    // did it change?
    roomClient.recorder.checkMicProducer(producers);
    roomClient.recorder.checkAudioConsumer(consumers);

    const lockTooltip = room.locked
        ? intl.formatMessage({
            id             : "tooltip.unLockRoom",
            defaultMessage : "Unlock room",
        })
        : intl.formatMessage({
            id             : "tooltip.lockRoom",
            defaultMessage : "Lock room",
        });

    let recordingTooltip = intl.formatMessage({
        id             : "tooltip.startRecording",
        defaultMessage : "Start recording",
    });

    if (recordingState === RECORDING_PAUSE) {
        recordingTooltip = intl.formatMessage({
            id             : "tooltip.startRecording",
            defaultMessage : "Start recording",
        });
    } else if (
        recordingState === RECORDING_RESUME ||
        recordingState === RECORDING_START
    ) {
        recordingTooltip = intl.formatMessage({
            id             : "tooltip.stopRecording",
            defaultMessage : "Stop recording",
        });
    }

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
        <Grid
            container
            alignItems="center"
            justifyContent="space-around"
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
            {/* Start Left Controls */}
            <Grid
                md={3}
                item
                container
                justifyContent="center"
                alignItems="center"
                className={classes.buttonGap}
            >
                <Tooltip
                    title={intl.formatMessage({
                        id             : "label.leave",
                        defaultMessage : "Leave",
                    })}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Button
                        aria-label={intl.formatMessage({
                            id             : "label.leave",
                            defaultMessage : "Leave",
                        })}
                        className={classes.fabLogout}
                        // color="secondary"
                        // size="small"
                        onClick={() => {
                            if (isModerator) {
                                setModeratorLeaveDialogOpen(true);
                            } else {
                                roomClient.close();
                            }
                        }}
                        endIcon={<LogoutIcon fontSize={"small"} />}
                    >
                        <FormattedMessage
                            id="label.leave"
                            defaultMessage="Leave"
                        />{" "}
                    </Button>
                </Tooltip>
                {/* {localesList.length > 1 &&
                    (() => {
                        const localeCode = locale.split(/[-_]/)[0];

                        return (
                            <Button
                                aria-label={localeCode}
                                className={classes.localeButton}
                                color="secondary"
                                disableRipple
                                onClick={(event) =>
                                    handleMenuOpen(event, "localeMenu")
                                }
                                startIcon={
                                    <Avatar
                                        variant="square"
                                        src={getFlag(localeCode)}
                                    />
                                }
                            >
                                {localeCode}
                            </Button>
                        );
                    })()} */}
            </Grid>
            {/* End Left Controls */}

            {/* Start Middle Controls */}
            <Grid
                item
                md
                container
                justifyContent="center"
                alignItems="center"
                className={classes.buttonGap}
            >
                <Tooltip
                    title={raisedHandTip}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Fab
                        aria-label={raisedHandTip}
                        className={classes.fab}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            roomClient.setRaisedHand(!me.raisedHand);
                        }}
                    >
                        <RaiseHandIcon
                            fontSize="small"
                            color={me.raisedHand ? "secondary" : "primary"}
                        />
                    </Fab>
                </Tooltip>
                <Tooltip
                    title={micTip}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Fab
                        aria-label={intl.formatMessage({
                            id             : "device.muteAudio",
                            defaultMessage : "Mute audio",
                        })}
                        className={classes.fab}
                        disabled={!me.canSendMic || me.audioInProgress}
                        size="small"
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
                            <MicOnIcon fontSize="small" />
                        ) : (
                            <MicOffIcon fontSize="small" color="secondary" />
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
                        size="small"
                        onClick={() => {
                            webcamState === "on"
                                ? roomClient.disableWebcam()
                                : roomClient.updateWebcam({ start: true });
                        }}
                    >
                        {webcamState === "on" ? (
                            <VideoOnIcon fontSize="small" />
                        ) : (
                            <VideoOffIcon fontSize="small" color="secondary" />                           
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
                            size="small"
                            onClick={() => {
                                if (screenState === "off") {
                                    roomClient.updateScreenSharing({
                                        start : true,
                                    });
                                } else if (screenState === "on") {
                                    roomClient.disableScreenSharing();
                                }
                            }}
                        >
                            {screenState === "off" ? (
                                <ScreenMirroringDisableIcon
                                    fontSize="small"
                                    color="secondary"
                                />
                               
                            ) : (
                                <ScreenMirroringIcon fontSize="small" /> 
                            )}
                        </Fab>
                    </Tooltip>
                )}

                <Tooltip
                    title={intl.formatMessage({
                        id             : "label.layouts",
                        defaultMessage : "Layouts",
                    })}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Fab
                        aria-label={intl.formatMessage({
                            id             : "label.layouts",
                            defaultMessage : "Layouts",
                        })}
                        className={classes.fab}
                        size="small"
                        onClick={(event) => handleMenuOpen(event, "layouts")}
                    >
                        <LayoutIcon fontSize="small" />
                    </Fab>
                </Tooltip>
                {canUseClassActivities && (
                    <Tooltip
                        title={intl.formatMessage({
                            id             : "label.classActiviteis",
                            defaultMessage : "Class Activities",
                        })}
                        placement={smallScreen ? "top" : "right"}
                    >
                        <Fab
                            aria-label={intl.formatMessage({
                                id             : "label.classActiviteis",
                                defaultMessage : "Class Activities",
                            })}
                            className={classes.fab}
                            size="small"
                            onClick={(event) =>
                                handleMenuOpen(event, "classActivities")
                            }
                        >
                            <PulsingBadge
                                color="primary"
                                overlap="rectangular"
                                badgeContent={unReadQuiz}
                            >
                                <ActivityIcon fontSize="small" />
                            </PulsingBadge>
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
                        size="small"
                        onClick={(event) =>
                            handleMenuOpen(event, "moreActions")
                        }
                    >
                        <MoreIcon fontSize="small" />
                    </Fab>
                </Tooltip>
            </Grid>
            {/* End Middle Controls */}

            {/* Start Right Controls */}
            <Grid
                md={3}
                item
                container
                justifyContent="center"
                alignItems="center"
                className={classes.buttonGap}
            >
                {canRecord && isSafari && (
                    <Tooltip
                        title={recordingTooltip}
                        placement={smallScreen ? "top" : "right"}
                        onClick={async () => {
                            if (recordingState === null) {
                                try {
                                    const recordingMimeType =
                                        store.getState().settings
                                            .recorderPreferredMimeType;
                                    const additionalAudioTracks = [];

                                    const micProducer = Object.values(
                                        producers
                                    ).find((p) => p.source === "mic");

                                    if (micProducer) {
                                        additionalAudioTracks.push(
                                            micProducer.track
                                        );
                                    }
                                    await roomClient.recorder.startRecording({
                                        additionalAudioTracks,
                                        recordingMimeType,
                                    });

                                    roomClient.recorder.checkAudioConsumer(
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
                            } else if (
                                recordingState === RECORDING_RESUME ||
                                    recordingState === RECORDING_START
                            ) {
                                await roomClient.recorder.pauseRecording();
                            } else {
                                await roomClient.recorder.resumeRecording();
                            }
                        }}
                    >
                        <Fab
                            aria-label={recordingTooltip}
                            className={classes.fab}
                            size="small"
                            // onClick={() => roomClient.close()}
                        >
                            <RecordIcon
                                fontSize={"small"}
                                color={
                                    recordingState === RECORDING_RESUME ||
                                    recordingState === RECORDING_START
                                        ? "secondary"
                                        : "inherit"
                                }
                            />
                        </Fab>
                    </Tooltip>
                )}

                {lobbyPeers.length > 0 && (
                    <Tooltip
                        title={intl.formatMessage({
                            id             : "tooltip.lobby",
                            defaultMessage : "Show lobby",
                        })}
                    >
                        <span className={classes.disabledButton}>
                            <Fab
                                aria-label={intl.formatMessage({
                                    id             : "tooltip.lobby",
                                    defaultMessage : "Show lobby",
                                })}
                                className={classes.fab}
                                // color="#000000"
                                disabled={!canPromote}
                                size="small"
                                onClick={() =>
                                    setLockDialogOpen(!room.lockDialogOpen)
                                }
                            >
                                <PulsingBadge
                                    overlap="rectangular"
                                    color="primary"
                                    badgeContent={lobbyPeers.length}
                                >
                                    <SecurityIcon fontSize={"small"} />
                                </PulsingBadge>
                            </Fab>
                        </span>
                    </Tooltip>
                )}
                <Tooltip
                    title={intl.formatMessage({
                        id             : "label.chat",
                        defaultMessage : "Chat",
                    })}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Fab
                        aria-label={intl.formatMessage({
                            id             : "label.chat",
                            defaultMessage : "Chat",
                        })}
                        className={classes.fab}
                        // color="secondary"
                        size="small"
                        onClick={() =>
                            toolAreaOpen ? toggleToolArea() : openChatTab()
                        }
                    >
                        <PulsingBadge
                            overlap="rectangular"
                            color="primary"
                            badgeContent={unread}
                        >
                            <ChatIcon fontSize={"small"} />
                        </PulsingBadge>
                    </Fab>
                </Tooltip>
                <Tooltip
                    title={intl.formatMessage({
                        id             : "label.participants",
                        defaultMessage : "Participants",
                    })}
                    placement={smallScreen ? "top" : "right"}
                >
                    <Fab
                        aria-label={intl.formatMessage({
                            id             : "label.participants",
                            defaultMessage : "Participants",
                        })}
                        className={classes.fab}
                        // color="secondary"
                        size="small"
                        onClick={() =>
                            toolAreaOpen ? toggleToolArea() : openUsersTab()
                        }
                    >
                        <Badge
                            overlap="rectangular"
                            color="primary"
                            badgeContent={peersLength + 1}
                        >
                            <UsersIcon fontSize={"small"} />
                        </Badge>
                    </Fab>
                </Tooltip>
            </Grid>
            {/* End Right Controls */}

            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={isMenuOpen}
                onClose={handleMenuClose}
                TransitionProps={{
                    onExited : handleExited,
                }}
                getContentAnchorEl={null}
            >
                {currentMenu === "moreActions" && (
                    <div>
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
                                <>
                                    <UnlockIcon fontSize="small" />
                                    <Typography
                                        component="p"
                                        variant="subtitle2"
                                        className={classes.moreAction}
                                    >
                                        <FormattedMessage
                                            id="tooltip.unLockRoom"
                                            defaultMessage="Unlock room"
                                        />
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <LockIcon fontSize="small" />
                                    <Typography
                                        component="p"
                                        variant="subtitle2"
                                        className={classes.moreAction}
                                    >
                                        <FormattedMessage
                                            id="tooltip.lockRoom"
                                            defaultMessage="Lock room"
                                        />
                                    </Typography>
                                </>
                            )}
                        </MenuItem>

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
                                <YoutubeCircleIcon
                                    fontSize="small"
                                    aria-label={intl.formatMessage({
                                        id             : "label.shareVideo",
                                        defaultMessage : "Share Youtube Video",
                                    })}
                                />
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
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
                                                defaultMessage="Share Youtube Video"
                                            />
                                        )}
                                </Typography>
                            </MenuItem>
                        )}
                        {
                            canProduceExtraVideo &&
                            <MenuItem
                                disabled={!canProduceExtraVideo}
                                onClick={() => {
                                    handleMenuClose();
                                    setExtraVideoOpen(!room.extraVideoOpen);
                                }}
                            >
                                <VideoOnIcon
                                    fontSize="small"
                                    aria-label={intl.formatMessage({
                                        id             : "label.addVideo",
                                        defaultMessage : "Add video",
                                    })}
                                />
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
                                    <FormattedMessage
                                        id="label.addVideo"
                                        defaultMessage="Add video"
                                    />
                                </Typography>
                            </MenuItem>
                        }
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setHideSelfView(!room.hideSelfView);
                            }}
                        >
                            {room.hideSelfView ? (
                                <SelfViewOnIcon
                                    fontSize="small"
                                    aria-label={intl.formatMessage({
                                        id             : "room.showSelfView",
                                        defaultMessage : "Show self view video",
                                    })}
                                />
                            ) : (
                                <SelfViewOffIcon
                                    fontSize="small"
                                    aria-label={intl.formatMessage({
                                        id             : "room.hideSelfView",
                                        defaultMessage : "Hide self view video",
                                    })}
                                />
                            )}
                            {room.hideSelfView ? (
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
                                    <FormattedMessage
                                        id="room.showSelfView"
                                        defaultMessage="Show self view video"
                                    />
                                </Typography>
                            ) : (
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
                                    <FormattedMessage
                                        id="room.hideSelfView"
                                        defaultMessage="Hide self view video"
                                    />
                                </Typography>
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
                            <SettingIcon fontSize="small" />
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                <FormattedMessage
                                    id="tooltip.settings"
                                    defaultMessage="Show settings"
                                />
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setHelpOpen(!room.helpOpen);
                            }}
                        >
                            <HelpIcon
                                fontSize="small"
                                aria-label={intl.formatMessage({
                                    id             : "room.help",
                                    defaultMessage : "Help",
                                })}
                            />
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                <FormattedMessage
                                    id="room.help"
                                    defaultMessage="Help"
                                />
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setAboutOpen(!room.aboutOpen);
                            }}
                        >
                            <InfoIcon
                                fontSize="small"
                                aria-label={intl.formatMessage({
                                    id             : "room.about",
                                    defaultMessage : "About",
                                })}
                            />
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                <FormattedMessage
                                    id="room.about"
                                    defaultMessage="About"
                                />
                            </Typography>
                        </MenuItem>
                    </div>
                )}
                {currentMenu === "classActivities" && (
                    <div>
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
                                <BoardIcon fontSize="small" />
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
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
                                </Typography>
                            </MenuItem>
                        )}

                        <MenuItem
                            aria-label={intl.formatMessage({
                                id             : "label.quiz",
                                defaultMessage : "Quick Quiz",
                            })}
                            onClick={() => {
                                if (quizDashboardDialogOpen) {
                                    handleQuizDialogOpen(false);
                                } else {
                                    handleQuizDialogOpen(true);
                                }
                                handleMenuClose();
                            }}
                            style={{ overflow: "unset" }}
                        >
                            <Badge
                                overlap="rectangular"
                                color="primary"
                                badgeContent={unReadQuiz}
                            >
                                <QuizIcon fontSize="small" />
                            </Badge>

                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                <FormattedMessage
                                    id="label.quiz"
                                    defaultMessage="Quick Quiz"
                                />
                            </Typography>
                        </MenuItem>

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
                                <FilesIcon fontSize="small" />
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
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
                                </Typography>
                            </MenuItem>
                        )}
                    </div>
                )}
                {currentMenu === "localeMenu" && (
                    <div>
                        {localesList.map((item, index) => (
                            <MenuItem
                                selected={item.locale.includes(locale)}
                                key={index}
                                onClick={() => {
                                    roomClient.setLocale(item.locale[0]);
                                    handleMenuClose();
                                }}
                            >
                                <Avatar
                                    variant="square"
                                    src={getFlag(item.locale[0])}
                                    style={{ marginRight: "8px" }}
                                />
                                {item.name}
                            </MenuItem>
                        ))}
                    </div>
                )}
                {currentMenu === "layouts" && (
                    <div>
                        <MenuItem
                            aria-label={intl.formatMessage({
                                id             : "label.filmstrip",
                                defaultMessage : "Filmstrip",
                            })}
                            onClick={() => {
                                setDisplayMode("filmstrip");
                                handleMenuClose();
                            }}
                        >
                            <FilmstripIcon fontSize="small" />
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                <FormattedMessage
                                    id="label.filmstrip"
                                    defaultMessage="Filmstrip"
                                />
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            aria-label={intl.formatMessage({
                                id             : "label.democratic",
                                defaultMessage : "Democratic",
                            })}
                            onClick={() => {
                                setDisplayMode("democratic");
                                handleMenuClose();
                            }}
                        >
                            <DemocraticIcon fontSize="small" />
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                <FormattedMessage
                                    id="label.democratic"
                                    defaultMessage="Democratic"
                                />
                            </Typography>
                        </MenuItem>
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
                                    <FullScreenExitIcon fontSize="small" />
                                ) : (
                                    <FullScreenIcon fontSize="small" />
                                )}
                                <Typography
                                    component="p"
                                    variant="subtitle2"
                                    className={classes.moreAction}
                                >
                                    <FormattedMessage
                                        id="tooltip.enterFullscreen"
                                        defaultMessage="Enter fullscreen"
                                    />
                                </Typography>
                            </MenuItem>
                        )}
                    </div>
                )}
            </Popover>
        </Grid>
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
    localesList                : PropTypes.array.isRequired,
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

    const hasModeratorPermission = makePermissionSelector(
        permissions.MODERATE_ROOM
    );

    const hasClassActivitiesPermission = makePermissionSelector(
        permissions.CLASS_ACTIVITIES
    );

    const mapStateToProps = (state) => ({
        isModerator     : hasModeratorPermission(state),
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
        unReadQuiz      : state.quizzes.countUnread,
        unread          :
            state.toolarea.unreadMessages +
            state.toolarea.unreadFiles +
            raisedHandsSelector(state),
        unreadMessages          : state.toolarea.unreadMessages,
        unreadFiles             : state.toolarea.unreadFiles,
        canProduceExtraVideo    : hasExtraVideoPermission(state),
        canLock                 : hasLockPermission(state),
        canPromote              : hasPromotionPermission(state),
        canSharedYoutubeVideo   : hasSharedYoutubeVideoPermission(state),
        canRecord               : hasRocordPermission(state),
        canUseWhiteboard        : hasWhiteboardPermission(state),
        canUseLaTeX             : hasLaTeXPermission(state),
        canUseClassDocument     : hasClassDocumentPermission(state),
        canUseClassActivities   : hasClassActivitiesPermission(state),
        locale                  : state.intl.locale,
        localesList             : state.intl.list,
        recordingState          : state.room.recordingState,
        recordingMimeType       : state.settings.recordingMimeType,
        producers               : state.producers,
        consumers               : state.consumers,
        document                : state.document,
        quizDashboardDialogOpen : state.quizzes.quizDashboardDialogOpen,
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
    handleQuizDialogOpen : (flag) => {
        dispatch(quizActions.setQuizDashboardOpen(flag));
    },
    setModeratorLeaveDialogOpen : (flag) => {
        dispatch(roomActions.setModeratorLeaveDialogOpen(flag));
    },
    setDisplayMode : (layout) => {
        store.dispatch(roomActions.setDisplayMode(layout));
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
                prev.room.recordingState === next.room.recordingState &&
                prev.toolarea.unreadMessages === next.toolarea.unreadMessages &&
                prev.toolarea.unreadFiles === next.toolarea.unreadFiles &&
                prev.intl.locale === next.intl.locale &&
                prev.intl.localesList === next.intl.localesList &&
                prev.quizzes.countUnread === next.quizzes.countUnread &&
                prev.quizzes.quizDashboardDialogOpen ===
                    next.quizzes.quizDashboardDialogOpen
            );
        },
    })(withStyles(styles, { withTheme: true })(ButtonControlBar))
);
