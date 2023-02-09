export const addPresentationFile = (file) => ({
    type    : "ADD_PRESENTATION_FILE",
    payload : { file },
});

export const removePresentationFile = (id) => ({
    type    : "REMOVE_PRESENTATION_FILE",
    payload : { id },
});

export const setSelectedFile = (id) => ({
    type    : "SET_SELECTED_FILE",
    payload : { id },
});

export const clearSelectedFile = () => ({
    type : "CLEAR_SELECTED_FILE",
});

export const setPage = (id, pageNumber) => ({
    type    : "SET_PAGE",
    payload : { id, pageNumber },
});
