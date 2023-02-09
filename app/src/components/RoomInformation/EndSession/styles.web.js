const styles = (theme) => ({
    root : {
        width           : "100vw",
        height          : "100vh",
        backgroundColor : "#fff",
    },
    title : {
        fontWeight : "bold",
    },
    cardRoot : {
        borderRadius                   : "var(--peer-border-radius-lg)",
        width                          : theme.spacing(70),
        boxShadow                      : "0px 0px 20px rgba(0,0,0,0.1)",
        display                        : "flex",
        justifyContent                 : "center",
        alignItems                     : "center",
        flexDirection                  : "column",
        padding                        : `${theme.spacing(3)}px ${theme.spacing(5)}px`,
        [theme.breakpoints.down("md")] : {
            "&" : {
                width        : theme.spacing(60),
                borderRadius : "var(--peer-border-radius-md)",
            },
        },
        [theme.breakpoints.down("sm")] : {
            "&" : {
                padding : `${theme.spacing(0)}px ${theme.spacing(3)}px`,
                width   : "auto",
            },
        },
    },
    cardContent : {
        width          : "100%",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        flexDirection  : "column",
        gap            : theme.spacing(1),
    },
    cardActions : {
        width          : "100%",
        padding        : theme.spacing(2),
        justifyContent : "center",
    },
    rating : {
        padding                        : `${theme.spacing(4)}px ${theme.spacing(8)}px`,
        borderRadius                   : "var(--peer-border-radius-md)",
        display                        : "flex",
        flexDirection                  : "column",
        justifyContent                 : "center",
        alignItems                     : "center",
        gap                            : theme.spacing(2),
        [theme.breakpoints.down("sm")] : {
            "&" : {
                padding : theme.spacing(4),
            },
        },
    },
    stars : {
        width          : "100%",
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "space-between",
        alignItems     : "center",
        gap            : theme.spacing(1),
    },
    star : {
        cursor                         : "pointer",
        [theme.breakpoints.down("xs")] : {
            "&" : {
                fontSize : theme.spacing(3),
            },
        },
    },
    tags : {
        width          : "100%",
        display        : "flex",
        flexDirection  : "row",
        justifyContent : "space-between",
        alignItems     : "center",
        gap            : theme.spacing(1),
    },
});

export default styles;
