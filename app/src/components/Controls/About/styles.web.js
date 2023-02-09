const styles = (theme) => ({
    dialogPaper : {
        borderRadius                   : "var(--peer-border-radius-lg)",
        padding                        : `${theme.spacing(2)}px ${theme.spacing(2)}px`,
        [theme.breakpoints.down("sm")] : {
            borderRadius : "var(--peer-border-radius-md)",
        },
    },
    dialogHeader : {
        display        : "flex",
        justifyContent : "center",
        flexDirection  : "column",
    },
    content : {
        marginBottom                   : `${theme.spacing(2)}px`,
        [theme.breakpoints.down("sm")] : {
            marginTop : `${theme.spacing(1)}px`,
        },
    },
    about : {
        display        : "flex",
        justifyContent : "space-between",
    },
    closeBtn : {
        alignSelf : "flex-end",
    },
    title : {
        fontWeight : "bold",
    },
    logoContent : {
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        gap            : theme.spacing(1),
    },
    link : {
        display      : "block",
        textAlign    : "center",
        marginBottom : theme.spacing(1),
    },
    privacy : {
        color : "#24DB78",
    },
    aboutIcon : {
        width  : "100%",
        height : "100%",
    },
});

export default styles;
