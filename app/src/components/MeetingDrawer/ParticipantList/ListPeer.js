import React, { useState } from "react";
import { connect } from "react-redux";
import {
    highestRoleLevelSelector,
    makePeerConsumerSelector,
    makePermissionSelector,
} from "../../../store/selectors";
import { withStyles } from "@material-ui/core/styles";
import { permissions } from "../../../permissions";
import * as roomActions from "../../../store/actions/roomActions";
import PropTypes from "prop-types";
import * as appPropTypes from "../../appPropTypes";
import { withRoomContext } from "../../../RoomContext";
import { useIntl, FormattedMessage } from "react-intl";
import classnames from "classnames";
import { green } from "@material-ui/core/colors";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import EmptyAvatar from "../../../assets/images/avatar-empty.jpeg";
import RemoveFromQueueIcon from "@material-ui/icons/RemoveFromQueue";
import AddToQueueIcon from "@material-ui/icons/AddToQueue";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Slider from "@material-ui/core/Slider";
import Paper from "@material-ui/core/Paper";
import ScreenShareOutlinedIcon from "@material-ui/icons/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@material-ui/icons/StopScreenShareOutlined";

import {
    RaiseHandIcon,
    VolumeOffIcon,
    VolumeOnIcon,
    MoreIcon,
    VideoOffIcon,
    VideoOnIcon,
    MicOffIcon,
    MicOnIcon,
    KickOutIcon,
    SecurityIcon,
    PresentIcon,
} from "../../../assets/icons";
import palette from "../../../theme/palette";
import RolesManager from "./RolesManager";

const styles = (theme) => ({
    root : {
        width      : "100%",
        overflow   : "hidden",
        cursor     : "auto",
        display    : "flex",
        alignItems : "center",
    },
    avatar : {
        borderRadius : "50%",
        height       : "2rem",
        width        : "2rem",
        marginTop    : theme.spacing(0.5),
        objectFit    : "cover",
    },
    indicator : {
        margin : theme.spacing(1),
    },
    buttons : {
        // padding: theme.spacing(1),
        // height: 32,
    },
    moreAction : {
        margin : theme.spacing(0, 0, 0, 1.5),
    },
    moreActionsHeader : {
        fontWeight  : 700,
        marginLeft  : theme.spacing(2),
        marginRight : theme.spacing(2),
        marginTop   : theme.spacing(1),
    },
    moderator : {
        color : theme.palette.primary.main,
    },
    displayName : {
        paddingLeft : theme.spacing(1),
        flexGrow    : 1,
        fontWeight  : 600,
    },
    moreButton : {
        borderRadius : "var(--peer-border-radius-ssm)",
        background   : palette.secondary.hover,
    },
    mediaOff : {
        color : palette.status.red.primary,
    },
});

const VolumeSlider = withStyles((theme) => ({
    root : {
        color   : "#3880ff",
        height  : 2,
        padding : theme.spacing(0, 0),
        margin  : theme.spacing(0, 0.5),
    },
    track : {
        height : 2,
    },
    rail : {
        height  : 2,
        opacity : 0.2,
    },
    mark : {
        backgroundColor : "#bfbfbf",
        height          : 10,
        width           : 3,
        marginTop       : -3,
    },
    markActive : {
        opacity         : 1,
        backgroundColor : "currentColor",
    },
}))(Slider);

const ListPeer = (props) => {
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMenu, setCurrentMenu] = useState(null);

    const handleExited = () => {
        setCurrentMenu(null);
    };

    const handleMenuOpen = (event, menu) => {
        setAnchorEl(event.currentTarget);
        setCurrentMenu(menu);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const {
        roomClient,
        isModerator,
        spotlight,
        peer,
        openRolesManager,
        micConsumer,
        webcamConsumer,
        screenConsumer,
        isSelected,
        children,
        classes,
        userRoles,
        canModifyRoles,
        highestLevel,
        canControlParticipant,
    } = props;

    const webcamEnabled =
        Boolean(webcamConsumer) &&
        !webcamConsumer.locallyPaused &&
        !webcamConsumer.remotelyPaused;

    const micEnabled =
        Boolean(micConsumer) &&
        !micConsumer.locallyPaused &&
        !micConsumer.remotelyPaused;

    const screenVisible =
        Boolean(screenConsumer) &&
        !screenConsumer.locallyPaused &&
        !screenConsumer.remotelyPaused;

    const picture = peer.picture || EmptyAvatar;

    const isMenuOpen = Boolean(anchorEl);

    return (
        <div className={classes.root}>
            <img alt="Peer avatar" className={classes.avatar} src={picture} />

            <Typography
                component="p"
                variant="subtitle2"
                className={classes.displayName}
            >
                {peer.displayName}
            </Typography>
            {peer.raisedHand && (
                <IconButton
                    disabled={!isModerator || peer.raisedHandInProgress}
                    onClick={() => {
                        roomClient.lowerPeerHand(peer.id);
                    }}
                    size="small"
                >
                    <RaiseHandIcon fontSize="small" />
                </IconButton>
            )}
            {isSelected ? (
                <Tooltip
                    title={intl.formatMessage({
                        id             : "tooltip.inSpotlight",
                        defaultMessage : "In spotlight",
                    })}
                >
                    <IconButton
                        size="small"
                        style={{ color: green[500] }}
                        onClick={() => {
                            roomClient.removeSelectedPeer(peer.id);
                        }}
                    >
                        <AddToQueueIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : (
                spotlight && (
                    <Tooltip
                        title={intl.formatMessage({
                            id             : "tooltip.isSpeaker",
                            defaultMessage : "Active speaker",
                        })}
                    >
                        <IconButton size="small" disabled>
                            <RecordVoiceOverIcon
                                fontSize="small"
                                style={{ color: green[500] }}
                            />
                        </IconButton>
                    </Tooltip>
                )
            )}
            {
                canControlParticipant &&  <Tooltip
                    title={intl.formatMessage({
                        id             : "tooltip.muteParticipant",
                        defaultMessage : "Mute audio",
                    })}
                    placement="bottom"
                >
                    <IconButton
                        aria-label={intl.formatMessage({
                            id             : "tooltip.muteParticipant",
                            defaultMessage : "Mute audio",
                        })}
                        size="small"
                        disabled={peer.peerAudioInProgress}
                        onClick={() => {
                            micEnabled
                                ? roomClient.modifyPeerConsumer(
                                    peer.id,
                                    "mic",
                                    true
                                )
                                : roomClient.modifyPeerConsumer(
                                    peer.id,
                                    "mic",
                                    false
                                );
                        }}
                    >
                        {micEnabled ? (
                            <MicOnIcon fontSize="small" />
                        ) : (
                            <MicOffIcon
                                fontSize="small"
                                className={classes.mediaOff}
                            />
                        )}
                    </IconButton>
                </Tooltip>
            }
           
            {children}
            {
                canControlParticipant && <>
                    {webcamEnabled ? (
                        <Tooltip
                            title={intl.formatMessage({
                                id             : "tooltip.cameraOn",
                                defaultMessage : "Camera On",
                            })}
                        >
                            <IconButton size="small" color="inherit">
                                <VideoOnIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip
                            title={intl.formatMessage({
                                id             : "tooltip.cameraOff",
                                defaultMessage : "Camera Off",
                            })}
                        >
                            <IconButton size="small" className={classes.mediaOff}>
                                <VideoOffIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip
                        title={intl.formatMessage({
                            id             : "label.moreActions",
                            defaultMessage : "More actions",
                        })}
                    >
                        <IconButton
                            className={classes.moreButton}
                            size="small"
                            aria-haspopup
                            onClick={(event) => handleMenuOpen(event, "moreActions")}
                            color="inherit"
                        >
                            <MoreIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </>
            }
            
            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                open={isMenuOpen}
                onClose={handleMenuClose}
                TransitionProps={{
                    onExited : handleExited,
                }}
                getContentAnchorEl={null}
            >
                {currentMenu === "moreActions" && (
                    <Paper elevation={0}>
                        <Typography
                            variant="subtitle2"
                            className={classes.moreActionsHeader}
                        >
                            {peer.displayName}
                        </Typography>
                        <MenuItem
                            className={classes.nested}
                            disabled={
                                !micConsumer || peer.stopPeerAudioInProgress
                            }
                            style={{ overflow: "visible" }}
                            disableRipple
                        >
                            <VolumeOffIcon fontSize="small" />
                            <VolumeSlider
                                className={classnames(
                                    classes.slider,
                                    classnames.setting
                                )}
                                key={"audio-gain-slider"}
                                disabled={
                                    !micConsumer || peer.stopPeerAudioInProgress
                                }
                                min={0}
                                max={2}
                                step={0.05}
                                value={
                                    micConsumer &&
                                    micConsumer.audioGain !== undefined
                                        ? micConsumer.audioGain
                                        : 1
                                }
                                valueLabelDisplay={"auto"}
                                onChange={(event, value) => {
                                    roomClient.setAudioGain(
                                        micConsumer,
                                        peer.id,
                                        value
                                    );
                                }}
                            />
                            <VolumeOnIcon fontSize="small" />
                        </MenuItem>
                        <MenuItem
                            disabled={
                                peer.peerVideoInProgress ||
                                !webcamConsumer ||
                                !spotlight
                            }
                            onClick={() => {
                                // handleMenuClose();

                                webcamEnabled
                                    ? roomClient.modifyPeerConsumer(
                                        peer.id,
                                        "webcam",
                                        true
                                    )
                                    : roomClient.modifyPeerConsumer(
                                        peer.id,
                                        "webcam",
                                        false
                                    );
                            }}
                        >
                            {webcamEnabled ? (
                                <VideoOnIcon fontSize="small" />
                            ) : (
                                <VideoOffIcon fontSize="small" />
                            )}
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                {webcamEnabled ? (
                                    <FormattedMessage
                                        id="tooltip.muteParticipantVideo"
                                        defaultMessage="Mute video"
                                    />
                                ) : (
                                    <FormattedMessage
                                        id="tooltip.unMuteParticipantVideo"
                                        defaultMessage="Unmute video"
                                    />
                                )}
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            disabled={
                                peer.peerScreenInProgress ||
                                !screenConsumer ||
                                !spotlight
                            }
                            onClick={() => {
                                // handleMenuClose();

                                screenVisible
                                    ? roomClient.modifyPeerConsumer(
                                        peer.id,
                                        "screen",
                                        true
                                    )
                                    : roomClient.modifyPeerConsumer(
                                        peer.id,
                                        "screen",
                                        false
                                    );
                            }}
                        >
                            {screenVisible ? (
                                <ScreenShareOutlinedIcon fontSize="small" />
                            ) : (
                                <StopScreenShareOutlinedIcon fontSize="small" />
                            )}
                            <Typography
                                component="p"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                {screenVisible ? (
                                    <FormattedMessage
                                        id="tooltip.muteScreenSharing"
                                        defaultMessage="Mute screen share"
                                    />
                                ) : (
                                    <FormattedMessage
                                        id="tooltip.unMuteScreenSharing"
                                        defaultMessage="Unmute screen share"
                                    />
                                )}
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                // handleMenuClose();

                                isSelected
                                    ? roomClient.removeSelectedPeer(peer.id)
                                    : roomClient.addSelectedPeer(peer.id);
                            }}
                        >
                            {!isSelected ? (
                                <AddToQueueIcon fontSize="small" />
                            ) : (
                                <RemoveFromQueueIcon fontSize="small" />
                            )}
                            <Typography
                                component="small"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                {!isSelected ? (
                                    <FormattedMessage
                                        id="tooltip.addParticipantToSpotlight"
                                        defaultMessage="Add to spotlight"
                                    />
                                ) : (
                                    <FormattedMessage
                                        id="tooltip.removeParticipantFromSpotlight"
                                        defaultMessage="Remove from spotlight"
                                    />
                                )}
                            </Typography>
                        </MenuItem>
                        {isModerator && (
                            <React.Fragment>
                                <Divider />
                                <Typography
                                    variant="subtitle2"
                                    className={classnames(
                                        classes.moreActionsHeader,
                                        classes.moderator
                                    )}
                                >
                                    <FormattedMessage
                                        id="room.moderatoractions"
                                        defaultMessage="Moderator actions"
                                    />
                                </Typography>

                                <MenuItem
                                    disabled={
                                        !micConsumer ||
                                        peer.stopPeerAudioInProgress
                                    }
                                    onClick={() => {
                                        roomClient.mutePeer(peer.id);
                                    }}
                                >
                                    {micConsumer &&
                                    !micConsumer.remotelyPaused ? (
                                            <MicOnIcon fontSize="small" />
                                        ) : (
                                            <MicOffIcon fontSize="small" />
                                        )}
                                    <Typography
                                        component="small"
                                        variant="subtitle2"
                                        className={classes.moreAction}
                                    >
                                        <FormattedMessage
                                            id="tooltip.muteParticipantAudioModerator"
                                            defaultMessage="Stop audio"
                                        />
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    disabled={
                                        !webcamConsumer ||
                                        peer.stopPeerVideoInProgress
                                    }
                                    onClick={() => {
                                        // handleMenuClose();

                                        roomClient.stopPeerVideo(peer.id);
                                    }}
                                >
                                    {webcamConsumer &&
                                    !webcamConsumer.remotelyPaused ? (
                                            <VideoOnIcon fontSize="small" />
                                        ) : (
                                            <VideoOffIcon fontSize="small" />
                                        )}
                                    <Typography
                                        component="small"
                                        variant="subtitle2"
                                        className={classes.moreAction}
                                    >
                                        <FormattedMessage
                                            id="tooltip.muteParticipantVideoModerator"
                                            defaultMessage="Stop video"
                                        />
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    disabled={
                                        !screenConsumer ||
                                        peer.stopPeerScreenSharingInProgress
                                    }
                                    onClick={() => {
                                        // handleMenuClose();

                                        roomClient.stopPeerScreenSharing(
                                            peer.id
                                        );
                                    }}
                                >
                                    {screenConsumer &&
                                    !screenConsumer.remotelyPaused ? (
                                            <ScreenShareOutlinedIcon fontSize="small" />
                                        ) : (
                                            <StopScreenShareOutlinedIcon fontSize="small" />
                                        )}
                                    <Typography
                                        component="small"
                                        variant="subtitle2"
                                        className={classes.moreAction}
                                    >
                                        <FormattedMessage
                                            id="tooltip.muteScreenSharingModerator"
                                            defaultMessage="Stop screen share"
                                        />
                                    </Typography>
                                </MenuItem>
                                <RolesManager peerId={peer.id} />
                                <MenuItem
                                    disabled={peer.peerKickInProgress}
                                    onClick={() => {
                                        // handleMenuClose();

                                        roomClient.kickPeer(peer.id);
                                    }}
                                >
                                    <KickOutIcon fontSize="small" />
                                    <Typography
                                        component="small"
                                        variant="subtitle2"
                                        className={classes.moreAction}
                                    >
                                        <FormattedMessage
                                            id="tooltip.kickParticipant"
                                            defaultMessage="Kick out"
                                        />
                                    </Typography>
                                </MenuItem>
                            </React.Fragment>
                        )}
                    </Paper>
                )}
            </Popover>
        </div>
    );
};

ListPeer.propTypes = {
    roomClient       : PropTypes.any.isRequired,
    advancedMode     : PropTypes.bool,
    isModerator      : PropTypes.bool,
    spotlight        : PropTypes.bool,
    peer             : appPropTypes.Peer.isRequired,
    openRolesManager : PropTypes.func.isRequired,
    micConsumer      : appPropTypes.Consumer,
    webcamConsumer   : appPropTypes.Consumer,
    screenConsumer   : appPropTypes.Consumer,
    isSelected       : PropTypes.bool,
    children         : PropTypes.object,
    classes          : PropTypes.object.isRequired,
};

const makeMapStateToProps = (initialState, { id }) => {
    const getPeerConsumers = makePeerConsumerSelector();
    const canModifyRoles = makePermissionSelector(permissions.MODIFY_ROLE);
    const canControlParticipant = makePermissionSelector(permissions.PARTICIPANT_CONTROL);

    const mapStateToProps = (state) => {
        return {
            peer                  : state.peers[id],
            userRoles             : state.room.userRoles,
            canModifyRoles        : canModifyRoles(state),
            canControlParticipant : canControlParticipant(state),
            highestLevel          : highestRoleLevelSelector(state),
            ...getPeerConsumers(state, id),
        };
    };

    return mapStateToProps;
};

export default withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.peers === next.peers && prev.consumers === next.consumers
            );
        },
    })(withStyles(styles)(ListPeer))
);
