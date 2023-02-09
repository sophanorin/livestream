import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { CloseIcon } from "../../assets/icons";
import DockItem from "./Items/DockItem";
const styles = (theme) => ({
    root : {
        position : "absolute",
        top      : 0,
        left     : 0,
        gap      : theme.spacing(1),
        zIndex   : 9999,
        padding  : theme.spacing(0, 1),
    },
});

export const DocksList = (props) => {
    const { classes, docks } = props;

    return (
        <Grid
            className={classes.root}
            container
            justifyContent="flex-start"
            alignItems="center"
            direction="row"
        >
            {docks &&
                Object.values(docks).map((dock) => (
                    <DockItem key={dock.id} dock={dock} />
                ))}
        </Grid>
    );
};

DocksList.propTypes = {
    classes : PropTypes.object.isRequired,
    docks   : PropTypes.object,
};

const mapStateToProps = (state) => ({
    docks : state.docks,
});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(DocksList));
