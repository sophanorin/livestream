import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../RoomContext";
import * as settingsActions from "../store/actions/settingsActions";
import * as roomActions from "../store/actions/roomActions";
import PropTypes from "prop-types";
import { useIntl, FormattedMessage } from "react-intl";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Grid from "@material-ui/core/Grid";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogActions from "@material-ui/core/DialogActions";
import Tooltip from "@material-ui/core/Tooltip";
import { getLinkData } from "../utils";
import { alpha, IconButton, Typography } from "@material-ui/core";
import {
    CloseIcon,
    PresentIcon,
    VideoOnIcon,
    MicOnIcon,
} from "../assets/icons";
import palette from "../theme/palette";

const styles = (theme) => ({
    root : {},
    logo : {
        width : "64px",
    },
    title : {
        fontWeight : "bold",
    },
    dialogTitle : {},
    dialogPaper : {
        borderRadius : "var(--peer-border-radius-md)",
        padding      : theme.spacing(1, 2, 2, 2),
    },
    groupButton : {
        display : "flex",
        gap     : theme.spacing(1),
    },
    buttonToggle : {
        // width: "5rem",
        // height: "5rem",
        borderRadius : "var(--peer-border-radius-sm) !important",
        border       : `1px solid ${palette.primary.main} !important`,

        padding : theme.spacing(0.5, 1),
        // [theme.breakpoints.down("sm")]: {
        //     width: "4rem",
        //     height: "4rem",
        // },
        // [theme.breakpoints.down("xs")]: {
        //     width: "3.5rem",
        //     height: "3.5rem",
        //     padding: 0,
        // },
    },
    accountButton : {
        padding : 0,
    },
    accountButtonAvatar : {
        width  : 50,
        height : 50,
    },

    green : {
        color : "#5F9B2D",
    },
    red : {
        color : "rgba(153, 0, 0, 1)",
    },
    joinButton : {
        backgroundColor : palette.status.green.primary,
        "&:hover"       : {
            backgroundColor : alpha(palette.status.green.primary, 0.7),
        },

        [theme.breakpoints.down("xs")] : {
            fontSize : "0.7rem",
        },
    },
    mediaDevicesSelectedButton : {
        "& .Mui-selected" : {
            color           : palette.basic.white,
            backgroundColor : palette.primary.main,
            "&:hover"       : {
                color           : palette.basic.white,
                backgroundColor : palette.primary.hover,
            },
            "& .MuiTypography-colorPrimary" : {
                color : `${palette.basic.white} !important`,
            },
            "& .MuiSvgIcon-colorPrimary" : {
                color : `${palette.basic.white} !important`,
            },
        },
    },
    buttonContent : {
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        flexDirection  : "row",
        gap            : theme.spacing(0.5),
        textTransform  : "capitalize",
    },
});

const DialogTitle = withStyles((theme) => ({
    root : {
        margin  : 0,
        padding : theme.spacing(1),
    },
}))(MuiDialogTitle);

const DialogActions = withStyles((theme) => ({
    root : {
        margin  : 0,
        padding : theme.spacing(1),
    },
}))(MuiDialogActions);

const ChooseMediaDialog = ({
    roomClient,
    mediaPerms,
    setMediaPerms,
    classes,
    setChooseMediaDialogOpen,
    devicePermissionOpen,
    isPreJoinBreakoutRoom,
    settings,
}) => {
    const intl = useIntl();

    const handleSetMediaPerms = (event, newMediaPerms) => {
        if (newMediaPerms !== null) {
            setMediaPerms(JSON.parse(newMediaPerms));
        }
    };

    const handleJoin = () => {
        setChooseMediaDialogOpen(false);
        if (isPreJoinBreakoutRoom) {
            roomClient.getBreakoutRoomsManager().joinBreakoutRoom();
        } else {
            const { videoMuted, audioMuted } = settings;
            const { roomId, roomKey, tk } = getLinkData(window.location.search);

            roomClient.join({
                roomId,
                roomKey,
                tk,
                joinVideo : !videoMuted,
                joinAudio : !audioMuted,
            });
        }
    };

    const handleJoinUsingEnterKey = (event) => {
        if (event.key === "Enter") {
            document.getElementById("joinButton").click();
        }
    };

    return (
        <Dialog
            className={classes.root}
            onKeyDown={handleJoinUsingEnterKey}
            open={devicePermissionOpen}
            classes={{
                paper : classes.dialogPaper,
            }}
        >
            <DialogTitle disableTypography id="form-dialog-title">
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    wrap="nowrap"
                >
                    <Grid
                        item
                        container
                        direction="row"
                        alignItems="center"
                        wrap="nowrap"
                        spacing={1}
                        style={{
                            gap : 4,
                        }}
                    >
                        <PresentIcon fontSize="small" />
                        <Typography
                            component="h2"
                            variant="subtitle1"
                            className={classes.title}
                        >
                            <FormattedMessage
                                id="room.chooseMedia"
                                defaultMessage="Choose Media"
                            />
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            className={classes.closeBtn}
                            onClick={() => setChooseMediaDialogOpen(false)}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            {/* {!room.inLobby && room.overRoomLimit && (
                    <DialogContent>
                        <DialogContentText
                            className={classes.red}
                            variant="h6"
                            gutterBottom
                        >
                            <FormattedMessage
                                id="room.overRoomLimit"
                                defaultMessage={
                                    "The room is full, retry after some time."
                                }
                            />
                        </DialogContentText>
                    </DialogContent>
                )} */}

            <DialogActions>
                <Grid container direction="column" spacing={2}>
                    {/* MEDIA PERMISSIONS TOGGLE BUTTONS */}
                    <Grid item>
                        <FormControl component="fieldset">
                            <ToggleButtonGroup
                                value={JSON.stringify(mediaPerms)}
                                size="small"
                                onChange={handleSetMediaPerms}
                                className={`${classes.groupButton} ${classes.mediaDevicesSelectedButton}`}
                                aria-label="choose permission"
                                exclusive
                            >
                                <ToggleButton
                                    className={classes.buttonToggle}
                                    value='{"audio":false,"video":false}'
                                >
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id             : "devices.disableBothMicrophoneAndCamera",
                                            defaultMessage :
                                                "Disable both Microphone And Camera",
                                        })}
                                        placement="bottom"
                                    >
                                        <Typography
                                            component="p"
                                            variant="subtitle2"
                                            color="primary"
                                            className={classes.buttonContent}
                                        >
                                            <FormattedMessage
                                                id="label.none"
                                                defaultMessage="None"
                                            />
                                        </Typography>
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton
                                    className={classes.buttonToggle}
                                    value='{"audio":true,"video":false}'
                                >
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id             : "devices.enableOnlyMicrophone",
                                            defaultMessage :
                                                "Enable only Microphone",
                                        })}
                                        placement="bottom"
                                    >
                                        <Typography
                                            className={classes.buttonContent}
                                            color="primary"
                                            component="p"
                                            variant="subtitle2"
                                        >
                                            <MicOnIcon
                                                fontSize="small"
                                                color="primary"
                                            />
                                            <FormattedMessage
                                                id="device.mic"
                                                defaultMessage="Mic"
                                            />
                                        </Typography>
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton
                                    className={classes.buttonToggle}
                                    value='{"audio":false,"video":true}'
                                >
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id             : "devices.enableOnlyCamera",
                                            defaultMessage :
                                                "Enable only Camera",
                                        })}
                                        placement="bottom"
                                    >
                                        <Typography
                                            className={classes.buttonContent}
                                            color="primary"
                                            component="p"
                                            variant="subtitle2"
                                        >
                                            <VideoOnIcon fontSize="small" />
                                            <FormattedMessage
                                                id="device.camera"
                                                defaultMessage="Camera"
                                            />
                                        </Typography>
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton
                                    className={classes.buttonToggle}
                                    value='{"audio":true,"video":true}'
                                >
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id             : "devices.enableBothMicrophoneAndCamera",
                                            defaultMessage :
                                                "Enable both Microphone and Camera",
                                        })}
                                        placement="bottom"
                                    >
                                        <Typography
                                            color="primary"
                                            component="p"
                                            variant="subtitle2"
                                            className={classes.buttonContent}
                                        >
                                            <MicOnIcon fontSize="small" />
                                            +
                                            <VideoOnIcon fontSize="small" />
                                        </Typography>
                                    </Tooltip>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </FormControl>
                    </Grid>

                    {/* /MEDIA PERMISSION BUTTONS */}

                    {/* JOIN/AUTH BUTTON */}
                    <Grid item container justifyContent="center">
                        <Button
                            className={classes.joinButton}
                            onClick={handleJoin}
                            variant="contained"
                            color="primary"
                            id="joinButton"
                        >
                            <FormattedMessage
                                id="label.join"
                                defaultMessage="Join"
                            />
                        </Button>
                    </Grid>
                    {/* /JOIN BUTTON */}
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

ChooseMediaDialog.propTypes = {
    roomClient               : PropTypes.any.isRequired,
    room                     : PropTypes.object.isRequired,
    setMediaPerms            : PropTypes.func.isRequired,
    classes                  : PropTypes.object.isRequired,
    mediaPerms               : PropTypes.object.isRequired,
    setChooseMediaDialogOpen : PropTypes.func.isRequired,
    devicePermissionOpen     : PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
    return {
        room                  : state.room,
        settings              : state.settings,
        mediaPerms            : state.settings.mediaPerms,
        devicePermissionOpen  : state.room.devicePermissionOpen,
        isPreJoinBreakoutRoom : state.room.isPreJoinBreakoutRoom,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setMediaPerms : (mediaPerms) => {
            dispatch(settingsActions.setMediaPerms(mediaPerms));
        },
        setAudioMuted : (flag) => {
            dispatch(settingsActions.setAudioMuted(flag));
        },
        setVideoMuted : (flag) => {
            dispatch(settingsActions.setVideoMuted(flag));
        },
        setChooseMediaDialogOpen : (toggle) => {
            dispatch(roomActions.setDevicePermissionOpen(toggle));
        },
    };
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.inLobby === next.room.inLobby &&
                prev.room.overRoomLimit === next.room.overRoomLimit &&
                prev.settings === next.settings &&
                prev.isPreJoinBreakoutRoom === next.isPreJoinBreakoutRoom
            );
        },
    })(withStyles(styles)(ChooseMediaDialog))
);
