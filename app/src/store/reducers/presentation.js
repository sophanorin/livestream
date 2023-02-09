const initialState = {
    files        : {},
    count        : 0,
    selectedFile : null,
};

const presentation = (state = initialState, action) => {
    switch (action.type) {
    case "ADD_PRESENTATION_FILE": {
        const { file } = action.payload;

        const newState = { ...state };

        newState.files[file.time] = file;
        newState.count++;

        return newState;
    }

    case "REMOVE_PRESENTATION_FILE": {
        const { id } = action.payload;

        const newState = { ...state };

        delete newState.files[id];
        newState.count--;

        return newState;
    }

    case "SET_SELECTED_FILE": {
        const { id } = action.payload;

        return { ...state, selectedFile: state.files[id] };
    }

    case "CLEAR_SELECTED_FILE": {
        return { ...state, selectedFile: null };
    }

    case "SET_PAGE": {
        const { id, pageNumber } = action.payload;

        const newState = { ...state };

        newState.files[id] = {
            ...newState.files[id],
            pageNumber,
        };

        if (id === newState.selectedFile.time) {
            newState.selectedFile = {
                ...newState.selectedFile,
                pageNumber,
            };
        }

        return newState;
    }

    default: {
        return state;
    }
    }
};

export default presentation;
