import palette from "./palette";

const overrides = {
    MuiMenuItem : {
        root : {
            margin       : 8,
            border       : "none",
            borderRadius : 10,
        },
    },
    MuiListItem : {
        root : {
            // backgroundColor: palette.secondary.main,
            "&$gutters:hover" : {
                backgroundColor : palette.secondary.hover,
            },
            "&$selected" : {
                backgroundColor : palette.secondary.hover,
            },
        },
    },
    MuiTabs : {
        root : {
            alignItems           : "center",
            "&$textColorPrimary" : {
                color : palette.text.primary,
            },
        },
        flexContainer : {
            justifyContent : "space-between",
        },
    },
    MuiTab : {
        root : {
            "&$textColorPrimary" : {
                color : palette.text.primary,
            },
        },
    },
    MuiRadio : {
        root : {
            color       : palette.text.primary,
            "&$checked" : {
                color : palette.primary.main,
            },
        },
    },
    MuiAppBar : {
        colorPrimary : {
            backgroundColor : "#313131",
        },
    },
    MuiButton : {
        root : {
            textTransform : "none",
            fontWeight    : "600",
            fontSize      : "12px",
        },
        containedPrimary : {
            backgroundColor : "#1855AB",
            fontWeight      : "bold",
            borderRadius    : 6,
            "&:hover"       : {
                backgroundColor : "#0f75b5",
            },
        },
        containedSecondary : {
            backgroundColor : "#F84D4D",
            // textTransform: "capitalize",
            color           : palette.basic.white,
            fontWeight      : "bold",
            borderRadius    : 8,
            "&:hover"       : {
                backgroundColor : "#F84D4D",
            },
        },
    },
    MuiIconButton : {
        root : {
            color              : palette.basic.dark,
            "&$colorSecondary" : {
                color : palette.basic.white,
            },
        },
    },
    MuiFab : {
        root : {
            boxShadow : "none",
        },
        primary : {
            color           : "#fff",
            backgroundColor : "#1183ca",
            "&:hover"       : {
                backgroundColor : "#0f75b5",
            },
        },
        secondary : {
            color           : "#fff",
            backgroundColor : "#F84D4D",
            "&:hover"       : {
                backgroundColor : "#df4545",
            },
        },
    },
    MuiSvgIcon : {
        root : {
            // "&$default": {
            //     color: palette.basic.dark,
            // },
            "&$colorPrimary" : {
                color : palette.primary.main,
            },
            "&$colorSecondary" : {
                color : palette.status.red.primary,
            },
            "&$colorError" : {
                color : palette.status.red.primary,
            },
        },
    },
    MuiBadge : {
        colorPrimary : {
            backgroundColor : palette.status.red.primary,
        },
    },
    MuiOutlinedInput : {
        root : {
            borderRadius : "10px",
        },
        notchedOutline : {
            borderColor : palette.secondary.main,
        },
    },
};

export default overrides;
