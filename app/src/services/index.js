import Axios from "./axios";
import { WritableStream } from "web-streams-polyfill/ponyfill";
import streamSaver from "streamsaver";

export const upload = async (
    files,
    options,
    onUploadProgressCallback = null
) => {
    try {
        const uri = `/aws/s3/upload`;

        const body = new FormData();

        Array.from(files).forEach((file) => {
            body.append("files", file);
        });

        return Axios.post(uri, body, {
            onUploadProgress : onUploadProgressCallback,
        });
    } catch (error) {
        return Promise.reject(error);
    }
};

export const download = async (url, fileName) => {
    fetch(url).then((response) => {
        if (!window.WritableStream) {
            streamSaver.WritableStream = WritableStream;
            window.WritableStream = WritableStream;
        }

        const fileStream = streamSaver.createWriteStream(fileName);
        const readableStream = response.body;

        if (readableStream.pipeTo) {
            return readableStream.pipeTo(fileStream);
        }
        window.writer = fileStream.getWriter();

        const reader = response.body.getReader();
        const pump = () =>
            reader
                .read()
                .then((res) =>
                    res.done
                        ? writer.close()
                        : writer.write(res.value).then(pump)
                );

        pump();
    });
};

/**
 * Get user verificated
 * @returns {object} room state
 */
export const canJoin = async ({ roomId, roomKey }) => {
    try {
        if (!roomId | !roomKey) {throw { message: "canJoin Param is empty" };}

        const uri = `external/livestream/verifyRoom`;
        const body = {
            roomId,
            roomKey,
        };

        return Axios.post(uri, body);
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * Get peer info
 * @returns {object} response user data
 */
export const getPeerInfo = async ({ roomId, tk }) => {
    try {
        if (!roomId | !tk) {throw { message: "getPeerInfo Param is empty" };}

        const uri = `external/livestream/verifyPeer`;
        const body = {
            roomId,
            tk,
        };

        return Axios.post(uri, body);
    } catch (error) {
        return Promise.reject(error);
    }
};
