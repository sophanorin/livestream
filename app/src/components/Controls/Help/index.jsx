import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../../RoomContext";
import * as roomActions from "../../../store/actions/roomActions";
import PropTypes from "prop-types";
import { useIntl, FormattedMessage } from "react-intl";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/CloseOutlined";
import DialogContent from "@material-ui/core/DialogContent";

import shortcuts from "./shortcuts";
import styles from "./styles.web";
import { Divider, Grid, Typography } from "@material-ui/core";

const Help = ({ helpOpen, handleCloseHelp, classes }) => {
    const intl = useIntl();

    return (
        <Dialog
            open={helpOpen}
            onClose={() => {
                handleCloseHelp(false);
            }}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="md"
        >
            <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
                <div className={classes.dialogHeader}>
                    <FormattedMessage
                        id="room.shortcutkeys"
                        defaultMessage="Shortcut Keys"
                    />
                    <IconButton onClick={() => handleCloseHelp(false)}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </DialogTitle>
            <Divider />
            <DialogContent className={classes.shortcuts}>
                {shortcuts.map((value, index) => {
                    return (
                        <Grid
                            key={index}
                            container
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={2}
                            wrap="nowrap"
                        >
                            <Grid item md={6} sm={4} xs={8}>
                                <Typography className={classes.shortcutText}>
                                    <FormattedMessage
                                        id={value.label}
                                        defaultMessage={value.defaultMessage}
                                    />
                                </Typography>
                            </Grid>
                            <Grid item md={2} sm={3} xs>
                                <div className={classes.shortcutKey}>
                                    {value.key}
                                </div>
                            </Grid>
                        </Grid>
                    );
                })}
            </DialogContent>
        </Dialog>
    );
};

Help.propTypes = {
    roomClient      : PropTypes.object.isRequired,
    helpOpen        : PropTypes.bool.isRequired,
    handleCloseHelp : PropTypes.func.isRequired,
    classes         : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    helpOpen : state.room.helpOpen,
});

const mapDispatchToProps = {
    handleCloseHelp : roomActions.setHelpOpen,
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return prev.room.helpOpen === next.room.helpOpen;
        },
    })(withStyles(styles)(Help))
);
