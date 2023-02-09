import palette from "../../../theme/palette";

const styles = (theme) => ({
    root : {
        width           : "100vw",
        height          : "100vh",
        backgroundColor : "#fff",
    },
    titleWrapper : {
        gap : theme.spacing(1),
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
        gap            : theme.spacing(2),
    },

    button : {
        backgroundColor : palette.status.yellow.primary,
        color           : palette.basic.white,
        "&:hover"       : {
            backgroundColor : palette.status.yellow.secondary,
            color           : palette.basic.dark,
        },
    },
});

export default styles;
