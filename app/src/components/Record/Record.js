import { alpha, IconButton, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";

import { RecordingIcon } from "../../assets/icons";
import palette from "../../theme/palette";

const styles = (theme) => ({
    root : {
        position      : "absolute",
        top           : theme.spacing(1),
        left          : theme.spacing(1),
        background    : alpha(palette.basic.gray, 0.3),
        borderRadius  : "var(--peer-border-radius-ssm)",
        color         : palette.basic.white,
        padding       : theme.spacing(0.1, 0.5),
        display       : "flex",
        flexDirection : "row",
        alignItems    : "center",
        gap           : theme.spacing(0.5),
    },
});

export const Record = (props) => {
    const { classes } = props;

    return (
        <div className={classes.root}>
            <RecordingIcon fontSize="small" color="secondary" />{" "}
            <Typography component="p" variant="subtitle2">
                Recording...
            </Typography>
        </div>
    );
};

Record.propTypes = {
    second : PropTypes.third,
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(Record));
