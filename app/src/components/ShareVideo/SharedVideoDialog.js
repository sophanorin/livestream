import React, { useState } from "react";
import * as youtubeManagerActions from "../../store/actions/youtubeManagerActions";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { withRoomContext } from "../../RoomContext";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import { IconButton, Typography } from "@material-ui/core";
import { CloseIcon } from "../../assets/icons";

const styles = (theme) => ({
    dialogTitle : {
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "space-between",
        alignItems     : "center",
        padding        : theme.spacing(2),
    },
    dialogPaper : {
        width        : "30vw",
        borderRadius : "var(--peer-border-radius-lg)",
        padding      : `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(
            4
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
    formControl : {
        display : "flex",
        margin  : "0px 24px",
    },
    action : {
        justifyContent : "center",
    },
});

function SharedVideoDialog(props) {
    const [link, setLink] = useState();
    const { me, classes, roomClient, youtube, handleCloseShareVideoDialog } =
        props;

    const intl = useIntl();

    const handleSubmition = (e) => {
        e.preventDefault();
        if (link !== "") {
            const data = roomClient
                .getYoutubeManager()
                .StartSharingYoutubeVideo(link, me.id);
            if (data?.status === "ok") {
                handleCloseShareVideoDialog(false);
            } else if (data?.status === "error") {
                //console.log(data);
            }
        }
    };

    return (
        <Dialog
            open={youtube.shareVideoInputDialogOpen}
            onClose={() => handleCloseShareVideoDialog(false)}
            classes={{
                paper : classes.dialogPaper,
            }}
        >
            <DialogTitle
                disableTypography
                id="form-dialog-title"
                className={classes.dialogTitle}
            >
                <Typography gutterBottom component="h2" variant="h6">
                    {intl.formatMessage({
                        id             : "youtube.shareVideo",
                        defaultMessage : "Share Video",
                    })}
                </Typography>
                <IconButton onClick={() => handleCloseShareVideoDialog(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form autoComplete="off">
                <FormControl className={classes.formControl}>
                    <TextField
                        autoFocus
                        id="url"
                        label={intl.formatMessage({
                            id             : "youtube.shareVideoLink",
                            defaultMessage : "Past video URL here",
                        })}
                        placeholder={intl.formatMessage({
                            id             : "youtube.shareVideoLink",
                            defaultMessage : "Past video URL here",
                        })}
                        error={youtube.status === "error"}
                        helperText={youtube.error}
                        variant="outlined"
                        margin="normal"
                        name="url"
                        fullWidth
                        onChange={(e) => setLink(e.target.value)}
                    />
                </FormControl>

                <DialogActions className={classes.action}>
                    <Button
                        type="submit"
                        onClick={handleSubmition}
                        color="primary"
                        variant="contained"
                    >
                        <FormattedMessage
                            id="youtube.share"
                            defaultMessage="Share"
                        />
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

SharedVideoDialog.propTypes = {
    classes                     : PropTypes.object.isRequired,
    handleCloseShareVideoDialog : PropTypes.func.isRequired,
    me                          : PropTypes.object.isRequired,
    youtube                     : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    me      : state.me,
    youtube : state.youtube,
});

const mapDispatchToProps = {
    handleCloseShareVideoDialog : youtubeManagerActions.setVideoYoutubeOpen,
};
export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return prev.me === next.me && prev.youtube === next.youtube;
        },
    })(withStyles(styles)(SharedVideoDialog))
);
