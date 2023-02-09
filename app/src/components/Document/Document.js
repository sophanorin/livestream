import React, { useCallback, useState, useEffect } from "react";
import { connect } from "react-redux";
import { withRoomContext } from "../../RoomContext";
import PropTypes from "prop-types";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css";
import { withStyles } from "@material-ui/core/styles";
import { render } from "react-dom";

import { CloseIcon } from "../../assets/icons";
import { IconButton } from "@material-ui/core";
import MinimizeIcon from "@material-ui/icons/Minimize";

Quill.register("modules/cursors", QuillCursors);

const styles = (theme) => ({
    root : {
        backgroundColor : "#fff",
        borderRadius    : "var(--peer-border-radius-sm)",
        position        : "relative",
        overflowY       : "hidden",
        transition      : "all .3s ease",
        "& .ql-snow"    : {
            border : "none !important",
        },
        "& .ql-toolbar" : {
            overflowX    : "hidden",
            borderBottom : "var(--peer-border) !important",
            paddingRight : "40px !important",
        },
    },
    editor : {
        width     : "100%",
        // height: "100%",
        overflowY : "scroll",
    },
    actions : {
        position      : "absolute",
        top           : 0,
        right         : 0,
        margin        : theme.spacing(1),
        display       : "flex",
        alignItems    : "center",
        flexDirection : "row",
    },
});

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
];

function OnlineDocument(props) {
    const { classes, roomClient, style } = props;

    const [quill, setQuill] = useState(null);

    const wrapperRef = useCallback(async (wrapper) => {
        if (wrapper == null) {
            return;
        }

        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor, {
            theme   : "snow",
            modules : {
                toolbar : TOOLBAR_OPTIONS,
                cursors : {
                    transformOnTextChange : true,
                },
            },
            placeholder : "typing here...",
        });

        q.disable();
        q.setText("Loading...");
        setQuill(q);
        roomClient.getClassDocumentManager().quill = q;
    }, []);

    useEffect(() => {
        if (quill === null) {
            return;
        }

        const textChangehandler = (delta, oldDelta, source) => {
            if (source !== "user") {
                return;
            }
            roomClient.getClassDocumentManager().notify("text-change", delta);
        };

        const selectionChangeHandler = (range, oldRange, source) => {
            roomClient
                .getClassDocumentManager()
                .notify("selection-change", range);
        };

        quill.on("text-change", textChangehandler);
        quill.on("selection-change", selectionChangeHandler);

        return () => {
            quill.off("text-change", textChangehandler);
            quill.off("selection-change", selectionChangeHandler);
            roomClient.getClassDocumentManager().dispose();
        };
    }, [quill]);

    const handleCloseClassDocument = () => {
        roomClient.getClassDocumentManager().closeUI();
    };

    const handleMinimizeClassDocument = () => {
        roomClient.getClassDocumentManager().minimize();
    };

    return (
        <div className={classes.root}>
            <div style={style} ref={wrapperRef}></div>
            <div className={classes.actions}>
                <IconButton size="small" onClick={handleMinimizeClassDocument}>
                    <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleCloseClassDocument}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
        </div>
    );
}

OnlineDocument.propTypes = {
    classes    : PropTypes.object.isRequired,
    roomClient : PropTypes.object.isRequired,
};

export default withRoomContext(
    withStyles(styles, { withTheme: true })(OnlineDocument)
);
