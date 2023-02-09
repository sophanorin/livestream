import React from "react";
import { CircularProgress, Typography, withStyles } from "@material-ui/core";

import styles from "./styles.web";

function SimpleLoading({ classes }) {
    return (
        <div className={classes.root}>
            <div className={classes.loadingContainer}>
                <div className={classes.loading}></div>
                <div className={classes.loadingText}>
                    <Typography>Loading</Typography>
                </div>
            </div>
        </div>
    );
}

export default withStyles(styles)(SimpleLoading);
