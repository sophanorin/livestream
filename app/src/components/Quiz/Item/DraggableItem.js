import { Box, IconButton, TextField } from "@material-ui/core";
import React from "react";
import { DeleteIcon, ReorderIcon } from "../../../assets/icons";

function DraggableItem({
    error,
    helperText,
    value,
    index,
    onBlur,
    onChange,
    onDelete,
    provided,
}) {
    return (
        <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            display="flex"
            flexDirection="row"
            alignItems="center"
        >
            <IconButton size="small" {...provided.dragHandleProps}>
                <ReorderIcon fontSize="small" />
            </IconButton>

            <TextField
                size="small"
                name={`answers.${index}.value`}
                value={value.value}
                placeholder={value.default}
                fullWidth
                variant="outlined"
                onBlur={onBlur}
                onChange={onChange}
                error={error}
                helperText={helperText}
            />
            <IconButton
                size="small"
                disableElevation
                disableRipple
                onClick={(e) => {
                    onDelete(e, index);
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}

export default DraggableItem;
