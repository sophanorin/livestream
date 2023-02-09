const styles = (theme) => ({
    root : {
        height   : "100%",
        width    : "100%",
        "& span" : {
            display  : "block",
            position : "absolute",
            top      : 0,
            left     : 0,
            bottom   : 0,
            right    : 0,
            margin   : "auto",
            height   : theme.spacing(10),
            width    : theme.spacing(10),
        },
        "&>span::before, &>span::after" : {
            content      : "''",
            display      : "block",
            position     : "absolute",
            top          : 0,
            left         : 0,
            bottom       : 0,
            right        : 0,
            margin       : "auto",
            height       : theme.spacing(10),
            width        : theme.spacing(10),
            border       : "2px solid #FFF",
            borderRadius : "50%",
            opacity      : 0,
            animation    :
                "$loader-6-1 1.5s cubic-bezier(0.075, 0.820, 0.165, 1.000) infinite",
        },
        "&>span::after" : {
            animation :
                "$loader-6-2 1.5s cubic-bezier(0.075, 0.820, 0.165, 1.000) .25s infinite;",
        },
    },
    "@keyframes loader-6-1" : {
        "0%"   : { transform: "translate3d(0, 0, 0) scale(0); opacity: 1;" },
        "100%" : {
            transform : "translate3d(0, 0, 0) scale(1.5); opacity: 0;",
        },
    },
    "@keyframes loader-6-2" : {
        "0%"   : { transform: "translate3d(0, 0, 0) scale(0); opacity: 1;" },
        "100%" : { transform: "translate3d(0, 0, 0) scale(1); opacity: 0;" },
    },
});

export default styles;
