const styles = (theme) => ({
    dialogTitle : {
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "space-between",
        alignItems     : "center",
        padding        : theme.spacing(2),
        paddingBottom  : 0,
    },
    dialogPaper : {
        borderRadius : "var(--peer-border-radius-lg)",
        padding      : `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(
            4
        )}px ${theme.spacing(2)}px`,
        width                          : "30vw",
        [theme.breakpoints.down("lg")] : {
            width : "40vw",
        },
        [theme.breakpoints.down("md")] : {
            borderRadius : "var(--peer-border-radius-md)",
            width        : "50vw",
        },
        [theme.breakpoints.down("sm")] : {
            width : "70vw",
        },
        [theme.breakpoints.down("xs")] : {
            width : "90vw",
        },
    },
    setting : {
        padding : theme.spacing(2),
    },
    formControl : {
        display : "flex",
    },
    subTitle : {
        fontWeight : "bold",
    },
    action : {
        justifyContent : "center",
    },
});

export default styles;
