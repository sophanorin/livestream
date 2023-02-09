const initialState = {
    quizzes                           : [],
    quizzesResult                     : [],
    count                             : 0,
    countUnread                       : 0,
    watching                          : false,
    watchingQuiz                      : null,
    quizDialogOpen                    : false,
    quizDashboardDialogOpen           : false,
    quizResultDialogOpen              : false,
    createQuizDialogOpen              : false,
    quizLiveResultDashboardDialogOpen : false,
    selectedQuiz                      : null,
};

const quizzes = (state = initialState, action) => {
    switch (action.type) {
    case "ADD_QUIZ": {
        const { quiz } = action.payload;
        return {
            ...state,
            quizzes     : [...state.quizzes, quiz],
            count       : state.count + 1,
            countUnread :
                    quiz.sender === "response"
                        ? ++state.countUnread
                        : state.countUnread,
        };
    }

    case "UPDATE_QUIZ": {
        const {
            time,
            correctIndexs,
            maxAnsweredPeers,
            answeredPeers,
            isPublicResult,
        } = action.payload;

        let newQuizzes = state.quizzes;
        newQuizzes = newQuizzes.map((quiz) => {
            if (quiz.time === time) {
                const newQuiz = {
                    ...quiz,
                    correctIndexs,
                    answeredPeers,
                    isPublicResult,
                };

                newQuiz.maxAnsweredPeers = maxAnsweredPeers;
                return newQuiz;
            }

            return quiz;
        });

        return { ...state, quizzes: newQuizzes };
    }

    case "SUBMIT_QUIZ": {
        const { quiz: submitQuiz } = action.payload;

        let quiz = state.quizzes.find(
            (quiz) => quiz.time === submitQuiz.time
        );
            
        quiz = submitQuiz;

        return {
            ...state,
        };
    }

    case "ADD_QUIZ_HISTORY": {
        const { quizHistory } = action.payload;

        quizHistory.forEach((item, index) => {
            quizHistory[index].isRead = true;
        });

        return {
            ...state,
            quizzes : quizHistory,
            count   : quizHistory.length,
        };
    }

    case "SET_PEER_CORRECT_INDEX": {
        const { time, peerAnswerIndexs } = action.payload;

        const newQuizzes = state.quizzes;

        const quiz = newQuizzes.find((quiz) => quiz.time === time);
        quiz.peerAnswerIndexs = peerAnswerIndexs;
        quiz.answered = true;

        return {
            ...state,
            quizzes : newQuizzes,
        };
    }

    case "SET_SENDER_WATCHING": {
        const { flage, watchingQuiz } = action.payload;

        return { ...state, watching: flage, watchingQuiz };
    }

    case "SET_QUIZ_RESULT": {
        const { time, correctIndex } = action.payload;

        const quiz = state.quizzes.find((quiz) => quiz.time === time);
        quiz.correctIndex = correctIndex;
        quiz.status = "closed";

        return {
            ...state,
        };
    }

    case "ADD_PEER_SUBMIT_QUIZ": {
        const { time, peer } = action.payload;

        const newQuizzes = [...state.quizzes];
        newQuizzes.forEach((quiz) => {
            if (quiz.time === time) {quiz.answeredPeers.push(peer);}
        });

        return { ...state, quizzes: newQuizzes };
    }

    case "ADD_QUESTIONS_RESULT_HISTORY": {
        const { questionsResultHistory } = action.payload;

        questionsResultHistory.forEach((item, index) => {
            questionsResultHistory[index].isRead = true;
        });

        return {
            ...state,
            quizzesResult : questionsResultHistory,
            count         : questionsResultHistory.length,
        };
    }

    case "ADD_QUESTION_RESULT": {
        const { questionResult } = action.payload;

        return {
            ...state,
            quizzesResult : [...state.quizzesResult, questionResult],
            count         : state.count + 1,
            countUnread   :
                    questionResult.sender === "response"
                        ? ++state.countUnread
                        : state.countUnread,
        };
    }

    case "CLEAR_QUIZ": {
        return {
            ...state,
            count       : state.count - state.quizzes.length,
            quizzes     : [],
            countUnread : 0,
        };
    }

    case "CLEAR_QUIZ_RESULT": {
        return {
            ...state,
            count         : state.count - state.quizzesResult.length,
            quizzesResult : [],
            countUnread   : 0,
        };
    }

    case "SET_QUIZ_DASHBOARD_DIALOG_OPEN": {
        const { flag } = action.payload;

        return { ...state, quizDashboardDialogOpen: flag };
    }

    case "SET_CREATE_QUIZ_DIALOG_OPEN": {
        const { flag } = action.payload;

        return { ...state, createQuizDialogOpen: flag };
    }

    case "SET_QUIZ_RESULT_DIALOG_OPEN": {
        const { flag } = action.payload;

        return { ...state, quizResultDialogOpen: flag };
    }

    case "SET_QUIZ_DIALOG_OPEN": {
        const { flag } = action.payload;

        return { ...state, quizDialogOpen: flag };
    }

    case "SET_QUIZ_LIVE_RESULT_DASHBOARD_DIALOG_OPEN": {
        const { flag } = action.payload;

        return { ...state, quizLiveResultDashboardDialogOpen: flag };
    }

    case "SET_SELECTED_QUIZ": {
        const { time } = action.payload;

        return { ...state, selectedQuiz: time };
    }

    case "CLEAR_SELECTED_QUIZ": {
        return { ...state, selectedQuiz: null };
    }

    case "SET_IS_QUIZ_READ": {
        const { id, isRead } = action.payload;

        state.quizzes.forEach((quiz) => {
            if (quiz.time === Number(id)) {
                quiz.isRead = isRead;

                state.countUnread--;
            }
        });

        return { ...state };
    }

    default:
        return state;
    }
};

export default quizzes;
