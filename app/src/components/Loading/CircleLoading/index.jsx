import React from "react";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles.web";

const CircleLoading = ({ classes }) => {
    return (
        <div className={classnames(classes.root)}>
            <span />
        </div>
    );
};

export default withStyles(styles)(CircleLoading);
