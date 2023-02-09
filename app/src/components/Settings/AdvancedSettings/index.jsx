import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";

import PropTypes from "prop-types";
import classnames from "classnames";
import { useIntl } from "react-intl";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";

import { withRoomContext } from "../../../RoomContext";
import * as settingsActions from "../../../store/actions/settingsActions";
import styles from "./styles.web";
import { IOSSwitch, Select } from "../../../core/components";

const AdvancedSettings = ({
    roomClient,
    settings,
    onToggleAdvancedMode,
    onToggleNotificationSounds,
    classes,
}) => {
    const intl = useIntl();

    return (
        <React.Fragment>
            <FormControlLabel
                className={classnames(classes.setting, classes.switchLabel)}
                control={
                    <IOSSwitch
                        checked={settings.advancedMode}
                        onChange={onToggleAdvancedMode}
                        value="advancedMode"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label={intl.formatMessage({
                    id             : "settings.advancedMode",
                    defaultMessage : "Advanced mode",
                })}
            />
            <FormControlLabel
                className={classnames(classes.setting, classes.switchLabel)}
                control={
                    <IOSSwitch
                        checked={settings.notificationSounds}
                        onChange={onToggleNotificationSounds}
                        value="notificationSounds"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label={intl.formatMessage({
                    id             : "settings.notificationSounds",
                    defaultMessage : "Notification sounds",
                })}
            />
            {!window.config.lockLastN && (
                <form
                    className={classnames(
                        classes.setting,
                        classes.visiblePeersControl
                    )}
                    autoComplete="off"
                >
                    <Typography
                        gutterBottom
                        variant="subtitle2"
                        component="p"
                        className={classes.subTitle}
                    >
                        {intl.formatMessage({
                            id             : "settings.lastn",
                            defaultMessage :
                                "Set number of visible peers in the room",
                        })}
                    </Typography>
                    <FormControl
                        variant="outlined"
                        size="small"
                        className={classes.formControl}
                    >
                        <Select
                            value={settings.lastN || ""}
                            onChange={(event) => {
                                if (event.target.value) {
                                    roomClient.changeMaxSpotlights(
                                        event.target.value
                                    );
                                }
                            }}
                            name="Last N"
                            autoWidth
                            className={classes.selectEmpty}
                        >
                            {Array.from(
                                { length: window.config.maxLastN || 10 },
                                (_, i) => i + 1
                            ).map((lastN) => {
                                return (
                                    <MenuItem key={lastN} value={lastN}>
                                        {lastN}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </form>
            )}
        </React.Fragment>
    );
};

AdvancedSettings.propTypes = {
    roomClient                 : PropTypes.any.isRequired,
    settings                   : PropTypes.object.isRequired,
    onToggleAdvancedMode       : PropTypes.func.isRequired,
    onToggleNotificationSounds : PropTypes.func.isRequired,
    classes                    : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    settings : state.settings,
});

const mapDispatchToProps = {
    onToggleAdvancedMode       : settingsActions.toggleAdvancedMode,
    onToggleNotificationSounds : settingsActions.toggleNotificationSounds,
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return prev.settings === next.settings;
        },
    })(withStyles(styles)(AdvancedSettings))
);
