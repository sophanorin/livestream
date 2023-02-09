const styles = (theme) => ({
    root : {
        position : "relative",
    },
    closeButton : {
        position : "absolute",
        padding  : theme.spacing(2),
        top      : 0,
        right    : 0,
    },
    dialogPaper : {
        padding                        : theme.spacing(5),
        width                          : "60vw",
        height                         : "70vh",
        borderRadius                   : "var(--peer-border-radius-lg)",
        [theme.breakpoints.down("md")] : {
            borderRadius : "var(--peer-border-radius-md)",
            width        : "75vw",
        },
        [theme.breakpoints.down("sm")] : {
            width : "80vw",
        },
        [theme.breakpoints.down("xs")] : {
            width : "90vw",
        },
    },
    dialogTitle : {
        padding : theme.spacing(1),
    },
    dialogContent : {
        padding : 0,
    },
    dialogHeader : {
        display        : "flex",
        justifyContent : "space-between",
        alignItems     : "center",
    },
    tabsHeader : {
        flexGrow                       : 1,
        margin                         : theme.spacing(1, 2),
        [theme.breakpoints.down("sm")] : {
            margin : theme.spacing(1),
        },
        "& .active" : {
            fontWeight      : "bold",
            backgroundColor : theme.palette.secondary.main,
        },
    },
    tab : {
        padding        : theme.spacing(1),
        minWidth       : "auto",
        justifyContent : "flex-start",
        borderRadius   : "var(--peer-border-radius-ssm)",
    },
    tabWrapper : {
        width                          : "auto",
        marginLeft                     : "40%",
        [theme.breakpoints.down("sm")] : {
            marginLeft : "auto",
        },
    },
});

export default styles;
