const initialState = {
    shareVideoInputDialogOpen : null,
    error                     : null,
    status                    : null,
    url                       : null,
};

const youtube = (state = initialState, action) => {
    switch (action.type) {
    case "SET_SHARED_YOUTUBE_VIDEO_DIALOG_OPEN":
        const { shareVideoInputDialogOpen } = action.payload;

        if (shareVideoInputDialogOpen)
        {return {
            ...state,
            shareVideoInputDialogOpen,
            error  : null,
            status : null,
        };}
        return { ...state, shareVideoInputDialogOpen };

    case "SET_YOUTUBE_VIDEO_URL":
        const { url } = action.payload;
        return { ...state, url };

    case "SET_SHARED_YOUTUBE_VIDEO_STATUS":
        const { status } = action.payload;

        return { ...state, status };

    case "YOUTUBE_VIDEO_ERROR":
        const { error, status: _status } = action.payload;

        return { ...state, error, status: _status };

    case "CLOSE_SHARE_VIDEO":
        return { ...state, status: null, url: null, error: null };

    default:
        return state;
    }
};

export default youtube;
