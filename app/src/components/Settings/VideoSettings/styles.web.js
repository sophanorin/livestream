const styles = (theme) => ({
    setting : {
        padding       : theme.spacing(2, 0),
        display       : "flex",
        flexDirection : "column",
        gap           : theme.spacing(2),
    },
    margin : {
        height : theme.spacing(3),
    },
    root : {
        width           : "100%",
        backgroundColor : theme.palette.background.paper,
    },
    switchLabel : {
        justifyContent : "space-between",
        flex           : "auto",
        display        : "flex",
        padding        : 0,
    },
    nested : {
        display       : "block",
        paddingTop    : 0,
        paddingBottom : 0,
        paddingLeft   : "25px",
        paddingRight  : "25px",
    },
    subTitle : {
        fontWeight : "bold",
    },
    formControl : {
        display : "flex",
    },
    padding : {
        padding : theme.spacing(0, 2),
    },
    divider : {
        margin : theme.spacing(4, 0),
    },
    formBlock : {
        marginBottom : theme.spacing(2),
    },
});

export default styles;
