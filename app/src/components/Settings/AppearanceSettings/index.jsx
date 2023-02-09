import React from "react";
import { connect } from "react-redux";
import * as appPropTypes from "../../appPropTypes";
import { withStyles } from "@material-ui/core/styles";
import * as roomActions from "../../../store/actions/roomActions";
import * as settingsActions from "../../../store/actions/settingsActions";
import classnames from "classnames";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withRoomContext } from "../../../RoomContext";
import Typography from "@material-ui/core/Typography";

import { IOSSwitch, Select } from "../../../core/components";
import styles from "./styles.web";

const AppearanceSettings = (props) => {
    const {
        roomClient,
        isMobile,
        room,
        locale,
        settings,
        onTogglePermanentTopBar,
        onToggleHiddenControls,
        onToggleButtonControlBar,
        onToggleShowNotifications,
        onToggleDrawerOverlayed,
        onToggleMirrorOwnVideo,
        onToggleHideNoVideoParticipants,
        handleChangeMode,
        handleChangeAspectRatio,
        classes,
        localesList,
    } = props;

    const intl = useIntl();

    const modes = [
        {
            value : "democratic",
            label : intl.formatMessage({
                id             : "label.democratic",
                defaultMessage : "Democratic view",
            }),
        },
        {
            value : "filmstrip",
            label : intl.formatMessage({
                id             : "label.filmstrip",
                defaultMessage : "Filmstrip view",
            }),
        },
    ];

    const aspectRatios = window.config.aspectRatios || [
        {
            value : 1.333,
            label : "4 : 3",
        },
        {
            value : 1.777,
            label : "16 : 9",
        },
    ];

    return (
        <React.Fragment>
            <div className={classes.padding}>
                <div className={classes.formBlock}>
                    <Typography
                        gutterBottom
                        className={classes.subTitle}
                        variant="subtitle2"
                        component="p"
                    >
                        {intl.formatMessage({
                            id             : "settings.language",
                            defaultMessage : "Select language",
                        })}
                    </Typography>
                    <FormControl
                        variant="outlined"
                        size="small"
                        className={classes.formControl}
                    >
                        <Select
                            value={locale || ""}
                            onChange={(event) => {
                                if (event.target.value) {
                                    roomClient.setLocale(event.target.value);
                                }
                            }}
                            name={intl.formatMessage({
                                id             : "settings.language",
                                defaultMessage : "Language",
                            })}
                            autoWidth
                            className={classes.selectEmpty}
                        >
                            {localesList.map((item, index) => {
                                return (
                                    <MenuItem
                                        key={index}
                                        value={item.locale[0]}
                                    >
                                        {item.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>

                <div className={classes.formBlock}>
                    <Typography
                        gutterBottom
                        className={classes.subTitle}
                        variant="subtitle2"
                        component="p"
                    >
                        {intl.formatMessage({
                            id             : "settings.selectRoomLayout",
                            defaultMessage : "Select room layout",
                        })}
                    </Typography>
                    <FormControl
                        variant="outlined"
                        size="small"
                        className={classes.formControl}
                    >
                        <Select
                            value={room.mode || ""}
                            onChange={(event) => {
                                if (event.target.value) {
                                    handleChangeMode(event.target.value);
                                }
                            }}
                            name={intl.formatMessage({
                                id             : "settings.layout",
                                defaultMessage : "Room layout",
                            })}
                            autoWidth
                            className={classes.selectEmpty}
                        >
                            {modes.map((mode, index) => {
                                return (
                                    <MenuItem key={index} value={mode.value}>
                                        {mode.label}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>
                <div className={classes.formBlock}>
                    <Typography
                        gutterBottom
                        className={classes.subTitle}
                        variant="subtitle2"
                        component="p"
                    >
                        {intl.formatMessage({
                            id             : "settings.selectAspectRatio",
                            defaultMessage : "Select room layout",
                        })}
                    </Typography>
                    <FormControl
                        variant="outlined"
                        size="small"
                        className={classes.formControl}
                    >
                        <Select
                            value={settings.aspectRatio || ""}
                            onChange={(event) => {
                                if (event.target.value) {
                                    handleChangeAspectRatio(event.target.value);
                                }
                            }}
                            name={intl.formatMessage({
                                id             : "settings.aspectRatio",
                                defaultMessage : "Select video aspect ratio",
                            })}
                            autoWidth
                            className={classes.selectEmpty}
                        >
                            {aspectRatios.map((aspectRatio, index) => {
                                return (
                                    <MenuItem
                                        key={index}
                                        value={aspectRatio.value}
                                    >
                                        {aspectRatio.label}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>
            </div>
            <div className={classes.blockSwitch}>
                <FormControlLabel
                    className={classnames(classes.setting, classes.switchLabel)}
                    control={
                        <IOSSwitch
                            checked={settings.mirrorOwnVideo}
                            onChange={onToggleMirrorOwnVideo}
                            value="mirrorOwnVideo"
                            color="primary"
                        />
                    }
                    labelPlacement="start"
                    label={intl.formatMessage({
                        id             : "settings.mirrorOwnVideo",
                        defaultMessage : "Mirror view of own video",
                    })}
                />
                <FormControlLabel
                    className={classnames(classes.setting, classes.switchLabel)}
                    control={
                        <IOSSwitch
                            color="primary"
                            checked={settings.hideNoVideoParticipants}
                            onChange={() => {
                                roomClient.setHideNoVideoParticipants(
                                    !settings.hideNoVideoParticipants
                                );
                                onToggleHideNoVideoParticipants();
                            }}
                            value="hideNoVideoParticipants"
                        />
                    }
                    labelPlacement="start"
                    label={intl.formatMessage({
                        id             : "settings.hideNoVideoParticipants",
                        defaultMessage : "Hide participants with no video",
                    })}
                />
                <FormControlLabel
                    className={classnames(classes.setting, classes.switchLabel)}
                    control={
                        <IOSSwitch
                            checked={settings.permanentTopBar}
                            onChange={onTogglePermanentTopBar}
                            value="permanentBottomBar"
                            color="primary"
                        />
                    }
                    labelPlacement="start"
                    label={intl.formatMessage({
                        id             : "settings.permanentBottomBar",
                        defaultMessage : "Permanent bottom controls",
                    })}
                />
                {/* <FormControlLabel
                    className={classnames(classes.setting, classes.switchLabel)}
                    control={
                        <IOSSwitch
                            checked={settings.hiddenControls}
                            onChange={onToggleHiddenControls}
                            value="hiddenControls"
                            color="primary"
                        />
                    }
                    labelPlacement="start"
                    label={intl.formatMessage({
                        id: "settings.hiddenControls",
                        defaultMessage: "Hidden media controls",
                    })}
                />
                <FormControlLabel
                    className={classnames(classes.setting, classes.switchLabel)}
                    control={
                        <IOSSwitch
                            checked={settings.buttonControlBar}
                            onChange={onToggleButtonControlBar}
                            value="buttonControlBar"
                            color="primary"
                        />
                    }
                    labelPlacement="start"
                    label={intl.formatMessage({
                        id: "settings.buttonControlBar",
                        defaultMessage: "Separate media controls",
                    })}
                /> */}
                {!isMobile && (
                    <FormControlLabel
                        className={classnames(
                            classes.setting,
                            classes.switchLabel
                        )}
                        control={
                            <IOSSwitch
                                checked={settings.drawerOverlayed}
                                onChange={onToggleDrawerOverlayed}
                                value="drawerOverlayed"
                                color="primary"
                            />
                        }
                        labelPlacement="start"
                        label={intl.formatMessage({
                            id             : "settings.drawerOverlayed",
                            defaultMessage : "Side drawer over content",
                        })}
                    />
                )}
                <FormControlLabel
                    className={classnames(classes.setting, classes.switchLabel)}
                    control={
                        <IOSSwitch
                            checked={settings.showNotifications}
                            onChange={onToggleShowNotifications}
                            value="showNotifications"
                            color="primary"
                        />
                    }
                    labelPlacement="start"
                    label={intl.formatMessage({
                        id             : "settings.showNotifications",
                        defaultMessage : "Show notifications",
                    })}
                />
            </div>
        </React.Fragment>
    );
};

AppearanceSettings.propTypes = {
    roomClient                      : PropTypes.any.isRequired,
    isMobile                        : PropTypes.bool.isRequired,
    room                            : appPropTypes.Room.isRequired,
    settings                        : PropTypes.object.isRequired,
    onTogglePermanentTopBar         : PropTypes.func.isRequired,
    onToggleHiddenControls          : PropTypes.func.isRequired,
    onToggleButtonControlBar        : PropTypes.func.isRequired,
    onToggleShowNotifications       : PropTypes.func.isRequired,
    onToggleDrawerOverlayed         : PropTypes.func.isRequired,
    onToggleHideNoVideoParticipants : PropTypes.func.isRequired,
    onToggleMirrorOwnVideo          : PropTypes.func.isRequired,
    handleChangeMode                : PropTypes.func.isRequired,
    handleChangeAspectRatio         : PropTypes.func.isRequired,
    classes                         : PropTypes.object.isRequired,
    intl                            : PropTypes.object.isRequired,
    locale                          : PropTypes.object.isRequired,
    localesList                     : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    isMobile    : state.me.browser.platform === "mobile",
    room        : state.room,
    settings    : state.settings,
    locale      : state.intl.locale,
    localesList : state.intl.list,
});

const mapDispatchToProps = {
    onTogglePermanentTopBar         : settingsActions.togglePermanentTopBar,
    onToggleHiddenControls          : settingsActions.toggleHiddenControls,
    onToggleShowNotifications       : settingsActions.toggleShowNotifications,
    onToggleButtonControlBar        : settingsActions.toggleButtonControlBar,
    onToggleDrawerOverlayed         : settingsActions.toggleDrawerOverlayed,
    onToggleMirrorOwnVideo          : settingsActions.toggleMirrorOwnVideo,
    onToggleHideNoVideoParticipants :
        settingsActions.toggleHideNoVideoParticipants,
    handleChangeMode        : roomActions.setDisplayMode,
    handleChangeAspectRatio : settingsActions.setAspectRatio,
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.me.browser === next.me.browser &&
                prev.room === next.room &&
                prev.settings === next.settings &&
                prev.intl.locale === next.intl.locale &&
                prev.intl.localesList === next.intl.localesList
            );
        },
    })(withStyles(styles)(AppearanceSettings))
);
