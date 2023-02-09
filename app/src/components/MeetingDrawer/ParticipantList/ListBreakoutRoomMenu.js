import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { withRoomContext } from "../../../RoomContext";
import { FormattedMessage } from "react-intl";
import { MenuItem, Paper, Typography } from "@material-ui/core";

const styles = (theme) => ({
    root : {},
});

const ListBreakoutRoomMenu = (props) => {
    const { roomClient, classes } = props;

    return (
        <Paper elevation={0}>
            <MenuItem
                onClick={() => {
                    roomClient.getBreakoutRoomsManager().addBreakoutRooms();
                }}
            >
                <Typography component="p" variant="subtitle2">
                    <FormattedMessage
                        id="room.createBreakoutRoom"
                        defaultMessage="Create Breakout Room"
                    />
                </Typography>
            </MenuItem>
        </Paper>
    );
};

ListBreakoutRoomMenu.propTypes = {
    roomClient : PropTypes.any.isRequired,
    classes    : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    room : state.room,
});

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return prev.room === next.room;
        },
    })(withStyles(styles)(ListBreakoutRoomMenu))
);
