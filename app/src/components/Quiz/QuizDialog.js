import React, { useState } from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    LinearProgress,
    Radio,
    RadioGroup,
    Slide,
    Typography,
    withStyles,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";
import KeyboardBackspaceOutlinedIcon from "@material-ui/icons/KeyboardBackspaceOutlined";

import * as quizzesActions from "../../store/actions/quizActions";
import { FormattedMessage } from "react-intl";
import { CloseIcon } from "../../assets/icons";
import palette from "../../theme/palette";
import { withRoomContext } from "../../RoomContext";

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
        padding      : theme.spacing(1, 2, 2, 2),
    },
    answer : {
        margin         : 0,
        border         : `1px solid ${palette.primary.hover}`,
        display        : "flex",
        justifyContent : "space-between",
        padding        : theme.spacing(0, 0, 0, 1),
        borderRadius   : "var(--peer-border-radius-sm)",
    },
    answerLabel : {
        fontSize : "12px",
    },
    chooseAnswerLabel : {
        marginTop    : theme.spacing(4),
        marginBottom : theme.spacing(1),
    },
    radioGroup : {
        width         : "50%",
        display       : "flex",
        flexDirection : "column",
        gap           : theme.spacing(1),
        "& .answered" : {
            background : palette.secondary.hover,
        },
        [theme.breakpoints.down("sm")] : {
            width : "100%",
        },
    },
    actions : {
        justifyContent : "space-between",
    },
});

export const QuizDialog = (props) => {
    const {
        classes,
        quizDialogOpen,
        handleCloseQuizDialog,
        handleClearSelectedQuiz,
        handleOpenQuizDashboardDialog,
        quiz,
        roomClient,
    } = props;

    const [value, setValue] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleRadioChange = (event) => {
        setValue([Number(event.target.value)]);
    };

    const handleCheckBoxChange = (event) => {
        const selectedIndex = Number(event.target.value);
        const checked = Boolean(event.target.checked);

        if (checked) {
            setValue((prev) => {
                return [...prev, selectedIndex];
            });
        } else {
            setValue((prev) => {
                return prev.filter((index) => index !== selectedIndex);
            });
        }

        // setValue({ ...value, [event.target.name]: event.target.checked });
    };

    const handleSubmit = async () => {
        setLoading(true);

        await roomClient.submitQuiz(quiz, value);
        setLoading(false);
        handleOpenQuizDashboardDialog();
    };

    return (
        <Dialog
            className={classes.root}
            open={quizDialogOpen}
            onClose={handleCloseQuizDialog}
            classes={{
                paper : classes.dialogPaper,
            }}
            TransitionProps={{
                onExited : handleClearSelectedQuiz,
            }}
            TransitionComponent={Transition}
            maxWidth="md"
            fullWidth
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
                            id="label.quickQuiz"
                            defaultMessage="Quick Quiz"
                        />
                    </Typography>
                    <IconButton
                        className={classes.closeBtn}
                        onClick={() => handleCloseQuizDialog()}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Typography
                    component="p"
                    variant="subtitle2"
                    color="primary"
                    className={classes.title}
                >
                    <FormattedMessage
                        id="quiz.question"
                        defaultMessage="Question"
                    />
                </Typography>

                <Typography component="p" variant="subtitle2">
                    {quiz.question}
                </Typography>

                <Typography
                    component="p"
                    variant="subtitle2"
                    color="primary"
                    className={classnames(
                        classes.title,
                        classes.chooseAnswerLabel
                    )}
                >
                    <FormattedMessage
                        id="quiz.chooseAnswer"
                        defaultMessage="Choose your answer"
                    />
                </Typography>
                {(quiz.questionType === "single" ||
                    quiz.questionType === "poll") && (
                    <RadioGroup
                        onChange={handleRadioChange}
                        value={value.length > 0 ? value[0] : -1}
                        className={classes.radioGroup}
                    >
                        {quiz.answers.map((answer, index) => {
                            return (
                                <FormControlLabel
                                    classes={{
                                        label : classes.answerLabel,
                                    }}
                                    className={classnames(classes.answer)}
                                    value={Number(index)}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    name={answer}
                                    labelPlacement="start"
                                    label={answer}
                                    key={`${index}-${answer}`}
                                />
                            );
                        })}
                    </RadioGroup>
                )}
                {quiz.questionType === "multiple" && (
                    <FormGroup onChange={handleCheckBoxChange} value={value}>
                        {quiz.answers.map((answer, index) => {
                            return (
                                <FormControlLabel
                                    control={<Checkbox color="primary" />}
                                    label={answer}
                                    value={Number(index)}
                                    name={answer}
                                    key={`${index}-${answer}`}
                                />
                            );
                        })}
                    </FormGroup>
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <IconButton onClick={handleOpenQuizDashboardDialog}>
                    <KeyboardBackspaceOutlinedIcon fontSize="small" />
                </IconButton>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    disabled={value.length === 0 || loading}
                    color="primary"
                >
                    {loading ? (
                        <LinearProgress />
                    ) : (
                        <FormattedMessage
                            id="quiz.submit"
                            defaultMessage="Submit answer"
                        />
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

QuizDialog.propTypes = {
    classes : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    quizDialogOpen : state.quizzes.quizDialogOpen,
    quiz           : state.quizzes.quizzes.filter(
        (quiz) => quiz.time === state.quizzes.selectedQuiz
    )[0],
});

const mapDispatchToProps = (dispatch) => {
    return {
        handleClearSelectedQuiz : () => {
            dispatch(quizzesActions.clearSelectedQuiz());
        },
        handleCloseQuizDialog : () => {
            dispatch(quizzesActions.setQuizDialogOpen(false));
        },
        handleOpenQuizDashboardDialog : () => {
            dispatch(quizzesActions.setQuizDialogOpen(false));
            dispatch(quizzesActions.setQuizDashboardOpen(true));
        },
    };
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return next.quizzes.quizDialogOpen === prev.quizzes.quizDialogOpen;
        },
    })(withStyles(styles)(QuizDialog))
);
