import React from "react";
import { connect } from "react-redux";
import {
    participantListSelector,
    makePermissionSelector,
    moderatorListSelector,
    getBreakoutRoomLengthSelector,
} from "../../../store/selectors";
import { permissions } from "../../../permissions";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { Flipper, Flipped } from "react-flip-toolkit";
import { FormattedMessage } from "react-intl";
import ListPeer from "./ListPeer";
import ListMe from "./ListMe";
import ListModeratorMenu from "./ListModeratorMenu";
import ListBreakoutRoomMenu from "./ListBreakoutRoomMenu";
import {
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Popover,
    Typography,
    Button,
} from "@material-ui/core";
import Volume from "../../Containers/Volume";
import BreakRooms from "../BreakRooms/BreakRooms";
import { AddRoomIcon, SecurityIcon } from "../../../assets/icons";
import palette from "../../../theme/palette";
import BreakRoomsList from "../BreakRooms/BreakRoomsList";
import { withRoomContext } from "../../../RoomContext";

const styles = (theme) => ({
    root : {
        width     : "100%",
        overflowY : "auto",
        padding   : theme.spacing(0, 1),
        position  : 'relative'
    },
    list : {
        listStyleType : "none",
        padding       : theme.spacing(1),
        margin        : 0,
        // backgroundColor: "lightblue",
    },
    listHeader : {
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "space-between",
        alignItems     : "center",
    },
    listPeerHeader : {
        padding         : theme.spacing(2),
        borderRadius    : "var(--peer-border-radius-md)",
        backgroundColor : palette.secondary.hover,
        marginBottom    : theme.spacing(1),
    },
    headerTitle : {
        fontWeight : "700",
        userSelect : "none",
    },
    listItem : {
        width     : "100%",
        overflow  : "hidden",
        cursor    : "pointer",
        marginTop : theme.spacing(1),
    },
    divider : {
        margin          : theme.spacing(1, 0),
        backgroundColor : palette.secondary.main,
    },
});
//getSnapshotBeforeUpdate refs https://blog.logrocket.com/how-is-getsnapshotbeforeupdate-implemented-with-hooks/
class ParticipantList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl    : null,
            isMenuOpen  : false,
            currentMenu : null,
        };
    }

    handleExitedMenu() {
        this.setState({
            currentMenu : null,
        });
    }

    handleMenuOpen(event, menu) {
        this.setState({
            anchorEl    : event.currentTarget,
            currentMenu : menu,
            isMenuOpen  : Boolean(event.currentTarget),
        });
    }

    handleMenuClose() {
        this.setState({
            anchorEl   : null,
            isMenuOpen : false,
        });
    }

    componentDidMount() {
        this.node.scrollTop = this.node.scrollHeight;
    }

    getSnapshotBeforeUpdate() {
        return (
            this.node.scrollTop + this.node.offsetHeight ===
            this.node.scrollHeight
        );
    }

    componentDidUpdate(prevProps, prevState, shouldScroll) {
        if (shouldScroll) {
            this.node.scrollTop = this.node.scrollHeight;
        }
    }

    render() {
        const {
            roomClient,
            advancedMode,
            isModerator,
            participants,
            spotlights,
            selectedPeers,
            groupMode,
            classes,
            hasAccessBreakoutRoomsPermission,
            moderators,
            breakoutRoomLength,
        } = this.props;

        return (
            <>
                <div
                    className={classes.root}
                    ref={(node) => {
                        this.node = node;
                    }}
                >
                    <ul className={classes.list}>
                        <li
                            className={classnames(
                                classes.listHeader,
                                classes.listPeerHeader
                            )}
                        >
                            <Typography
                                className={classes.headerTitle}
                                component="p"
                                variant="subtitle2"
                                color="primary"
                            >
                                <FormattedMessage
                                    id="label.participants"
                                    defaultMessage="Participants"
                                />
                                &nbsp; ({participants.length + 1})
                            </Typography>
                        </li>
                        <ListMe />
                        <Flipper flipKey={participants}>
                            {participants.map((peer) => (
                                <Flipped key={peer.id} flipId={peer.id}>
                                    <li
                                        key={peer.id}
                                        className={classnames(classes.listItem)}
                                    >
                                        <ListPeer
                                            id={peer.id}
                                            advancedMode={advancedMode}
                                            isModerator={isModerator}
                                            spotlight={spotlights.includes(
                                                peer.id
                                            )}
                                            isSelected={selectedPeers.includes(
                                                peer.id
                                            )}
                                        >
                                            <Volume small id={peer.id} />
                                        </ListPeer>
                                    </li>
                                </Flipped>
                            ))}
                        </Flipper>
                    </ul>
                </div>
                <Popover
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    open={this.state.isMenuOpen}
                    onClose={() => {
                        this.handleMenuClose();
                    }}
                    getContentAnchorEl={null}
                >
                    {this.state.currentMenu === "moderatorActionMenu" && (
                        <ListBreakoutRoomMenu />
                    )}
                </Popover>
            </>
        );
    }
}

ParticipantList.propTypes = {
    advancedMode  : PropTypes.bool,
    isModerator   : PropTypes.bool.isRequired,
    groupMode     : PropTypes.bool.isRequired,
    participants  : PropTypes.array.isRequired,
    spotlights    : PropTypes.array.isRequired,
    selectedPeers : PropTypes.array.isRequired,
    classes       : PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {
    const hasPermission = makePermissionSelector(permissions.MODERATE_ROOM);
    const hasAccessBreakoutRoomsPermission = makePermissionSelector(
        permissions.ACCESS_BREAKOUT_ROOMS
    );

    const mapStateToProps = (state) => {
        return {
            breakoutRoomLength               : getBreakoutRoomLengthSelector(state),
            isModerator                      : hasPermission(state),
            hasAccessBreakoutRoomsPermission :
                hasAccessBreakoutRoomsPermission(state),
            participants  : participantListSelector(state),
            moderators    : moderatorListSelector(state),
            spotlights    : state.room.spotlights,
            selectedPeers : state.room.selectedPeers,
            groupMode     : state.room.groupMode,
        };
    };

    return mapStateToProps;
};

const ParticipantListContainer = withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.spotlights === next.room.spotlights &&
                prev.room.selectedPeers === next.room.selectedPeers &&
                prev.me.roles === next.me.roles &&
                prev.peers === next.peers &&
                prev.room.groupMode === next.room.groupMode &&
                prev.room.breakoutRooms === next.room.breakoutRooms
            );
        },
    })(withStyles(styles)(ParticipantList))
);

export default ParticipantListContainer;
