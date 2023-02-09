import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import isElectron from "is-electron";
import CookieConsent from "react-cookie-consent";
import PropTypes from "prop-types";
import { useIntl, FormattedMessage } from "react-intl";
import {
    Tooltip,
    Fab,
    MenuItem,
    Grid,
    Box,
    Button,
    FormControl,
    Typography,
    useMediaQuery,
    Avatar,
    TextField,
} from "@material-ui/core";

import { withRoomContext } from "../../RoomContext";
import * as appPropTypes from "../appPropTypes";
import {
    PlayIcon,
    NextIcon,
    VideoOffIcon,
    VideoOnIcon,
    MicOffIcon,
    MicOnIcon,
} from "../../assets/icons";
import { meProducersSelector } from "../../store/selectors";
import VideoPrview from "./VideoPrview";
import { SecondaryLoading, SimpleLoading } from "../Loading";
import VoiceAnimationBar from "../VoiceAnimationBar";
import { Select } from "../../core/components";
import randomString from 'random-string';


const config = window.config;

const styles = (theme) => ({
    root : {
        flexGrow    : 1,
        width       : "100%",
        height      : "100%",
        padding     : `${theme.spacing(5)}px ${theme.spacing(10)}px`,
        margin      : 0,
        position    : "relative",
        overflow    : "hidden",
        "&::before" : {
            content         : "''",
            backgroundImage : `url(${
                window.config ? window.config.backgroundSplines.splines : null
            })`,
            backgroundAttachment : "fixed",
            backgroundPositionX  : "left",
            backgroundPositionY  : "bottom",
            backgroundSize       : "contain",
            backgroundRepeat     : "no-repeat",
            position             : "absolute",
            width                : "100%",
            height               : "100%",
            bottom               : 0,
            left                 : 0,
            zIndex               : 0,
            transform            : "scale(0.7) translate(-30%, 30%)",
        },
        [theme.breakpoints.down("sm")] : {
            padding : theme.spacing(2),
        },
    },
    logo : {
        gap      : theme.spacing(1),
        flexWrap : "nowrap",
    },
    logoImg : {
        width                          : "64px",
        [theme.breakpoints.down("xs")] : {
            width : "48px",
        },
    },
    logoName : {
        fontWeight                    : "bold",
        [theme.breakpoints.down(380)] : {
            fontSize : theme.spacing(2.5),
        },
    },
    form : {
        zIndex                         : 1,
        gap                            : theme.spacing(2),
        [theme.breakpoints.down("xs")] : {
            flexDirection : "column-reverse",
            alignItems    : "center",
        },
    },
    formControl : {
        display : "flex",
    },
    viewContainer : {
        position           : "relative",
        width              : "100%",
        height             : "100%",
        zIndex             : 1,
        objectFit          : "cover",
        userSelect         : "none",
        transitionProperty : "opacity",
        transitionDuration : ".15s",
        backgroundColor    : "var(--peer-video-bg-color)",
        backgroundImage    : "var(--peer-empty-avatar)",
        borderRadius       : `calc(var(--peer-border-radius-lg) + ${theme.spacing(
            1
        )}px)`,
        backgroundSize               : "auto 85%",
        backgroundRepeat             : "no-repeat",
        backgroundPositionX          : "center",
        backgroundPositionY          : "bottom",
        border                       : `${theme.spacing(1)}px solid #9CB6DB`,
        [theme.breakpoints.up("md")] : {
            maxWidth  : "853.333px",
            maxHeight : "480px",
        },
        [theme.breakpoints.between("sm", "md")] : {
            maxWidth     : "568.88px",
            maxHeight    : "320px",
            border       : `${theme.spacing(0.5)}px solid #9CB6DB`,
            borderRadius : `calc(var(--peer-border-radius-lg) + ${theme.spacing(
                0.5
            )}px)`,
        },
        [theme.breakpoints.between("xs", "sm")] : {
            maxWidth     : "320px",
            maxHeight    : "180px",
            border       : `${theme.spacing(0.5)}px solid #9CB6DB`,
            borderRadius : `calc(var(--peer-border-radius-lg) + ${theme.spacing(
                0.5
            )}px)`,
            display        : "flex",
            justifyContent : "center",
        },
    },
    mediaControls : {
        [theme.breakpoints.down("xs")] : {
            minWidth : "100%",
        },
    },
    controls : {
        position       : "absolute",
        width          : "100%",
        height         : "100%",
        display        : "flex",
        flexDirection  : "column",
        justifyContent : "flex-start",
        alignItems     : "flex-end",
        padding        : theme.spacing(4),
        zIndex         : 21,
        opacity        : 0,
        gap            : theme.spacing(1),
        transition     : "opacity 0.3s",
        touchAction    : "none",
        borderRadius   : "var(--peer-border-radius-lg)",
        background     : "rgba(0,0,0,0.2)",
        "&.hover"      : {
            opacity : 1,
        },
        [theme.breakpoints.down("md")] : {
            padding : theme.spacing(3),
        },
    },
    testBtn : {
        marginTop : theme.spacing(1),
    },
    joinBtn : {
        textAlign : "end",
    },
    subTitle : {
        fontWeight : "bold",
    },
    accountButton : {
        padding       : 0,
        display       : "flex",
        flexDirection : "column",
        gap           : theme.spacing(1),
    },
    accountButtonAvatar : {
        width                         : 50,
        height                        : 50,
        [theme.breakpoints.down(400)] : {
            width  : 35,
            height : 35,
        },
    },
});

const StartMeeting = (props) => {
    const {
        me,
        room,
        theme,
        classes,
        settings,
        roomClient,
        micProducer,
        webcamProducer,
    } = props;

    settings.displayName = settings.displayName.trimLeft();

    const [ roomId, setRoomId ] = useState(
        decodeURIComponent(location.pathname.slice(1)) ||
		randomString({ length: 8 }).toLowerCase()
    );

    const intl = useIntl();
    const [hover, setHover] = useState(false);

    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    let touchTimeout = null;

    let webcams;

    if (me.webcamDevices) {
        webcams = Object.values(me.webcamDevices);
    } else {
        webcams = [];
    }

    let audioDevices;

    if (me.audioDevices) {
        audioDevices = Object.values(me.audioDevices);
    } else {
        audioDevices = [];
    }

    let audioOutputDevices;

    if (me.audioOutputDevices) {
        audioOutputDevices = Object.values(me.audioOutputDevices);
    } else {
        audioOutputDevices = [];
    }

    let webcamState;

    let webcamTip;

    if (webcamProducer) {
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

    let micState;

    let micTip;

    if (micProducer) {
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

    let loginTooltip;

    if (me.loggedIn) {
        loginTooltip = intl.formatMessage({
            id             : "label.logout",
            defaultMessage : "Logout",
        });
    } else {
        loginTooltip = intl.formatMessage({
            id             : "label.login",
            defaultMessage : "Login",
        });
    }

    const handleJoin = () => {
        const { videoMuted, audioMuted } = settings;

        roomClient.join({
            roomId,
            joinVideo  : !videoMuted,
            joinAudio  : !audioMuted,
            anonymouse : room.enableAnonymouseMode,
        });
    };

    const handleFocus = (event) => event.target.select();

    useEffect(() =>
    {
        window.history.replaceState({}, null, encodeURIComponent(roomId) || '/');

    }, [ roomId ]);

    useEffect(() =>
    {
        (location.pathname === '/') && history.push(encodeURIComponent(roomId));
    });

    return (
        <>
            {room.loading && <SimpleLoading />}
            <Grid
                container
                className={classes.root}
                justifyContent="flex-start"
                direction="column"
                wrap="nowrap"
                spacing={2}
            >
                {/* Start Logo */}
                <Grid
                    item
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    wrap="nowarp"
                    style={{ flexWrap: "nowrap" }}
                >
                    <Grid
                        item
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        className={classes.logo}
                    >
                        <Grid item>
                            <Typography
                                color="primary"
                                variant="h5"
                                className={classes.logoName}
                            >
                                {config.title}
                            </Typography>
                        </Grid>
                    </Grid>
                    {room.enableAnonymouseMode && config.loginEnabled && (
                        <Grid item>
                            <Tooltip title={loginTooltip} placement="bottom">
                                <Button
                                    className={classes.accountButton}
                                    onClick={
                                        me.loggedIn
                                            ? () => roomClient.logout()
                                            : () => roomClient.login()
                                    }
                                >
                                    {me.loggedIn ? (
                                        <Box
                                            display="flex"
                                            flexDirection="row"
                                            justifyContent="center"
                                            alignItems="center"
                                            style={{
                                                gap : 8,
                                            }}
                                        >
                                            <Typography
                                                component="p"
                                                variant="subtitle2"
                                            >
                                                {settings.displayName}
                                            </Typography>
                                            <Avatar src={me.picture}></Avatar>
                                        </Box>
                                    ) : (
                                        <Typography
                                            component="p"
                                            variant="subtitle2"
                                        >
                                            {loginTooltip}
                                        </Typography>
                                    )}
                                </Button>
                            </Tooltip>
                        </Grid>
                    )}
                </Grid>
                {/* End Logo */}

                {/* Start Main Control */}
                <Grid
                    container
                    item
                    xs
                    md
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center"
                    wrap="nowrap"
                    className={classes.form}
                >
                    <Grid
                        item
                        xs={5}
                        md={4}
                        container
                        direction="column"
                        justifyContent="flex-start"
                        spacing={2}
                        className={classes.mediaControls}
                    >
                        {/* ROOM NAME */}
                        <Grid item>
                            <TextField
                                autoFocus
                                id='roomId'
                                label={intl.formatMessage({
                                    id             : 'label.roomName',
                                    defaultMessage : 'Room name'
                                })}
                                value={roomId}
                                variant='outlined'
                                margin='normal'
                                fullWidth
                                size="small"
                                // InputProps={{
                                //     startAdornment : (
                                //         <InputAdornment position='start'>
                                //             <MeetingRoomIcon />
                                //         </InputAdornment>
                                //     )
                                // }}
                                onChange={(event) =>
                                {
                                    const { value } = event.target;

                                    setRoomId(value.toLowerCase());

                                }}
                                onFocus={handleFocus}
                                onBlur={() =>
                                {
                                    if (roomId === '')
                                    {setRoomId(randomString({ length: 8 }).toLowerCase());}
                                }}
                            />
                        </Grid>
                        {/* ROOM NAME */}

                        {room.enableAnonymouseMode && config.loginEnabled && (
                            <Grid item>
                                <TextField
                                    required
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    error={settings.displayName.length === 0}
                                    label={intl.formatMessage({
                                        id             : "label.yourName",
                                        defaultMessage : "Your name",
                                    })}
                                    value={settings.displayName}
                                    disabled={
                                        settings.displayNameInProgress ||
                                        me.loggedIn
                                    }
                                    onChange={(event) => {
                                        const { value } = event.target;

                                        roomClient.changeDisplayName(value);
                                    }}
                                    onBlur={(event) => {
                                        const { value } = event.target;

                                        roomClient.changeDisplayName(
                                            value.trim()
                                        );
                                    }}
                                />
                            </Grid>
                        )}

                        {/* Start Camera */}
                        <Grid item container>
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="subtitle2"
                                component="p"
                                className={classes.subTitle}
                            >
                                {intl.formatMessage({
                                    id             : "settings.selectCamera",
                                    defaultMessage : "Select your camemra",
                                })}
                            </Typography>
                            <FormControl
                                variant="outlined"
                                size="small"
                                className={classes.formControl}
                                fullWidth
                            >
                                <Select
                                    value={settings.selectedWebcam || ""}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            roomClient.updateLocalWebcam({
                                                restart     : true,
                                                newDeviceId : event.target.value,
                                            });
                                        }
                                    }}
                                    displayEmpty
                                    name={intl.formatMessage({
                                        id             : "settings.camera",
                                        defaultMessage : "Camera",
                                    })}
                                    className={classes.selectEmpty}
                                    disabled={
                                        room.loading ||
                                        webcams.length === 0 ||
                                        me.webcamInProgress
                                    }
                                >
                                    {webcams.map((webcam, index) => {
                                        return (
                                            <MenuItem
                                                key={index}
                                                value={webcam.deviceId}
                                            >
                                                {webcam.label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Start Camera */}

                        {/* Start Microphone*/}
                        <Grid item container>
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="subtitle2"
                                component="p"
                                className={classes.subTitle}
                            >
                                {audioDevices.length > 0
                                    ? intl.formatMessage({
                                        id             : "settings.selectAudio",
                                        defaultMessage :
                                              "Select audio input device",
                                    })
                                    : intl.formatMessage({
                                        id             : "settings.cantSelectAudio",
                                        defaultMessage :
                                              "Unable to select audio input device",
                                    })}
                            </Typography>
                            <FormControl
                                variant="outlined"
                                size="small"
                                className={classes.formControl}
                                fullWidth
                            >
                                <Select
                                    value={settings.selectedAudioDevice || ""}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            roomClient.updateLocalMic({
                                                restart     : true,
                                                newDeviceId : event.target.value,
                                            });
                                        }
                                    }}
                                    displayEmpty
                                    name={intl.formatMessage({
                                        id             : "settings.audio",
                                        defaultMessage : "Audio input device",
                                    })}
                                    className={classes.selectEmpty}
                                    disabled={
                                        room.loading ||
                                        audioDevices.length === 0 ||
                                        me.audioInProgress
                                    }
                                >
                                    {audioDevices.map((audio, index) => {
                                        return (
                                            <MenuItem
                                                key={index}
                                                value={audio.deviceId}
                                            >
                                                {audio.label === ""
                                                    ? index + 1
                                                    : audio.label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* End Microphone*/}

                        {/* Start Speaker*/}
                        {"audioOutputSupportedBrowsers" in window.config &&
                            window.config.audioOutputSupportedBrowsers.includes(
                                me.browser.name
                            ) && (
                            <Grid item container>
                                <Typography
                                    gutterBottom
                                    color="textPrimary"
                                    variant="subtitle2"
                                    component="p"
                                    className={classes.subTitle}
                                >
                                    {audioOutputDevices.length > 0
                                        ? intl.formatMessage({
                                            id             : "settings.selectAudioOutput",
                                            defaultMessage :
                                                      "Select audio output device",
                                        })
                                        : intl.formatMessage({
                                            id             : "settings.cantSelectAudioOutput",
                                            defaultMessage :
                                                      "Unable to select audio output device",
                                        })}
                                </Typography>
                                <FormControl
                                    variant="outlined"
                                    size="small"
                                    className={classes.formControl}
                                    fullWidth
                                >
                                    <Select
                                        value={
                                            settings.selectedAudioOutputDevice ||
                                                ""
                                        }
                                        onChange={(event) => {
                                            if (event.target.value) {
                                                roomClient.changeAudioOutputDevice(
                                                    event.target.value
                                                );
                                            }
                                        }}
                                        displayEmpty
                                        name={intl.formatMessage({
                                            id             : "settings.audioOutput",
                                            defaultMessage :
                                                    "Audio output device",
                                        })}
                                        className={classes.selectEmpty}
                                        disabled={
                                            room.loading ||
                                                audioOutputDevices.length ===
                                                    0 ||
                                                me.audioOutputInProgress
                                        }
                                    >
                                        {audioOutputDevices.map(
                                            (audioOutput, index) => {
                                                return (
                                                    <MenuItem
                                                        key={index}
                                                        value={
                                                            audioOutput.deviceId
                                                        }
                                                    >
                                                        {audioOutput.label}
                                                    </MenuItem>
                                                );
                                            }
                                        )}
                                    </Select>
                                </FormControl>
                                <Box
                                    component="div"
                                    style={{
                                        display    : "flex",
                                        alignItems : "center",
                                    }}
                                >
                                    <Button
                                        className={classes.testBtn}
                                        startIcon={<PlayIcon />}
                                        variant="contained"
                                        color="primary"
                                        disabled={room.loading}
                                        onClick={() => {
                                            roomClient.speakerTestPlay();
                                        }}
                                    >
                                        <FormattedMessage
                                            id="room.testSpeaker"
                                            defaultMessage="Test Speaker"
                                        />
                                    </Button>
                                    {settings.speakerTestPlaying && (
                                        <Box
                                            component="div"
                                            style={{
                                                flexGrow       : 1,
                                                display        : "flex",
                                                justifyContent : "center",
                                                alignItems     : "center",
                                            }}
                                        >
                                            <VoiceAnimationBar />
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        )}
                        {/* Start Speaker*/}
                    </Grid>

                    <Grid
                        item
                        container
                        xs={7}
                        md={8}
                        className={classnames(classes.viewContainer)}
                    >
                        {room.mediaLoading ? (
                            <SecondaryLoading />
                        ) : (
                            <>
                                <div
                                    className={classnames(
                                        classes.controls,
                                        hover ? "hover" : null
                                    )}
                                    onMouseOver={() => setHover(true)}
                                    onMouseOut={() => setHover(false)}
                                    onTouchStart={() => {
                                        if (touchTimeout) {
                                            clearTimeout(touchTimeout);
                                        }

                                        setHover(true);
                                    }}
                                    onTouchEnd={() => {
                                        if (touchTimeout) {
                                            clearTimeout(touchTimeout);
                                        }

                                        touchTimeout = setTimeout(() => {
                                            setHover(false);
                                        }, 2000);
                                    }}
                                >
                                    <Tooltip
                                        title={webcamTip}
                                        placement={
                                            smallScreen ? "top" : "right"
                                        }
                                    >
                                        <Fab
                                            aria-label={intl.formatMessage({
                                                id             : "device.startVideo",
                                                defaultMessage : "Start video",
                                            })}
                                            className={classes.fab}
                                            disabled={
                                                room.loading ||
                                                me.webcamInProgress
                                            }
                                            size={
                                                smallScreen ? "small" : "medium"
                                            }
                                            onClick={() => {
                                                webcamState === "on"
                                                    ? roomClient.disableLocalWebcam()
                                                    : roomClient.updateLocalWebcam(
                                                        {
                                                            start : true,
                                                        }
                                                    );
                                            }}
                                        >
                                            {webcamState === "on" ? (
                                                <VideoOnIcon fontSize="medium" />  
                                                
                                            ) : (
                                                <VideoOffIcon
                                                    fontSize="medium"
                                                    color="error"
                                                />
                                            )}
                                        </Fab>
                                    </Tooltip>
                                    <Tooltip
                                        title={micTip}
                                        placement={
                                            smallScreen ? "top" : "right"
                                        }
                                    >
                                        <Fab
                                            aria-label={intl.formatMessage({
                                                id             : "device.muteAudio",
                                                defaultMessage : "Mute audio",
                                            })}
                                            className={classes.fab}
                                            disabled={
                                                room.loading ||
                                                me.localAudioInProgress
                                            }
                                            size={
                                                smallScreen ? "small" : "medium"
                                            }
                                            onClick={() => {
                                                if (micState === "muted") {
                                                    roomClient.updateLocalMic({
                                                        start : true,
                                                    });
                                                } else {
                                                    roomClient.disableLocalMic();
                                                }
                                            }}
                                        >
                                            {micState === "on" ? (
                                                <MicOnIcon fontSize="medium" />
                                               
                                            ) : (
                                                <MicOffIcon
                                                    fontSize="medium"
                                                    color="error"
                                                />
                                            )}
                                        </Fab>
                                    </Tooltip>
                                </div>
                                <VideoPrview
                                    isMirrored={settings.mirrorOwnVideo}
                                    videoTrack={
                                        webcamProducer && webcamProducer.track
                                    }
                                />
                            </>
                        )}
                    </Grid>
                </Grid>
                {/* End Main Control */}

                {/* Start Join Button */}
                <Grid item className={classnames(classes.joinBtn)}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleJoin}
                        endIcon={<NextIcon />}
                        disabled={
                            room.loading ||
                            !room.canJoin ||
                            (room.enableAnonymouseMode &&
                                !me.loggedIn &&
                                !settings.displayName)
                        }
                    >
                        <FormattedMessage
                            id="room.joinMeeting"
                            defaultMessage="Join Meeting"
                        />
                    </Button>
                </Grid>
                {/* End Join Button */}

                {!isElectron() && (
                    <CookieConsent
                        style={{ zIndex: 10000 }}
                        buttonText={
                            <FormattedMessage
                                id="room.consentUnderstand"
                                defaultMessage="I understand"
                            />
                        }
                    >
                        <FormattedMessage
                            id="room.cookieConsent"
                            defaultMessage="This website uses cookies to enhance the user experience"
                        />
                    </CookieConsent>
                )}
            </Grid>
        </>
    );
};

StartMeeting.propTypes = {
    me         : appPropTypes.Me.isRequired,
    roomClient : PropTypes.any.isRequired,
    settings   : PropTypes.object.isRequired,
    classes    : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        room     : state.room,
        me       : state.me,
        settings : state.settings,
        ...meProducersSelector(state),
    };
};

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.me === next.me &&
                prev.settings === next.settings &&
                prev.room === next.room &&
                prev.producers === next.producers &&
                prev.settings === next.settings &&
                prev.transports === next.transports
            );
        },
    })(withStyles(styles, { withTheme: true })(StartMeeting))
);
