const initialState = {
    documentOpen : false,
    latexOpen    : false,
    delta        : null,
    latex        : null,
};

const document = (state = initialState, action) => {
    switch (action.type) {
    case "SET_QUILL": {
        const { quill } = action.payload;

        return { ...state, quill };
    }
    case "SET_LATEX": {
        const { latex } = action.payload;
        return { ...state, latex };
    }

    case "SET_DELTA": {
        const { delta } = action.payload;

        return { ...state, delta };
    }

    case "SET_ONLINE_DOCUMENT_OPEN": {
        const { documentOpen } = action.payload;

        return { ...state, documentOpen };
    }

    case "SET_LATEX_OPEN": {
        const { latexOpen } = action.payload;

        return { ...state, latexOpen };
    }
    case "SEND_DOCUMENT_CHANGE":
        break;
    case "RECIEVE_DOCUMENT_CHANGE":
        break;
    case "SAVE_DOCUMENT_CHANGE":
        break;

    default:
        return state;
    }
};

export default document;
