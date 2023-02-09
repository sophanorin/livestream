const initialState = {
    whiteboardOpen : false,
};

const whiteboard = (state = initialState, action) => {
    switch (action.type) {
    case "SET_WHITEBOARD_OPEN": {
        const { whiteboardOpen } = action.payload;

        return { ...state, whiteboardOpen };
    }
    default:
        return state;
    }
};

export default whiteboard;
