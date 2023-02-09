import React, { useEffect, Suspense } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../RoomContext";
import PropTypes from "prop-types";
import LoadingView from "./LoadingView";
import EndSession from "./EndSession";
import { ReactLazyPreload } from "./ReactLazyPreload";
import * as settingsActions from "../store/actions/settingsActions";
import { getLinkData } from "../utils";

const styles = (theme) => ({
    root : {},
});

const Room = ReactLazyPreload(() =>
    import(/* webpackChunkName: "room" */ "./Room")
);

const App = (props) => {
    const { roomClient, room, mediaPerms } = props;

    const _askForPerms = () => {
        if (mediaPerms.video || mediaPerms.audio) {
            navigator.mediaDevices.getUserMedia(mediaPerms);
        }
    };

    const verifyUser = () => {
        try {
            const { roomId, roomKey, tk } = getLinkData(window.location.search);

            _askForPerms();

            roomClient.verify({
                roomId,
                roomKey,
                tk,
            });
        } catch (error) {
            window.alert(`Something went wrong with ${window.location.href}`);
        }
    };

    useEffect(() => {
        Room.preload();
    }, [room.joined]);

    useEffect(() => {
        if (room.joined) {
            return;
        }
        verifyUser();
    }, []);

    switch (room.state) {
    case "closed":
        return <EndSession />;
    case "new":
    case "connecting":
        return <LoadingView />;
    default:
        return (
            <Suspense>
                <Room />
            </Suspense>
        );
    }

    // if (room.state === "closed") {
    //     return <EndSession />;
    // } else if (!room.joined) {
    //     return <LoadingView />;
    // }
    // return (
    //     <Suspense fallback={<LoadingView />}>
    //         <Room />
    //     </Suspense>
    // );
};

App.propTypes = {
    roomClient            : PropTypes.any.isRequired,
    room                  : PropTypes.object.isRequired,
    displayName           : PropTypes.string.isRequired,
    displayNameInProgress : PropTypes.bool.isRequired,
    loginEnabled          : PropTypes.bool.isRequired,
    loggedIn              : PropTypes.bool.isRequired,
    myPicture             : PropTypes.string,
    changeDisplayName     : PropTypes.func.isRequired,
    setMediaPerms         : PropTypes.func.isRequired,
    classes               : PropTypes.object.isRequired,
    mediaPerms            : PropTypes.object.isRequired,
    setAudioMuted         : PropTypes.bool.isRequired,
    setVideoMuted         : PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
    room       : state.room,
    mediaPerms : state.settings.mediaPerms,
});

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
    };
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.state === next.room.state &&
                prev.room.joined === next.room.joined &&
                prev.room.inLobby === next.room.inLobby &&
                prev.room.signInRequired === next.room.signInRequired &&
                prev.room.overRoomLimit === next.room.overRoomLimit &&
                prev.settings.displayName === next.settings.displayName &&
                prev.settings === next.settings &&
                prev.me.displayNameInProgress ===
                    next.me.displayNameInProgress &&
                prev.me.loginEnabled === next.me.loginEnabled &&
                prev.me.loggedIn === next.me.loggedIn &&
                prev.me.picture === next.me.picture
            );
        },
    })(withStyles(styles)(App))
);
