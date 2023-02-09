const styles = (theme) => ({
    root : {
        display              : "flex",
        justifyContent       : "center",
        alignItems           : "center",
        height               : theme.spacing(3),
        width                : "fit-content",
        "&>div:nth-child(1)" : {
            left              : "1px",
            animationDuration : "474ms",
        },
        "&>:nth-child(2)" : {
            left              : "12px",
            animationDuration : "433ms",
        },
        "&>:nth-child(3)" : {
            left              : "23px",
            animationDuration : "407ms",
        },
        "&>:nth-child(4)" : {
            left              : "34px",
            animationDuration : "458ms",
        },
        "&>:nth-child(5)" : {
            left              : "45px",
            animationDuration : "400ms",
        },
        "&>:nth-child(6)" : {
            left              : "56px",
            animationDuration : "427ms",
        },
        "&>:nth-child(7)" : {
            left              : "67px",
            animationDuration : "441ms",
        },
        "&>:nth-child(8)" : {
            left              : "78px",
            animationDuration : "419ms",
        },
        "&>:nth-child(9)" : {
            left              : "89px",
            animationDuration : "487ms",
        },
        "&>:nth-child(10)" : {
            left              : "100px",
            animationDuration : "442ms",
        },
    },
    "@keyframes sound" : {
        "0%" : {
            opacity : 0.35,
            height  : theme.spacing(0.3),
        },
        "100%" : {
            opacity : 1,
            height  : theme.spacing(3),
        },
    },
    bar : {
        background   : "#68BA6B",
        bottom       : "1px",
        height       : theme.spacing(0.3),
        width        : theme.spacing(0.3),
        margin       : "0px 4px",
        borderRadius : "5px",
        animation    : "$sound 0ms -600ms linear infinite alternate",
    },
});

export default styles;
