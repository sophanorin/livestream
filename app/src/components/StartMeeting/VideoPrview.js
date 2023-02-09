import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import React, { forwardRef, useEffect, useRef } from "react";
import Logger from "../../Logger";

const logger = new Logger("VideoPreview");

const styles = (theme) => ({
    root : {
        position      : "relative",
        height        : "100%",
        width         : "100%",
        display       : "flex",
        flexDirection : "column",
        overflow      : "hidden",
        borderRadius  : "var(--peer-border-radius-lg)",
    },
    info : {
        width          : "100%",
        height         : "100%",
        padding        : theme.spacing(1),
        position       : "absolute",
        zIndex         : 10,
        display        : "flex",
        flexDirection  : "column",
        justifyContent : "space-between",
    },
    media : {
        display            : "flex",
        transitionProperty : "opacity",
        transitionDuration : ".15s",
    },
    video : {
        flex           : "100 100 auto",
        height         : "100%",
        width          : "100%",
        objectFit      : "cover",
        userSelect     : "none",
        "&.isMirrored" : {
            transform : "scaleX(-1)",
        },
        "&.hidden" : {
            opacity            : 0,
            transitionDuration : "0s",
        },
        "&.loading" : {
            filter : "blur(5px)",
        },
        "&.contain" : {
            objectFit       : "contain",
            backgroundColor : "rgba(0, 0, 0, 1)",
        },
    },
});

function VideoPrview(props) {
    const { videoTrack, classes, children, isMirrored } = props;

    const videoTrackRef = useRef(null);
    const videoElementRef = useRef(null);

    const setTracks = (videoTrack) => {
        if (videoTrackRef.current === videoTrack) {return;}

        videoTrackRef.current = videoTrack;

        if (videoTrackRef.current) {
            const stream = new MediaStream();

            stream.addTrack(videoTrackRef.current);

            videoElementRef.current.srcObject = stream;

            videoElementRef.current
                .play()
                .catch((error) =>
                    logger.warn('videoElement.play() [error:"%o]', error)
                );
        } else {
            if (videoElementRef.current.srcObject)
            {videoElementRef.current.srcObject
                .getTracks()
                .forEach((track) => track.stop());}

            videoElementRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        setTracks(videoTrack);
        return () => {
            if (videoElementRef.current) {
                videoElementRef.current.oncanplay = null;
                videoElementRef.current.onplay = null;
                videoElementRef.current.onpause = null;
            }
        };
    }, [videoTrack]);

    return (
        <div className={classnames(classes.root)}>
            <video
                ref={videoElementRef}
                autoPlay
                playsInline
                muted
                controls={false}
                className={classnames(classes.video, {
                    isMirrored,
                })}
            />
            {children}
        </div>
    );
}

export default withStyles(styles)(VideoPrview);
