import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../../RoomContext";
import classnames from "classnames";
import PropTypes from "prop-types";
import * as appPropTypes from "../../appPropTypes";
import { useIntl } from "react-intl";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import PanIcon from "@material-ui/icons/PanTool";
import EmptyAvatar from "../../../assets/images/avatar-empty.jpeg";
import { FormattedMessage } from "react-intl";
import { RaiseHandIcon } from "../../../assets/icons";
import { Typography } from "@material-ui/core";

const styles = (theme) => ({
    root : {
        width      : "100%",
        overflow   : "hidden",
        cursor     : "auto",
        display    : "flex",
        boxShadow  : "none",
        alignItems : "center",
    },
    avatar : {
        borderRadius : "50%",
        height       : "2rem",
        width        : "2rem",
        marginTop    : theme.spacing(0.5),
        objectFit    : "cover",
    },
    displayName : {
        fontWeight : "600",
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
    buttons : {
        borderRadius : "var(--peer-border-radius-ssm)",
    },
});

const ListMe = (props) => {
    const intl = useIntl();

    const { roomClient, me, settings, classes } = props;

    const picture = me.picture || EmptyAvatar;

    let raisedHandTip;
    if (me.raisedHand) {
        raisedHandTip = intl.formatMessage({
            id             : "device.lowerHand",
            defaultMessage : "Lower Hand",
        });
    } else {
        raisedHandTip = intl.formatMessage({
            id             : "device.raiseHand",
            defaultMessage : "Raise Hand",
        });
    }

    return (
        <div className={classes.root}>
            <img alt="My avatar" className={classes.avatar} src={picture} />

            <div className={classes.peerInfo}>
                <Typography
                    component="p"
                    variant="subtitle2"
                    className={classes.displayName}
                >
                    {settings.displayName} (
                    <FormattedMessage id="room.me" defaultMessage="Me" />)
                </Typography>
            </div>
            <Tooltip title={raisedHandTip} placement="bottom">
                <IconButton
                    aria-label={raisedHandTip}
                    className={classnames(classes.buttons)}
                    disabled={me.raisedHandInProgress}
                    color="primary"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();

                        roomClient.setRaisedHand(!me.raisedHand);
                    }}
                >
                    <RaiseHandIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </div>
    );
};

ListMe.propTypes = {
    roomClient : PropTypes.object.isRequired,
    me         : appPropTypes.Me.isRequired,
    settings   : PropTypes.object.isRequired,
    classes    : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    me       : state.me,
    settings : state.settings,
});

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return prev.me === next.me && prev.settings === next.settings;
        },
    })(withStyles(styles)(ListMe))
);
