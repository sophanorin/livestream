export const sendDocumentChange = (delta) => ({
    type    : "SEND_DOCUMENT_CHANGE",
    payload : {delta},
});

export const recieveDocumentChange = (delta) => ({
    type    : "RECIEVE_DOCUMENT_CHANGE",
    payload : {delta},
});

// export const saveDocumentChange = (contents) => ({
//   type: "SAVE_DOCUMENT_CHANGE",
//   payload: { delta },
// });

export const setOnlineDocumentOpen = (documentOpen) => ({
    type    : "SET_ONLINE_DOCUMENT_OPEN",
    payload : {documentOpen},
});

export const setLatexOpen = (latexOpen) => ({
    type    : "SET_LATEX_OPEN",
    payload : {latexOpen},
});

export const setQuill = (quill) => ({
    type    : "SET_QUILL",
    payload : {quill},
});

export const setLatex = (latex) => ({
    type    : "SET_LATEX",
    payload : {latex},
});

export const setDelta = (delta) => ({
    type    : "SET_DELTA",
    payload : {delta},
});
