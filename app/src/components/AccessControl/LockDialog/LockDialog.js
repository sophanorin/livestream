import React from "react";
import { connect } from "react-redux";
import {
    lobbyPeersKeySelector,
    makePermissionSelector,
} from "../../../store/selectors";
import { permissions } from "../../../permissions";
import * as appPropTypes from "../../appPropTypes";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../../RoomContext";
import * as roomActions from "../../../store/actions/roomActions";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListLobbyPeer from "./ListLobbyPeer";
import { Typography, IconButton, Grid, Divider } from "@material-ui/core";

import { CloseIcon } from "../../../assets/icons";

const styles = (theme) => ({
    root  : {},
    title : {
        fontWeight : "bold",
    },
    dialogPaper : {
        width        : "30vw",
        borderRadius : "var(--peer-border-radius-lg)",
        padding      : `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(
            2
        )}px ${theme.spacing(2)}px`,
        [theme.breakpoints.down("lg")] : {
            width : "40vw",
        },
        [theme.breakpoints.down("md")] : {
            borderRadius : "var(--peer-border-radius-md)",
            width        : "50vw",
        },
        [theme.breakpoints.down("sm")] : {
            width : "70vw",
        },
        [theme.breakpoints.down("xs")] : {
            width : "90vw",
        },
    },
    lock : {
        padding : theme.spacing(2),
    },
    divider : {
        margin : theme.spacing(0, 2),
    },
    closeBtn : {
        transform                      : "translateX(50%)",
        [theme.breakpoints.down("xs")] : {
            transform : "translateX(0%)",
        },
    },
});

const LockDialog = ({
    roomClient,
    room,
    handleCloseLockDialog,
    lobbyPeers,
    canPromote,
    classes,
}) => {
    return (
        <Dialog
            className={classes.root}
            open={room.lockDialogOpen}
            onClose={() => handleCloseLockDialog(false)}
            classes={{
                paper : classes.dialogPaper,
            }}
        >
            <DialogTitle disableTypography id="form-dialog-title">
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    wrap="nowrap"
                >
                    <Grid xs={0} sm={1} md={1}></Grid>
                    <Grid xs={10} md={10} container justifyContent="center">
                        <Typography
                            component="h2"
                            variant="h6"
                            className={classes.title}
                        >
                            <FormattedMessage
                                id="room.lobbyAdministration"
                                defaultMessage="Lobby administration"
                            />
                        </Typography>
                    </Grid>
                    <Grid xs={1} md={1} container justifyContent="flex-end">
                        <IconButton
                            className={classes.closeBtn}
                            onClick={() => handleCloseLockDialog(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <Divider className={classes.divider} />
            {lobbyPeers.length > 0 ? (
                <List
                    dense
                    subheader={
                        <ListSubheader component="div">
                            <FormattedMessage
                                id="room.peersInLobby"
                                defaultMessage="Participants in Lobby"
                            />
                        </ListSubheader>
                    }
                >
                    {lobbyPeers.map((peerId) => {
                        return <ListLobbyPeer key={peerId} id={peerId} />;
                    })}
                </List>
            ) : (
                <DialogContent>
                    <DialogContentText gutterBottom>
                        <FormattedMessage
                            id="room.lobbyEmpty"
                            defaultMessage="There are currently no one in the lobby"
                        />
                    </DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <Button
                    disabled={
                        lobbyPeers.length === 0 ||
                        !canPromote ||
                        room.lobbyPeersPromotionInProgress
                    }
                    onClick={() => roomClient.promoteAllLobbyPeers()}
                    color="primary"
                    variant="contained"
                >
                    <FormattedMessage
                        id="label.promoteAllPeers"
                        defaultMessage="Admit all"
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LockDialog.propTypes = {
    roomClient            : PropTypes.object.isRequired,
    room                  : appPropTypes.Room.isRequired,
    handleCloseLockDialog : PropTypes.func.isRequired,
    handleAccessCode      : PropTypes.func.isRequired,
    lobbyPeers            : PropTypes.array,
    canPromote            : PropTypes.bool,
    classes               : PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {
    const hasPermission = makePermissionSelector(permissions.PROMOTE_PEER);

    const mapStateToProps = (state) => {
        return {
            room       : state.room,
            lobbyPeers : lobbyPeersKeySelector(state),
            canPromote : hasPermission(state),
        };
    };

    return mapStateToProps;
};

const mapDispatchToProps = {
    handleCloseLockDialog : roomActions.setLockDialogOpen,
    handleAccessCode      : roomActions.setAccessCode,
};

export default withRoomContext(
    connect(makeMapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room === next.room &&
                prev.me.roles === next.me.roles &&
                prev.peers === next.peers &&
                prev.lobbyPeers === next.lobbyPeers
            );
        },
    })(withStyles(styles)(LockDialog))
);
