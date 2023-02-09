import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import Grid from "@material-ui/core/Grid";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { alpha, IconButton } from "@material-ui/core";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import PdfPreview from "../PdfPreview/PdfPreview";

import { videoBoxesSelector } from "../../store/selectors";
import { withRoomContext } from "../../RoomContext";
import Me from "../Containers/Me";
import Peer from "../Containers/Peer";
import SpeakerPeer from "../Containers/SpeakerPeer";
import Document from "../Document/Document";
import YoutubeView from "../ShareVideo/YoutubeView";

import {
    YOUTUBE_START,
    YOUTUBE_PLAYING,
    YOUTUBE_PAUSE,
} from "../../store/actions/youtubeManagerActions";
import palette from "../../theme/palette";

const PADDING_V = 40;
const PADDING_H = 32;
const TOOLBAR_PADDING = 64;
const FILMSTRING_PADDING_V = 16;
const FILMSTRING_PADDING_H = 32;

const FILL_RATE = 0.95;

const styles = (theme) => ({
    root : {
        width    : "100%",
        height   : "100vh",
        overflow : "hidden",
        // display: "grid",
        // gridTemplateColumns: "1fr 0.1fr",
        // gridTemplateRows: "1fr",
        // gap: theme.spacing(2),
        // padding: theme.spacing(2),
        position : "relative",
    },
    speaker : {
        // gridArea: "1 / 1 / 1 / 1",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "flex-start",
        overflow       : "hidden",
        transition     : "all .5s ease",
        // padding: theme.spacing(2,0,2,2),

        position                       : "absolute",
        top                            : 0,
        left                           : 0,
        padding                        : theme.spacing(3, 2, 2, 2),
        width                          : "85%",
        height                         : "100%",
        [theme.breakpoints.down("md")] : {
            width : "85%",
        },
    },
    speakerFullScreen : {
        width : "100%",
    },
    filmStrip : {
        // gridArea: "1 / 2 / 1 / 2",
        // overflowX: "scroll",
        backgroundColor                : alpha(palette.basic.gray, 0.2),
        borderRadius                   : "var(--peer-border-radius-sm)",
        position                       : "absolute",
        width                          : `calc(15% - ${FILMSTRING_PADDING_H}px)`,
        height                         : `calc(100% - ${FILMSTRING_PADDING_V + TOOLBAR_PADDING}px)`,
        padding                        : theme.spacing(1, 0),
        top                            : theme.spacing(1),
        bottom                         : theme.spacing(1),
        right                          : theme.spacing(2),
        // padding: theme.spacing(2, 2, 2, 0),
        transition                     : "transform .5s ease",
        [theme.breakpoints.down("md")] : {
            width : `calc(15% - ${FILMSTRING_PADDING_H}px)`,
        },
    },
    filmStripList : {
        height                 : "100%",
        overflowY              : "auto",
        overflowX              : "hidden",
        "&::-webkit-scrollbar" : {
            display : "none",
        },
    },
    hiddenFilmStrip : {
        transform : `translateX(calc(100% + ${FILMSTRING_PADDING_H}px / 2) )`,
    },
    filmStripSlider : {
        position : "relative",
        top      : 0,
        left     : 0,
    },
    hiddenButton : {
        position : "absolute",
        left     : -theme.spacing(3),
        top      : "50%",
        color    : palette.basic.gray,
    },
    hiddenButtonIcon : {
        color : palette.basic.gray,
    },
    filmItem : {
        display       : "flex",
        gap           : theme.spacing(1),
        flexDirection : "column",
        // border: "var(--peer-border)",
        "&.selected"  : {
            borderColor : "var(--selected-peer-border-color)",
        },
        "&.active" : {
            borderColor : "var(--selected-peer-border-color)",
        },
    },
    hiddenToolBar : {
        // paddingTop: 0,
        transition : "padding .5s",
    },
    showingToolBar : {
        paddingBottom : TOOLBAR_PADDING,
        transition    : "padding .5s",
    },
});

class Filmstrip extends React.PureComponent {
    constructor(props) {
        super(props);

        this.resizeTimeout = null;

        this.rootContainer = React.createRef();

        this.activePeerContainer = React.createRef();

        this.filmStripContainer = React.createRef();

        const selectedPeerId = this.getSelectedPeerId();

        if (selectedPeerId) {
            props.roomClient.setSelectedPeer(selectedPeerId);
        }
    }

    state = {
        lastSpeaker     : null,
        hiddenFilmStrip : false,
    };

    toggleHiddenFilmStrip = () => {
        this.setState({ hiddenFilmStrip: !this.state.hiddenFilmStrip });
    };

    getSelectedPeerId = () => {
        const { selectedPeers, peers } = this.props;

        let selectedPeerId;

        if (
            selectedPeers &&
            selectedPeers.length > 0 &&
            peers[selectedPeers[selectedPeers.length - 1]]
        ) {
            selectedPeerId = selectedPeers[selectedPeers.length - 1];
        }

        return selectedPeerId;
    };

    // Find the name of the peer which is currently speaking. This is either
    // the latest active speaker, or the manually selected peer, or, if no
    // person has spoken yet, the first peer in the list of peers.
    getActivePeerId = () => {
        const { peers } = this.props;

        const { lastSpeaker } = this.state;

        const selectedPeerId = this.getSelectedPeerId();

        if (selectedPeerId && peers[selectedPeerId]) {
            return selectedPeerId;
        }

        if (lastSpeaker && peers[lastSpeaker]) {
            return this.state.lastSpeaker;
        }

        const peerIds = Object.keys(peers);

        if (peerIds.length > 0) {
            return peerIds[0];
        }
    };

    isSharingCamera = (peerId) =>
        this.props.peers[peerId] &&
        this.props.peers[peerId].consumers.some(
            (consumer) => this.props.consumers[consumer].source === "screen"
        );

    updateDimensions = () => {
        const {
            toolbarsVisible,
            permanentTopBar,
            boxes,
            aspectRatio,
            document,
            whiteboard,
            youtube,
        } = this.props;

        const newState = {};

        const root = this.activePeerContainer.current;

        if (!root) {return;}

        const availableWidth = root.clientWidth;
        const availableHeight = root.clientHeight;
        // Grid is:
        // 4/5 speaker
        // 1/5 filmstrip
        const availableSpeakerHeight =
            root.clientHeight -
            PADDING_V -
            (toolbarsVisible || permanentTopBar ? TOOLBAR_PADDING : 0);

        const availableFilmstripHeight =
            root.clientHeight -
            FILMSTRING_PADDING_V -
            (toolbarsVisible || permanentTopBar ? TOOLBAR_PADDING : 0);

        const speaker = this.activePeerContainer.current;

        if (speaker) {
            let speakerWidth = availableWidth - PADDING_H;

            let speakerHeight = speakerWidth / aspectRatio;

            // if (this.isSharingCamera(this.getActivePeerId())) {
            //     speakerWidth /= 2;
            //     speakerHeight = speakerWidth / aspectRatio;
            // }

            if (speakerHeight > availableSpeakerHeight) {
                speakerHeight = availableSpeakerHeight;
                speakerWidth = speakerHeight * aspectRatio;
            }

            if (
                true ||
                document.documentOpen ||
                document.latexOpen ||
                whiteboard.whiteboardOpen ||
                youtube.status === YOUTUBE_START ||
                youtube.status === YOUTUBE_PLAYING ||
                youtube.status === YOUTUBE_PAUSE
            ) {
                speakerWidth = speakerWidth;
                speakerHeight = availableSpeakerHeight;
            }

            newState.speakerWidth = speakerWidth;
            newState.speakerHeight = speakerHeight;
        }

        const filmStrip = this.filmStripContainer.current;

        const availableFilmstripWidth = filmStrip.clientWidth;

        if (filmStrip) {
            const filmStripWidth = availableFilmstripWidth;

            const filmStripHeight = filmStripWidth / aspectRatio;

            // if (filmStripHeight * boxes > availableFilmstripHeight) {
            //     filmStripWidth =
            //         (availableWidth - FILMSTRING_PADDING_H) / boxes;
            //     filmStripHeight = filmStripWidth / aspectRatio;
            // }

            newState.filmStripWidth = filmStripWidth * FILL_RATE;
            newState.filmStripHeight = filmStripHeight * FILL_RATE;
        }

        this.setState({
            ...newState,
        });
    };

    componentDidMount() {
        // window.resize event listener
        window.addEventListener("resize", () => {
            // clear the timeout
            clearTimeout(this.resizeTimeout);

            // start timing for event "completion"
            this.resizeTimeout = setTimeout(() => this.updateDimensions(), 250);
        });

        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            if (
                this.props.activeSpeakerId != null &&
                this.props.activeSpeakerId !== this.props.myId
            ) {
                this.setState({
                    lastSpeaker : this.props.activeSpeakerId,
                });
            }

            this.updateDimensions();
        }
    }

    render() {
        const {
            /* roomClient, */
            peers,
            myId,
            advancedMode,
            spotlights,
            toolbarsVisible,
            permanentTopBar,
            hideSelfView,
            classes,
            whiteboard,
            document,
            youtube,
            selectedPresentFile,
        } = this.props;

        const activePeerId = this.getActivePeerId();

        const speakerStyle = {
            width  : this.state.speakerWidth,
            height : this.state.speakerHeight,
        };

        const peerStyle = {
            width  : this.state.filmStripWidth,
            height : this.state.filmStripHeight,
        };

        const sharingScreen = this.isSharingCamera(this.getActivePeerId());

        const playingYoutube =
            youtube.status === YOUTUBE_START ||
            youtube.status === YOUTUBE_PLAYING ||
            youtube.status === YOUTUBE_PAUSE;

        const openingDocument = document.documentOpen;
        const openingLaTeX = document.latexOpen;
        const openingWhiteboard = whiteboard.whiteboardOpen;

        const speakerPeer =
            !openingLaTeX &&
            !openingDocument &&
            !playingYoutube &&
            !openingWhiteboard &&
            !selectedPresentFile;

        return (
            <div
                className={classnames(
                    classes.root,
                    toolbarsVisible || permanentTopBar
                        ? classes.showingToolBar
                        : classes.hiddenToolBar
                )}
                ref={this.rootContainer}
            >
                <div
                    className={classnames(
                        classes.speaker,
                        this.state.hiddenFilmStrip && classes.speakerFullScreen
                    )}
                    ref={this.activePeerContainer}
                >
                    {speakerPeer && peers[activePeerId] && (
                        <SpeakerPeer
                            advancedMode={advancedMode}
                            id={activePeerId}
                            style={speakerStyle}
                        />
                    )}

                    {selectedPresentFile && (
                        <PdfPreview
                            file={selectedPresentFile}
                            style={speakerStyle}
                        />
                    )}

                    {openingDocument && <Document style={speakerStyle} />}

                    {playingYoutube && <YoutubeView style={speakerStyle} />}

                </div>

                <div
                    className={classnames(
                        classes.filmStrip,
                        this.state.hiddenFilmStrip && classes.hiddenFilmStrip
                    )}
                    ref={this.filmStripContainer}
                >
                    <Grid
                        container
                        justifyContent="flex-start"
                        alignItems="center"
                        direction="column"
                        wrap="nowrap"
                        spacing={1}
                        className={classes.filmStripList}
                    >
                        <Grid item>
                            <div
                                className={classnames(classes.filmItem, {
                                    active : myId === activePeerId,
                                })}
                            >
                                {!hideSelfView && (
                                    <Me
                                        advancedMode={advancedMode}
                                        style={peerStyle}
                                    />
                                )}
                            </div>
                        </Grid>

                        {Object.keys(peers).map((peerId) => {
                            if (
                                spotlights.find(
                                    (spotlightsElement) =>
                                        spotlightsElement === peerId
                                )
                            ) {
                                return (
                                    <Grid key={peerId} item>
                                        <div
                                            key={peerId}
                                            className={classnames(
                                                classes.filmItem,
                                                {
                                                    selected :
                                                        this.getSelectedPeerId() ===
                                                        peerId,
                                                    active :
                                                        peerId === activePeerId,
                                                }
                                            )}
                                        >
                                            <Peer
                                                advancedMode={advancedMode}
                                                id={peerId}
                                                style={peerStyle}
                                                enableLayersSwitch={
                                                    activePeerId !== peerId
                                                }
                                            />
                                        </div>
                                    </Grid>
                                );
                            } 
                            return "";
                            
                        })}
                    </Grid>

                    {/* slider hidden filmstrip peers */}
                    <IconButton
                        className={classes.hiddenButton}
                        size="small"
                        onClick={this.toggleHiddenFilmStrip}
                        disableRipple
                    >
                        {this.state.hiddenFilmStrip ? (
                            <NavigateBeforeIcon />
                        ) : (
                            <NavigateNextIcon />
                        )}
                    </IconButton>
                </div>
            </div>
        );
    }
}

Filmstrip.propTypes = {
    roomClient      : PropTypes.any.isRequired,
    activeSpeakerId : PropTypes.string,
    advancedMode    : PropTypes.bool,
    peers           : PropTypes.object.isRequired,
    consumers       : PropTypes.object.isRequired,
    myId            : PropTypes.string.isRequired,
    selectedPeers   : PropTypes.array,
    spotlights      : PropTypes.array.isRequired,
    boxes           : PropTypes.number,
    toolbarsVisible : PropTypes.bool.isRequired,
    hideSelfView    : PropTypes.bool.isRequired,
    toolAreaOpen    : PropTypes.bool.isRequired,
    permanentTopBar : PropTypes.bool.isRequired,
    aspectRatio     : PropTypes.number.isRequired,
    classes         : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        activeSpeakerId     : state.room.activeSpeakerId,
        selectedPeers       : state.room.selectedPeers,
        peers               : state.peers,
        consumers           : state.consumers,
        myId                : state.me.id,
        spotlights          : state.room.spotlights,
        boxes               : videoBoxesSelector(state),
        toolbarsVisible     : state.room.toolbarsVisible,
        hideSelfView        : state.room.hideSelfView,
        toolAreaOpen        : state.toolarea.toolAreaOpen,
        aspectRatio         : state.settings.aspectRatio,
        permanentTopBar     : state.settings.permanentTopBar,
        whiteboard          : state.whiteboard,
        youtube             : state.youtube,
        document            : state.document,
        selectedPresentFile : state.presentation.selectedFile,
    };
};

export default withRoomContext(
    connect(mapStateToProps, null, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.room.activeSpeakerId === next.room.activeSpeakerId &&
                prev.room.selectedPeers === next.room.selectedPeers &&
                prev.room.toolbarsVisible === next.room.toolbarsVisible &&
                prev.room.hideSelfView === next.room.hideSelfView &&
                prev.toolarea.toolAreaOpen === next.toolarea.toolAreaOpen &&
                prev.settings.permanentTopBar ===
                    next.settings.permanentTopBar &&
                prev.settings.aspectRatio === next.settings.aspectRatio &&
                prev.peers === next.peers &&
                prev.consumers === next.consumers &&
                prev.room.spotlights === next.room.spotlights &&
                prev.me.id === next.me.id &&
                prev.document.documentOpen === next.document.documentOpen &&
                prev.document.latexOpen === next.document.latexOpen &&
                prev.whiteboard.whiteboardOpen ===
                    next.whiteboard.whiteboardOpen &&
                prev.youtube.status === next.youtube.status &&
                prev.presentation.selectedFile ===
                    next.presentation.selectedFile
            );
        },
    })(withStyles(styles)(Filmstrip))
);
