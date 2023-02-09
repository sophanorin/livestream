import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRoomContext } from "../../../../../RoomContext";
import { withStyles } from "@material-ui/core/styles";
import { useIntl, FormattedTime, FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DescriptionIcon from "@material-ui/icons/Description";
import Paper from "@material-ui/core/Paper";
import classnames from "classnames";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GetAppIcon from "@material-ui/icons/GetApp";
import Tooltip from "@material-ui/core/Tooltip";
import Alert from "@material-ui/lab/Alert";

import palette from "../../../../../theme/palette";
import typography from "../../../../../theme/typography";
import { Box } from "@material-ui/core";
import {
    DownloadIcon,
    ImageIcon,
    WordIcon,
    PptIcon,
    ExcelIcon,
    TxtIcon,
    PdfIcon,
    FileIcon,
    PresentIcon,
    ScreenMirroringIcon,
} from "../../../../../assets/icons";
import { permissions } from "../../../../../permissions";
import { makePermissionSelector } from "../../../../../store/selectors";

const styles = (theme) => ({
    root : {
        display    : "flex",
        flexShrink : 0,
        wordWrap   : "break-word",
        wordBreak  : "break-all",
        // gap: theme.spacing(1.3),
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
        width          : "3rem",
        display        : "flex",
        justifyContent : "center",
        "& img"        : {
            borderRadius : "50%",
            width        : "2rem",
            height       : "2rem",
            alignSelf    : "start",
            objectFit    : "cover",
        },
    },
    content : {
        position : "relative",
        flex     : 12,
        margin   : theme.spacing(0, 1, 2, 1),
        "& p"    : {
            margin : "0",
        },
    },
    "@keyframes fadeIn" : {
        from : {
            backgroundColor : "#5f9b2d5c",
        },
        to : {
            backgroundColor : "#e0e0e085",
        },
    },
    isseen : {
        animation         : "$fadeIn 2s linear",
        animationFillMode : "forwards",
    },
    text : {
        margin     : 0,
        padding    : theme.spacing(1),
        fontWeight : "bold",
        // overflow: "hidden",
        // textOverflow: "ellipsis",
        // whiteSpace: "nowrap",
        // maxWidth: "220px",
    },
    fileInfo : {
        display    : "flex",
        alignItems : "center",
        padding    : theme.spacing(0),
    },
    uploadIcon : {
        animation  : "$swapUp 0.5s linear infinite alternate",
        transition : "all 0.5s linear",
    },
    "@keyframes swapUp" : {
        from : {
            opacity : 0,
        },
        to : {
            opacity : 1,
        },
    },
    textContainer : {
        display        : "flex",
        justifyContent : "space-between",
        padding        : theme.spacing(1),
        border         : `1px solid ${palette.primary.hover}`,
        borderRadius   : "var(--peer-border-radius-sm)",
        background     : palette.secondary.hover,
        color          : palette.basic.dark,
        boxShadow      : "var(--chat-shadow)",
        gap            : theme.spacing(1),
        position       : "relative",
    },
    textSentContainer : {
        flexDirection        : "row-reverse",
        borderTopRightRadius : 0,
    },
    textReceivedContainer : {
        flexDirection : "row",

        borderTopLeftRadius : 0,
    },
    textReceived : {},
    textSent     : {
        color     : "inherit",
        textAlign : "end",
    },
    time : {
        position   : "absolute",
        fontSize   : theme.spacing(1.3),
        bottom     : theme.spacing(0.5),
        right      : theme.spacing(1.5),
        color      : "inherit",
        wordBreak  : "normal",
        whiteSpace : "nowrap",
    },
    present : {
        position : "absolute",
        top      : theme.spacing(0),
        right    : theme.spacing(0),
        // transform: "translateY(100%)",
    },
    presentIcon : {
        width  : theme.spacing(2),
        height : theme.spacing(2),
    },
});

const File = (props) => {
    const intl = useIntl();
    const {
        roomClient,
        name,
        canShareFiles,
        url,
        time,
        file,
        classes,
        sender,
        isseen,
        format,
        avatar,
        canMarkPresentationFile,
    } = props;

    const GetFileIcon = () => {
        switch (file.fileType) {
        case "image/avif":
        case "image/bmp":
        case "image/gif":
        case "image/vnd.microsoft.icon":
        case "image/jpeg":
        case "image/png":
        case "image/svg+xml":
        case "image/tiff":
        case "image/webp":
            return <ImageIcon />;

        case "text/plain":
        case "text/xml":
        case "text/css":
        case "text/csv":
        case "text/html":
        case "text/calender":
        case "text/javascript":
            return <TxtIcon />;
        case "application/vnd.ms-powerpoint":
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return <PptIcon />;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <WordIcon />;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return <ExcelIcon />;
        case "application/pdf":
            return <PdfIcon />;
        default:
            return <FileIcon />;
        }
    };

    const handlePresentFile = async () => {
        await roomClient.presentFile({
            peerId     : file.peerId,
            name       : file.name,
            picture    : file.picture,
            url        : file.url,
            fileType   : file.fileType,
            fileName   : file.fileName,
            time       : file.time,
            pageNumber : 1,
        });
    };

    return (
        <Box
            className={classnames(
                classes.root,
                sender === "client" ? classes.sent : classes.received,
                isseen && sender === "response" ? classes.isseen : null,
                classes[format]
            )}
            data-name={name}
            data-isseen={isseen}
            data-time={time}
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

            {/* Content */}
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
                    {/* Download File */}
                    <div className={classes.fileInfo}>
                        {GetFileIcon()}
                        <Typography
                            variant="subtitle2"
                            component="p"
                            className={classes.text}
                        >
                            {file.fileName}
                        </Typography>

                        <Tooltip
                            title={
                                file.upload
                                    ? intl.formatMessage({
                                        id             : "filesharing.uploading",
                                        defaultMessage : "Uploading",
                                    })
                                    : intl.formatMessage({
                                        id             : "filesharing.download",
                                        defaultMessage : "Download",
                                    })
                            }
                            placement="top"
                            enterDelay={700}
                            enterNextDelay={700}
                        >
                            <IconButton
                                variant="contained"
                                component="span"
                                className={classes.button}
                                // disabled={!canShareFiles}
                                aria-label={
                                    file.upload
                                        ? intl.formatMessage({
                                            id             : "filesharing.uploading",
                                            defaultMessage : "Uploading",
                                        })
                                        : intl.formatMessage({
                                            id             : "filesharing.download",
                                            defaultMessage : "Download",
                                        })
                                }
                            >
                                {file.upload ? (
                                    <CloudUploadIcon
                                        className={classes.uploadIcon}
                                        fontSize="small"
                                    />
                                ) : (
                                    <DownloadIcon
                                        color="primary"
                                        fontSize="small"
                                        onClick={
                                            () =>
                                                roomClient.handleDownload(
                                                    url
                                                )
                                        }
                                    />
                                )}
                            </IconButton>
                        </Tooltip>
                    </div>
                    {canMarkPresentationFile &&
                        file.fileType === "application/pdf" && (
                        <IconButton
                            size="small"
                            className={classnames(classes.present)}
                            onClick={handlePresentFile}
                        >
                            <ScreenMirroringIcon
                                className={classes.presentIcon}
                            />
                        </IconButton>
                    )}

                    {/* /Download File */}
                    <Typography
                        className={classnames(classes.time)}
                        component="p"
                        color="secondary"
                    >
                        <FormattedTime value={new Date(time)} />
                    </Typography>
                </div>

                {/* {!canShareFiles && (
                    <div>
                        <Alert severity="error">
                            <FormattedMessage
                                id="label.fileSharingUnsupported"
                                defaultMessage="File sharing not supported"
                            />
                        </Alert>
                    </div>
                )} */}
            </div>
            {/* /Content */}
        </Box>
    );
};

File.propTypes = {
    roomClient              : PropTypes.object.isRequired,
    url                     : PropTypes.string.isRequired,
    time                    : PropTypes.number.isRequired,
    name                    : PropTypes.string.isRequired,
    picture                 : PropTypes.string,
    canShareFiles           : PropTypes.bool.isRequired,
    file                    : PropTypes.object.isRequired,
    classes                 : PropTypes.object.isRequired,
    isseen                  : PropTypes.bool,
    sender                  : PropTypes.string.isRequired,
    refMessage              : PropTypes.object,
    format                  : PropTypes.string.isRequired,
    avatar                  : PropTypes.string,
    canMarkPresentationFile : PropTypes.bool,
};

const mapStateToProps = (state, { time, fileName }) => {
    const canMarkPresentationFileSelector = makePermissionSelector(
        permissions.MARK_PRESENTATION_FILE
    );

    return {
        file : state.files.files.filter(
            (item) => item.time === time && item.fileName === fileName
        )[0],
        canShareFiles           : state.me.canShareFiles,
        canMarkPresentationFile : canMarkPresentationFileSelector(state),
    };
};

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.files === next.files &&
                prev.me.canShareFiles === next.me.canShareFiles
            );
        },
    })(withStyles(styles)(File))
);
