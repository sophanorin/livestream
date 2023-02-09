import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import React from "react";

import styles from "./styles.web";

const ThreeDotsLoading = ({ classes }) => {
    return (
        <div className={classnames(classes.root)}>
            <div className={classnames(classes.dot, classes.dot1)}></div>
            <div className={classnames(classes.dot, classes.dot2)}></div>
            <div className={classnames(classes.dot, classes.dot3)}></div>
        </div>
    );
};

export default withStyles(styles)(ThreeDotsLoading);
