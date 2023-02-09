import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../../../RoomContext";
import { useIntl } from "react-intl";
import { permissions } from "../../../../permissions";
import { makePermissionSelector } from "../../../../store/selectors";
import Paper from "@material-ui/core/Paper";
import { Grid } from "@material-ui/core";
import { EditorState, RichUtils, ContentState } from "draft-js";
import Editor from "draft-js-plugins-editor";
import createSingleLinePlugin from "draft-js-single-line-plugin";
import { stateToHTML } from "draft-js-export-html";
import "draft-js/dist/Draft.css";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";

import IconButton from "@material-ui/core/IconButton";
// import SendIcon from "@material-ui/icons/Send";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import SortIcon from "@material-ui/icons/Sort";
import { SendIcon, SaveIcon, AttachIcon } from "../../../../assets/icons";
import palette from "../../../../theme/palette";
import * as requestActions from '../../../../store/actions/requestActions'

const styles = (theme) => ({
    root : {
        padding         : theme.spacing(0),
        display         : "flex",
        alignItems      : "center",
        borderRadius    : 0,
        backgroundColor : "transparent",
    },
    inputContainer : {
        backgroundColor : palette.basic.dark,
        padding         : theme.spacing(2),
        borderRadius    : "var(--peer-border-radius-ssm)",
    },
    input : {
        flex           : 1,
        "&[type=file]" : {
            display : "none",
        },
        padding                : "8px 4px",
        lineHeight             : "20px",
        fontSize               : "16px",
        width                  : "50px",
        maxHeight              : theme.spacing(5),
        overflowY              : "scroll",
        overflowWrap           : "break-word",
        "&::-webkit-scrollbar" : {
            width  : 0,
            height : 0,
        },
        "& .DraftEditor-root" : {
            color : palette.basic.white,
        },
        "& .public-DraftEditorPlaceholder-root" : {
            fontWeight : "bold",
            color      : palette.basic.white,
        },
    },
    icon : {
        color : palette.basic.white,
    },
    disabled : {
        color : `${palette.basic.disabled} !important`,
    },
    smallIcon : {
        padding : theme.spacing(1),
    },
});

const MAX_FILE_SIZE = window.config.maxFileSize || 2000000;

const ChatInput = (props) => {
    const {
        roomClient,
        displayName,
        peerId,
        picture,
        canChat,
        canShare,
        classes,
        browser,
        canShareFiles,
        chat,
        files,
        toolAreaOpen,
    } = props;

    const intl = useIntl();

    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty()
    );

    const [message, setMessage] = useState("");

    const inputRef = useRef(null);

    const chatItemsLength = files.length + chat.messages.length;

    const singleLinePlugin = createSingleLinePlugin();

    const clearInput = () => {
        setEditorState(
            EditorState.moveFocusToEnd(
                EditorState.push(
                    editorState,
                    ContentState.createFromText(""),
                    "remove-range"
                )
            )
        );
    };

    const isMessageEmpty = () => message === "<br>";

    const sendMessage = () => {
        if (!isMessageEmpty()) {
            roomClient.sendChatMessage({
                type   : "message",
                time   : Date.now(),
                sender : "response",
                isRead : null,
                name   : displayName,
                peerId,
                picture,
                text   : message,
            });

            clearInput();
        }
    };

    const attachFile = async (e) => {
        if (e.target.files.length > 0) {
            await props.roomClient.shareFiles({
                type       : "file",
                time       : Date.now(),
                sender     : "response",
                isRead     : null,
                name       : displayName,
                peerId,
                picture,
                attachment : e.target.files,
            });
        }
    };

    useEffect(() => {
        setMessage(
            stateToHTML(editorState.getCurrentContent(), {
                defaultBlockTag : null,
            })
        );
    }, [editorState]);

    // Autofocus on input when chat is visible
    useEffect(() => {
        inputRef.current.focus();
    }, [toolAreaOpen]);

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);

        if (newState) {
            setEditorState(newState);

            return "handled";
        }

        return "not-handled";
    };

    const handleInlineStyled = (style) =>
        editorState.getCurrentInlineStyle().has(style);

    const handleUnderlineClick = () =>
        setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));

    const handleBoldClick = () =>
        setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));

    const handleItalicClick = () =>
        setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));

    const handleAttachFile = (e) => attachFile(e);

    const handleIsMessageEmpty = () => isMessageEmpty();

    const handleSendMessage = () => sendMessage();

    const handleReturn = () => sendMessage();

    return (
        <Paper className={classes.root} elevation={0}>
            <Grid container direction="column">
                <Grid
                    item
                    container
                    justifyContent="space-between"
                    alignItems="center"
                >
                    {/* Buttons of format */}
                    {browser.platform !== "mobile" ? (
                        <Grid item>
                            {/* Button bold */}
                            <Tooltip
                                title={intl.formatMessage({
                                    id             : "label.bold",
                                    defaultMessage : "Bold",
                                })}
                                placement="top"
                                enterDelay={700}
                                enterNextDelay={700}
                            >
                                <IconButton
                                    size="small"
                                    classes={{ sizeSmall: classes.smallIcon }}
                                    disabled={!canChat}
                                    aria-label={intl.formatMessage({
                                        id             : "label.bold",
                                        defaultMessage : "Bold",
                                    })}
                                    color={
                                        handleInlineStyled("BOLD")
                                            ? "primary"
                                            : "default"
                                    }
                                    component="span"
                                    onClick={handleBoldClick}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <FormatBoldIcon />
                                </IconButton>
                            </Tooltip>
                            {/* /Button bold */}

                            {/* Button italic */}
                            <Tooltip
                                title={intl.formatMessage({
                                    id             : "label.italic",
                                    defaultMessage : "Italic",
                                })}
                                placement="top"
                                enterDelay={700}
                                enterNextDelay={700}
                            >
                                <IconButton
                                    size="small"
                                    classes={{ sizeSmall: classes.smallIcon }}
                                    disabled={!canChat}
                                    aria-label={intl.formatMessage({
                                        id             : "label.italic",
                                        defaultMessage : "Italic",
                                    })}
                                    color={
                                        handleInlineStyled("ITALIC")
                                            ? "primary"
                                            : "default"
                                    }
                                    component="span"
                                    onClick={handleItalicClick}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <FormatItalicIcon />
                                </IconButton>
                            </Tooltip>
                            {/* /Button italic */}

                            {/* Button underline */}
                            <Tooltip
                                title={intl.formatMessage({
                                    id             : "label.underline",
                                    defaultMessage : "Underline",
                                })}
                                placement="top"
                                enterDelay={700}
                                enterNextDelay={700}
                            >
                                <IconButton
                                    size="small"
                                    classes={{ sizeSmall: classes.smallIcon }}
                                    disabled={!canChat}
                                    aria-label={intl.formatMessage({
                                        id             : "label.underline",
                                        defaultMessage : "Underline",
                                    })}
                                    color={
                                        handleInlineStyled("UNDERLINE")
                                            ? "primary"
                                            : "default"
                                    }
                                    component="span"
                                    onClick={handleUnderlineClick}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <FormatUnderlinedIcon />
                                </IconButton>
                            </Tooltip>
                            {/* /Button underline */}
                        </Grid>
                    ) : (
                        <Grid item />
                    )}
                    {/* /Buttons of format */}

                    {/* Buttons of actions */}
                    <Grid item>
                        {/* Button sort chat */}
                        {/* <React.Fragment>
                            {chat.order === "asc" ? (
                                <Tooltip
                                    title={intl.formatMessage({
                                        id             : "label.sortAscending",
                                        defaultMessage : "Sort ascending",
                                    })}
                                    placement="top"
                                    enterDelay={700}
                                    enterNextDelay={700}
                                >
                                    <IconButton
                                        className={classes.IconButton}
                                        aria-label={intl.formatMessage({
                                            id             : "label.sortAscending",
                                            defaultMessage : "Sort ascending",
                                        })}
                                        component="span"
                                        disabled={chat.messages.length < 1}
                                        onClick={() =>
                                            roomClient.sortChat("desc")
                                        }
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <SortIcon
                                            style={{
                                                transform :
                                                    "rotateX(180deg) rotateY(180deg)",
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    title={intl.formatMessage({
                                        id             : "label.sortDescending",
                                        defaultMessage : "Sort descending",
                                    })}
                                    placement="top"
                                    enterDelay={700}
                                    enterNextDelay={700}
                                >
                                    <IconButton
                                        className={classes.IconButton}
                                        aria-label={intl.formatMessage({
                                            id             : "label.sortDescending",
                                            defaultMessage : "Sort descending",
                                        })}
                                        component="span"
                                        disabled={chat.messages.length < 1}
                                        onClick={() =>
                                            roomClient.sortChat("asc")
                                        }
                                    >
                                        <SortIcon
                                            style={{
                                                transform : "rotateY(180deg)",
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </React.Fragment> */}
                        {/* /Button sort chat */}

                        {/* Button save chat */}
                        {/* {browser.platform !== "mobile" && (
                            <React.Fragment>
                                <Tooltip
                                    title={intl.formatMessage({
                                        id             : "label.saveChat",
                                        defaultMessage : "Save Chat",
                                    })}
                                    placement="top"
                                    enterDelay={700}
                                    enterNextDelay={700}
                                >
                                    <IconButton
                                        size="small"
                                        color="default"
                                        classes={{
                                            sizeSmall : classes.smallIcon,
                                        }}
                                        disabled={
                                            !canShareFiles ||
                                            !canShare ||
                                            chatItemsLength === 0
                                        }
                                        aria-label={intl.formatMessage({
                                            id             : "label.saveChat",
                                            defaultMessage : "Save Chat",
                                        })}
                                        component="span"
                                        onClick={() => roomClient.saveChat()}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <SaveIcon />
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        )} */}
                        {/* /Button save chat */}

                        {/* Button share file */}
                        <React.Fragment>
                            <input
                                id="contained-button-file"
                                className={classes.input}
                                disabled={!canShare}
                                type="file"
                                multiple
                                onChange={handleAttachFile}
                            />
                            <label htmlFor="contained-button-file">
                                <Tooltip
                                    title={intl.formatMessage({
                                        id             : "label.shareFile",
                                        defaultMessage : "Share file (2MB)",
                                    })}
                                    placement="top"
                                    enterDelay={700}
                                    enterNextDelay={700}
                                >
                                    <IconButton
                                        size="small"
                                        classes={{
                                            sizeSmall : classes.smallIcon,
                                        }}
                                        aria-label={intl.formatMessage({
                                            id             : "label.shareFile",
                                            defaultMessage : "Share file",
                                        })}
                                        disabled={ !canShare}
                                        component="span"
                                        // onClick={(e) => (e.target.value = null)}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <AttachIcon size="small" />
                                    </IconButton>
                                </Tooltip>
                            </label>
                        </React.Fragment>
                        {/* /Button of share file */}

                        {/* Button share gallery file (mobile) */}
                        {browser.platform === "mobile" &&
                            canShare && (
                            <React.Fragment>
                                <input
                                    className={classes.input}
                                    type="file"
                                    disabled={!canShare}
                                    onChange={handleAttachFile}
                                    accept="image/*"
                                    id="share-files-gallery-button"
                                />

                                <label htmlFor="share-files-gallery-button">
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id             : "label.shareGalleryFile",
                                            defaultMessage :
                                                    "Share gallery file",
                                        })}
                                        placement="top"
                                        enterDelay={700}
                                        enterNextDelay={700}
                                    >
                                        <IconButton
                                            size="small"
                                            classes={{
                                                sizeSmall :
                                                        classes.smallIcon,
                                            }}
                                            disabled={
                                                !canShare
                                            }
                                            aria-label={intl.formatMessage({
                                                id             : "label.shareGalleryFile",
                                                defaultMessage :
                                                        "Share gallery file",
                                            })}
                                            component="span"
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                        >
                                            <PhotoCamera />
                                        </IconButton>
                                    </Tooltip>
                                </label>
                            </React.Fragment>
                        )}
                        {/* /Button share gallery file (mobile) */}
                    </Grid>
                    {/* /Buttons of actions */}
                </Grid>

                <Grid
                    className={classes.inputContainer}
                    item
                    container
                    direction="row"
                    alignItems="center"
                >
                    {/* Input field */}
                    <div className={classes.input}>
                        <Editor
                            placeholder={intl.formatMessage({
                                id             : "label.chatInput",
                                defaultMessage : "Write message here",
                            })}
                            editorState={editorState}
                            onChange={setEditorState}
                            handleKeyCommand={
                                browser.platform !== "mobile"
                                    ? handleKeyCommand
                                    : null
                            }
                            handleReturn={handleReturn}
                            plugins={[singleLinePlugin]}
                            blockRenderMap={singleLinePlugin.blockRenderMap}
                            ref={inputRef}
                        />
                    </div>
                    {/* /Input field */}

                    {/* Button send message */}
                    <Tooltip
                        title={intl.formatMessage({
                            id             : "label.send",
                            defaultMessage : "Send",
                        })}
                        placement="top"
                        enterDelay={700}
                        enterNextDelay={700}
                    >
                        <IconButton
                            size="small"
                            className={classes.icon}
                            classes={{
                                sizeSmall : classes.smallIcon,
                                disabled  : classes.disabled,
                            }}
                            aria-label={intl.formatMessage({
                                id             : "label.send",
                                defaultMessage : "Send",
                            })}
                            disabled={!canChat || handleIsMessageEmpty()}
                            onClick={handleSendMessage}
                        >
                            <SendIcon />
                        </IconButton>
                    </Tooltip>
                    {/* /Button send message */}
                </Grid>
            </Grid>
        </Paper>
    );
};

ChatInput.propTypes = {
    roomClient    : PropTypes.object.isRequired,
    displayName   : PropTypes.string,
    peerId        : PropTypes.string.isRequired,
    picture       : PropTypes.string,
    canChat       : PropTypes.bool.isRequired,
    canShare      : PropTypes.bool.isRequired,
    classes       : PropTypes.object.isRequired,
    browser       : PropTypes.object.isRequired,
    canShareFiles : PropTypes.bool.isRequired,
    chat          : PropTypes.object.isRequired,
    files         : PropTypes.object.isRequired,
    toolAreaOpen  : PropTypes.bool.isRequired,
};

const makeMapStateToProps = () => {
    const hasPermission = makePermissionSelector(permissions.SEND_CHAT);
    const mapStateToProps = (state) => ({
        displayName   : state.settings.displayName,
        peerId        : state.me.id,
        picture       : state.me.picture,
        canChat       : hasPermission(state),
        canShare      : hasPermission(state),
        browser       : state.me.browser,
        canShareFiles : state.me.canShareFiles,
        chat          : state.chat,
        files         : state.files,
        toolAreaOpen  : state.toolarea.toolAreaOpen,
    });

    return mapStateToProps;
};

export default withRoomContext(
    connect(makeMapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room === next.room &&
                prev.me.browser === next.me.browser &&
                prev.me.roles === next.me.roles &&
                prev.me.canShareFiles === next.me.canShareFiles &&
                prev.peers === next.peers &&
                prev.settings.displayName === next.settings.displayName &&
                prev.me.picture === next.me.picture &&
                prev.chat === next.chat &&
                prev.files === next.files &&
                prev.toolarea.toolAreaOpen === next.toolarea.toolAreaOpen
            );
        },
    })(withStyles(styles)(ChatInput))
);
