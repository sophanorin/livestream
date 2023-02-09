import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import DOMPurify from "dompurify";
import marked from "marked";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useIntl, FormattedTime } from "react-intl";
import { Box } from "@material-ui/core";
import typography from "../../../../../theme/typography";
import palette from "../../../../../theme/palette";

const styles = (theme) => ({
    root : {
        display    : "flex",
        flexShrink : 0,
        wordWrap   : "break-word",
        wordBreak  : "break-all",
        fontSize   : typography.chatFontSize.default,
        // gap: theme.spacing(1),
    },
    single : {
        marginTop    : theme.spacing(1),
        borderRadius : "10px 10px 10px 10px",
    },
    combinedBegin : {
        marginTop    : theme.spacing(1),
        borderRadius : "10px 10px 0px 0px",
    },

    combinedMiddle : {
        marginBottom : theme.spacing(0),
        borderRadius : "0px 0px 0px 0px",
    },
    combinedEnd : {
        marginBottom : theme.spacing(0),
        borderRadius : "0px 0px 10px 10px",
    },
    combinedTime : {
        width          : "75px",
        alignSelf      : "center",
        fontSize       : "13px",
        color          : "#999999",
        dispay         : "flex",
        display        : "flex",
        justifyContent : "center",
    },
    sent : {
        alignSelf : "flex-end",
    },
    received : {
        alignSelf : "flex-start",
    },
    name   : {},
    avatar : {
        // flex: 2,
        width          : "3rem",
        display        : "flex",
        justifyContent : "center",
        "& img"        : {
            borderRadius : "50%",
            width        : "2rem",
            height       : "2rem",
            alignSelf    : "start",
            objectFit    : "cover",
            // backgroundColor: "#e0e0e085",
        },
    },
    content : {
        flex   : 12,
        margin : theme.spacing(0, 1, 2, 1),
        "& p"  : {
            margin : "0",
        },
    },
    isSeen : {
        // backgroundColor: "#e0e0e085",
        transition : "background-color 1s",
    },
    text : {
        lineHeight : 1.5,
    },
    time : {
        fontSize       : theme.spacing(1.3),
        display        : "flex",
        justifyContent : "flex-end",
        alignItems     : "flex-end",
        color          : "inherit",
        wordBreak      : "normal",
        whiteSpace     : "nowrap",
    },
    textContainer : {
        display        : "flex",
        justifyContent : "space-between",
        padding        : theme.spacing(2),
        borderRadius   : "var(--peer-border-radius-sm)",
        boxShadow      : "var(--chat-shadow)",
        gap            : theme.spacing(1),
    },
    textSentContainer : {
        background           : palette.primary.hover,
        color                : palette.basic.gray,
        flexDirection        : "row-reverse",
        borderTopRightRadius : 0,
        "& a"                : {
            color : palette.basic.white,
        },
    },
    textReceivedContainer : {
        flexDirection       : "row",
        background          : palette.basic.white,
        color               : palette.basic.dark,
        borderTopLeftRadius : 0,
        "& a"               : {
            color : palette.primary.hover,
        },
    },
    textReceived : {
        textAlign : "start",
    },
    textSent : {
        color     : "inherit",
        textAlign : "end",
    },
});

const Message = (props) => {
    const intl = useIntl();
    const linkRenderer = new marked.Renderer();

    linkRenderer.link = (href, title, text) => {
        title = title ? title : href;
        text = text ? text : href;

        return `<a target='_blank' href='${href}' title='${title}'>${text}</a>`;
    };

    const allowedHTMLNodes = {
        ALLOWED_TAGS : ["a", "b", "strong", "i", "em", "u", "strike", "p", "br"],
        ALLOWED_ATTR : ["href", "target", "title"],
    };

    const { avatar, text, time, name, classes, isseen, sender, format } = props;

    return (
        <Box
            component="div"
            className={classnames(
                classes.root,
                sender === "client" ? classes.sent : classes.received,
                isseen ? classes.isSeen : null,
                classes[format]
            )}
            data-name={name}
            data-isseen={isseen}
            data-time={time}
            // ref={refMessage}
        >
            {/* Start Avatar */}
            {sender !== "client" && (
                <div className={classes.avatar}>
                    {(format === "single" || format === "combinedBegin") &&
                    "hidden" ? (
                            <img src={avatar} alt="Avatar" />
                        ) : null}
                </div>
            )}
            {/* End Avatar */}

            {/* Start Content */}
            <div className={classes.content}>
                {/* Name & Time */}
                {(format === "single" || format === "combinedBegin") && (
                    <Typography
                        component="p"
                        variant="subtitle2"
                        className={classnames(
                            sender === "client"
                                ? classes.textSent
                                : classes.textReceived
                        )}
                    >
                        <b>
                            {" "}
                            {sender === "client" ? (
                                `${intl.formatMessage({
                                    id             : "room.me",
                                    defaultMessage : "You",
                                })}`
                            ) : (
                                <b>{name}</b>
                            )}
                        </b>
                    </Typography>
                )}
                {/* /Name & Time */}

                <div
                    className={classnames(
                        classes.textContainer,
                        sender === "client"
                            ? classes.textSentContainer
                            : classes.textReceivedContainer
                    )}
                >
                    {/* Text */}
                    <Typography
                        className={classnames(classes.text)}
                        variant="subtitle2"
                        component="p"
                        dangerouslySetInnerHTML={{
                            __html : DOMPurify.sanitize(
                                marked.parse(text, { renderer: linkRenderer }),
                                allowedHTMLNodes
                            ),
                        }}
                    />
                    {/* /Text */}
                    <Typography
                        className={classnames(classes.time)}
                        component="p"
                        color="secondary"
                    >
                        <FormattedTime value={new Date(time)} />
                    </Typography>
                </div>
            </div>
            {/* End Content */}
        </Box>
    );
};

Message.propTypes = {
    avatar     : PropTypes.string,
    text       : PropTypes.string,
    time       : PropTypes.number,
    name       : PropTypes.string,
    classes    : PropTypes.object.isRequired,
    isseen     : PropTypes.bool.isRequired,
    sender     : PropTypes.string.isRequired,
    refMessage : PropTypes.object,
    format     : PropTypes.string.isRequired,
};

export default withStyles(styles)(Message);
