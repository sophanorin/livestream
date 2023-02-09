import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import classnames from "classnames";
import { useIntl, FormattedMessage } from "react-intl";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideoIcon from "@material-ui/icons/Videocam";
import VideoOffIcon from "@material-ui/icons/VideocamOff";
import ScreenIcon from "@material-ui/icons/ScreenShare";
import SettingsVoiceIcon from "@material-ui/icons/SettingsVoice";
import MoreHorizIcon from "@material-ui/icons/MoreHorizOutlined";
import { Avatar } from "@material-ui/core";
import { RaiseHandIcon , VolumeOffIcon, VolumeOnIcon } from "../../assets/icons";
import Volume from "./Volume";
import VideoView from "../VideoContainers/VideoView";
import * as appPropTypes from "../appPropTypes";
import { withRoomContext } from "../../RoomContext";
import { permissions } from "../../permissions";
import {
    meProducersSelector,
    makePermissionSelector,
} from "../../store/selectors";

import palette from "../../theme/palette";

const styles = (theme) => ({
    root : {
        flex               : "0 0 auto",
        boxShadow          : "var(--peer-shadow)",
        // border: "var(--peer-border)",
        backgroundColor    : "var(--peer-bg-color)",
        backgroundImage    : "var(--peer-empty-avatar)",
        backgroundPosition : "bottom",
        backgroundSize     : "auto 85%",
        backgroundRepeat   : "no-repeat",
        borderRadius       : "var(--peer-border-radius-md)",
        "&.hover"          : {
            boxShadow :
                "0px 1px 3px rgba(0, 0, 0, 0.05) inset, 0px 0px 8px rgba(82, 168, 236, 0.9)",
        },
        "&.active-speaker" : {
            // transition  : 'filter .2s',
            // filter      : 'grayscale(0)',
            borderColor : "var(--active-speaker-border-color)",
        },
        "&:not(.active-speaker):not(.screen)" : {
            // transition : 'filter 10s',
            // filter     : 'grayscale(0.75)'
        },
        "&.webcam" : {
            order : 1,
        },
        "&.screen" : {
            order : 2,
        },
    },
    viewContainer : {
        position : "relative",
        width    : "100%",
        height   : "100%",
    },
    meTag : {
        position   : "absolute",
        float      : "left",
        top        : "50%",
        left       : "50%",
        transform  : "translate(-50%, -50%)",
        color      : "rgba(255, 255, 255, 0.5)",
        zIndex     : 1,
        margin     : 0,
        opacity    : 0,
        transition : "opacity 0.1s ease-in-out",
        "&.hover"  : {
            opacity : 1,
        },
    },
    controls : {
        position       : "absolute",
        width          : "100%",
        height         : "100%",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "flex-end",
        padding        : theme.spacing(1),
        zIndex         : 21,
        touchAction    : "none",
        pointerEvents  : "none",
        "&.hide"       : {
            transition : "opacity 0.1s ease-in-out",
            opacity    : 0,
        },
        "&.hover" : {
            opacity : 1,
        },
        "& .fab" : {
            margin        : theme.spacing(1),
            pointerEvents : "auto",
        },
    },
    ptt : {
        position       : "absolute",
        width          : "100%",
        height         : "100%",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        zIndex         : 1200,
        opacity        : 0,
        transition     : "opacity 1s ease",
        pointerEvents  : "none",
        padding        : theme.spacing(1),
        "& div"        : {
            color           : "rgba(255, 255, 255, 0.7)",
            backgroundColor : "rgba(245, 0, 87, 0.70)",
            borderRadius    : "20px",
            textAlign       : "center",
            opacity         : 1,
            padding         : theme.spacing(1),
            margin          : theme.spacing(1),
        },
        "&.enabled" : {
            transition : "opacity 0.1s",
            opacity    : 1,
        },
    },
    activitiesCotainer : {
        top            : 0,
        left           : 0,
        margin         : theme.spacing(1),
        position       : "absolute",
        touchAction    : "none",
        zIndex         : 999,
        display        : "flex",
        flexDirection  : "row",
        gap            : theme.spacing(1),
        justifyContent : "flex-start",
        alignItems     : "center",
    },
    raisedHand : {
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
    },
    micState : {
        width  : theme.spacing(3),
        height : theme.spacing(3),
    },
    micOff : {
        backgroundColor : "rgba(73, 75, 94, 0.4);",
    },
    micOn : {
        backgroundColor : palette.status.green.primary,
    },
});

const Me = (props) => {
    const [hover, setHover] = useState(false);
    const [screenShareTooltipOpen, screenShareTooltipSetOpen] = useState(false);
    const intl = useIntl();

    let touchTimeout = null;

    const {
        roomClient,
        me,
        settings,
        activeSpeaker,
        spacing,
        style,
        advancedMode,
        micProducer,
        webcamProducer,
        screenProducer,
        extraVideoProducers,
        hasAudioPermission,
        hasVideoPermission,
        hasScreenPermission,
        transports,
        noiseVolume,
        classes,
        theme,
    } = props;

    const {height} = style;

    const [controls, setControls] = useState({
        root : {
            style : {},
        },
        item : {
            style : {},
            size  : "",
        },
    });

    const [meTag, setMeTag] = useState({
        root : {
            style : {},
        },
    });

    // Extend styles/props values
    useEffect(() => {
        if (height > 0) {
            setControls({
                root : {
                    style : {
                        flexDirection : "row",
                        alignItems    : "flex-start",
                    },
                },
                item : {
                    style : {
                        width     : 30,
                        height    : 30,
                        minHeight : "auto",
                        margin    : theme.spacing(0.5),
                    },
                    size : "small",
                },
            });

            setMeTag({
                root : {
                    style : {
                        fontSize : "2em",
                    },
                },
            });
        }

        if (height > 170) {
            setControls({
                root : {
                    style : {
                        flexDirection : "row",
                        alignItems    : "flex-start",
                    },
                },
                item : {
                    style : {},
                    size  : "small",
                },
            });

            setMeTag({
                root : {
                    style : {
                        fontSize : "3.0em",
                    },
                },
            });
        }

        if (height > 190) {
            setControls({
                root : {
                    style : {
                        flexDirection : "column",
                    },
                },
                item : {
                    style : {},
                    size  : "small",
                },
            });

            setMeTag({
                root : {
                    style : {
                        fontSize : "3.0em",
                    },
                },
            });
        }

        if (height > 320) {
            setControls({
                root : {
                    style : {
                        flexDirection : "column",
                    },
                },
                item : {
                    style : {},
                    size  : "medium",
                },
            });

            setMeTag({
                root : {
                    style : {
                        fontSize : "4em",
                    },
                },
            });
        }

        if (height > 400) {
            setControls({
                root : {
                    style : {
                        flexDirection : "column",
                    },
                },
                item : {
                    style : {},
                    size  : "large",
                },
            });

            setMeTag({
                root : {
                    style : {
                        fontSize : "5.0em",
                    },
                },
            });
        }
    }, [height, theme]);

    const micEnabled =
        Boolean(micProducer) &&
        !micProducer.locallyPaused &&
        !micProducer.remotelyPaused;

    const videoVisible =
        Boolean(webcamProducer) &&
        !webcamProducer.locallyPaused &&
        !webcamProducer.remotelyPaused;

    const screenVisible =
        Boolean(screenProducer) &&
        !screenProducer.locallyPaused &&
        !screenProducer.remotelyPaused;

    let micState;

    let micTip;

    if (!me.canSendMic || !hasAudioPermission) {
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
    } else if (
        !micProducer.locallyPaused &&
        !micProducer.remotelyPaused &&
        !settings.audioMuted
    ) {
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

    if (!me.canSendWebcam || !hasVideoPermission) {
        webcamState = "unsupported";
        webcamTip = intl.formatMessage({
            id             : "device.videoUnsupported",
            defaultMessage : "Video unsupported",
        });
    } else if (webcamProducer && !settings.videoMuted) {
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

    if (!me.canShareScreen || !hasScreenPermission) {
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

    const screenShareTooltipHandleClose = () => {
        screenShareTooltipSetOpen(false);
    };

    const screenShareTooltipHandleOpen = () => {
        screenShareTooltipSetOpen(true);
    };

    if (
        screenState === "off" &&
        me.screenShareInProgress &&
        screenShareTooltipOpen
    ) {
        screenShareTooltipHandleClose();
    }

    const spacingStyle = {
        margin : spacing,
    };

    if (me.picture) {
        spacingStyle.backgroundImage = `url(${me.picture})`;
        spacingStyle.backgroundSize = "auto 100%";
    }

    let audioScore = null;

    if (micProducer && micProducer.score) {
        audioScore = micProducer.score.reduce((prev, curr) =>
            prev.score < curr.score ? prev : curr
        );
    }

    let videoScore = null;

    if (webcamProducer && webcamProducer.score) {
        videoScore = webcamProducer.score.reduce((prev, curr) =>
            prev.score < curr.score ? prev : curr
        );
    }

    useEffect(() => {
        let poll;

        const interval = 1000;

        if (advancedMode) {
            poll = setInterval(() => roomClient.getTransportStats(), interval);
        }

        return () => clearInterval(poll);
    }, [roomClient, advancedMode]);

    // menu
    const [menuAnchorElement, setMenuAnchorElement] = React.useState(null);
    const [showAudioAnalyzer, setShowAudioAnalyzer] = React.useState(null);

    const handleMenuOpen = (event) => {
        setMenuAnchorElement(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorElement(null);
    };

    return (
        <>
            <div
                className={classnames(
                    classes.root,
                    "webcam",
                    hover ? "hover" : null,
                    activeSpeaker ? "active-speaker" : null
                )}
                onMouseOver={() => setHover(true)}
                onMouseOut={() => setHover(false)}
                onTouchStart={() => {
                    if (touchTimeout) {clearTimeout(touchTimeout);}

                    setHover(true);
                }}
                onTouchEnd={() => {
                    if (touchTimeout) {clearTimeout(touchTimeout);}

                    touchTimeout = setTimeout(() => {
                        setHover(false);
                    }, 2000);
                }}
                style={spacingStyle}
            >
                {/* {me.raisedHand && (
                    <div className={classes.raisedHand}>
                        <div
                            aria-label={intl.formatMessage({
                                id: "device.raisedHand",
                                defaultMessage: "Raised Hand",
                            })}
                            className={classes.raisedHandContainer}
                            size="small"
                            color="white"
                        >
                            <PanIcon
                                fontSize="medium"
                                className={classes.panIcon}
                            />
                        </div>
                    </div>
                )} */}
                <div className={classes.viewContainer} style={style}>
                    <div className={classes.activitiesCotainer}>
                        {me.raisedHand && (
                            <div className={classes.raisedHand}>
                                <RaiseHandIcon
                                    color="primary"
                                    fontSize="small"
                                />
                            </div>
                        )}

                        {micEnabled ? (
                            <Avatar
                                variant="circular"
                                className={classnames(
                                    classes.micState,
                                    classes.micOn
                                )}
                            >
                                <VolumeOnIcon fontSize="small" />
                            </Avatar>
                        ) : (
                            <Avatar
                                variant="circular"
                                className={classnames(
                                    classes.micState,
                                    classes.micOff
                                )}
                            >
                                <VolumeOffIcon fontSize="small" />
                            </Avatar>
                        )}
                    </div>

                    {/* PTT */}
                    {me.browser.platform !== "mobile" && height >= 170 && (
                        <div
                            className={classnames(
                                classes.ptt,
                                micState === "muted" && me.isSpeaking
                                    ? "enabled"
                                    : null
                            )}
                        >
                            <div>
                                <FormattedMessage
                                    id="me.mutedPTT"
                                    defaultMessage="You are muted, {br} hold down SPACE-BAR to talk"
                                    values={{
                                        br : <br />,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {/* /PTT */}

                    {/* ME TAG */}
                    <p
                        style={{ ...meTag.root.style }}
                        className={classnames(
                            classes.meTag,
                            hover ? "hover" : null
                        )}
                    >
                        <FormattedMessage id="room.me" defaultMessage="Me" />
                    </p>
                    {/* /ME TAG */}

                    {/* CONTROLS BUTTONS (inside) */}
                    {!settings.buttonControlBar && (
                        <div
                            style={{ ...controls.root.style }}
                            className={classnames(
                                classes.controls,
                                settings.hiddenControls ? "hide" : null,
                                hover ? "hover" : null
                            )}
                            onMouseOver={() => setHover(true)}
                            onMouseOut={() => setHover(false)}
                            onTouchStart={() => {
                                if (touchTimeout) {clearTimeout(touchTimeout);}

                                setHover(true);
                            }}
                            onTouchEnd={() => {
                                if (touchTimeout) {clearTimeout(touchTimeout);}

                                touchTimeout = setTimeout(() => {
                                    setHover(false);
                                }, 2000);
                            }}
                        >
                            <>
                                {/* MICROPHONE */}
                                <Tooltip
                                    title={micTip}
                                    placement={
                                        height <= 190 ? "bottom" : "left"
                                    }
                                >
                                    <div>
                                        <Fab
                                            aria-label={intl.formatMessage({
                                                id             : "device.muteAudio",
                                                defaultMessage : "Mute audio",
                                            })}
                                            style={{ ...controls.item.style }}
                                            className={classnames("fab")}
                                            disabled={
                                                !me.canSendMic ||
                                                !hasAudioPermission ||
                                                me.audioInProgress
                                            }
                                            color={
                                                micState === "on"
                                                    ? settings.voiceActivatedUnmute
                                                        ? me.isAutoMuted
                                                            ? "secondary"
                                                            : "primary"
                                                        : "default"
                                                    : "secondary"
                                            }
                                            size={controls.item.size}
                                            onClick={() => {
                                                if (micState === "off")
                                                {roomClient.updateMic({
                                                    start : true,
                                                });}
                                                else if (micState === "on")
                                                {roomClient.muteMic();}
                                                else {roomClient.unmuteMic();}
                                            }}
                                        >
                                            {settings.voiceActivatedUnmute ? (
                                                micState === "on" ? (
                                                    <>
                                                        <svg
                                                            className="MuiSvgIcon-root"
                                                            focusable="false"
                                                            aria-hidden="true"
                                                            style={{
                                                                position :
                                                                    "absolute",
                                                            }}
                                                        >
                                                            <defs>
                                                                <clipPath id="cut-off-indicator">
                                                                    <rect
                                                                        x="0"
                                                                        y="0"
                                                                        width="24"
                                                                        height={
                                                                            24 -
                                                                            2.4 *
                                                                                noiseVolume
                                                                        }
                                                                    />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>
                                                        <SettingsVoiceIcon
                                                            style={{
                                                                position :
                                                                    "absolute",
                                                            }}
                                                            color="default"
                                                        />
                                                        <SettingsVoiceIcon
                                                            clipPath="url(#cut-off-indicator)"
                                                            style={{
                                                                position :
                                                                    "absolute",
                                                                opacity : "0.6",
                                                            }}
                                                            color={
                                                                me.isAutoMuted
                                                                    ? "primary"
                                                                    : "default"
                                                            }
                                                        />
                                                    </>
                                                ) : (
                                                    <MicOffIcon />
                                                )
                                            ) : micState === "on" ? (
                                                <MicIcon />
                                            ) : (
                                                <MicOffIcon />
                                            )}
                                        </Fab>
                                    </div>
                                </Tooltip>
                                {/* /MICROPHONE */}

                                {/* WEBCAM */}
                                <Tooltip
                                    title={webcamTip}
                                    placement={
                                        height <= 190 ? "bottom" : "left"
                                    }
                                >
                                    <div>
                                        <Fab
                                            aria-label={intl.formatMessage({
                                                id             : "device.startVideo",
                                                defaultMessage : "Start video",
                                            })}
                                            style={{ ...controls.item.style }}
                                            className={classnames("fab")}
                                            disabled={
                                                !me.canSendWebcam ||
                                                !hasVideoPermission ||
                                                me.webcamInProgress
                                            }
                                            color={
                                                webcamState === "on"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            size={controls.item.size}
                                            onClick={() => {
                                                if (webcamState === "on") {
                                                    roomClient.disableWebcam()
                                                } else {
                                                    roomClient.updateWebcam({
                                                        start : true,
                                                    });
                                                }
                                            }}
                                        >
                                            {webcamState === "on" ? (
                                                <VideoIcon />
                                            ) : (
                                                <VideoOffIcon />
                                            )}
                                        </Fab>
                                    </div>
                                </Tooltip>
                                {/* /WEBCAM */}

                                {/* SCREENSHARING */}
                                {me.browser.platform !== "mobile" && (
                                    <Tooltip
                                        open={screenShareTooltipOpen}
                                        onClose={screenShareTooltipHandleClose}
                                        onOpen={screenShareTooltipHandleOpen}
                                        title={screenTip}
                                        placement={
                                            height <= 190 ? "bottom" : "left"
                                        }
                                    >
                                        <div>
                                            <Fab
                                                aria-label={intl.formatMessage({
                                                    id             : "device.startScreenSharing",
                                                    defaultMessage :
                                                        "Start screen sharing",
                                                })}
                                                style={{
                                                    ...controls.item.style,
                                                }}
                                                className={classnames("fab")}
                                                disabled={
                                                    !hasScreenPermission ||
                                                    !me.canShareScreen ||
                                                    me.screenShareInProgress
                                                }
                                                color={
                                                    screenState === "on"
                                                        ? "primary"
                                                        : "default"
                                                }
                                                size={controls.item.size}
                                                onClick={() => {
                                                    if (screenState === "off")
                                                    {roomClient.updateScreenSharing(
                                                        { start: true }
                                                    );}
                                                    else if (
                                                        screenState === "on"
                                                    )
                                                    {roomClient.disableScreenSharing();}
                                                }}
                                            >
                                                <ScreenIcon />
                                            </Fab>
                                        </div>
                                    </Tooltip>
                                )}
                                {/* /SCREENSHARING */}

                                {/* MORE BUTTON */}
                                {advancedMode && (
                                    <>
                                        <Tooltip
                                            title={intl.formatMessage({
                                                id             : "device.options",
                                                defaultMessage : "Options",
                                            })}
                                            placement={
                                                height <= 190
                                                    ? "bottom"
                                                    : "left"
                                            }
                                        >
                                            <Fab
                                                aria-label={intl.formatMessage({
                                                    id             : "device.options",
                                                    defaultMessage : "Options",
                                                })}
                                                style={{
                                                    ...controls.item.style,
                                                }}
                                                className={classnames("fab")}
                                                size={controls.item.size}
                                                onClick={handleMenuOpen}
                                            >
                                                <MoreHorizIcon />
                                            </Fab>
                                        </Tooltip>

                                        <Menu
                                            anchorEl={menuAnchorElement}
                                            keepMounted
                                            open={Boolean(menuAnchorElement)}
                                            onClose={handleMenuClose}
                                        >
                                            <MenuItem
                                                onClick={() => {
                                                    setShowAudioAnalyzer(
                                                        !showAudioAnalyzer
                                                    );
                                                    handleMenuClose();
                                                }}
                                            >
                                                {showAudioAnalyzer
                                                    ? "Disable"
                                                    : "Enable"}{" "}
                                                audio analyzer
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}
                                {/* /MORE BUTTON */}
                            </>
                        </div>
                    )}
                    {/* /CONTROLS BUTTONS (inside) */}

                    <VideoView
                        // localRecordingState={localRecordingState}
                        // recordingConsents={recordingConsents}
                        isMe
                        isMirrored={settings.mirrorOwnVideo}
                        VideoView
                        advancedMode={advancedMode}
                        peer={me}
                        displayName={settings.displayName}
                        showPeerInfo
                        videoTrack={webcamProducer && webcamProducer.track}
                        videoVisible={videoVisible}
                        audioTrack={micProducer && micProducer.track}
                        audioCodec={micProducer && micProducer.codec}
                        videoCodec={webcamProducer && webcamProducer.codec}
                        netInfo={transports && transports}
                        audioScore={audioScore}
                        videoScore={videoScore}
                        showQuality
                        onChangeDisplayName={(displayName) => {
                            roomClient.changeDisplayName(displayName);
                        }}
                        showAudioAnalyzer={showAudioAnalyzer}
                    >
                        {micState === "muted" ? null : <Volume id={me.id} />}
                    </VideoView>
                </div>
            </div>
            {extraVideoProducers.map((producer) => (
                <div
                    key={producer.id}
                    className={classnames(
                        classes.root,
                        "webcam",
                        hover ? "hover" : null,
                        activeSpeaker ? "active-speaker" : null
                    )}
                    onMouseOver={() => setHover(true)}
                    onMouseOut={() => setHover(false)}
                    onTouchStart={() => {
                        if (touchTimeout) {clearTimeout(touchTimeout);}

                        setHover(true);
                    }}
                    onTouchEnd={() => {
                        if (touchTimeout) {clearTimeout(touchTimeout);}

                        touchTimeout = setTimeout(() => {
                            setHover(false);
                        }, 2000);
                    }}
                    style={spacingStyle}
                >
                    <div className={classes.viewContainer} style={style}>
                        <p
                            style={{ ...meTag.root.style }}
                            className={classnames(
                                classes.meTag,
                                hover ? "hover" : null,
                                height <= 170 ? "smallest" : null
                            )}
                        >
                            <FormattedMessage
                                id="room.me"
                                defaultMessage="Me"
                            />
                        </p>
                        <div
                            className={classnames(
                                classes.controls,
                                settings.hiddenControls ? "hide" : null,
                                hover ? "hover" : null
                            )}
                            onMouseOver={() => setHover(true)}
                            onMouseOut={() => setHover(false)}
                            onTouchStart={() => {
                                if (touchTimeout)
                                {clearTimeout(touchTimeout);}

                                setHover(true);
                            }}
                            onTouchEnd={() => {
                                if (touchTimeout)
                                {clearTimeout(touchTimeout);}

                                touchTimeout = setTimeout(() => {
                                    setHover(false);
                                }, 2000);
                            }}
                        >
                            <Tooltip
                                title={webcamTip}
                                placement={
                                    height <= 190 ? "bottom" : "left"
                                }
                            >
                                <div>
                                    <Fab
                                        aria-label={intl.formatMessage({
                                            id             : "device.stopVideo",
                                            defaultMessage : "Stop video",
                                        })}
                                        style={{ ...controls.item.style }}
                                        className={classnames("fab")}
                                        disabled={
                                            !me.canSendWebcam ||
                                                me.webcamInProgress
                                        }
                                        size={controls.item.size}
                                        onClick={() => {
                                            roomClient.disableExtraVideo(
                                                producer.id
                                            );
                                        }}
                                    >
                                        <VideoIcon />
                                    </Fab>
                                </div>
                            </Tooltip>
                        </div>

                        <VideoView
                            // localRecordingState={localRecordingState}
                            // recordingConsents={recordingConsents}
                            isMe
                            isMirrored={settings.mirrorOwnVideo}
                            isExtraVideo
                            advancedMode={advancedMode}
                            peer={me}
                            displayName={settings.displayName}
                            showPeerInfo
                            videoTrack={producer && producer.track}
                            videoVisible={videoVisible}
                            videoCodec={producer && producer.codec}
                            onChangeDisplayName={(displayName) => {
                                roomClient.changeDisplayName(displayName);
                            }}
                        />
                    </div>
                </div>
            ))}
            {screenProducer && (
                <div
                    className={classnames(
                        classes.root,
                        "screen",
                        hover ? "hover" : null
                    )}
                    onMouseOver={() => setHover(true)}
                    onMouseOut={() => setHover(false)}
                    onTouchStart={() => {
                        if (touchTimeout) {clearTimeout(touchTimeout);}

                        setHover(true);
                    }}
                    onTouchEnd={() => {
                        if (touchTimeout) {clearTimeout(touchTimeout);}

                        touchTimeout = setTimeout(() => {
                            setHover(false);
                        }, 2000);
                    }}
                    style={spacingStyle}
                >
                    <div className={classes.viewContainer} style={style}>
                        <p
                            style={{ ...meTag.root.style }}
                            className={classnames(
                                classes.meTag,
                                hover ? "hover" : null
                            )}
                        >
                            <FormattedMessage
                                id="room.me"
                                defaultMessage="Me"
                            />
                        </p>

                        <VideoView
                            // localRecordingState={localRecordingState}
                            // recordingConsents={recordingConsents}
                            isMe
                            isScreen
                            advancedMode={advancedMode}
                            videoContain
                            videoTrack={screenProducer && screenProducer.track}
                            videoVisible={screenVisible}
                            videoCodec={screenProducer && screenProducer.codec}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

Me.propTypes = {
    roomClient          : PropTypes.any.isRequired,
    advancedMode        : PropTypes.bool,
    me                  : appPropTypes.Me.isRequired,
    settings            : PropTypes.object,
    youtube             : PropTypes.object.isRequired,
    activeSpeaker       : PropTypes.bool,
    micProducer         : appPropTypes.Producer,
    webcamProducer      : appPropTypes.Producer,
    screenProducer      : appPropTypes.Producer,
    extraVideoProducers : PropTypes.arrayOf(appPropTypes.Producer),
    spacing             : PropTypes.number,
    style               : PropTypes.object,
    presentationStyle   : PropTypes.object,
    smallContainer      : PropTypes.bool,
    hasAudioPermission  : PropTypes.bool.isRequired,
    hasVideoPermission  : PropTypes.bool.isRequired,
    hasScreenPermission : PropTypes.bool.isRequired,
    noiseVolume         : PropTypes.number,
    classes             : PropTypes.object.isRequired,
    theme               : PropTypes.object.isRequired,
    transports          : PropTypes.object.isRequired,
    peers               : PropTypes.object.isRequired,
    room                : PropTypes.object.isRequired,
    whiteboard          : PropTypes.object.isRequired,
    document            : PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {
    const canShareAudio = makePermissionSelector(permissions.SHARE_AUDIO);
    const canShareVideo = makePermissionSelector(permissions.SHARE_VIDEO);
    const canShareScreen = makePermissionSelector(permissions.SHARE_SCREEN);

    const mapStateToProps = (state) => {
        let noise;

        // noise = volume under threshold
        if (state.peerVolumes[state.me.id] < state.settings.noiseThreshold) {
            // noise mapped to range 0 ... 10
            noise = Math.round(
                ((100 + state.peerVolumes[state.me.id]) /
                    (100 + state.settings.noiseThreshold)) *
                    10
            );
        }
        // noiseVolume over threshold: no noise but voice
        else {
            noise = 10;
        }

        return {
            whiteboard          : state.whiteboard,
            room                : state.room,
            youtube             : state.youtube,
            peers               : state.peers,
            me                  : state.me,
            ...meProducersSelector(state),
            settings            : state.settings,
            activeSpeaker       : state.me.id === state.room.activeSpeakerId,
            hasAudioPermission  : canShareAudio(state),
            hasVideoPermission  : canShareVideo(state),
            hasScreenPermission : canShareScreen(state),
            noiseVolume         : noise,
            transports          : state.transports,
            document            : state.document,
        };
    };

    return mapStateToProps;
};

export default withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => (
            prev.document === next.document &&
                prev.whiteboard === next.whiteboard &&
                prev.room === next.room &&
                prev.youtube === next.youtube &&
                Math.round(prev.peerVolumes[prev.me.id]) ===
                    Math.round(next.peerVolumes[next.me.id]) &&
                prev.room === next.room &&
                prev.me === next.me &&
                prev.peers === next.peers &&
                prev.producers === next.producers &&
                prev.settings === next.settings &&
                prev.transports === next.transports
        ),
    })(withStyles(styles, { withTheme: true })(Me))
);
