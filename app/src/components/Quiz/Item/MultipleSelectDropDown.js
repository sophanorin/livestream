import { MenuItem, TextField } from "@material-ui/core";
import React from "react";

function MultipleSelectDropDown({
    value,
    onChange,
    error,
    helperText,
    options,
    ...rest
}) {
    return (
        <TextField
            value={value}
            SelectProps={{
                multiple : true,
                onChange : (event) => {
                    const { value } = event.target;
                    onChange(event, value);
                },
                SelectDisplayProps : {
                    style : {
                        padding : 12,
                    },
                },
            }}
            error={error}
            helperText={helperText}
            {...rest}
        >
            {options.map((option, index) => {
                const value =
                    option.value === "" ? option.default : option.value;

                if (!value) {return;}

                return (
                    <MenuItem key={index} value={value}>
                        {value}
                    </MenuItem>
                );
            })}
        </TextField>
    );
}

export default MultipleSelectDropDown;
