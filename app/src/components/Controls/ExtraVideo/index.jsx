import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { useIntl, FormattedMessage } from "react-intl";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

import { withRoomContext } from "../../../RoomContext";
import * as roomActions from "../../../store/actions/roomActions";
import { Select } from "../../../core/components";
import styles from "./styles.web";
import { IconButton } from "@material-ui/core";
import { CloseIcon } from "../../../assets/icons";

const ExtraVideo = ({
    roomClient,
    extraVideoOpen,
    webcamDevices,
    handleCloseExtraVideo,
    classes,
}) => {
    const intl = useIntl();

    const [videoDevice, setVideoDevice] = React.useState("");

    const handleChange = (event) => {
        setVideoDevice(event.target.value);
    };

    let videoDevices;

    if (webcamDevices) {
        videoDevices = Object.values(webcamDevices);
    } else {
        videoDevices = [];
    }

    return (
        <Dialog
            open={extraVideoOpen}
            onClose={() => handleCloseExtraVideo(false)}
            classes={{
                paper : classes.dialogPaper,
            }}
        >
            <DialogTitle
                disableTypography
                id="form-dialog-title"
                className={classes.dialogTitle}
            >
                <Typography component="h2" variant="h6">
                    {intl.formatMessage({
                        id             : "room.extraVideo",
                        defaultMessage : "Add external camera",
                    })}
                </Typography>

                <IconButton onClick={() => handleCloseExtraVideo(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form className={classes.setting} autoComplete="off">
                <Typography
                    gutterBottom
                    variant="subtitle2"
                    component="p"
                    className={classes.subTitle}
                >
                    {videoDevices.length > 0
                        ? intl.formatMessage({
                            id             : "settings.selectCamera",
                            defaultMessage : "Select video device",
                        })
                        : intl.formatMessage({
                            id             : "settings.cantSelectCamera",
                            defaultMessage : "Unable to select video device",
                        })}
                </Typography>
                <FormControl
                    variant="outlined"
                    size="small"
                    className={classes.formControl}
                >
                    <Select
                        value={videoDevice}
                        displayEmpty
                        name={intl.formatMessage({
                            id             : "settings.camera",
                            defaultMessage : "Camera",
                        })}
                        autoWidth
                        className={classes.selectEmpty}
                        disabled={videoDevices.length === 0}
                        onChange={handleChange}
                    >
                        {videoDevices.map((webcam, index) => {
                            return (
                                <MenuItem key={index} value={webcam.deviceId}>
                                    {webcam.label}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </form>
            <DialogActions className={classes.action}>
                <Button
                    onClick={() => roomClient.addExtraVideo(videoDevice)}
                    color="primary"
                    variant="contained"
                >
                    <FormattedMessage
                        id="label.addVideo"
                        defaultMessage="Add Camera"
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ExtraVideo.propTypes = {
    roomClient            : PropTypes.object.isRequired,
    extraVideoOpen        : PropTypes.bool.isRequired,
    webcamDevices         : PropTypes.object,
    handleCloseExtraVideo : PropTypes.func.isRequired,
    classes               : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    webcamDevices  : state.me.webcamDevices,
    extraVideoOpen : state.room.extraVideoOpen,
});

const mapDispatchToProps = {
    handleCloseExtraVideo : roomActions.setExtraVideoOpen,
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.me.webcamDevices === next.me.webcamDevices &&
                prev.room.extraVideoOpen === next.room.extraVideoOpen
            );
        },
    })(withStyles(styles)(ExtraVideo))
);
