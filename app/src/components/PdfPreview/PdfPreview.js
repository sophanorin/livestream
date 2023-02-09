import { withStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import { sampleBase64pdf } from "./base64";

import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import MinimizeIcon from "@material-ui/icons/Minimize";

import { IconButton, Typography } from "@material-ui/core";
import { CloseIcon } from "../../assets/icons";
import palette from "../../theme/palette";
import { withRoomContext } from "../../RoomContext";
import { makePermissionSelector } from "../../store/selectors";
import { permissions } from "../../permissions";
import { connect } from "react-redux";

const styles = (theme) => ({
    root : {
        transition     : "all .3s ease",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
    },
    document : {
        height   : "100%",
        position : "relative",
    },
    page : {
        height       : "100%",
        "& > canvas" : {
            height : "100% !important",
            width  : "auto !important",
        },
    },
    pagination : {
        position       : "absolute",
        bottom         : 0,
        left           : "50%",
        transform      : "translate(-50%,-80%)",
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "center",
        alignItems     : "center",
    },
    actions : {
        position      : "absolute",
        top           : theme.spacing(0.5),
        right         : theme.spacing(1),
        zIndex        : 999,
        display       : "flex",
        flexDirection : "row",
        gap           : theme.spacing(0.5),
    },
    buttons : {
        borderRadius : "var(--peer-border-radius-ssm)",
        background   : palette.basic.gray,
        "&:hover"    : {
            background : palette.basic.gray,
        },
    },
    buttonIcon : {
        width  : theme.spacing(1.5),
        height : theme.spacing(1.5),
    },
});

function PdfPreview(props) {
    const { style, classes, roomClient, file, canMarkPresentationFile } = props;

    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const handleNextPage = async () => {
        if (file.pageNumber + 1 > numPages) {return;}

        await roomClient.changePageNumber(file.time, file.pageNumber + 1);
    };

    const handlePreviousPage = async () => {
        if (file.pageNumber - 1 < 1) {return;}

        await roomClient.changePageNumber(file.time, file.pageNumber - 1);
    };

    const handleClosePresentFile = () => {
        roomClient.closePresentationFile();
    };

    const handleMinimizePresentFile = () => {
        roomClient.minimizePresentationFile();
    };

    return (
        <div className={classes.root} style={style}>
            <Document
                className={classes.document}
                file={file.url}
                onLoadSuccess={onDocumentLoadSuccess}
            >
                <Page pageNumber={file.pageNumber} className={classes.page} />
                <div className={classes.pagination}>
                    {canMarkPresentationFile && (
                        <IconButton size="small" onClick={handlePreviousPage}>
                            <NavigateBeforeIcon fontSize="small" />
                        </IconButton>
                    )}

                    <Typography component="p" variant="subtitle2">
                        {file.pageNumber}/{numPages}
                    </Typography>

                    {canMarkPresentationFile && (
                        <IconButton size="small" onClick={handleNextPage}>
                            <NavigateNextIcon fontSize="small" />
                        </IconButton>
                    )}
                </div>

                {canMarkPresentationFile && (
                    <div className={classes.actions}>
                        <IconButton
                            className={classes.buttons}
                            size="small"
                            onClick={handleMinimizePresentFile}
                        >
                            <MinimizeIcon
                                className={classes.buttonIcon}
                                fontSize="small"
                            />
                        </IconButton>
                        <IconButton
                            className={classes.buttons}
                            size="small"
                            onClick={handleClosePresentFile}
                        >
                            <CloseIcon
                                className={classes.buttonIcon}
                                fontSize="small"
                            />
                        </IconButton>
                    </div>
                )}
            </Document>
        </div>
    );
}

const mapStateToProps = (state) => {
    const canMarkPresentationFileSelector = makePermissionSelector(
        permissions.MARK_PRESENTATION_FILE
    );
    return {
        canMarkPresentationFile : canMarkPresentationFileSelector(state),
    };
};

export default withRoomContext(
    connect(mapStateToProps)(withStyles(styles)(PdfPreview))
);
