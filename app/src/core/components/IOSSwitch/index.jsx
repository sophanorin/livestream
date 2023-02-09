import { Switch, withStyles } from "@material-ui/core";

const IOSSwitch = withStyles((theme) => ({
    root : {
        width   : 48,
        height  : 24,
        padding : 0,
        margin  : theme.spacing(1),
    },
    switchBase : {
        padding     : 1,
        "&$checked" : {
            transform    : "translateX(24px)",
            color        : theme.palette.common.white,
            "& + $track" : {
                backgroundColor : "#68BA6B",
                opacity         : 1,
                border          : "none",
            },
        },
        "&$focusVisible $thumb" : {
            color  : "#68BA6B",
            border : "6px solid #fff",
        },
    },
    thumb : {
        width  : 22,
        height : 22,
    },
    track : {
        borderRadius    : 24 / 2,
        border          : `1px solid ${theme.palette.grey[400]}`,
        backgroundColor : "#AEB1B7",
        opacity         : 1,
        transition      : theme.transitions.create(["background-color", "border"]),
    },
    checked      : {},
    focusVisible : {},
}))(({ classes, ...props }) => {
    return (
        <Switch
            focusVisibleClassName={classes.focusVisible}
            disableRipple
            classes={{
                root       : classes.root,
                switchBase : classes.switchBase,
                thumb      : classes.thumb,
                track      : classes.track,
                checked    : classes.checked,
            }}
            {...props}
        />
    );
});

export default IOSSwitch;
