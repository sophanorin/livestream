import { MenuItem, Typography, withStyles } from "@material-ui/core";
import React from "react";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { SecurityIcon, PresentIcon } from "../../../assets/icons";
import { permissions } from "../../../permissions";
import { withRoomContext } from "../../../RoomContext";
import {
    highestRoleLevelSelector,
    makePermissionSelector,
} from "../../../store/selectors";

const styles = (theme) => ({
    moreAction : {
        margin : theme.spacing(0, 0, 0, 1.5),
    },
});

function RolesManager(props) {
    const {
        roomClient,
        peer,
        userRoles,
        canModifyRoles,
        highestLevel,
        classes,
    } = props;

    const intl = useIntl();

    return (
        <>
            {[...userRoles].map((entry) => {
                const role = entry[1];

                if (role.promotable && role.level <= highestLevel) {
                    const hasRole = peer.roles.some(
                        (peerRole) => peerRole === role.id
                    );

                    let icon = <SecurityIcon fontSize="small" />;

                    if (role.level === 50) {
                        icon = <SecurityIcon fontSize="small" />;
                    } else if (role.level === 40) {
                        icon = <PresentIcon fontSize="small" />;
                    }

                    return (
                        <MenuItem
                            key={role.id}
                            disabled={
                                role.level > highestLevel ||
                                !canModifyRoles ||
                                peer.peerModifyRolesInProgress
                            }
                            onClick={() => {
                                if (hasRole) {
                                    roomClient.removePeerRole(peer.id, role.id);
                                } else {
                                    roomClient.givePeerRole(peer.id, role.id);
                                }
                            }}
                        >
                            {icon}
                            <Typography
                                component="small"
                                variant="subtitle2"
                                className={classes.moreAction}
                            >
                                {hasRole
                                    ? intl.formatMessage(
                                        {
                                            id             : "roleManager.demote",
                                            defaultMessage : "Demote {label}",
                                        },
                                        {
                                            label : role.label,
                                        }
                                    )
                                    : intl.formatMessage(
                                        {
                                            id             : "roleManager.promote",
                                            defaultMessage : "Promote {label}",
                                        },
                                        {
                                            label : role.label,
                                        }
                                    )}
                            </Typography>
                        </MenuItem>
                    );
                }
                return null;
            })}
        </>
    );
}

const makeMapStateToProps = () => {
    const canModifyRoles = makePermissionSelector(permissions.MODIFY_ROLE);

    const mapStateToProps = (state, { peerId }) => {
        return {
            peer           : state.peers[peerId],
            userRoles      : state.room.userRoles,
            canModifyRoles : canModifyRoles(state),
            highestLevel   : highestRoleLevelSelector(state),
        };
    };

    return mapStateToProps;
};

export default withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.me === next.me &&
                prev.peers === next.peers &&
                prev.room === next.room
            );
        },
    })(withStyles(styles)(React.memo(RolesManager)))
);
