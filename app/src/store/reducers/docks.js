const initialState = {};

const docks = (state = initialState, action) => {
    switch (action.type) {
    case "ADD_DOCK_ITEM": {
        const { dock } = action.payload;

        return {
            ...state,
            [dock.id] : dock,
        };
    }
    case "REMOVE_DOCK_ITEM": {
        const { id } = action.payload;

        const newState = { ...state };

        delete newState[id];

        return newState;
    }
    default:
        return state;
    }
};

export default docks;
