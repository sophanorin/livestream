import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
    alpha,
    Box,
    Button,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    Typography,
} from "@material-ui/core";

import { useIntl, FormattedMessage } from "react-intl";
import MoreIcon from "@material-ui/icons/MoreVert";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import EmptyAvatar from "../../../assets/images/avatar-empty.jpeg";
import classnames from "classnames";
import { withRoomContext } from "../../../RoomContext";
import * as roomActions from "../../../store/actions/roomActions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { permissions } from "../../../permissions";
import { makePermissionSelector } from "../../../store/selectors";
import palette from "../../../theme/palette";
import { DeleteIcon } from "../../../assets/icons";

const styles = (theme) => ({
    root : {
        marginBottom : theme.spacing(1),
        padding      : theme.spacing(0.5, 1),
        borderRadius : "var(--peer-border-radius-sm)",
        cursor       : "pointer",
        background   : palette.secondary.hover,
        border       : "1px solid",
        borderColor  : palette.secondary.main,
        // "&:hover": {
        //     background: "#00000025",
        // },
    },
    avatar : {
        borderRadius : "50%",
        height       : "2rem",
    },
    peerInfo : {
        fontSize    : "1rem",
        display     : "flex",
        paddingLeft : theme.spacing(1),
        flexGrow    : 1,
        alignItems  : "center",
        fontStyle   : "normal",
        fontWeight  : 600,
    },
    breakoutRoomText : {
        fontSize   : "1rem",
        fontWeight : 600,
    },
    list : {
        padding      : 0,
        marginBottom : theme.spacing(1),
    },
    peerList : {
        display        : "flex",
        cursor         : "auto",
        width          : "100%",
        justifyContent : "center",
        alignItems     : "center",
    },

    breakoutRoomButton : {
        display        : "none",
        justifyContent : "space-between",
        gap            : theme.spacing(0.5),
    },
    customPaddingButton : {
        paddingTop    : "3px",
        paddingBottom : "3px",
    },
    breakoutRoomDeleteButton : {
        color      : palette.status.red.primary,
        background : palette.status.red.secondary,
        padding    : "3px 6px",
        minWidth   : "0px",
        "&:hover"  : {
            background : alpha(palette.status.red.secondary, 0.8),
        },
    },
    hover : {
        display : "flex",
    },
    container : {
        width          : "100%",
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "space-between",
        alignItems     : "center",
    },
    breakoutRoomNameContainer : {
        display       : "flex",
        flexDirection : "row",
        alignItems    : "center",
        gap           : theme.spacing(1),
    },
    breakoutRoomName : {
        userSelect : "none",
    },
});
const Room = (props) => {
    const {
        key,
        classes,
        groupMode,
        roomClient,
        breakoutRoomInfo,
        setDialogMessageOpen,
        canRemoveBreakoutRoom,
        setRemovingBreakoutRoomInfo,
    } = props;

    const [open, setOpen] = useState(groupMode);
    const [hover, setHover] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const intl = useIntl();

    const [isClicked, setIsClicked] = useState(false);

    const isMenuOpen = Boolean(anchorEl);

    const handleCollapseJoinedPeers = () => {
        setOpen(!open);
    };

    const handleMenuOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setIsClicked(true);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setIsClicked(false);
        setHover(false);
    };

    const handleJoinBreakoutRoom = (e) => {
        e.stopPropagation();
        roomClient
            .getBreakoutRoomsManager()
            .preJoinBreakoutRoom(breakoutRoomInfo.id);
    };

    const handleRemoveBreakoutRooms = (e) => {
        e.stopPropagation();
        if (breakoutRoomInfo.peers.length > 0) {
            setRemovingBreakoutRoomInfo({
                id       : breakoutRoomInfo.id,
                name     : breakoutRoomInfo.name,
                numPeers : breakoutRoomInfo.peers.length,
            });
            setDialogMessageOpen(true);
        } else {
            roomClient
                .getBreakoutRoomsManager()
                .removeBreakoutRoom(breakoutRoomInfo.id);
        }
        handleMenuClose();
    };

    return (
        <>
            <ListItem
                className={classes.root}
                onClick={handleCollapseJoinedPeers}
                onMouseOver={() => {
                    setHover(true);
                }}
                onMouseLeave={() => {
                    !isClicked && setHover(false);
                }}
            >
                <Box className={classes.container}>
                    <Box className={classes.breakoutRoomNameContainer}>
                        {open ? <ExpandLess /> : <ExpandMore />}
                        <Typography
                            component="p"
                            variant="subtitle2"
                            className={classes.breakoutRoomName}
                        >
                            {`${breakoutRoomInfo.name} (${breakoutRoomInfo.peers.length})`}
                        </Typography>
                    </Box>
                    {!groupMode && (
                        <Box
                            className={classnames(
                                classes.breakoutRoomButton,
                                true ? classes.hover : null
                            )}
                        >
                            <Button
                                aria-label={intl.formatMessage({
                                    id             : "breakoutRoom.joinBreakoutRoom",
                                    defaultMessage : "Join",
                                })}
                                disableRipple
                                variant="contained"
                                color="primary"
                                classes={{
                                    root : classes.customPaddingButton,
                                }}
                                onClick={handleJoinBreakoutRoom}
                            >
                                <FormattedMessage
                                    id="breakoutRoom.joinBreakoutRoom"
                                    defaultMessage="Join"
                                />
                            </Button>
                            {canRemoveBreakoutRoom && (
                                <Button
                                    onClick={handleRemoveBreakoutRooms}
                                    aria-label={intl.formatMessage({
                                        id             : "breakoutRoom.breakoutRoomMore",
                                        defaultMessage : "More",
                                    })}
                                    disableRipple
                                    disableElevation
                                    variant="contained"
                                    color="primary"
                                    classes={{
                                        root : classes.breakoutRoomDeleteButton,
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {breakoutRoomInfo.peers.length > 0 && (
                    <List className={classes.list}>
                        {breakoutRoomInfo.peers.map((peer) => {
                            const picture = peer?.picture || EmptyAvatar;

                            return (
                                <ListItem
                                    component="div"
                                    className={classes.peerList}
                                    key={peer.id}
                                >
                                    <img
                                        alt="Peer avatar"
                                        className={classes.avatar}
                                        src={picture}
                                    />

                                    <div className={classes.peerInfo}>
                                        {peer.displayName}
                                    </div>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Collapse>
        </>
    );
};

Room.prototype = {
    setDialogMessageOpen        : PropTypes.func.isRequired,
    setRemovingBreakoutRoomInfo : PropTypes.func.isRequired,
};

const makeMapStateToProps = () => {
    const hasPermission = makePermissionSelector(
        permissions.REMOVE_BREAKOUT_ROOMS
    );
    const mapStateToProps = (state) => {
        return {
            canRemoveBreakoutRoom : hasPermission(state),
        };
    };

    return mapStateToProps;
};

const mapDispatchToProps = (dispatch) => ({
    setDialogMessageOpen : (value) => {
        dispatch(
            roomActions.setBreakoutRoomRemoveConfirmationDialogOpen(value)
        );
    },
    setRemovingBreakoutRoomInfo : (value) => {
        dispatch(roomActions.setRemovingBreakoutRoomInfo(value));
    },
});

export default withRoomContext(
    connect(makeMapStateToProps, mapDispatchToProps, null, {
        pure : false,
    })(withStyles(styles)(Room))
);
