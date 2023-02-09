const initialState = {
    link : null,
};

const shareVideo = (state = initialState, action) => {
    switch (action.type) {
    case "SET_SHARE_VIDEO_LINK":
        return;
    default:
        return state;
    }
};

export default shareVideo;
