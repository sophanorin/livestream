import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { useIntl, FormattedMessage } from "react-intl";
import {
    Box,
    Grid,
    DialogContent,
    IconButton,
    DialogTitle,
    Dialog,
    Tabs,
    Tab,
    useMediaQuery,
} from "@material-ui/core";
import classnames from "classnames";

import { CloseIcon } from "../../assets/icons";
import AppearanceSettings from "./AppearanceSettings";
import AdvancedSettings from "./AdvancedSettings";
import VideoSettings from "./VideoSettings";
import AudioSettings from "./AudioSettings";
import * as roomActions from "../../store/actions/roomActions";

import styles from "./styles.web";

const tabs = ["video", "audio", "appearance", "advanced"];

const Settings = ({
    currentSettingsTab,
    settingsOpen,
    handleCloseSettings,
    setSettingsTab,
    classes,
    theme,
}) => {
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const intl = useIntl();

    return (
        <Dialog
            className={classes.root}
            open={settingsOpen}
            onClose={() => handleCloseSettings(false)}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth={false}
        >
            <Box className={classes.closeButton}>
                <IconButton onClick={() => handleCloseSettings(false)}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
                <div className={classes.dialogHeader}>
                    <FormattedMessage
                        id="settings.settings"
                        defaultMessage="Settings"
                    />
                </div>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <Grid
                    container
                    direction={smallScreen ? "column" : "row"}
                    justifyContent="flex-start"
                >
                    <Grid item md={4} xs>
                        <Tabs
                            TabIndicatorProps={{
                                style : {
                                    display : "none",
                                },
                            }}
                            className={classes.tabsHeader}
                            value={tabs.indexOf(currentSettingsTab)}
                            onChange={(event, value) =>
                                setSettingsTab(tabs[value])
                            }
                            variant={smallScreen ? "scrollable" : "standard"}
                            scrollButtons="auto"
                            textColor="primary"
                            orientation={
                                smallScreen ? "horizontal" : "vertical"
                            }
                        >
                            <Tab
                                className={classnames(classes.tab, {
                                    active : currentSettingsTab === "video",
                                })}
                                label={intl.formatMessage({
                                    id             : "settingsLabel.video",
                                    defaultMessage : "Video",
                                })}
                                classes={{
                                    wrapper : classes.tabWrapper,
                                }}
                            />
                            <Tab
                                className={classnames(classes.tab, {
                                    active : currentSettingsTab === "audio",
                                })}
                                label={intl.formatMessage({
                                    id             : "settingsLabel.audio",
                                    defaultMessage : "Audio",
                                })}
                                classes={{
                                    wrapper : classes.tabWrapper,
                                }}
                            />
                            <Tab
                                color="textPrimary"
                                className={classnames(classes.tab, {
                                    active : currentSettingsTab === "appearance",
                                })}
                                label={intl.formatMessage({
                                    id             : "settingsLabel.appearance",
                                    defaultMessage : "Appearance",
                                })}
                                classes={{
                                    wrapper : classes.tabWrapper,
                                }}
                            />
                            <Tab
                                className={classnames(classes.tab, {
                                    active : currentSettingsTab === "advanced",
                                })}
                                label={intl.formatMessage({
                                    id             : "settingsLabel.advanced",
                                    defaultMessage : "Advanced",
                                })}
                                classes={{
                                    wrapper : classes.tabWrapper,
                                }}
                            />
                        </Tabs>
                    </Grid>
                    <Grid item md={7} xs>
                        {currentSettingsTab === "video" && <VideoSettings />}
                        {currentSettingsTab === "audio" && <AudioSettings />}
                        {currentSettingsTab === "appearance" && (
                            <AppearanceSettings />
                        )}
                        {currentSettingsTab === "advanced" && (
                            <AdvancedSettings />
                        )}
                    </Grid>
                </Grid>
            </DialogContent>

            {/* <DialogActions>
        <Button onClick={() => handleCloseSettings(false)} color="primary">
          <FormattedMessage id="label.close" defaultMessage="Close" />
        </Button>
      </DialogActions> */}
        </Dialog>
    );
};

Settings.propTypes = {
    currentSettingsTab  : PropTypes.string.isRequired,
    settingsOpen        : PropTypes.bool.isRequired,
    handleCloseSettings : PropTypes.func.isRequired,
    setSettingsTab      : PropTypes.func.isRequired,
    classes             : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    currentSettingsTab : state.room.currentSettingsTab,
    settingsOpen       : state.room.settingsOpen,
});

const mapDispatchToProps = {
    handleCloseSettings : roomActions.setSettingsOpen,
    setSettingsTab      : roomActions.setSettingsTab,
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
    areStatesEqual : (next, prev) => {
        return (
            prev.room.currentSettingsTab === next.room.currentSettingsTab &&
            prev.room.settingsOpen === next.room.settingsOpen
        );
    },
})(withStyles(styles, { withTheme: true })(Settings));
