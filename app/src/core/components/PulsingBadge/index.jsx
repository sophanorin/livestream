import { Badge } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";

const PulsingBadge = withStyles((theme) => ({
    badge : {
        backgroundColor : theme.palette.error.main,
        "&::after"      : {
            position     : "absolute",
            width        : "100%",
            height       : "100%",
            borderRadius : "50%",
            animation    : "$ripple 1.2s infinite ease-in-out",
            border       : `3px solid ${theme.palette.error.main}`,
            content      : '""',
        },
    },
    "@keyframes ripple" : {
        "0%" : {
            transform : "scale(.8)",
            opacity   : 1,
        },
        "100%" : {
            transform : "scale(2.4)",
            opacity   : 0,
        },
    },
}))(Badge);

export default PulsingBadge;
