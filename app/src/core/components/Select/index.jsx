import { Select, withStyles } from "@material-ui/core";
import { ChevronDownIcon } from "../../../assets/icons";

const CustomSelect = withStyles(() => ({
    root : {
        "& MuiOutlinedInput-notchedOutline" : {
            borderColor : "black",
        },
    },
}))(({ classes, ...props }) => {
    return (
        <Select
            {...props}
            IconComponent={props.IconComponent || ChevronDownIcon}
            classes={{
                root     : classes.root,
                outlined : classes.root,
            }}
        />
    );
});

export default CustomSelect;
