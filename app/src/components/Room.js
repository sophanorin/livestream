import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as appPropTypes from "./appPropTypes";
import { withStyles } from "@material-ui/core/styles";
import * as roomActions from "../store/actions/roomActions";
import * as toolareaActions from "../store/actions/toolareaActions";
import { idle } from "../utils";
import FullScreen from "./FullScreen";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Notifications from "./Notifications/Notifications";
import MeetingDrawer from "./MeetingDrawer/MeetingDrawer";
import Democratic from "./MeetingViews/Democratic";
import Filmstrip from "./MeetingViews/Filmstrip";
import AudioPeers from "./PeerAudio/AudioPeers";
import FullScreenView from "./VideoContainers/FullScreenView";
import VideoWindow from "./VideoWindow/VideoWindow";
import LockDialog from "./AccessControl/LockDialog/LockDialog";
import Settings from "./Settings/Settings";
import WakeLock from "react-wakelock-react16";
import ExtraVideo from "./Controls/ExtraVideo";
import ButtonControlBar from "./Controls/ButtonControlBar";
import Help from "./Controls/Help";
import About from "./Controls/About";
import RolesManager from "./Controls/RolesManager";
import SharedVideoDialog from "./ShareVideo/SharedVideoDialog";
import ChooseMediaDialog from "./ChooseMediaDialog";
import BreakoutRoomRemoveConfirmationDialog from "./MeetingDrawer/BreakRooms/BreakoutRoomRemoveConfirmationDialog";
import LobbyDialog from "./LobbyDialog";
import palette from "../theme/palette";
import QuizDashboardDialog from "./Quiz/QuizDashboardDialog";
import QuizResultDialog from "./Quiz/QuizResultDialog";
import CreateQuizDialog from "./Quiz/CreateQuizDialog";
import QuizLiveResultDashboardDialog from "./Quiz/QuizLiveResultDashboardDialog";
import QuizDialog from "./Quiz/QuizDialog";
import Record from "./Record/Record";
import {
    RECORDING_PAUSE,
    RECORDING_RESUME,
    RECORDING_START,
} from "../store/actions/recorderActions";
import ModeratorLeaveDialog from "./Controls/ModeratorLeaveDialog";
import DocksList from "./Dock/DocksList";
import { CssBaseline } from "@material-ui/core";

const TIMEOUT = window.config.hideTimeout || 5000;

const styles = (theme) => ({
    root : {
        display              : "flex",
        width                : "100%",
        height               : "100%",
        backgroundAttachment : "fixed",
        backgroundPosition   : "center",
        backgroundColor      : palette.basic.dark,
        backgroundSize       : "cover",
        backgroundRepeat     : "no-repeat",
        position             : "relative",
    },
    drawer : {
        width                          : "20vw",
        flexShrink                     : 0,
        [theme.breakpoints.down("lg")] : {
            width : "25vw",
        },
        [theme.breakpoints.down("md")] : {
            width : "35vw",
        },
        [theme.breakpoints.down("sm")] : {
            width : "40vw",
        },
        [theme.breakpoints.down("xs")] : {
            width : "90vw",
        },
    },
    drawerPaper : {
        zIndex                         : 998,
        width                          : "20vw",
        [theme.breakpoints.down("lg")] : {
            width : "25vw",
        },
        [theme.breakpoints.down("md")] : {
            width : "35vw",
        },
        [theme.breakpoints.down("sm")] : {
            width : "40vw",
        },
        [theme.breakpoints.down("xs")] : {
            width : "90vw",
        },
    },
});

class Room extends React.PureComponent {
    constructor(props) {
        super(props);

        this.fullscreen = new FullScreen(document);

        this.state = {
            fullscreen : false,
        };
    }

    waitForHide = idle(() => {
        this.props.setToolbarsVisible(false);
    }, TIMEOUT);

    handleMovement = () => {
        // If the toolbars were hidden, show them again when
        // the user moves their cursor.
        if (!this.props.room.toolbarsVisible) {
            this.props.setToolbarsVisible(true);
        }

        this.waitForHide();
    };

    componentDidMount() {
        if (this.fullscreen.fullscreenEnabled) {
            this.fullscreen.addEventListener(
                "fullscreenchange",
                this.handleFullscreenChange
            );
        }

        window.addEventListener("mousemove", this.handleMovement);
        window.addEventListener("touchstart", this.handleMovement);
    }

    componentWillUnmount() {
        if (this.fullscreen.fullscreenEnabled) {
            this.fullscreen.removeEventListener(
                "fullscreenchange",
                this.handleFullscreenChange
            );
        }

        window.removeEventListener("mousemove", this.handleMovement);
        window.removeEventListener("touchstart", this.handleMovement);
    }

    handleToggleFullscreen = () => {
        if (this.fullscreen.fullscreenElement) {
            this.fullscreen.exitFullscreen();
        } else {
            this.fullscreen.requestFullscreen(document.documentElement);
        }
    };

    handleFullscreenChange = () => {
        this.setState({
            fullscreen : this.fullscreen.fullscreenElement !== null,
        });
    };

    render() {
        const {
            youtube,
            room,
            browser,
            advancedMode,
            showNotifications,
            buttonControlBar,
            drawerOverlayed,
            toolAreaOpen,
            toggleToolArea,
            classes,
            theme,
            quizzes,
            recordingState,
        } = this.props;

        const View = {
            filmstrip  : Filmstrip,
            democratic : Democratic,
        }[room.mode];

        const container =
            window !== undefined ? window.document.body : undefined;

        return (
            <div className={classes.root}>
                {(recordingState === RECORDING_START ||
                    recordingState === RECORDING_RESUME) && <Record />}

                <FullScreenView advancedMode={advancedMode} />

                <VideoWindow advancedMode={advancedMode} />

                <AudioPeers />

                {showNotifications && <Notifications />}

                <CssBaseline />

                <View advancedMode={advancedMode} />

                {browser.platform === "mobile" || drawerOverlayed ? (
                    <nav>
                        <Hidden implementation="css">
                            <SwipeableDrawer
                                container={container}
                                variant="temporary"
                                anchor={
                                    theme.direction === "ltr" ? "right" : "left"
                                }
                                open={toolAreaOpen}
                                onClose={() => toggleToolArea()}
                                onOpen={() => toggleToolArea()}
                                classes={{
                                    paper : classes.drawerPaper,
                                }}
                                ModalProps={{
                                    keepMounted : true, // Better open performance on mobile.
                                }}
                            >
                                <MeetingDrawer closeDrawer={toggleToolArea} />
                            </SwipeableDrawer>
                        </Hidden>
                    </nav>
                ) : (
                    <nav className={toolAreaOpen ? classes.drawer : null}>
                        <Hidden implementation="css">
                            <Drawer
                                variant="persistent"
                                anchor={
                                    theme.direction === "ltr" ? "right" : "left"
                                }
                                open={toolAreaOpen}
                                onClose={() => toggleToolArea()}
                                classes={{
                                    paper : classes.drawerPaper,
                                }}
                            >
                                <MeetingDrawer closeDrawer={toggleToolArea} />
                            </Drawer>
                        </Hidden>
                    </nav>
                )}

                {browser.platform === "mobile" && browser.os !== "ios" && (
                    <WakeLock />
                )}

                {room.devicePermissionOpen && <ChooseMediaDialog />}

                {room.inLobby && <LobbyDialog />}

                {buttonControlBar && (
                    <ButtonControlBar
                        fullscreenEnabled={this.fullscreen.fullscreenEnabled}
                        fullscreen={this.state.fullscreen}
                        onFullscreen={this.handleToggleFullscreen}
                    />
                )}

                {room.moderatorLeaveDialogOpen && <ModeratorLeaveDialog />}

                {room.lockDialogOpen && <LockDialog />}

                {room.settingsOpen && <Settings />}

                {youtube.shareVideoInputDialogOpen && <SharedVideoDialog />}

                {room.extraVideoOpen && <ExtraVideo />}

                {room.helpOpen && <Help />}

                {room.aboutOpen && <About />}

                {room.rolesManagerOpen && <RolesManager />}

                {room.removeBreakoutRoomDialogMessageOpen && (
                    <BreakoutRoomRemoveConfirmationDialog />
                )}

                {quizzes.quizLiveResultDashboardDialogOpen && (
                    <QuizLiveResultDashboardDialog />
                )}

                {quizzes.quizDashboardDialogOpen && <QuizDashboardDialog />}

                {quizzes.quizResultDialogOpen && <QuizResultDialog />}

                {quizzes.createQuizDialogOpen && <CreateQuizDialog />}

                {quizzes.quizDialogOpen && <QuizDialog />}
            </div>
        );
    }
}

Room.propTypes = {
    youtube            : PropTypes.object.isRequired,
    room               : appPropTypes.Room.isRequired,
    browser            : PropTypes.object.isRequired,
    advancedMode       : PropTypes.bool.isRequired,
    showNotifications  : PropTypes.bool.isRequired,
    buttonControlBar   : PropTypes.bool.isRequired,
    drawerOverlayed    : PropTypes.bool.isRequired,
    toolAreaOpen       : PropTypes.bool.isRequired,
    setToolbarsVisible : PropTypes.func.isRequired,
    toggleToolArea     : PropTypes.func.isRequired,
    classes            : PropTypes.object.isRequired,
    theme              : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    youtube           : state.youtube,
    room              : state.room,
    browser           : state.me.browser,
    quizzes           : state.quizzes,
    advancedMode      : state.settings.advancedMode,
    showNotifications : state.settings.showNotifications,
    buttonControlBar  : state.settings.buttonControlBar,
    drawerOverlayed   : state.settings.drawerOverlayed,
    toolAreaOpen      : state.toolarea.toolAreaOpen,
    recordingState    : state.room.recordingState,
});

const mapDispatchToProps = (dispatch) => ({
    setToolbarsVisible : (visible) => {
        dispatch(roomActions.setToolbarsVisible(visible));
    },
    toggleToolArea : () => {
        dispatch(toolareaActions.toggleToolArea());
    },
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    areStatesEqual : (next, prev) => {
        return (
            prev.youtube === next.youtube &&
            prev.room === next.room &&
            prev.me.browser === next.me.browser &&
            prev.room.recordingState === next.room.recordingState &&
            prev.settings.advancedMode === next.settings.advancedMode &&
            prev.settings.mediaPerms === next.settings.mediaPerms &&
            prev.settings.showNotifications ===
                next.settings.showNotifications &&
            prev.settings.buttonControlBar === next.settings.buttonControlBar &&
            prev.settings.drawerOverlayed === next.settings.drawerOverlayed &&
            prev.toolarea.toolAreaOpen === next.toolarea.toolAreaOpen &&
            prev.quizzes.quizDashboardDialogOpen ===
                next.quizzes.quizDashboardDialogOpen &&
            prev.quizzes.createQuizDialogOpen ===
                next.quizzes.createQuizDialogOpen &&
            prev.quizzes.quizResultDialogOpen ===
                next.quizzes.quizResultDialogOpen &&
            prev.quizzes.selectedQuiz === next.quizzes.selectedQuiz &&
            prev.quizzes.quizLiveResultDashboardDialogOpen ===
                next.quizzes.quizLiveResultDashboardDialogOpen
        );
    },
})(withStyles(styles, { withTheme: true })(React.memo(Room)));
