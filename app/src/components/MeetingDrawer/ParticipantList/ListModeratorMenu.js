import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { withRoomContext } from "../../../RoomContext";
import { useIntl, FormattedMessage } from "react-intl";
import Button from "@material-ui/core/Button";
import MicOffIcon from "@material-ui/icons/MicOff";
import StopShareScreen from "@material-ui/icons/StopScreenShare";
import VideoOff from "@material-ui/icons/VideocamOff";
import CallEnd from "@material-ui/icons/CallEnd";
import { MenuItem, Paper, Typography } from "@material-ui/core";

const styles = (theme) => ({
    root : {
        display       : "flex",
        flex          : 1,
        flexDirection : "row",
        flexWrap      : "wrap",
    },
    flexDirection : {
        display       : "flex",
        flex          : 1,
        flexDirection : "column",
        flexWrap      : "wrap",
    },
    mobileButtonContent : {
        display       : "flex",
        flex          : 1,
        flexDirection : "column",
    },
    destopButtonContent : {
        display       : "flex",
        flex          : 1,
        flexDirection : "row",
    },
    smButton : {
        marginRight  : theme.spacing(2),
        marginTop    : theme.spacing(1),
        padding      : theme.spacing(1),
        borderRadius : "var(--peer-border-radius-sm)",
        fontWeight   : "bold",
        boxShadow    : "none",
    },
    button : {
        marginTop    : theme.spacing(1),
        padding      : theme.spacing(1),
        borderRadius : "var(--peer-border-radius-sm)",
        fontWeight   : "bold",
        boxShadow    : "none",
    },
    divider : {
        marginTop : theme.spacing(2),
        border    : "1px dashed #AEB1B7",
        opacity   : 0.6,
        transform : "rotate(180deg)",
    },
});

const ListModerator = (props) => {
    const intl = useIntl();

    const { roomClient, room, browser, classes } = props;

    return (
        <Paper elevation={0}>
            <MenuItem onClick={() => roomClient.muteAllPeers()}>
                <Typography component="p" variant="subtitle2">
                    <FormattedMessage
                        id="room.muteAll"
                        defaultMessage="Mute all"
                    />
                </Typography>
            </MenuItem>

            <MenuItem onClick={() => roomClient.stopAllPeerScreenSharing()}>
                <Typography component="p" variant="subtitle2">
                    <FormattedMessage
                        id="room.stopAllScreenSharing"
                        defaultMessage="Stop all screen sharing"
                    />
                </Typography>
            </MenuItem>

            <MenuItem onClick={() => roomClient.stopAllPeerVideo()}>
                <Typography component="p" variant="subtitle2">
                    <FormattedMessage
                        id="room.stopAllVideo"
                        defaultMessage="Stop all video"
                    />
                </Typography>
            </MenuItem>

            <MenuItem onClick={() => roomClient.closeMeeting()}>
                <Typography component="p" variant="subtitle2">
                    <FormattedMessage
                        id="room.closeMeeting"
                        defaultMessage="End meeting"
                    />
                </Typography>
            </MenuItem>
        </Paper>
    );
};

ListModerator.propTypes = {
    roomClient : PropTypes.any.isRequired,
    room       : PropTypes.object.isRequired,
    classes    : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    room    : state.room,
    browser : state.me.browser,
});

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return prev.room === next.room;
        },
    })(withStyles(styles)(ListModerator))
);
