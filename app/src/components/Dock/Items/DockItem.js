import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { Grid, IconButton, Typography } from "@material-ui/core";
import * as dockActions from "../../../store/actions/dockActions";

import { CloseIcon } from "../../../assets/icons";
import palette from "../../../theme/palette";

const styles = (theme) => ({
    root : {
        background              : palette.basic.white,
        display                 : "flex",
        justifyContent          : "space-between",
        alignItems              : "center",
        gap                     : theme.spacing(2),
        padding                 : theme.spacing(0, 0.5, 0, 1),
        borderBottomRightRadius : theme.spacing(0.5),
        borderBottomLeftRadius  : theme.spacing(0.5),
        cursor                  : "pointer",
        userSelect              : "none",
        "&:hover"               : {
            background : palette.basic.gray,
        },
    },
    content : {
        display    : "flex",
        alignItems : "center",
        gap        : theme.spacing(0.5),
        fontSize   : 12,
    },
    dot : {
        width        : theme.spacing(1),
        height       : theme.spacing(1),
        background   : palette.status.green.primary,
        borderRadius : "50%",
    },
    closeButton : {
        padding : 0,
    },
});

export const DockItem = (props) => {
    const { classes, dock, removeDockItem } = props;

    const handleDockOpen = () => {
        dock.open();
    };

    const handleeDockClose = () => {
        removeDockItem(dock.id);
    };

    return (
        <Grid className={classes.root} item>
            <Typography
                className={classes.content}
                component="h6"
                variant="subtitle2"
                onClick={handleDockOpen}
            >
                {dock.name}
                <span className={classes.dot}></span>
            </Typography>

            <IconButton
                size="small"
                onClick={handleeDockClose}
                className={classes.closeButton}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </Grid>
    );
};

DockItem.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeDockItem : (id) => {
            dispatch(dockActions.removeDockItem(id));
        },
    };
};

export default connect(null, mapDispatchToProps)(withStyles(styles)(DockItem));
