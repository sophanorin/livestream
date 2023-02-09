import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
    withStyles,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import { CloseIcon } from "../../assets/icons";

import { withRoomContext } from "../../RoomContext";
import * as roomActions from "../../store/actions/roomActions";

const styles = (theme) => ({
    root  : {},
    title : {
        fontWeight : "bold",
    },
});

export const ModeratorLeave = (props) => {
    const {
        classes,
        roomClient,
        handleCloseModeratorLeaveDialog,
        moderatorLeaveDialogOpen,
    } = props;

    return (
        <Dialog
            className={classes.root}
            open={moderatorLeaveDialogOpen}
            onClose={handleCloseModeratorLeaveDialog}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle disableTypography id="form-dialog-title">
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    wrap="nowrap"
                >
                    <Typography
                        component="h2"
                        variant="subtitle1"
                        className={classes.title}
                    >
                        <FormattedMessage
                            id="label.moderatorLeaveDialog"
                            defaultMessage="Leave"
                        />
                    </Typography>
                    <IconButton
                        className={classes.closeBtn}
                        onClick={handleCloseModeratorLeaveDialog}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You can end this room now or keep this room hosting.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        roomClient.close();
                    }}
                >
                    <FormattedMessage
                        id="me.leaveAlone"
                        defaultMessage="Leave"
                    />
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                        roomClient.closeMeeting();
                    }}
                >
                    <FormattedMessage
                        id="room.closeMeeting"
                        defaultMessage="Close Meeting"
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModeratorLeave.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    moderatorLeaveDialogOpen : state.room.moderatorLeaveDialogOpen,
});

const mapDispatchToProps = (dispatch) => {
    return {
        handleCloseModeratorLeaveDialog : () => {
            dispatch(roomActions.setModeratorLeaveDialogOpen(false));
        },
    };
};

export default withRoomContext(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(ModeratorLeave))
);
