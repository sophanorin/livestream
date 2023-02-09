import React from "react";
import Logger from "./Logger";
import YouTube from "react-youtube";
import {
    YOUTUBE_PROGRESS,
    YOUTUBE_START,
    YOUTUBE_PLAYING,
    YOUTUBE_PAUSE,
    YOUTUBE_CLOSE,
    YOUTUBE_BUFFERING,
    YOUTUBE_ERROR,
    errorYoutubeVideo,
    setYoutubeVideoStatus,
    setYoutubeVideoUrl,
} from "./store/actions/youtubeManagerActions";
import * as roomActions from "./store/actions/roomActions";
import throttle from "lodash.throttle";

export default class YoutubeVideoManager {
    constructor(roomClient, store) {
        this.logger = new Logger("YoutubeManager");

        this._playerRef = React.createRef();

        this._ownerId = null;
        this._isOwner = null;
        this.youtubeUrl = null;
        this.youtubeId = null;

        this.store = store;

        this._enabled = true;

        this.roomClient = roomClient;

        this.onThrottleVideoProgress = throttle(
            this.onVideoProgress.bind(this),
            10000
        );
    }

    get isOwner() {
        return this._isOwner;
    }

    get ownerId() {
        return this._ownerId;
    }

    get player() {
        return this._playerRef.current;
    }

    set player(player) {
        this._playerRef.current = player;
    }

    /**
     * Indicates whether the video is muted.
     *
     * @returns {boolean}
     */
    isMuted() {
        return this.player?.isMuted();
    }

    /**
     * Retrieves current volume.
     *
     * @returns {number}
     */
    getVolume() {
        return this.player?.getVolume();
    }

    /**
     * Retrieves current time.
     *
     * @returns {number}
     */
    getTime() {
        return this.player?.getCurrentTime();
    }

    /**
     * Seeks video to provided time.
     *
     * @param {number} time - The time to seek to.
     *
     * @returns {void}
     */
    seek(time) {
        return this.player?.seekTo(time);
    }

    /**
     * Plays video.
     *
     * @returns {void}
     */
    play() {
        return this.player?.playVideo();
    }

    /**
     * Pauses video.
     *
     * @returns {void}
     */
    pause() {
        return this.player?.pauseVideo();
    }

    /**
     * Mutes video.
     *
     * @returns {void}
     */
    mute() {
        return this.player?.mute();
    }

    /**
     * Unmutes video.
     *
     * @returns {void}
     */
    unMute() {
        return this.player?.unMute();
    }

    /**
     *  Set Volume
     *
     * @param {Number} number
     */
    volume(number) {
        this.player?.setVolume(number);
    }

    /**
     * Disposes of the current video player.
     *
     * @returns {void}
     */
    dispose() {
        if (this.player) {
            this.player.destroy();
            this.player = null;

            if (this._isOwner) {
                this.roomClient._sendRequest("youtube", {
                    method : YOUTUBE_CLOSE,
                });
            }
            this.store.dispatch(setYoutubeVideoStatus(YOUTUBE_CLOSE));
            this.store.dispatch(setYoutubeVideoUrl(null));
        }
        this.store.dispatch(roomActions.setDisplayMode("democratic"));
    }

    /**
     * Handle video error.
     *
     * @returns {void}
     */
    onError() {
        this.logger.error("Error in the video player");
        this.store.dispatch(
            errorYoutubeVideo("Error occure while youtube streaming!")
        );
        this.dispose();
    }

    /**
     * Indicates the playback state of the video.
     *
     * @returns {string}
     */
    getPlaybackStatus() {
        let status;

        if (!this.player) {
            return;
        }

        const playerState = this.player.getPlayerState();

        if (playerState === YouTube.PlayerState.PLAYING) {
            status = YOUTUBE_PLAYING;
        }

        if (playerState === YouTube.PlayerState.PAUSED) {
            status = YOUTUBE_PAUSE;
        }

        return status;
    }

    /**
     * Fired on play state toggle.
     *
     * @param {Object} event - The yt player stateChange event.
     *
     * @returns {void}
     */
    onPlayerStateChange(event) {
        if (this._isOwner) {
            if (event.data === YouTube.PlayerState.PLAYING) {
                this.roomClient._sendRequest("youtube", {
                    method : YOUTUBE_PLAYING,
                    data   : { currentTime: this.getTime() },
                });
                this.store.dispatch(setYoutubeVideoStatus(YOUTUBE_PLAYING));
            } else if (event.data === YouTube.PlayerState.PAUSED) {
                this.roomClient._sendRequest("youtube", {
                    method : YOUTUBE_PAUSE,
                });
                this.store.dispatch(setYoutubeVideoStatus(YOUTUBE_PAUSE));
            } else if (event.data === YouTube.PlayerState.BUFFERING) {
                this.roomClient._sendRequest("youtube", {
                    method : YOUTUBE_BUFFERING,
                    data   : { currentTime: this.getTime() },
                });
            }
        }
    }

    smartAudioMute() {}

    /**
     * Handle volume changed.
     *
     * @returns {void}
     */
    onVolumeChange() {
        const volume = this.getVolume();
        const muted = this.isMuted();

        if (volume > 0 && !muted) {
            this.smartAudioMute();
        }

        this.roomClient._sendRequest("youtube", {
            method : "volume",
            data   : { volume, muted },
        });
    }

    /**
     * Handle video prgress changed
     *
     * @return {void}
     */

    onVideoProgress(e) {
        this.roomClient._sendRequest("youtube", {
            method : YOUTUBE_PROGRESS,
            data   : { currentTime: e.data },
        });
    }

    /**
     * Fired when youtube player is ready.
     *
     * @param {Object} event - The youtube player event.
     *
     * @returns {void}
     */
    onPlayerReady(event) {
        this.player = event.target;

        if (this._isOwner) {
            this.player.addEventListener("onVolumeChange", () => {
                this.onVolumeChange();
            });
        }

        if (this._isOwner) {
            this.player.addEventListener(
                "onVideoProgress",
                this.onThrottleVideoProgress
            );
        }

        this.play();

        // sometimes youtube can get muted state from previous videos played in the browser
        // and as we are disabling controls we want to unmute it
        if (this.isMuted()) {
            this.unMute();
        }
    }

    StartSharingYoutubeVideo(link, ownerId) {
        if (link === undefined || link === null || link === "") {
            const message = "Empty field set";
            const data = { status: YOUTUBE_ERROR, error: message };
            this.store.dispatch(errorYoutubeVideo(YOUTUBE_ERROR, message));
            return data;
        }

        if (!this.player) {
            const yt_id = this.getYoutubeId(link.trim());
            if (yt_id) {
                this.youtubeUrl = link;
                this._ownerId = ownerId;
                this.youtubeId = yt_id;
                this._isOwner = this.store.getState().me.id === ownerId;

                if (this._isOwner) {
                    this.roomClient._sendRequest("youtube", {
                        method : YOUTUBE_START,
                        data   : {
                            ownerId,
                            youtubeUrl : this.youtubeUrl,
                            status     : YOUTUBE_PLAYING,
                        },
                    });
                }
                this.store.dispatch(setYoutubeVideoStatus(YOUTUBE_START));
                this.store.dispatch(setYoutubeVideoUrl(link));

                // minimize
                const { documentOpen, latexOpen } =
                    this.store.getState().document;
                const { whiteboardOpen } = this.store.getState().whiteboard;
                const { selectedFile } = this.store.getState().presentation;

                if (selectedFile) {
                    this.roomClient.minimizePresentationFile();
                }

                if (documentOpen) {
                    this.roomClient.getClassDocumentManager().minimize();
                }
                
                if (whiteboardOpen) {
                    this.roomClient.getWhiteboardManager().minimize();
                }

                this.store.dispatch(roomActions.setDisplayMode("filmstrip"));

                const data = { status: "ok" };

                return data;
            }
            const message = "Incorrect url provided";
            const data = { status: YOUTUBE_ERROR, error: message };
            this.store.dispatch(errorYoutubeVideo(YOUTUBE_ERROR, message));
            return data;
        }
    }

    getYoutubeId(url) {
        if (!url) {
            return null;
        }
        const p =
            /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|(?:m\.)?youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        const result = url.match(p);

        return result ? result[1] : null;
    }

    getPlayerOptions() {
        const showControls = this._isOwner ? 2 : 0;

        const options = {
            id   : "sharedVideoPlayer",
            opts : {
                height     : "100%",
                width      : "100%",
                playerVars : {
                    fs       : "0",
                    autoplay : 0,
                    controls : showControls,
                    rel      : 0,
                },
            },
            onError       : () => this.onError(),
            onReady       : this.onPlayerReady.bind(this),
            onStateChange : this.onPlayerStateChange.bind(this),
            videoId       : this.youtubeId,
        };

        return options;
    }

    addYoutubeLink(url, ownerId, progress = null, status = null) {
        this.StartSharingYoutubeVideo(url, ownerId);

        const yt_interval = setInterval(() => {
            if (this.player) {
                
                if (progress) {
                    this.seek(progress)
                }

                if (status === "playing") {
                    this.play()
                };

                if (status === "pause") {
                    this.pause()
                };

                return clearTimeout(yt_interval);
            }
        }, 800);
    }
}
