import React from "react";
import { connect } from "react-redux";
import {
    raisedHandsSelector,
    makePermissionSelector,
} from "../../store/selectors";
import { permissions } from "../../permissions";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import * as toolareaActions from "../../store/actions/toolareaActions";
import { useIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import Chat from "./Chat/Chat";
import ParticipantList from "./ParticipantList/ParticipantList";
import CloseIcon from "@material-ui/icons/CloseOutlined";
import IconButton from "@material-ui/core/IconButton";

import palette from "../../theme/palette";
import MeetingInfo from "./ParticipantList/MeetingInfo";

const tabs = ["chat", "users"];

const styles = (theme) => ({
    root : {
        display         : "flex",
        flexDirection   : "column",
        width           : "100%",
        height          : "100%",
        backgroundColor : palette.basic.gray,
        backdropFilter  : `blur(${theme.spacing(8.5)}px)`,
        zIndex          : 998,
        position        : 'relative'
    },
    appBar : {
        display         : "flex",
        flexDirection   : "column",
        alignItems      : "center",
        boxShadow       : "none",
        backgroundColor : "inherit",
        padding         : theme.spacing(2, 2, 1, 2),
        backdropFilter  : `blur(${theme.spacing(8.5)}px)`,
    },
    tabsHeader : {
        width                  : "100%",
        "& .MuiTabs-indicator" : {
            display : "none",
        },
    },
    tabHeader : {
        fontWeight : "bold",
        color      : "#AEB1B7",
        // minHeight: 30,
        // padding: theme.spacing(0, 1),
    },
    activeTabHeader : {
        // padding: theme.spacing(1, 1.5),
        fontWeight      : "bold",
        borderRadius    : "var(--peer-border-radius-sm)",
        color           : `${palette.basic.white} !important`,
        backgroundColor : palette.basic.dark,
    },
    closeButton : {
        alignSelf    : "start",
        marginBottom : theme.spacing(1),
    },
});

const MeetingDrawer = (props) => {
    const intl = useIntl();

    const {
        currentToolTab,
        unreadMessages,
        unreadFiles,
        raisedHands,
        closeDrawer,
        setToolTab,
        classes,
        theme,
        canSendQuiz,
    } = props;

    return (
        <div className={classes.root}>
            <AppBar
                position="static"
                color="inherit"
                className={classes.appBar}
            >
                <IconButton
                    size="small"
                    onClick={closeDrawer}
                    className={classes.closeButton}
                >
                    <CloseIcon />
                </IconButton>
                <Tabs
                    className={classes.tabsHeader}
                    value={tabs.indexOf(currentToolTab)}
                    onChange={(event, value) => setToolTab(tabs[value])}
                    textColor="primary"
                    variant="standard"
                >
                    <Tab
                        className={
                            currentToolTab === "chat"
                                ? classes.activeTabHeader
                                : classes.tabHeader
                        }
                        label={
                            <Badge
                                color="primary"
                                overlap="rectangular"
                                badgeContent={unreadMessages}
                            >
                                {intl.formatMessage({
                                    id             : "label.chat",
                                    defaultMessage : "Chat",
                                })}
                            </Badge>
                        }
                    />
                    <Tab
                        className={
                            currentToolTab === "users"
                                ? classes.activeTabHeader
                                : classes.tabHeader
                        }
                        label={
                            <Badge
                                overlap="rectangular"
                                color="primary"
                                badgeContent={raisedHands}
                            >
                                {intl.formatMessage({
                                    id             : "label.participants",
                                    defaultMessage : "Participants",
                                })}
                            </Badge>
                        }
                    />
                </Tabs>
            </AppBar>
            {currentToolTab === "chat" && <Chat />}
            {currentToolTab === "users" && <>
                <ParticipantList />
                <MeetingInfo/>
            </>}
        </div>
    );
};

MeetingDrawer.propTypes = {
    currentToolTab : PropTypes.string.isRequired,
    setToolTab     : PropTypes.func.isRequired,
    unreadMessages : PropTypes.number.isRequired,
    unreadFiles    : PropTypes.number.isRequired,
    raisedHands    : PropTypes.number.isRequired,
    closeDrawer    : PropTypes.func.isRequired,
    classes        : PropTypes.object.isRequired,
    theme          : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    const hasQuizPermission = makePermissionSelector(permissions.SEND_QUIZ);

    return {
        canSendQuiz    : hasQuizPermission(state),
        currentToolTab : state.toolarea.currentToolTab,
        unreadMessages : state.toolarea.unreadMessages,
        unreadFiles    : state.toolarea.unreadFiles,
        raisedHands    : raisedHandsSelector(state),
    };
};

const mapDispatchToProps = {
    setToolTab : toolareaActions.setToolTab,
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
    areStatesEqual : (next, prev) => {
        return (
            prev.toolarea.currentToolTab === next.toolarea.currentToolTab &&
            prev.toolarea.unreadMessages === next.toolarea.unreadMessages &&
            prev.toolarea.unreadFiles === next.toolarea.unreadFiles &&
            prev.me.roles === next.me.roles &&
            prev.peers === next.peers
        );
    },
})(withStyles(styles, { withTheme: true })(MeetingDrawer));
