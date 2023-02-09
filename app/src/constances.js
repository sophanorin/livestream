const CLASS_DOCUMENT_CURSOR_FLAG_TIMEOUT = 2000;

// Constant to simulate a high-latency connection when sending
// text changes.
const CLASS_DOCUMENT_TEXT_LATENCY = 500;

// Constant to simulate a high-latency connection when sending cursor
// position updates.
const CLASS_DOCUMENT_CURSOR_LATENCY = 450;

// Constant to simulate a high-latency connection when sending
// text changes.
const LATEX_TEXT_LATENCY = 500;

const PAGE_CHANGE_LATENCY = 500;

export {
    CLASS_DOCUMENT_TEXT_LATENCY,
    CLASS_DOCUMENT_CURSOR_LATENCY,
    LATEX_TEXT_LATENCY,
    CLASS_DOCUMENT_CURSOR_FLAG_TIMEOUT,
    PAGE_CHANGE_LATENCY,
};
