import { createSelector } from "reselect";

import {
    YOUTUBE_SHARING,
    WHITEBOARD,
    SCREEN_SHARING,
    LATEX,
    SPEAKER_PEER,
    CLASS_DOCUMENT,
} from "../components/constants";
import { permissions } from "../permissions";

import {
    YOUTUBE_START,
    YOUTUBE_PAUSE,
    YOUTUBE_PLAYING,
} from "./actions/youtubeManagerActions";

const meRolesSelect = (state) => state.me.roles;
const userRolesSelect = (state) => state.room.userRoles;
const roomPermissionsSelect = (state) => state.room.roomPermissions;
const roomAllowWhenRoleMissing = (state) => state.room.allowWhenRoleMissing;
const producersSelect = (state) => state.producers;
const consumersSelect = (state) => state.consumers;
// const meSelector = (state) => state.me;
const spotlightsSelector = (state) => state.room.spotlights;
const peersSelector = (state) => state.peers;
const lobbyPeersSelector = (state) => state.lobbyPeers;
const getPeerConsumers = (state, id) =>
    state.peers[id] ? state.peers[id].consumers : null;
const isHiddenSelect = (state) => state.room.hideSelfView;
const getAllConsumers = (state) => state.consumers;
const peersKeySelector = createSelector(peersSelector, (peers) =>
    Object.keys(peers)
);
const quizzesSelector = (state) => state.quizzes.quizzes;
const selectedQuizSelector = (state) => state.quizzes.selectedQuiz;

const youtubeSelector = (state) => state.youtube;
// const whiteboardSelector = (state) => state.whiteboard;
// const documentSelector = (state) => state.document;

const breakoutRoomsSelector = (state) => state.room.breakoutRooms;
const breakoutRoomIdSelector = (state) => state.room.myBreakoutRoomId;

export const peersValueSelector = createSelector(peersSelector, (peers) =>
    Object.values(peers)
);

export const lobbyPeersKeySelector = createSelector(
    lobbyPeersSelector,
    (lobbyPeers) => Object.keys(lobbyPeers)
);

export const micProducersSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).filter((producer) => producer.source === "mic")
);

export const webcamProducersSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).filter(
            (producer) => producer.source === "webcam"
        )
);

export const screenProducersSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).filter(
            (producer) => producer.source === "screen"
        )
);

export const extraVideoProducersSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).filter(
            (producer) => producer.source === "extravideo"
        )
);

export const micProducerSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).find((producer) => producer.source === "mic")
);

export const webcamProducerSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).find(
            (producer) => producer.source === "webcam"
        )
);

export const screenProducerSelector = createSelector(
    producersSelect,
    (producers) =>
        Object.values(producers).find(
            (producer) => producer.source === "screen"
        )
);

export const micConsumerSelector = createSelector(
    consumersSelect,
    (consumers) =>
        Object.values(consumers).filter((consumer) => consumer.source === "mic")
);

export const webcamConsumerSelector = createSelector(
    consumersSelect,
    (consumers) =>
        Object.values(consumers).filter(
            (consumer) => consumer.source === "webcam"
        )
);

export const screenConsumerSelector = createSelector(
    consumersSelect,
    (consumers) =>
        Object.values(consumers).filter(
            (consumer) => consumer.source === "screen"
        )
);

export const spotlightScreenConsumerSelector = createSelector(
    spotlightsSelector,
    consumersSelect,
    (spotlights, consumers) =>
        Object.values(consumers).filter(
            (consumer) =>
                consumer.source === "screen" &&
                spotlights.includes(consumer.peerId)
        )
);

export const spotlightExtraVideoConsumerSelector = createSelector(
    spotlightsSelector,
    consumersSelect,
    (spotlights, consumers) =>
        Object.values(consumers).filter(
            (consumer) =>
                consumer.source === "extravideo" &&
                spotlights.includes(consumer.peerId)
        )
);

export const passiveMicConsumerSelector = createSelector(
    spotlightsSelector,
    consumersSelect,
    (spotlights, consumers) =>
        Object.values(consumers).filter(
            (consumer) =>
                consumer.source === "mic" &&
                !spotlights.includes(consumer.peerId)
        )
);

export const highestRoleLevelSelector = createSelector(
    meRolesSelect,
    userRolesSelect,
    (roles, userRoles) => {
        let level = 0;

        for (const role of roles) {
            const tmpLevel = userRoles.get(role).level;

            if (tmpLevel > level) {
                level = tmpLevel;
            }
        }

        return level;
    }
);

export const spotlightsLengthSelector = createSelector(
    spotlightsSelector,
    (spotlights) => spotlights.length
);

export const spotlightPeersSelector = createSelector(
    spotlightsSelector,
    peersKeySelector,
    (spotlights, peers) => peers.filter((peerId) => spotlights.includes(peerId))
);

export const spotlightSortedPeersSelector = createSelector(
    spotlightsSelector,
    peersValueSelector,
    (spotlights, peers) =>
        peers
            .filter((peer) => spotlights.includes(peer.id) && !peer.raisedHand)
            .sort((a, b) =>
                String(a.displayName || "").localeCompare(
                    String(b.displayName || "")
                )
            )
);

const raisedHandSortedPeers = createSelector(peersValueSelector, (peers) =>
    peers
        .filter((peer) => peer.raisedHand)
        .sort((a, b) => a.raisedHandTimestamp - b.raisedHandTimestamp)
);

const peersSortedSelector = createSelector(
    spotlightsSelector,
    peersValueSelector,
    (spotlights, peers) =>
        peers
            .filter((peer) => !spotlights.includes(peer.id) && !peer.raisedHand)
            .sort((a, b) =>
                String(a.displayName || "").localeCompare(
                    String(b.displayName || "")
                )
            )
);

export const participantListSelector = createSelector(
    raisedHandSortedPeers,
    spotlightSortedPeersSelector,
    peersSortedSelector,
    (raisedHands, spotlights, peers) => [
        ...raisedHands,
        ...spotlights,
        ...peers,
    ]
);

export const moderatorListSelector = createSelector(
    roomPermissionsSelect,
    peersValueSelector,
    (roomPermissions, peers) => {
        return peers.filter((peer) =>
            peer.roles.some((roleId) =>
                roomPermissions[permissions.MODERATE_ROOM].some(
                    (permissionRole) => roleId === permissionRole.id
                )
            )
        );
    }
);

export const peersLengthSelector = createSelector(
    peersSelector,
    (peers) => Object.values(peers).length
);

export const passivePeersSelector = createSelector(
    peersValueSelector,
    spotlightsSelector,
    (peers, spotlights) =>
        peers
            .filter((peer) => !spotlights.includes(peer.id))
            .sort((a, b) =>
                String(a.displayName || "").localeCompare(
                    String(b.displayName || "")
                )
            )
);

export const raisedHandsSelector = createSelector(peersValueSelector, (peers) =>
    peers.reduce((a, b) => a + (b.raisedHand ? 1 : 0), 0)
);

export const youtubeSharedSelector = createSelector(
    youtubeSelector,
    (youtube) =>
        youtube.status === YOUTUBE_PLAYING ||
        youtube.status === YOUTUBE_START ||
        youtube.youtube === YOUTUBE_PAUSE
);

export const videoBoxesSelector = createSelector(
    isHiddenSelect,
    spotlightsLengthSelector,
    screenProducersSelector,
    spotlightScreenConsumerSelector,
    extraVideoProducersSelector,
    spotlightExtraVideoConsumerSelector,
    youtubeSelector,
    (
        isHidden,
        spotlightsLength,
        screenProducers,
        screenConsumers,
        extraVideoProducers,
        extraVideoConsumers,
        youtube
    ) => {
        return (
            spotlightsLength +
            (isHidden ? 0 : 1) +
            (isHidden ? 0 : screenProducers.length) +
            screenConsumers.length +
            (isHidden ? 0 : extraVideoProducers.length) +
            extraVideoConsumers.length +
            (youtube.url ? 1 : 0)
        );
    }
);

export const meProducersSelector = createSelector(
    micProducerSelector,
    webcamProducerSelector,
    screenProducerSelector,
    extraVideoProducersSelector,
    (micProducer, webcamProducer, screenProducer, extraVideoProducers) => {
        return {
            micProducer,
            webcamProducer,
            screenProducer,
            extraVideoProducers,
        };
    }
);

export const makePeerConsumerSelector = () => {
    return createSelector(
        getPeerConsumers,
        getAllConsumers,
        (consumers, allConsumers) => {
            if (!consumers) {
                return null;
            }

            const consumersArray = consumers.map(
                (consumerId) => allConsumers[consumerId]
            );
            const micConsumer = consumersArray.find(
                (consumer) => consumer.source === "mic"
            );
            const webcamConsumer = consumersArray.find(
                (consumer) => consumer.source === "webcam"
            );
            const screenConsumer = consumersArray.find(
                (consumer) => consumer.source === "screen"
            );
            const extraVideoConsumers = consumersArray.filter(
                (consumer) => consumer.source === "extravideo"
            );

            return {
                micConsumer,
                webcamConsumer,
                screenConsumer,
                extraVideoConsumers,
            };
        }
    );
};

// Very important that the Components that use this
// selector need to check at least these state changes:
//
// areStatesEqual : (next, prev) =>
// {
// 		return (
// 			prev.room.roomPermissions === next.room.roomPermissions &&
// 			prev.room.allowWhenRoleMissing === next.room.allowWhenRoleMissing &&
// 			prev.peers === next.peers &&
// 			prev.me.roles === next.me.roles
// 		);
// }
export const makePermissionSelector = (permission) => {
    return createSelector(
        meRolesSelect,
        roomPermissionsSelect,
        roomAllowWhenRoleMissing,
        peersValueSelector,
        (roles, roomPermissions, allowWhenRoleMissing, peers) => {
            if (!roomPermissions) {
                return false;
            }

            const permitted = roles.some((roleId) =>
                roomPermissions[permission].some(
                    (permissionRole) => roleId === permissionRole.id
                )
            );

            if (permitted) {
                return true;
            }

            if (!allowWhenRoleMissing) {
                return false;
            }

            // Allow if config is set, and no one is present
            if (
                allowWhenRoleMissing.includes(permission) &&
                peers.filter((peer) =>
                    peer.roles.some((roleId) =>
                        roomPermissions[permission].some(
                            (permissionRole) => roleId === permissionRole.id
                        )
                    )
                ).length === 0
            ) {
                return true;
            }

            return false;
        }
    );
};

export const isPresentedSelector = (presented_type) => {
    return createSelector(() => {
        switch (presented_type) {
        case WHITEBOARD:
            return false;
        case CLASS_DOCUMENT:
            return false;
        case LATEX:
            return false;
        case SPEAKER_PEER:
            return false;
        case YOUTUBE_SHARING:
            return false;
        case SCREEN_SHARING:
            return false;

        default:
            return false;
        }
    });
};

export const getMyBreakoutRoomSelector = () => {
    return createSelector(
        breakoutRoomsSelector,
        breakoutRoomIdSelector,
        (breakoutRooms, id) => {
            if (!breakoutRooms) {return;}

            return breakoutRooms[id];
        }
    );
};

export const getBreakoutRoomLengthSelector = createSelector(
    breakoutRoomsSelector,
    (breakoutRooms) => {
        return Object.keys(breakoutRooms).length;
    }
);
export const quizResultSelector = createSelector(
    quizzesSelector,
    selectedQuizSelector,
    (quizzes, selectedQuiz) => {
        const quiz = quizzes.filter((quiz) => quiz.time === selectedQuiz)[0];

        if (!quiz) {return;}

        const answersResult = [...quiz.answers].map((answer, index) => ({
            answer,
            answerIndex             : index,
            answeredPeers           : 0,
            answeredPeersPercentage : 0,
        }));

        quiz.answeredPeers.forEach((peer) => {
            peer.peerAnswerIndexs.map((peerAnswerIndex) => {
                const answerResult = answersResult[peerAnswerIndex];
                answerResult.answeredPeers++;
                answerResult.answeredPeersPercentage =
                    (answerResult.answeredPeers / quiz.maxAnsweredPeers) * 100;
            });
        });

        return { ...quiz, answersResult };
    }
);

export const quizLiveResultSelector = createSelector(
    quizzesSelector,
    selectedQuizSelector,
    peersLengthSelector,
    (quizzes, selectedQuiz, peersLength) => {
        const quiz = quizzes.filter((quiz) => quiz.time === selectedQuiz)[0];

        if (!quiz) {return;}

        const answersResult = [...quiz.answers].map((answer, index) => ({
            answer,
            answerIndex             : index,
            answeredPeers           : 0,
            answeredPeersPercentage : 0,
        }));

        quiz.answeredPeers.forEach((peer) => {
            peer.peerAnswerIndexs.map((peerAnswerIndex) => {
                const answerResult = answersResult[peerAnswerIndex];
                answerResult.answeredPeers += 1;
                answerResult.answeredPeersPercentage =
                    (answerResult.answeredPeers / peersLength) * 100;
            });
        });

        return { ...quiz, answersResult };
    }
);

export const quizzesSortedSelector = createSelector(
    quizzesSelector,
    (quizzes) => {
        return quizzes.sort((a, b) => b.time - a.time);
    }
);
