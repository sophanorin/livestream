export const YOUTUBE_START = "start";
export const YOUTUBE_PLAYING = "playing";
export const YOUTUBE_CLOSE = "close";
export const YOUTUBE_PAUSE = "pause";
export const YOUTUBE_BUFFERING = "buffering";
export const YOUTUBE_PROGRESS = "progress";
export const YOUTUBE_INIT = null;
export const YOUTUBE_ERROR = "error";

export const setVideoYoutubeOpen = (shareVideoInputDialogOpen) => ({
    type    : "SET_SHARED_YOUTUBE_VIDEO_DIALOG_OPEN",
    payload : { shareVideoInputDialogOpen },
});

export const setYoutubeVideoUrl = (url) => ({
    type    : "SET_YOUTUBE_VIDEO_URL",
    payload : { url },
});

export const setYoutubeVideoStatus = (status) => ({
    type    : "SET_SHARED_YOUTUBE_VIDEO_STATUS",
    payload : { status },
});

export const closeShareVideo = () => ({
    type    : "CLOSE_SHARE_VIDEO",
    payload : {},
});

export const errorYoutubeVideo = (status, error) => ({
    type    : "YOUTUBE_VIDEO_ERROR",
    payload : { status, error },
});
