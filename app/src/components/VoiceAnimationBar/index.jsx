import React from "react";
import { withStyles } from "@material-ui/styles";
import classnames from "classnames";

import styles from "./styles";

function VoiceAnimationBar({ classes }) {
    const numBar = 10;
    const vBars = Array(numBar);
    return (
        <div className={classnames(classes.root)}>
            {[...vBars].map(() => (
                <div className={classnames(classes.bar)}></div>
            ))}
        </div>
    );
}

export default withStyles(styles)(VoiceAnimationBar);
