export const addQuiz = (quiz) => ({
    type    : "ADD_QUIZ",
    payload : { quiz },
});

export const updateQuiz = (quiz) => ({
    type    : "UPDATE_QUIZ",
    payload : { ...quiz },
});

export const addQuizHistory = (quizHistory) => ({
    type    : "ADD_QUIZ_HISTORY",
    payload : { quizHistory },
});

export const submitQuiz = (quiz) => ({
    type    : "SUBMIT_QUIZ",
    payload : { quiz },
});

export const setPeerCorrectIndex = (time, peerAnswerIndexs) => ({
    type    : "SET_PEER_CORRECT_INDEX",
    payload : { time, peerAnswerIndexs },
});

export const setSenderWatching = (flage, watchingQuiz) => ({
    type    : "SET_SENDER_WATCHING",
    payload : { flage, watchingQuiz },
});

export const setQuizResult = (result) => ({
    type    : "SET_QUIZ_RESULT",
    payload : result,
});

export const addPeerSubmitQuiz = (time, peer) => ({
    type    : "ADD_PEER_SUBMIT_QUIZ",
    payload : { time, peer },
});

export const addQuizResult = (questionResult) => ({
    type    : "ADD_QUESTION_RESULT",
    payload : { questionResult },
});

export const addQuizResultHistory = (questionsResultHistory) => ({
    type    : "ADD_QUESTIONS_RESULT_HISTORY",
    payload : { questionsResultHistory },
});

export const clearQuiz = () => ({
    type : "CLEAR_QUIZ",
});

export const clearQuizResult = () => ({
    type : "CLEAR_QUIZ_RESULT",
});

export const setQuizDashboardOpen = (flag) => ({
    type    : "SET_QUIZ_DASHBOARD_DIALOG_OPEN",
    payload : { flag },
});

export const setCreateQuizDialogOpen = (flag) => ({
    type    : "SET_CREATE_QUIZ_DIALOG_OPEN",
    payload : { flag },
});

export const setQuizResultDialogOpen = (flag) => ({
    type    : "SET_QUIZ_RESULT_DIALOG_OPEN",
    payload : { flag },
});
export const setQuizLiveResultDashboardDialogOpen = (flag) => ({
    type    : "SET_QUIZ_LIVE_RESULT_DASHBOARD_DIALOG_OPEN",
    payload : { flag },
});

export const setQuizDialogOpen = (flag) => ({
    type    : "SET_QUIZ_DIALOG_OPEN",
    payload : { flag },
});

export const setSelectedQuiz = (time) => ({
    type    : "SET_SELECTED_QUIZ",
    payload : {
        time,
    },
});

export const clearSelectedQuiz = () => ({
    type : "CLEAR_SELECTED_QUIZ",
});

export const setIsQuizRead = (id, isRead) => ({
    type    : "SET_IS_QUIZ_READ",
    payload : { id, isRead },
});
