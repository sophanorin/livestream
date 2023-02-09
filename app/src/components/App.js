import React, { useEffect, Suspense } from "react";
import { useParams } from 'react-router';
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../RoomContext";
import PropTypes from "prop-types";
import { ThreeDotsLoading } from "./Loading";
import EndSession from "./RoomInformation/EndSession";
import StartMeeting from "./StartMeeting/StartMeeting";
import { ReactLazyPreload } from "./ReactLazyPreload";
import { getLinkData } from "../utils";
import RoomExpire from "./RoomInformation/RoomExpire";
import Logger from "../Logger";

const styles = () => ({
    root : {},
});

const Room = ReactLazyPreload(() =>
    import(/* webpackChunkName: "room" */ "./Room")
);

const logger = new Logger("App");

const App = (props) => {
    const { room, roomClient } = props;

    // useEffect(() => {
    //     const { roomId, roomKey } = getLinkData(window.location.search);

    //     roomClient.check({ roomId, roomKey });
    // }, []);

    // const id = useParams().id.toLowerCase();

    useEffect(() => {
        Room.preload();
    }, [room.joined]);

    fetch("/auth/check_login_status", {
        credentials    : "include",
        method         : "GET",
        cache          : "no-cache",
        redirect       : "follow",
        referrerPolicy : "no-referrer",
    })
        .then((response) => response.json())
        .then((json) => {
            if (json.loggedIn) {
                roomClient.setLoggedIn(json.loggedIn);
            }
        })
        .catch((error) => {
            logger.error("Error checking login status", error);
        });

    switch (room.state) {
    case "new":
        return <StartMeeting />;
    case "connecting":
        return <ThreeDotsLoading />;
    case "closed":
        return <EndSession />;
    case "connected":
        return (
            <Suspense>
                <Room />
            </Suspense>
        );
    default:
        return <RoomExpire />;
    }
};

App.propTypes = {
    room    : PropTypes.object.isRequired,
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    room : state.room,
});

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.state === next.room.state &&
                prev.room.joined === next.room.joined &&
                prev.room.inLobby === next.room.inLobby &&
                prev.room.signInRequired === next.room.signInRequired &&
                prev.room.overRoomLimit === next.room.overRoomLimit
            );
        },
    })(withStyles(styles)(App))
);
