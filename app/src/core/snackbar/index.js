import { SnackbarProvider } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import { Avatar } from "@material-ui/core";
import classnames from "classnames";

import palette from "../../theme/palette";
import {
    RecordIcon,
    RoomIcon,
    FileIcon,
    BreakoutRoomIcon,
    PersonIcon,
} from "../../assets/icons";

const iconVariant = {
    default : (
        <Avatar className={classnames("icon", "icon-default")}>
            <BreakoutRoomIcon fontSize="small" />
        </Avatar>
    ),
    info : (
        <Avatar className={classnames("icon", "icon-info")}>
            <PersonIcon fontSize="small" />
        </Avatar>
    ),
    success : (
        <Avatar className={classnames("icon", "icon-success")}>
            <FileIcon
                fontSize="small"
                style={{ fill: palette.status.green.primary }}
            />
        </Avatar>
    ),
    error : (
        <Avatar className={classnames("icon", "icon-error")}>
            <RecordIcon fontSize="small" />
        </Avatar>
    ),
    warning : (
        <Avatar className={classnames("icon", "icon-warning")}>
            <RoomIcon fontSize="small" />
        </Avatar>
    ),
};

const StyledSnackBarProvider = withStyles((theme) => ({
    root : {
        color     : palette.basic.dark,
        "& .icon" : {
            width       : theme.spacing(4),
            height      : theme.spacing(4),
            marginRight : theme.spacing(1),
        },
        "& .icon-default" : {
            backgroundColor : palette.basic.dark,
        },
        "& .icon-error" : {
            backgroundColor : palette.status.red.primary,
        },
        "& .icon-info" : {
            backgroundColor : palette.primary.main,
        },
        "& .icon-success" : {
            backgroundColor : palette.status.green.primary,
        },
        "& .icon-warning" : {
            backgroundColor : palette.status.yellow.primary,
        },
        "& .MuiSnackbarContent-root" : {
            padding      : theme.spacing(1, 2),
            border       : "2px solid",
            borderColor  : palette.basic.dark,
            borderRadius : "var(--peer-border-radius-sm)",
            background   : `${palette.basic.white}`,
            color        : palette.basic.dark,
        },
        "& .MuiSnackbarContent-message" : {
            padding : theme.spacing(0.5, 0),
        },
    },
    variantSuccess : {
        borderColor : `${palette.status.green.primary} !important`,
    },
    variantInfo : {
        borderColor : `${palette.primary.main} !important`,
    },
    variantWarning : {
        borderColor : `${palette.status.yellow.primary} !important`,
    },
    variantError : {
        borderColor : `${palette.status.red.primary} !important`,
    },
}))((props) => <SnackbarProvider {...props} iconVariant={iconVariant} />);

export default StyledSnackBarProvider;
