const styles = (theme) => ({
    root : {
        position       : "absolute",
        width          : "100%",
        height         : "100%",
        background     : "rgba(0,0,0,.2)",
        zIndex         : 999,
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        color          : "rgba(255,255,255,.8)",
    },
    loadingContainer : {
        position : "relative",
        width    : theme.spacing(15),
        height   : theme.spacing(15),
        margin   : `${theme.spacing(5)}px auto`,
    },
    loading : {
        width           : theme.spacing(15),
        height          : theme.spacing(15),
        position        : "absolute",
        borderRadius    : "100%",
        border          : "2px solid transparent",
        borderColor     : "transparent #fff transparent #FFF",
        transformOrigin : "50% 50%",
        animation       : "$rotateLoading 1.5s linear 0s infinite normal",
    },
    loadingText : {
        opacity       : 0,
        position      : "absolute",
        textAlign     : "center",
        textTransform : "uppercase",
        top           : "50%",
        left          : "50%",
        transform     : "translate(-50%, -50%)",
        animation     : "$loadingTextOpacity 2s linear 0s infinite normal",
    },
    "@keyframes rotateLoading" : {
        "0%"   : { transform: "rotate(0deg)" },
        "100%" : { transform: "rotate(360deg)" },
    },
    "@keyframes loadingTextOpacity" : {
        "0%"   : { opacity: 0 },
        "20%"  : { opacity: 0 },
        "50%"  : { opacity: 1 },
        "100%" : { opacity: 0 },
    },
});

export default styles;
