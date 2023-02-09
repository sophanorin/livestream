const styles = (theme) => ({
    dialogPaper : {
        width                          : "100%",
        borderRadius                   : "var(--peer-border-radius-lg)",
        padding                        : theme.spacing(5),
        display                        : "flex",
        flexDirection                  : "column",
        // [theme.breakpoints.down("md")]: {
        //     "&": {
        //       padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
        //     },
        // },
        [theme.breakpoints.down("sm")] : {
            "&" : {
                padding : `${theme.spacing(1)}px ${theme.spacing(2)}px`,
            },
        },
    },
    shortcutKey : {
        padding         : theme.spacing(1),
        textAlign       : "center",
        backgroundColor : "#CFE6F4",
        color           : theme.palette.primary.main,
        fontWeight      : 600,
        whiteSpace      : "nowrap",
        borderRadius    : theme.spacing(1),
        border          : `1px dashed`,
        // lineHeight: 1,
        // backgroundPosition: "0 0, 0 0, 100% 0, 0 100%;",
        // backgroundSize: "2px 100%, 100% 2px, 2px 100% , 100% 2px;",
        // backgroundRepeat: "no-repeat;",
        // backgroundImage: `repeating-linear-gradient(0deg, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, transparent 5px, transparent 10px), repeating-linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, transparent 5px, transparent 10px), repeating-linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, transparent 5px, transparent 10px), repeating-linear-gradient(270deg, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, transparent 5px, transparent 10px);`,
        // borderImage: `repeating-linear-gradient(0deg, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, transparent 5px, transparent 10px);`,
    },
    dialogHeader : {
        display        : "flex",
        justifyContent : "space-between",
        alignItems     : "center",
    },
    dialogTitle : {
        padding : theme.spacing(1, 2, 1, 3),
    },
    shortcutText : {
        whiteSpace                     : "nowrap",
        [theme.breakpoints.down("sm")] : {
            whiteSpace : "break-spaces",
        },
    },
    shortcuts : {
        padding                        : `${theme.spacing(2)}px ${theme.spacing(10)}px`,
        [theme.breakpoints.down("md")] : {
            "&" : {
                padding : `${theme.spacing(2)}px ${theme.spacing(5)}px`,
            },
        },
        [theme.breakpoints.down("xs")] : {
            "&" : {
                padding : theme.spacing(2),
            },
        },
    },
    tabsHeader : {
        flexGrow     : 1,
        marginBottom : theme.spacing(1),
    },
});

export default styles;
