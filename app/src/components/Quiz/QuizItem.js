import React from "react";
import { connect } from "react-redux";
import { FormattedDate, FormattedTime, useIntl } from "react-intl";
import { withStyles } from "@material-ui/styles";
import { Box, Grid, Typography } from "@material-ui/core";
import classnames from "classnames";

import { makePermissionSelector } from "../../store/selectors";
import * as quizzesActions from "../../store/actions/quizActions";
import palette from "../../theme/palette";
import { QuizIcon } from "../../assets/icons";
import { permissions } from "../../permissions";

const styles = (theme) => ({
    root : {
        cursor       : "pointer",
        margin       : theme.spacing(1, 0),
        padding      : theme.spacing(2),
        border       : `1px solid ${palette.secondary.main}`,
        borderRadius : "var(--peer-border-radius-md)",
    },
    icon : {
        [theme.breakpoints.down("sm")] : {
            display : "none",
        },
    },
    quizInfo : {
        display : "flex",
        gap     : theme.spacing(2),
    },
    text : {
        overflow                       : "hidden",
        whiteSpace                     : "nowrap",
        textOverflow                   : "ellipsis",
        maxWidth                       : "300px",
        [theme.breakpoints.down("sm")] : {
            maxWidth : "200px",
        },
        [theme.breakpoints.down("xs")] : {
            maxWidth : "130px",
        },
    },
    primary : {
        color : palette.primary.main,
    },
    green : {
        color : palette.status.green.primary,
    },
});

function QuizItem(props) {
    const intl = useIntl();
    const {
        classes,
        quiz,
        handleOpenQuizDialog,
        handleOpenQuizResultDialog,
        handleOpenQuizLiveResultDashboardDialog,
        setSelectedQuiz,
        isModerator,
        isseen,
        time,
    } = props;

    let quizState;
    let quizTip;
    let color;

    // waiting result from teacher
    if (quiz.answered) {
        if (isModerator && !quiz.isPublicResult) {
            quizState = "public";
            quizTip = intl.formatMessage({
                id             : "quiz.public",
                defaultMessage : "Public now",
            });
            color = classes.primary;
        } else if (quiz.isPublicResult) {
            quizState = "viewResult";
            quizTip = intl.formatMessage({
                id             : "quiz.viewResult",
                defaultMessage : "View Result",
            });
            color = classes.green;
        } else {
            quizState = "waitingResult";
            quizTip = intl.formatMessage({
                id             : "quiz.waitingResult",
                defaultMessage : "Waiting Result",
            });
            color = classes.green;
        }
    } else {
        quizState = "answer";
        quizTip = intl.formatMessage({
            id             : "quiz.answer",
            defaultMessage : "Answer Now",
        });
        color = classes.primary;
    }

    const handleClickQuizItem = () => {
        setSelectedQuiz(quiz.time); //quiz public time

        // quizState === "viewResult"
        if (quizState === "public") {
            handleOpenQuizLiveResultDashboardDialog();
        } else if (quizState === "answer") {
            handleOpenQuizDialog();
        } else if (quizState === "viewResult") {
            handleOpenQuizResultDialog();
        }
    };

    return (
        <Grid
            data-isseen={isseen}
            data-time={time}
            container
            wrap="nowrap"
            className={classes.root}
            onClick={handleClickQuizItem}
        >
            <Grid xs sm md item container alignItems="center">
                <Grid item container className={classes.quizInfo}>
                    <QuizIcon
                        fontSize="large"
                        color="primary"
                        className={classes.icon}
                    />
                    <Box>
                        <Typography
                            component="p"
                            variant="subtitle2"
                            className={classes.text}
                        >
                            {quiz.question}
                        </Typography>
                        <Typography
                            component="p"
                            variant="subtitle2"
                            color="primary"
                            className={classes.text}
                        >
                            {quiz.answers.join(" / ")}
                        </Typography>
                        <Typography component="p" variant="caption">
                            <FormattedDate value={new Date(quiz.time)} /> &nbsp;
                            <FormattedTime value={new Date(quiz.time)} />
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Grid xs={3} sm={3} md={3} item>
                <Typography component="p" variant="subtitle2">
                    {quiz.name}
                </Typography>
            </Grid>
            <Grid xs={3} sm={2} md={2} item>
                <Typography
                    component="p"
                    variant="subtitle2"
                    align="right"
                    className={classnames(color)}
                >
                    {quizTip}
                </Typography>
            </Grid>
        </Grid>
    );
}

const mapStateToProps = (state, { time }) => {
    const hasPermission = makePermissionSelector(permissions.MODERATE_ROOM);

    return {
        isModerator : hasPermission(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSelectedQuiz : (time) => {
            dispatch(quizzesActions.setSelectedQuiz(time));
        },
        handleOpenQuizLiveResultDashboardDialog : () => {
            dispatch(quizzesActions.setQuizLiveResultDashboardDialogOpen(true));
            dispatch(quizzesActions.setQuizDashboardOpen(false));
        },
        handleOpenQuizResultDialog : () => {
            dispatch(quizzesActions.setQuizResultDialogOpen(true));
            dispatch(quizzesActions.setQuizDashboardOpen(false));
        },
        handleOpenQuizDialog : () => {
            dispatch(quizzesActions.setQuizDialogOpen(true));
            dispatch(quizzesActions.setQuizDashboardOpen(false));
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(React.memo(QuizItem)));
