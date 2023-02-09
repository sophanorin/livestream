import React from "react";
import Youtube from "react-youtube";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../RoomContext";
import classNames from "classnames";

const styles = (theme) => ({
    root : {
        width      : "100%",
        height     : "100%",
        transition : "all .3s ease",
    },
    client : {
        pointerEvents : "none",
    },
});

function YoutubeView(props) {
    const { roomClient, classes, style } = props;

    return (
        <div style={style}>
            <Youtube
                {...roomClient.getYoutubeManager().getPlayerOptions()}
                containerClassName={classNames(
                    classes.root,
                    !roomClient.getYoutubeManager().isOwner
                        ? classes.client
                        : null
                )}
            />
        </div>
    );
}

YoutubeView.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.youtube.shareVideoInputDialogOpen ===
                    next.youtube.shareVideoInputDialogOpen &&
                prev.me === next.me
            );
        },
    })(withStyles(styles)(YoutubeView))
);
