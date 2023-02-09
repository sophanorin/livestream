/**
 * Create a function which will call the callback function
 * after the given amount of milliseconds has passed since
 * the last time the callback function was called.
 */
export function idle(callback, delay) {
    let handle;

    return () => {
        if (handle) {
            clearTimeout(handle);
        }

        handle = setTimeout(callback, delay);
    };
}

export function debounce(func, wait = 500) {
    let timeout;
    return function (...args) {
        const context = this;
        const later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, wait = 500) {
    let shouldWait = false;
    let waitingArgs;

    const timeoutFunc = () => {
        if (waitingArgs === null) {
            shouldWait = false;
        } else {
            func(...waitingArgs);
            waitingArgs = null;
            setTimeout(timeoutFunc, wait);
        }
    };

    return function (...args) {
        if (shouldWait) {
            waitingArgs = args;
            return;
        }
        func(...args);
        shouldWait = true;

        setTimeout(timeoutFunc, wait);
    };
}

/**
 * Error produced when a socket request has a timeout.
 */
export class SocketTimeoutError extends Error {
    constructor(message) {
        super(message);

        this.name = "SocketTimeoutError";

        if (Error.hasOwnProperty("captureStackTrace"))
        // Just in V8.
        {Error.captureStackTrace(this, SocketTimeoutError);}
        else {this.stack = new Error(message).stack;}
    }
}

export const getLinkData = (search) => {
    try {
        const params = new URLSearchParams(search);
        const room = params.get("room");
        const tk = params.get("tk");

        if (!room) {
            window.alert("Invalid URL");
            throw "Invalid URL";
        }

        const match = room.match(/^([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/);

        if (match && match[2].length !== 22) {
            window.alert("Invalid Encryption Key");
            return null;
        }
        return match ? { roomId: match[1], roomKey: match[2], tk } : null;
    } catch (error) {
        throw error;
    }
};

import kh_flag from "./assets/images/flags/132-cambodia.png";
import cn_flag from "./assets/images/flags/261-china.png";
import en_flag from "./assets/images/flags/262-united-kingdom.png";

export const getFlag = (local) => {
    switch (local) {
    case "en":
        return en_flag;
    case "zn":
        return cn_flag;
    case "kh":
        return kh_flag;

    default:
        break;
    }
};
