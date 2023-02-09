import React from "react";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles.web";

const SecondaryLoading = ({ classes }) => {
    return (
        <div className={classnames(classes.root)}>
            <div className={classnames(classes.loader)}>
                <span />
            </div>
        </div>
    );
};

export default withStyles(styles)(SecondaryLoading);
