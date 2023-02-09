import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { Dialog, DialogContent, DialogContentText } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

import styles from "./styles.web";
import Hourglass from "../../assets/images/hourglass.png";

function LobbyDialog(props) {
    const { classes, inLobby } = props;

    return (
        <div className={classes.root}>
            <Dialog open={inLobby}>
                <DialogContent className={classes.content}>
                    <DialogContentText
                        className={classes.title}
                        variant="h6"
                        gutterBottom
                    >
                        <FormattedMessage
                            id="room.inLobby"
                            defaultMessage={"You're in the lobby"}
                        />
                    </DialogContentText>
                    <img src={Hourglass} />
                    <DialogContentText
                        className={classes.text}
                        variant="p"
                        gutterBottom
                    >
                        <FormattedMessage
                            id="room.inLobbyMessage"
                            defaultMessage={
                                "Please wait, the host will let you in soon."
                            }
                        />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
}

LobbyDialog.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        inLobby : state.room.inLobby,
    };
};

export default connect(mapStateToProps, null, null, {
    areStatesEqual : (next, prev) => {
        return prev.room.inLobby === next.room.inLobby;
    },
})(withStyles(styles)(LobbyDialog));
