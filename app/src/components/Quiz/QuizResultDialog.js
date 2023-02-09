import React from "react";
import {
    Box,
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

import { quizResultSelector } from "../../store/selectors";
import * as quizzesActions from "../../store/actions/quizActions";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import { CloseIcon } from "../../assets/icons";
import palette from "../../theme/palette";
import { mapIndexsToValues } from "./utils";

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
    answerResultContainer : {
        padding : theme.spacing(2),
    },
    answerInfo : {
        display        : "flex",
        flexDirection  : "row",
        flexWrap       : "nowrap",
        justifyContent : "space-between",
        gap            : theme.spacing(1),
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
    peerAnswerWrapper : {
        overflow     : "hidden",
        whiteSpace   : "nowrap",
        textOverflow : "ellipsis",
        width        : "100px",
    },
    peerAnswer : {
        color : "var(--answerColor) ",
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

const Transition = React.forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const QuizResultDialog = (props) => {
    const {
        classes,
        quizResultDialogOpen,
        handleCloseQuizResultDialog,
        handleOpenQuizDashboardDialog,
        clearSelectedQuiz,
        quizResult,
    } = props;

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
                    {answerValues.map((answer, index) => {
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
            open={quizResultDialogOpen}
            onClose={handleCloseQuizResultDialog}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="md"
            fullWidth
            TransitionProps={{
                onExited : clearSelectedQuiz,
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
                            id="label.quizResult"
                            defaultMessage="Quiz Result"
                        />
                    </Typography>
                    <IconButton
                        className={classes.closeBtn}
                        onClick={handleCloseQuizResultDialog}
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
            </DialogActions>
        </Dialog>
    );
};

QuizResultDialog.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        quizResult           : quizResultSelector(state),
        quizResultDialogOpen : state.quizzes.quizResultDialogOpen,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearSelectedQuiz : () => {
            dispatch(quizzesActions.clearSelectedQuiz());
        },
        handleCloseQuizResultDialog : () => {
            dispatch(quizzesActions.setQuizResultDialogOpen(false));
        },
        handleOpenQuizDashboardDialog : () => {
            dispatch(quizzesActions.setQuizDashboardOpen(true));
            dispatch(quizzesActions.setQuizResultDialogOpen(false));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
    areStatesEqual : (next, prev) => {
        return (
            next.quizzes.quizResultDialogOpen ===
                prev.quizzes.quizResultDialogOpen &&
            next.quizzes.quizzes === next.quizzes.quizzes
        );
    },
})(withStyles(styles)(QuizResultDialog));
