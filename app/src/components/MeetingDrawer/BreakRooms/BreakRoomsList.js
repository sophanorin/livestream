import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { List } from "@material-ui/core";
import { connect } from "react-redux";
import { withRoomContext } from "../../../RoomContext";
import PropTypes from "prop-types";

import Room from "./Room";
import { getMyBreakoutRoomSelector } from "../../../store/selectors";

const styles = (theme) => ({
    root : {
        padding : theme.spacing(1),
    },
    avatar : {
        borderRadius : "50%",
        height       : "2rem",
    },
});

function BreakRoomsList(props) {
    const { classes, breakoutRooms, myBreakoutRoom, groupMode } = props;

    return (
        <div className={classes.root}>
            {!groupMode ? (
                <List className={classes.list}>
                    {breakoutRooms &&
                        Object.values(breakoutRooms).map((breakoutRoomInfo) => {
                            return (
                                <Room
                                    breakoutRoomInfo={breakoutRoomInfo}
                                    groupMode={groupMode}
                                    key={breakoutRoomInfo.id}
                                />
                            );
                        })}
                </List>
            ) : (
                <Room breakoutRoomInfo={myBreakoutRoom} groupMode={groupMode} />
            )}
        </div>
    );
}

BreakRoomsList.prototype = {
    breakoutRooms  : PropTypes.object.isRequired,
    groupMode      : PropTypes.bool.isRequired,
    myBreakoutRoom : PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {
    const getMyBreakoutRoom = getMyBreakoutRoomSelector();

    const mapStateToProps = (state) => {
        return {
            breakoutRooms  : state.room.breakoutRooms,
            myBreakoutRoom : getMyBreakoutRoom(state),
            groupMode      : state.room.groupMode,
        };
    };

    return mapStateToProps;
};

export default withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.breakoutRooms === next.room.breakoutRooms &&
                prev.room.groupMode === next.room.groupMode
            );
        },
    })(withStyles(styles)(BreakRoomsList))
);
