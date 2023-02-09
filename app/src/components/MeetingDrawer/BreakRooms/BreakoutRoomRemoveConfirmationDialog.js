import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Typography,
    Grid,
} from "@material-ui/core";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import React from "react";
import * as roomActions from "../../../store/actions/roomActions";
import { withRoomContext } from "../../../RoomContext";
import PropTypes from "prop-types";
import { ConfirmIcon } from "../../../assets/icons";
import { FormattedMessage } from "react-intl";

const styles = (theme) => ({
    root        : {},
    dialogPaper : {
        borderRadius : "var(--peer-border-radius-md)",
        padding      : theme.spacing(1, 2, 2, 2),
    },
    title : {
        fontWeight : "bold",
    },
});

function BreakoutRoomRemoveConfirmationDialog(props) {
    const {
        classes,
        roomClient,
        dialogOpen,
        setDialogMessageOpen,
        removingBreakoutRoomInfo,
        setRemovingBreakoutRoomInfo,
    } = props;

    return (
        <Dialog
            open={dialogOpen}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="xs"
        >
            <DialogTitle disableTypography>
                <Grid
                    container
                    wrap="nowrap"
                    justifyContent="flex-start"
                    alignItems="center"
                >
                    <ConfirmIcon />
                    <Typography
                        component="p"
                        variant="subtitle1"
                        color="primary"
                        className={classes.title}
                    >
                        <FormattedMessage
                            id="breakoutRoom.removalConfirmation"
                            defaultMessage="Are you sure?"
                        />
                    </Typography>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    There are students in this breakout room. Are you sure you
                    want to delete this breakout room?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                        setDialogMessageOpen(false);
                    }}
                    fullWidth
                >
                    <FormattedMessage
                        id="breakoutRoom.cancel"
                        defaultMessage="Cancel"
                    />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        roomClient
                            .getBreakoutRoomsManager()
                            .removeBreakoutRoom(removingBreakoutRoomInfo.id);
                        setDialogMessageOpen(false);
                        setRemovingBreakoutRoomInfo(null);
                    }}
                    fullWidth
                >
                    <FormattedMessage
                        id="breakoutRoom.remove"
                        defaultMessage="Delete"
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const mapStateToProps = (state) => ({
    dialogOpen               : state.room.removeBreakoutRoomDialogMessageOpen,
    removingBreakoutRoomInfo : state.room.removingBreakoutRoomInfo,
});

const mapDispatchToProps = (dispatch) => ({
    setDialogMessageOpen : (flag) => {
        dispatch(roomActions.setBreakoutRoomRemoveConfirmationDialogOpen(flag));
    },
    setRemovingBreakoutRoomInfo : (flag) => {
        dispatch(roomActions.setRemovingBreakoutRoomInfo(flag));
    },
});

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) =>
            next.room.removeBreakoutRoomDialogMessageOpen ===
                prev.room.removeBreakoutRoomDialogMessageOpen &&
            next.room.removingBreakoutRoomInfo ===
                prev.room.removingBreakoutRoomInfo,
    })(withStyles(styles)(BreakoutRoomRemoveConfirmationDialog))
);
