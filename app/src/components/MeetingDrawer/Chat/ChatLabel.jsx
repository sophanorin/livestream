import { withStyles } from "@material-ui/core";
import React from "react";
import palette from "../../../theme/palette";

const styles = (theme) => ({
    root : {
        color       : palette.secondary.main,
        position    : "relative",
        textAlign   : "center",
        "&::before" : {
            content      : "''",
            position     : "absolute",
            width        : `calc(35% - ${theme.spacing(1)}px)`,
            left         : theme.spacing(1),
            top          : "50%",
            borderBottom : `1px solid ${palette.secondary.main}`,
            transform    : "translateY(-50%)",
        },
        "&::after" : {
            content      : "''",
            position     : "absolute",
            width        : `calc(35% - ${theme.spacing(1)}px)`,
            right        : theme.spacing(1),
            top          : "50%",
            borderBottom : `1px solid ${palette.secondary.main}`,
        },
    },
});

function ChatLabel({ classes }) {
    return <div className={classes.root}>Messages</div>;
}

export default withStyles(styles)(ChatLabel);
