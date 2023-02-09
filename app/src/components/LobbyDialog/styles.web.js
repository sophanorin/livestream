const styles = (theme) => ({
    root : {
        display              : "flex",
        width                : "100%",
        height               : "100%",
        backgroundColor      : "transparent",
        backgroundAttachment : "fixed",
        backgroundPosition   : "center",
        backgroundSize       : "cover",
        backgroundRepeat     : "no-repeat",
        position             : "absolute",
    },
    content : {
        width          : theme.spacing(70),
        display        : "flex",
        flexDirection  : "column",
        justifyContent : "center",
        alignItems     : "center",
        "&>img"        : {
            // width: "100%",
            height        : "100%",
            objectFit     : "cover",
            pointerEvents : "none",
            userSelect    : "none",
        },
        [theme.breakpoints.down("md")] : {
            "&" : {
                width : theme.spacing(60),
            },
        },
        [theme.breakpoints.down("sm")] : {
            "&" : {
                width : "auto",
            },
        },
    },
    title : {
        fontWeight : "bold",
    },
});

export default styles;
