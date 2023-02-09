import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { makePermissionSelector } from "../../../store/selectors";
import { permissions } from "../../../permissions";
import PropTypes from "prop-types";
import { useIntl, FormattedMessage } from "react-intl";

import { Button } from "@material-ui/core";
import BreakRoomsList from "./BreakRoomsList";
import { withRoomContext } from "../../../RoomContext";

const styles = (theme) => ({
    root : {
        marginTop      : theme.spacing(2),
        display        : "flex",
        justifyContent : "flex-start",
        flexDirection  : "column",
        gap            : theme.spacing(1),
    },
});

function BreakRooms(props) {
    const { classes, roomClient, isModerator, groupMode, myBreakoutRoomId } =
        props;

    const intl = useIntl();
    return (
        <div className={classes.root}>
            {isModerator && !groupMode && (
                <Button
                    fullWidth
                    aria-label={intl.formatMessage({
                        id             : "breakoutRoom.addBreakoutRooms",
                        defaultMessage : "Add Breakout Rooms",
                    })}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        roomClient.getBreakoutRoomsManager().addBreakoutRooms();
                    }}
                >
                    <FormattedMessage
                        id="breakoutRoom.addBreakoutRooms"
                        defaultMessage="Add Breakout Rooms"
                    />
                </Button>
            )}
            {groupMode ? (
                <Button
                    fullWidth
                    aria-label={intl.formatMessage({
                        id             : "breakoutRoom.leaveBreakoutRoom",
                        defaultMessage : "Leave Breakout Room",
                    })}
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                        roomClient
                            .getBreakoutRoomsManager()
                            .leaveBreakoutRoom(myBreakoutRoomId);
                    }}
                >
                    <FormattedMessage
                        id="breakoutRoom.leaveBreakoutRoom"
                        defaultMessage="Leave Breakout Room"
                    />
                </Button>
            ) : (
                <BreakRoomsList />
            )}
        </div>
    );
}

const makeMapStateToProps = () => {
    const hasPermission = makePermissionSelector(permissions.MODERATE_ROOM);

    const mapStateToProps = (state) => {
        return {
            isModerator      : hasPermission(state),
            groupMode        : state.room.groupMode,
            myBreakoutRoomId : state.room.myBreakoutRoomId,
        };
    };

    return mapStateToProps;
};

export default withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.myBreakoutRoomId === next.room.myBreakoutRoomId &&
                prev.room.groupMode === next.room.groupMode
            );
        },
    })(withStyles(styles)(BreakRooms))
);
