import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const TextButton = withStyles(
    (theme) => ({
        root : {
            transition : "color .5s",
            "&:hover"  : {
                color : theme.palette.primary.hover,
            },
        },
    }),
    { withTheme: true }
)(Button);

export default TextButton;
