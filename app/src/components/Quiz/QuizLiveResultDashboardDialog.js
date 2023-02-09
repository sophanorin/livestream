import React from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Slide,
    Tooltip,
    Typography,
    withStyles,
} from "@material-ui/core";
import PropTypes from "prop-types";
import randomColor from "randomcolor";
import KeyboardBackspaceOutlinedIcon from "@material-ui/icons/KeyboardBackspaceOutlined";

import {
    quizLiveResultSelector,
    quizResultSelector,
} from "../../store/selectors";
import * as quizzesActions from "../../store/actions/quizActions";
import { connect } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { CloseIcon } from "../../assets/icons";
import palette from "../../theme/palette";
import { withRoomContext } from "../../RoomContext";
import { mapIndexsToValues } from "./utils";

const Transition = React.forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />;
});

const styles = (theme) => ({
    root  : {},
    title : {
        fontWeight : "bold",
    },
    dialogPaper : {
        height       : "100%",
        borderRadius : "var(--peer-border-radius-lg)",
        padding      : `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(
            2
        )}px ${theme.spacing(2)}px`,
    },
    closeBtn : {
        transform                      : "translateX(50%)",
        [theme.breakpoints.down("xs")] : {
            transform : "translateX(0%)",
        },
    },
    peerAnswerWrapper : {
        overflow     : "hidden",
        whiteSpace   : "nowrap",
        textOverflow : "ellipsis",
        width        : "100px",
    },
    peerAnswer : {
        color : "var(--answerColor) ",
    },
    answerResultContainer : {
        padding : theme.spacing(2),
    },
    answerInfo : {
        display        : "flex",
        flexDirection  : "row",
        flexWrap       : "nowrap",
        justifyContent : "space-between",
    },
    answerPercentage : {},
    answerNumber     : {},
    progress         : {
        borderRadius                           : "var(--peer-border-radius-md)",
        background                             : "#E9ECEF",
        "& .MuiLinearProgress-barColorPrimary" : {
            background : "var(--color) ",
        },
    },
    question : {
        marginBottom : theme.spacing(2),
    },
    divider : {
        margin     : theme.spacing(4, 0),
        background : "#8D8E92",
    },
    votes : {
        marginBottom : theme.spacing(2),
    },
    actions : {
        justifyContent : "space-between",
    },
    correctAnswer : {
        fontWeight : "bold",
        color      : palette.status.green.primary,
    },
});

export const QuizLiveResultDashboardDialog = (props) => {
    const {
        classes,
        quizLiveResultDashboardDialogOpen,
        handleCloseQuizLiveResultDashboardDialog,
        handleOpenQuizDashboardDialog,
        clearSelectedQuiz,
        quizResult,
        roomClient,
    } = props;

    const intl = useIntl();

    let quizState;
    let quizTip;

    if (quizResult.isPublicResult) {
        quizState = "published";
        quizTip = intl.formatMessage({
            id             : "quiz.published",
            defaultMessage : "Published",
        });
    } else {
        quizState = "local";
        quizTip = intl.formatMessage({
            id             : "quiz.nonPublished",
            defaultMessage : "Publish",
        });
    }

    const renderPeerAnswers = (peerAnswerIndexs) => {
        const answerValues = mapIndexsToValues(
            peerAnswerIndexs,
            quizResult.answers
        );

        return (
            <Tooltip title={answerValues.join(", ")} placement="top">
                <Typography
                    component="p"
                    variant="subtitle2"
                    className={classes.peerAnswerWrapper}
                >
                    {answerValues.map((answer) => {
                        return (
                            <Typography
                                className={classes.peerAnswer}
                                component="span"
                                variant="subtitle2"
                                style={{
                                    "--answerColor" :
                                        quizResult.answerColors[
                                            quizResult.answers.indexOf(answer)
                                        ],
                                }}
                            >
                                {answer}{" "}
                            </Typography>
                        );
                    })}
                </Typography>
            </Tooltip>
        );
    };

    return (
        <Dialog
            className={classes.root}
            open={quizLiveResultDashboardDialogOpen}
            onClose={handleCloseQuizLiveResultDashboardDialog}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="md"
            fullWidth
            TransitionProps={{
                onExit : clearSelectedQuiz,
            }}
            TransitionComponent={Transition}
        >
            <DialogTitle disableTypography id="form-dialog-title">
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    wrap="nowrap"
                >
                    <Typography
                        component="h2"
                        variant="subtitle1"
                        className={classes.title}
                    >
                        <FormattedMessage
                            id="label.liveResultDashboard"
                            defaultMessage="Live Quiz Result Dashboard"
                        />
                    </Typography>
                    <IconButton
                        className={classes.closeBtn}
                        onClick={handleCloseQuizLiveResultDashboardDialog}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Typography
                    component="p"
                    variant="body2"
                    color="primary"
                    className={classes.question}
                >
                    {quizResult.question}
                </Typography>
                <Grid container spacing={2}>
                    {quizResult.answersResult.map((result, index) => (
                        <Grid key={index} item sm={4} md={4} lg={4}>
                            <Paper className={classes.answerResultContainer}>
                                <Box
                                    component="div"
                                    className={classes.answerInfo}
                                >
                                    <Typography
                                        component="p"
                                        variant="subtitle2"
                                        className={classes.answer}
                                    >
                                        {result.answer}
                                    </Typography>
                                    <Typography
                                        component="p"
                                        variant="subtitle2"
                                        className={classes.answerPercentage}
                                    >
                                        {result.answeredPeersPercentage} %
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={result.answeredPeersPercentage}
                                    className={classes.progress}
                                    style={{
                                        "--color" :
                                            quizResult.answerColors[index],
                                    }}
                                />
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        component="p"
                                        variant="caption"
                                        className={classes.answerNumber}
                                    >
                                        {result.answeredPeers} students
                                    </Typography>
                                    {quizResult.correctIndexs?.includes(
                                        result.answerIndex
                                    ) && (
                                        <Typography
                                            component="p"
                                            variant="caption"
                                            className={classes.correctAnswer}
                                        >
                                            <FormattedMessage
                                                id="quiz.correctAnswer"
                                                defaultMessage="Correct"
                                            />
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
                <Divider className={classes.divider} />
                <Typography
                    component="p"
                    variant="subtitle2"
                    color="primary"
                    className={classes.votes}
                >
                    <FormattedMessage
                        id="quiz.total"
                        defaultMessage="Total Answers"
                    />
                    : {quizResult.answeredPeers.length}
                </Typography>
                <Grid container spacing={2}>
                    {quizResult.answeredPeers.map((peer, index) => (
                        <Grid
                            lg={4}
                            md={4}
                            sm={4}
                            key={index}
                            item
                            container
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Grid item lg={6} md={6}>
                                <Typography component="p" variant="subtitle2">
                                    {peer.name}
                                </Typography>
                            </Grid>

                            <Grid item lg={6} md={6}>
                                {renderPeerAnswers(peer.peerAnswerIndexs)}
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <IconButton onClick={handleOpenQuizDashboardDialog}>
                    <KeyboardBackspaceOutlinedIcon fontSize="small" />
                </IconButton>
                <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    disabled={quizResult.isPublicResult}
                    onClick={async () => {
                        await roomClient.publicQuizResult(quizResult);
                    }}
                >
                    {quizTip}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

QuizLiveResultDashboardDialog.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        quizResult                        : quizLiveResultSelector(state),
        quizLiveResultDashboardDialogOpen :
            state.quizzes.quizLiveResultDashboardDialogOpen,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearSelectedQuiz : () => {
            dispatch(quizzesActions.clearSelectedQuiz());
        },
        handleCloseQuizLiveResultDashboardDialog : () => {
            dispatch(
                quizzesActions.setQuizLiveResultDashboardDialogOpen(false)
            );
        },
        handleOpenQuizDashboardDialog : () => {
            dispatch(quizzesActions.setQuizDashboardOpen(true));
            dispatch(
                quizzesActions.setQuizLiveResultDashboardDialogOpen(false)
            );
        },
    };
};

export default withRoomContext(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(QuizLiveResultDashboardDialog))
);
