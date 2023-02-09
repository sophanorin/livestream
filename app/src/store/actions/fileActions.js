export const addFile = (file) => ({
    type    : "ADD_FILE",
    payload : { ...file },
});

export const addFileUpload = (file) => ({
    type    : "ADD_FILE_UPLOAD",
    payload : { ...file },
});

export const removeFileUpload = (file) => ({
    type    : "REMOVE_FILE_UPLOAD",
    payload : { ...file },
});

export const addFileHistory = (fileHistory) => ({
    type    : "ADD_FILE_HISTORY",
    payload : { fileHistory },
});

export const setFileActive = (url) => ({
    type    : "SET_FILE_ACTIVE",
    payload : { url },
});

export const setFileInActive = (url) => ({
    type    : "SET_FILE_INACTIVE",
    payload : { url },
});

export const setFileProgress = (url, progress) => ({
    type    : "SET_FILE_PROGRESS",
    payload : { url, progress },
});

export const setFileDone = (url, sharedFiles) => ({
    type    : "SET_FILE_DONE",
    payload : { url, sharedFiles },
});

export const clearFiles = () => ({
    type : "CLEAR_FILES",
});
