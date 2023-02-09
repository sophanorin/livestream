import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Moderator from "./Menu/Moderator";
import List from "./List/List";
import Input from "./Menu/Input";
import ChatLabel from "./ChatLabel";

const styles = (theme) => ({
    root : {
        display         : "flex",
        flexDirection   : "column",
        width           : "100%",
        height          : "100%",
        overflowY       : "auto",
        padding         : theme.spacing(1),
        backgroundColor : "inherit",
    },
});

const Chat = (props) => {
    const { classes } = props;

    return (
        <Paper className={classes.root}>
            <ChatLabel />
            <List />
            <Input />
        </Paper>
    );
};

Chat.propTypes = {
    classes : PropTypes.object.isRequired,
};

export default withStyles(styles)(Chat);
