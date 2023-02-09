import React from "react";
import { connect } from "react-redux";
import * as appPropTypes from "../../appPropTypes";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../../RoomContext";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";

import { ChevronDownIcon } from "../../../assets/icons";
import { Select } from "../../../core/components";
import styles from "./styles.web";

const VideoSettings = ({ roomClient, me, settings, classes }) => {
    const intl = useIntl();

    const resolutions = [
        {
            value : "low",
            label : intl.formatMessage({
                id             : "label.low",
                defaultMessage : "Low",
            }),
        },
        {
            value : "medium",
            label : intl.formatMessage({
                id             : "label.medium",
                defaultMessage : "Medium",
            }),
        },
        {
            value : "high",
            label : intl.formatMessage({
                id             : "label.high",
                defaultMessage : "High (HD)",
            }),
        }
        // {
        //     value : "veryhigh",
        //     label : intl.formatMessage({
        //         id             : "label.veryHigh",
        //         defaultMessage : "Very high (FHD)",
        //     }),
        // },
        // {
        //     value : "ultra",
        //     label : intl.formatMessage({
        //         id             : "label.ultra",
        //         defaultMessage : "Ultra (UHD)",
        //     }),
        // },
    ];

    let webcams;

    if (me.webcamDevices) {
        webcams = Object.values(me.webcamDevices);
    } else {
        webcams = [];
    }

    return (
        <React.Fragment>
            <form className={classes.setting} autoComplete="off">
                {/* ============ SECTION 1 ============ */}
                <div className={classes.padding}>
                    <FormControl
                        variant="outlined"
                        size="small"
                        className={classes.formControl}
                    >
                        <Typography
                            className={classes.subTitle}
                            component="p"
                            variant="subtitle2"
                            gutterBottom
                        >
                            {webcams.length > 0
                                ? intl.formatMessage({
                                    id             : "settings.selectCamera",
                                    defaultMessage : "Select video device",
                                })
                                : intl.formatMessage({
                                    id             : "settings.cantSelectCamera",
                                    defaultMessage :
                                          "Unable to select video device",
                                })}
                        </Typography>
                        <Select
                            value={settings.selectedWebcam || ""}
                            onChange={(event) => {
                                if (event.target.value) {
                                    roomClient.updateWebcam({
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
                            autoWidth
                            className={classes.selectEmpty}
                            disabled={
                                webcams.length === 0 || me.webcamInProgress
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
                </div>

                {/* ============ SECTION 2 ============ */}
                <div className={classes.padding}>
                    <Typography
                        className={classes.subTitle}
                        component="p"
                        variant="subtitle2"
                        gutterBottom
                    >
                        {intl.formatMessage({
                            id             : "settings.showAdvancedVideo",
                            defaultMessage : "Advanced Video Settings",
                        })}
                    </Typography>

                    {/* ============ VIDEO RESOLUTION ============ */}
                    <div className={classes.formBlock}>
                        <Typography
                            gutterBottom
                            color="textPrimary"
                            variant="caption"
                        >
                            {intl.formatMessage({
                                id             : "settings.resolution",
                                defaultMessage : "Select your video resolution",
                            })}
                        </Typography>
                        <FormControl
                            variant="outlined"
                            size="small"
                            className={classes.formControl}
                        >
                            <Select
                                value={settings.resolution || ""}
                                onChange={(event) => {
                                    if (event.target.value) {
                                        roomClient.updateWebcam({
                                            newResolution : event.target.value,
                                        });
                                    }
                                }}
                                name="Video resolution"
                                autoWidth
                                className={classes.selectEmpty}
                            >
                                {resolutions.map((resolution, index) => {
                                    return (
                                        <MenuItem
                                            key={index}
                                            value={resolution.value}
                                        >
                                            {resolution.label}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    {/* ============ WEBCAM FREAMERATE ============ */}
                    <div className={classes.formBlock}>
                        <Typography
                            gutterBottom
                            color="textPrimary"
                            variant="caption"
                        >
                            {intl.formatMessage({
                                id             : "settings.webcamFrameRate",
                                defaultMessage : "Select your webcam frame rate",
                            })}
                        </Typography>
                        <FormControl
                            variant="outlined"
                            size="small"
                            className={classes.formControl}
                        >
                            <Select
                                value={settings.frameRate}
                                onChange={(event) => {
                                    if (event.target.value) {
                                        roomClient.updateWebcam({
                                            restart      : true,
                                            newFrameRate : event.target.value,
                                        });
                                    }
                                }}
                                name="Frame rate"
                                autoWidth
                                className={classes.selectEmpty}
                            >
                                {[1, 5, 10, 15, 20, 25, 30, 60].map(
                                    (frameRate) => {
                                        return (
                                            <MenuItem
                                                key={frameRate}
                                                value={frameRate}
                                            >
                                                {frameRate}
                                            </MenuItem>
                                        );
                                    }
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    {/* ============ SCREEN SHARING FREAMERATE ============ */}
                    <div className={classes.formBlock}>
                        <Typography
                            gutterBottom
                            color="textPrimary"
                            variant="caption"
                        >
                            {intl.formatMessage({
                                id             : "settings.screenSharingFrameRate",
                                defaultMessage :
                                    "Select your screen sharing frame rate",
                            })}
                        </Typography>
                        <FormControl
                            variant="outlined"
                            size="small"
                            className={classes.formControl}
                        >
                            <Select
                                value={settings.screenSharingFrameRate || ""}
                                onChange={(event) => {
                                    if (event.target.value) {
                                        roomClient.updateScreenSharing({
                                            newFrameRate : event.target.value,
                                        });
                                    }
                                }}
                                name="Frame rate"
                                autoWidth
                                className={classes.selectEmpty}
                            >
                                {[1, 5, 10, 15, 20, 25, 30].map(
                                    (screenSharingFrameRate) => {
                                        return (
                                            <MenuItem
                                                key={screenSharingFrameRate}
                                                value={screenSharingFrameRate}
                                            >
                                                {screenSharingFrameRate}
                                            </MenuItem>
                                        );
                                    }
                                )}
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </form>
        </React.Fragment>
    );
};

VideoSettings.propTypes = {
    roomClient : PropTypes.any.isRequired,
    me         : appPropTypes.Me.isRequired,
    settings   : PropTypes.object.isRequired,
    classes    : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        me       : state.me,
        settings : state.settings,
    };
};

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return prev.me === next.me && prev.settings === next.settings;
        },
    })(withStyles(styles)(VideoSettings))
);
