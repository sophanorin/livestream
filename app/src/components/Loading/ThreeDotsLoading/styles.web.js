const styles = {
    root : {
        height         : "100%",
        width          : "100%",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        gap            : "10px",
    },

    dot : {
        width        : "20px",
        height       : "20px",
        borderRadius : "50%",
    },
    dot1 : {
        backgroundColor : "#22eed3",
        animation       : "$jump-up 1s 0.1s linear infinite",
    },
    dot2 : {
        backgroundColor : "#e8fb36",
        animation       : "$jump-up 1s 0.3s linear infinite",
    },
    dot3 : {
        backgroundColor : "#612b22",
        animation       : "$jump-up 1s 0.5s linear infinite",
    },
    "@keyframes jump-up" : {
        "50%" : {
            transform : "translate(0, 25px)",
        },
    },
};

export default styles;
