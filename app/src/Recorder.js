import Logger from "./Logger";
import * as roomActions from "./store/actions/roomActions";
import { store } from "./store/store";
import * as requestActions from "./store/actions/requestActions";
import {
    RECORDING_PAUSE,
    RECORDING_RESUME,
    RECORDING_STOP,
    RECORDING_START,
} from "./store/actions/recorderActions";

export default class Recorder {
    constructor(roomClient) {
        // react intl
        this.intl = null;

        // MediaRecorder
        this.recorder = null;
        this.recordingMimeType = null;
        this.recordingData = [];
        this.recorderStream = null;
        this.gdmStream = null;
        this.roomClient = roomClient;
        this.fileName = "apple.webm";
        this.logger = new Logger("Recorder");

        // Audio MIXER
        this.ctx = null;
        this.dest = null;
        this.gainNode = null;
        this.audioConsumersMap = new Map();
        this.micProducerId = null;
        this.micProducerStreamSource = null;

        this.recorderState = null;

        this.RECORDING_CONSTRAINTS = {
            video : {
                displaySurface : "browser",
                width          : 854,
                height         : 480,
                frameRate      : 20,
                aspectRatio    : { ideal: 1.7777777778 },
                facingMode     : "user",
                ...window.config.recordContainnt.video,
            },
            audio : {
                sampleSize       : 16,
                channelCount     : 2,
                echoCancellation : true,
                ...window.config.recordContainnt.audio,
            },
        };

        this.RECORDER_CONFIG = {
            audioBitsPerSecond :
                window.config.recordContainnt.audioBitsPerSecond || 96000,
            videoBitsPerSecond :
                window.config.recordContainnt.videoBitsPerSecond || 960000,
        };
        // 10 sec
        this.RECORDING_SLICE_SIZE = window.config.recordSliceSize || 10000;
    }

    mixer(audiotrack, videostream) {
        // AUDIO
        if (audiotrack != null) {
            this.ctx
                .createMediaStreamSource(new MediaStream([audiotrack]))
                .connect(this.dest);
        }
        // VIDEO+AUDIO
        if (videostream.getAudioTracks().length > 0) {
            this.ctx.createMediaStreamSource(videostream).connect(this.dest);
        }
        // VIDEOMIX
        let tracks = this.dest.stream.getTracks();

        tracks = tracks.concat(videostream.getVideoTracks());

        return new MediaStream(tracks);
    }

    init() {
        this.logger.debug("startRecording()");

        // Check
        if (typeof MediaRecorder === undefined) {
            throw new Error("Unsupported media recording API");
        }
        // Check mimetype is supported by the browser
        if (MediaRecorder.isTypeSupported(this.recordingMimeType) === false) {
            throw new Error(
                "Unsupported media recording format %O",
                this.recordingMimeType
            );
        }

        // Audio mixer init
        this.ctx = new AudioContext();
        this.dest = this.ctx.createMediaStreamDestination();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.dest);
    }

    async getUserMedia(additionalAudioTracks) {
        // Screensharing video ( and audio on Chrome )
        this.gdmStream = await navigator.mediaDevices.getDisplayMedia(
            this.RECORDING_CONSTRAINTS
        );

        this.gdmStream.getVideoTracks().forEach((track) => {
            track.addEventListener("ended", (e) => {
                this.logger.debug(
                    `gdmStream ${
                        track.kind
                    } track ended event: ${JSON.stringify(e)}`
                );
                this.stopRecording();
            });
        });

        if (additionalAudioTracks.length > 0) {
            // add mic track
            this.recorderStream = this.mixer(
                additionalAudioTracks[0],
                this.gdmStream
            );
            // add other audio tracks
            for (let i = 1; i < additionalAudioTracks.length; i++) {
                this.addTrack(additionalAudioTracks[i]);
            }
        } else {
            this.recorderStream = this.mixer(null, this.gdmStream);
        }
    }

    async bufferRecordingStart() {
        if (this.recorder) {
            this.recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    e.data.arrayBuffer().then((buffer) => {
                        const b64 = Buffer.from(buffer, "base64");

                        this.roomClient._sendRequest("moderator:recording", {
                            method : "buffer",
                            data   : {
                                buffer : {
                                    b64,
                                },
                            },
                        });
                    });
                }
            };

            this.recorder.onstop = (e) => {
                this.logger.debug(`Logger stopped event: ${e}`);

                try {
                    this.stopStreams();
                } catch (error) {
                    this.logger.error(
                        "Error during getting all data chunks from IndexedDB! error: %O",
                        error
                    );
                }
            };
        } else {
            // recorder did not start
            this.logger.debug("Recorder did not start.");
        }
    }

    async startRecording({ additionalAudioTracks, recordingMimeType }) {
        this.recordingMimeType = recordingMimeType;

        // Get date for filename
        // const dt = new Date();
        // const rdt = `${dt.getFullYear()}-${`0${dt.getMonth() + 1}`.slice(
        //     -2
        // )}-${`0${dt.getDate()}`.slice(
        //     -2
        // )}_${dt.getHours()}_${`0${dt.getMinutes()}`.slice(
        //     -2
        // )}_${dt.getSeconds()}`;

        this.init();

        // start recording process
        try {
            await this.getUserMedia(additionalAudioTracks);

            this.recorder = new MediaRecorder(this.recorderStream, {
                mimeType : this.recordingMimeType,
                ...this.RECORDER_CONFIG,
            });

            if (this.recorder) {
                this.bufferRecordingStart();

                this.recorder.onerror = (error) => {
                    this.logger.err(`Recorder onerror: ${error}`);
                    switch (error.name) {
                    case "SecurityError":
                        store.dispatch(
                            requestActions.notify({
                                type : "error",
                                text : "Recording the specified source is not allowed due to security restrictions. Check you client settings!",
                            })
                        );
                        break;
                    case "InvalidStateError":
                    default:
                        throw new Error(error);
                    }
                };
            }

            this.recorder.start(this.RECORDING_SLICE_SIZE);

            roomActions.setRecordingState(RECORDING_START);

            const ext = this.recorder.mimeType.split(";")[0].split("/")[1];

            await this.roomClient.sendRequest("moderator:recording", {
                method : RECORDING_START,
                data   : {
                    extension : ext,
                },
            });

            store.dispatch(roomActions.setRecordingState(RECORDING_START));

            store.dispatch(
                requestActions.notify({
                    type : "error",
                    text : "You started recording",
                })
            );
        } catch (error) {
            // store.dispatch(
            //     requestActions.notify({
            //         type: "error",
            //         text: "Unexpected error ocurred during recording",
            //     })
            // );
            this.logger.error('startRecording() [error:"%o"]', error);

            if (this.recorder) {
                this.recorder.stop();
            }
            store.dispatch(roomActions.setRecordingState(RECORDING_STOP));
            if (
                typeof this.gdmStream !== "undefined" &&
                this.gdmStream &&
                typeof this.gdmStream.getTracks === "function"
            ) {
                this.gdmStream.getTracks().forEach((track) => track.stop());
            }

            this.gdmStream = null;
            this.recorderStream = null;
            this.recorder = null;

            return -1;
        }
    }

    checkMicProducer(producers) {
        // is it already appended to stream?
        if (
            this.recorder != null &&
            (this.recorder.state === "recording" ||
                this.recorder.state === "paused")
        ) {
            const micProducer = Object.values(producers).find(
                (p) => p.source === "mic"
            );

            if (micProducer && this.micProducerId !== micProducer.id) {
                // delete/dc previous one
                if (this.micProducerStreamSource) {
                    this.micProducerStreamSource.disconnect(this.dest);
                }

                this.micProducerStreamSource = this.ctx.createMediaStreamSource(
                    new MediaStream([micProducer.track])
                );
                this.micProducerStreamSource.connect(this.dest);

                // set Mic id
                this.micProducerId = micProducer.id;
            }
        }
    }
    checkAudioConsumer(consumers) {
        if (
            this.recorder != null &&
            (this.recorder.state === "recording" ||
                this.recorder.state === "paused")
        ) {
            const audioConsumers = Object.values(consumers).filter(
                (p) => p.kind === "audio"
            );

            for (let i = 0; i < audioConsumers.length; i++) {
                if (!this.audioConsumersMap.has(audioConsumers[i].id)) {
                    const audioConsumerStreamSource =
                        this.ctx.createMediaStreamSource(
                            new MediaStream([audioConsumers[i].track])
                        );

                    audioConsumerStreamSource.connect(this.dest);
                    this.audioConsumersMap.set(
                        audioConsumers[i].id,
                        audioConsumerStreamSource
                    );
                }
            }

            for (const [
                consumerId,
                aCStreamSource,
            ] in this.audioConsumersMap.entries()) {
                if (!audioConsumers.find((c) => consumerId === c.id)) {
                    aCStreamSource.disconnect(this.dest);
                    this.audioConsumersMap.delete(consumerId);
                }
            }
        }
    }

    stopStreams() {
        // Stop all used video/audio tracks
        if (this.recorderStream && this.recorderStream.getTracks().length > 0) {
            this.recorderStream.getTracks().forEach((track) => track.stop());
        }

        if (this.gdmStream && this.gdmStream.getTracks().length > 0) {
            this.gdmStream.getTracks().forEach((track) => track.stop());
        }
    }

    async stopRecording() {
        this.logger.debug("stopRecording()");
        try {
            this.recorder.stop();

            // store.dispatch(
            //     requestActions.notify({
            //         type: "error",
            //         text: "You stopped recording",
            //     })
            // );

            store.dispatch(roomActions.setRecordingState(null));

            await this.roomClient.sendRequest("moderator:recording", {
                method : RECORDING_STOP,
            });

            this.gdmStream = null;
            this.recorderStream = null;
            this.recorder = null;
        } catch (error) {
            // store.dispatch(
            //     requestActions.notify({
            //         type: "error",
            //         text: "Unexpected error ocurred during recording",
            //     })
            // );

            this.logger.error('stopRecording() [error:"%o"]', error);
        }
    }
    async pauseRecording() {
        if (this.recorder) {
            this.recorder.pause();
            store.dispatch(roomActions.setRecordingState(RECORDING_PAUSE));
            await this.roomClient.sendRequest("moderator:recording", {
                method : RECORDING_PAUSE,
            });
        } else {
        }
    }
    async resumeRecording() {
        if (this.recorder) {
            this.recorder.resume();
            store.dispatch(roomActions.setRecordingState(RECORDING_RESUME));
            await this.roomClient.sendRequest("moderator:recording", {
                method : RECORDING_RESUME,
            });
        }
    }
}
