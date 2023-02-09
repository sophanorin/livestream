import React, { useState } from "react";
import * as Yup from "yup";
import { permissions } from "../../permissions";
import { connect } from "react-redux";
import { makePermissionSelector } from "../../store/selectors";
import { withStyles } from "@material-ui/core/styles";
import { useFormik, Form, FormikProvider } from "formik";
import { withRoomContext } from "../../RoomContext";
import { useIntl, FormattedMessage } from "react-intl";
import classnames from "classnames";
import {
    Grid,
    Button,
    TextField,
    MenuItem,
    Typography,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    Dialog,
    DialogContent,
    DialogTitle,
    Select,
    DialogActions,
    Box,
    Slide,
} from "@material-ui/core";
import KeyboardBackspaceOutlinedIcon from "@material-ui/icons/KeyboardBackspaceOutlined";
import { useCallback } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import AddIcon from "@material-ui/icons/Add";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import CloseIcon from "@material-ui/icons/Close";
import * as quizzesActions from "../../store/actions/quizActions";
import palette from "../../theme/palette";

import { reorder, mapIndexsToValues, mapValuesToIndexs } from "./utils";
import MultipleSelectDropDown from "./Item/MultipleSelectDropDown";
import SingleSelectDropDown from "./Item/SingleSelectDropDown";
import DraggableItem from "./Item/DraggableItem";
import randomColor from "randomcolor";
import Logger from "../../Logger";

const logger = new Logger("Quizz Component")

const Transition = React.forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />;
});

const responseTypes = [
    {
        id      : 1,
        name    : "Yes / No",
        answers : [
            {
                value   : "",
                default : "Yes",
            },
            {
                value   : "",
                default : "No",
            },
        ],
    },
    {
        id      : 2,
        name    : "True / False",
        answers : [
            {
                value   : "",
                default : "True",
            },
            {
                value   : "",
                default : "False",
            },
        ],
    },
    {
        id      : 3,
        name    : "A / B / C / D",
        answers : [
            {
                value   : "",
                default : "A",
            },
            {
                value   : "",
                default : "B",
            },
            {
                value   : "",
                default : "C",
            },
            {
                value   : "",
                default : "D",
            },
        ],
    },
];

const questionTypes = [
    {
        id    : 1,
        name  : "Single",
        value : "single",
    },
    {
        id    : 2,
        name  : "Multiple",
        value : "multiple",
    },
    {
        id    : 3,
        name  : "Poll",
        value : "poll",
    },
];

const styles = (theme) => ({
    root        : {},
    dialogPaper : {
        height       : "100%",
        borderRadius : "var(--peer-border-radius-lg)",
        padding      : `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(
            2
        )}px ${theme.spacing(2)}px`,
    },
    form : {
        flexGrow       : 1,
        display        : "flex",
        flexDirection  : "column",
        justifyContent : "space-between",
        gap            : theme.spacing(2),
        padding        : theme.spacing(1),
    },
    title : {
        fontWeight : "bold",
    },
    closeBtn : {
        transform                      : "translateX(50%)",
        [theme.breakpoints.down("xs")] : {
            transform : "translateX(0%)",
        },
    },
    inputRoot : {
        // marginBottom: theme.spacing(1),
    },
    label : {
        fontWeight   : 600,
        marginBottom : theme.spacing(1),
    },
    dragging : {
        boxShadow  : "0px 0px 0px 0px rgba(0, 0, 0, 0.2)",
        background : "red",
    },
    radioGroup : {
        display       : "flex",
        flexDirection : "row",
    },
    questionType : {
        display       : "flex",
        flexDirection : "row",
        gap           : theme.spacing(2),
    },
    answerChioce : {
        border     : `1px solid ${palette.secondary.main}`,
        background : palette.basic.white,
        color      : palette.basic.dark,
        "&:hover"  : {
            background : palette.secondary.hover,
        },
    },
    choseAnswerChoice : {
        color      : palette.basic.white,
        background : palette.primary.hover,
        "&:hover"  : {
            color : palette.basic.dark,
        },
    },
    border : {
        borderColor : palette.secondary.main,
    },
    draggableContainer : {
        gap : theme.spacing(1),
    },
    actions : {
        justifyContent : "space-between",
    },
    droppableContainer : {
        gap : theme.spacing(1),
    },
});

function CreateQuizDialog(props) {
    const intl = useIntl();

    const [selectedAnswerChioce, setSelectedAnswerChoice] = useState(null);

    const {
        classes,
        roomClient,
        peerId,
        displayName,
        picture,
        createQuizDialogOpen,
        handleCloseCreateQuizDialog,
        handleOpenQuizDashboardDialog,
    } = props;

    const QuizFormSchema = Yup.object().shape({
        question      : Yup.string().required("Question could not empty."),
        questionType  : Yup.string(),
        correctIndexs : Yup.array()
            .of(Yup.number())
            .test(
                "correctIndexs",
                "Correct answer required.",
                (correctIndexs, ctx) => {
                    if (ctx.parent.questionType === "poll") {return true;}

                    return !!(ctx.parent.questionType === "single" ||
                        (ctx.parent.questionType === "multiple" &&
                            correctIndexs.length > 0));
                }
            ),
        answers : Yup.array()
            .of(
                Yup.object()
                    .shape({
                        value   : Yup.string(),
                        default : Yup.string(),
                    })
                    .test("Answer", "Answer could not empty.", (answer) => {
                        return Boolean(answer.value || answer.default);
                    })
            )
            .min(2, "Question must be have answer choices at least 2"),
    });

    const formik = useFormik({
        initialValues : {
            question      : "",
            answers       : [],
            correctIndexs : [],
            questionType  : "single", // --> single || multiple || poll
        },
        validationSchema : QuizFormSchema,
        onSubmit         : (values, { resetForm }) => {
            try {
                const generatedAnswerColors = randomColor({
                    count : values.answers.length,
                });

                const quiz = {
                    questionType  : values.questionType,
                    correctIndexs : values.correctIndexs,
                    question      : values.question,
                    answers       : values.answers.map((answer) =>
                        answer.value === "" ? answer.default : answer.value
                    ),
                    answerColors : generatedAnswerColors,
                    time         : Date.now(),
                    peerId,
                    name         : displayName,
                    picture,
                    isRead       : null,
                    status       : "opening",
                    sender       : "response",
                    type         : "quiz",
                };

                roomClient.sendQuiz(quiz);

                handleOpenQuizDashboardDialog();
                resetForm();
            } catch (error) {
                logger.debug("quiz error", error);
            }
        },
    });

    const {
        errors,
        touched,
        values,
        handleSubmit,
        // getFieldProps,
        setFieldValue,
        resetForm,
        handleChange,
        handleBlur,
        submitForm,
    } = formik;

    const ChangeAnswerChoicHandler = useCallback(
        (choice) => {
            if (values.answers.length > 0)
            {resetForm({
                values : { ...values, answers: [], correctIndexs: [] },
            });}

            setFieldValue("answers", choice.answers);
            setSelectedAnswerChoice(choice.id);
        },
        [values.answers]
    );

    const AddAnswerHandler = () => {
        setFieldValue("answers", [
            ...values.answers,
            { value: "", default: "" },
        ]);
    };

    const RemoveAnswerHandler = (answerIndex) => {
        const answers = values.answers.filter(
            (answer, index) => index !== answerIndex
        );

        setFieldValue("answers", answers);
    };

    const onDragEnd = (result) => {
        // `destination` is `undefined` if the item was dropped outside the list
        // In this case, do nothing
        if (!result.destination) {
            return;
        }

        const newAnswers = reorder(
            values.answers,
            result.source.index,
            result.destination.index
        );

        // Update correctIndex when answer choices changed order
        if (result.source.index === values.correctIndexs[0]) {
            setFieldValue("correctIndexs", [result.destination.index]);
        }

        if (
            result.source.index > values.correctIndexs[0] &&
            result.destination.index <= values.correctIndexs[0]
        ) {
            setFieldValue("correctIndexs", [values.correctIndexs[0] + 1]);
        }

        if (
            result.source.index < values.correctIndexs[0] &&
            result.destination.index >= values.correctIndexs[0]
        ) {
            setFieldValue("correctIndexs", [values.correctIndexs[0] - 1]);
        }

        setFieldValue("answers", newAnswers);
    };

    const renderResopnseChoiceBlock = () => {
        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                    droppableId="droppable"
                    // direction="horizontal"
                >
                    {(provided, snapshot) => (
                        <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            display="flex"
                            flexDirection="column"
                            className={classes.droppableContainer}
                        >
                            {values.answers && values.answers.length > 0 && (
                                <>
                                    {values.answers.map((answer, index) => {
                                        let error = false;
                                        let message = null;

                                        if (
                                            touched.answers &&
                                            touched.answers[index] &&
                                            typeof errors.answers === "object"
                                        ) {
                                            if (errors?.answers)
                                            {message = errors.answers[index];}

                                            error =
                                                touched.answers[index].value &&
                                                message;
                                        }

                                        return (
                                            <Draggable
                                                key={index}
                                                index={index}
                                                draggableId={`${
                                                    `${answer.default  }-${  index}`
                                                }`}
                                            >
                                                {(provided, snapshot) => (
                                                    <DraggableItem
                                                        value={answer}
                                                        index={index}
                                                        provided={provided}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        error={error}
                                                        helperText={
                                                            error && message
                                                        }
                                                        onDelete={(
                                                            e,
                                                            index
                                                        ) => {
                                                            RemoveAnswerHandler(
                                                                index
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                </>
                            )}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        );
    };

    return (
        <Dialog
            open={createQuizDialogOpen}
            className={classes.root}
            onClose={handleCloseCreateQuizDialog}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="md"
            fullWidth
            TransitionComponent={Transition}
        >
            <FormikProvider value={formik}>
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
                                id="label.createQuickQuiz"
                                defaultMessage="Create a Quick Quiz"
                            />
                        </Typography>
                        <IconButton
                            className={classes.closeBtn}
                            onClick={() => handleCloseCreateQuizDialog()}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Form
                        autoComplete="off"
                        noValidate
                        onSubmit={handleSubmit}
                        className={classes.form}
                    >
                        <Grid container direction="column" spacing={2}>
                            {/* Start question */}
                            <Grid item>
                                <Typography
                                    className={classes.label}
                                    color="primary"
                                    variant="subtitle2"
                                    component="p"
                                >
                                    {intl.formatMessage({
                                        id             : "quizLabel.question",
                                        defaultMessage :
                                            "Write your question here",
                                    })}
                                </Typography>
                                <TextField
                                    className={classes.border}
                                    fullWidth
                                    minRows={4}
                                    multiline
                                    type="text"
                                    variant="outlined"
                                    placeholder="Enter your question"
                                    name="question"
                                    value={values.question}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(
                                        touched.question && errors.question
                                    )}
                                    helperText={
                                        touched.question && errors.question
                                    }
                                />
                            </Grid>
                            {/* End question */}

                            {/* Start Answers choices */}
                            <Grid item>
                                <Typography
                                    className={classes.label}
                                    component="p"
                                    variant="subtitle2"
                                    color="primary"
                                >
                                    {intl.formatMessage({
                                        id             : "quizLabel.responseTypes",
                                        defaultMessage : "Choose Response Type",
                                    })}
                                </Typography>
                                <Grid container spacing={2}>
                                    {responseTypes.map((choice, index) => {
                                        return (
                                            <Grid sm md key={index} item>
                                                <Button
                                                    disableElevation
                                                    fullWidth
                                                    color="primary"
                                                    variant="contained"
                                                    onClick={() => {
                                                        ChangeAnswerChoicHandler(
                                                            choice
                                                        );
                                                    }}
                                                    className={classnames(
                                                        classes.answerChioce,
                                                        selectedAnswerChioce ===
                                                            choice.id &&
                                                            classes.choseAnswerChoice
                                                    )}
                                                >
                                                    {choice.name}
                                                </Button>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                            {/* End Answers choices */}
                            <Grid item container spacing={2}>
                                {/* Start Answers inputs */}
                                <Grid item sm md lg>
                                    <Typography
                                        className={classes.label}
                                        component="p"
                                        variant="subtitle2"
                                        color="primary"
                                    >
                                        {intl.formatMessage({
                                            id             : "quizLabel.reponseChoices",
                                            defaultMessage : "Response Choice",
                                        })}
                                    </Typography>

                                    {/* Start message no answer inputs */}
                                    {errors.answers &&
                                        typeof errors.answers === "string" && (
                                        <Typography
                                            // className={classes.label}
                                            component="p"
                                            variant="caption"
                                            color="error"
                                        >
                                            <FormattedMessage
                                                id="quiz.noAnswerInput"
                                                defaultMessage={
                                                    errors.answers
                                                }
                                            />
                                        </Typography>
                                    )}
                                    {/* End message no answer inputs */}

                                    {/* Start List of answer inputs */}
                                    {renderResopnseChoiceBlock()}
                                    {/* End List of answer inputs */}

                                    {/* Start add answer input */}
                                    <Button
                                        variant="text"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={AddAnswerHandler}
                                    >
                                        Add
                                    </Button>
                                    {/* end add answer input */}
                                </Grid>
                                {/* End answers inputs */}

                                <Grid
                                    item
                                    container
                                    sm
                                    md
                                    lg
                                    direction="column"
                                    spacing={2}
                                >
                                    {/* Start Question types */}
                                    <Grid item>
                                        <Typography
                                            className={classes.label}
                                            component="p"
                                            variant="subtitle2"
                                            color="primary"
                                        >
                                            {intl.formatMessage({
                                                id             : "quizLabel.questionType",
                                                defaultMessage :
                                                    "Question Types",
                                            })}
                                        </Typography>
                                        <RadioGroup
                                            className={classes.questionType}
                                            aria-label="Question Type"
                                            name="questionType"
                                            value={values.questionType}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (e.target.value === "poll")
                                                {setFieldValue(
                                                    "correctIndexs",
                                                    []
                                                );}
                                            }}
                                            onBlur={handleBlur}
                                        >
                                            {questionTypes.map(
                                                (type, index) => {
                                                    return (
                                                        <FormControlLabel
                                                            key={`${index}-${type.value}`}
                                                            label={type.name}
                                                            value={type.value}
                                                            control={
                                                                <Radio color="primary" />
                                                            }
                                                        />
                                                    );
                                                }
                                            )}
                                        </RadioGroup>
                                    </Grid>
                                    {/* Start Question types */}

                                    {/* Start correct answer */}
                                    {values.questionType === "single" &&
                                        values.answers.length > 0 && (
                                        <Grid item>
                                            <Typography
                                                className={classes.label}
                                                component="p"
                                                variant="subtitle2"
                                                color="primary"
                                            >
                                                {intl.formatMessage({
                                                    id             : "quizLabel.correctAnswer",
                                                    defaultMessage :
                                                            "Select correct answer above.",
                                                })}
                                            </Typography>
                                            <SingleSelectDropDown
                                                fullWidth
                                                select
                                                variant="outlined"
                                                placeholder="Please select one"
                                                error={Boolean(
                                                    touched.correctIndexs &&
                                                            errors.correctIndexs
                                                )}
                                                helperText={
                                                    touched.correctIndexs &&
                                                        errors.correctIndexs
                                                }
                                                value={
                                                    mapIndexsToValues(
                                                        values.correctIndexs,
                                                        values.answers
                                                    )[0]
                                                }
                                                options={values.answers}
                                                onChange={(e, value) => {
                                                    const indexs =
                                                            mapValuesToIndexs(
                                                                [value],
                                                                values.answers
                                                            );
                                                    setFieldValue(
                                                        "correctIndexs",
                                                        indexs
                                                    );
                                                }}
                                            />
                                        </Grid>
                                    )}

                                    {values.questionType === "multiple" &&
                                        values.answers.length > 0 && (
                                        <Grid item>
                                            <Typography
                                                className={classes.label}
                                                component="p"
                                                variant="subtitle2"
                                                color="primary"
                                            >
                                                {intl.formatMessage({
                                                    id             : "quizLabel.correctAnswer",
                                                    defaultMessage :
                                                            "Select correct answer above.",
                                                })}
                                            </Typography>
                                            <MultipleSelectDropDown
                                                fullWidth
                                                select
                                                variant="outlined"
                                                placeholder="Please select one"
                                                value={mapIndexsToValues(
                                                    values.correctIndexs,
                                                    values.answers
                                                )}
                                                error={Boolean(
                                                    touched.correctIndexs &&
                                                            errors.correctIndexs
                                                )}
                                                helperText={
                                                    touched.correctIndexs &&
                                                        errors.correctIndexs
                                                }
                                                options={values.answers}
                                                onChange={(e, selected) => {
                                                    const indexs =
                                                            mapValuesToIndexs(
                                                                selected,
                                                                values.answers
                                                            );

                                                    setFieldValue(
                                                        "correctIndexs",
                                                        indexs
                                                    );
                                                }}
                                            />
                                        </Grid>
                                    )}

                                    {/* End correct answer */}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Form>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <IconButton onClick={handleOpenQuizDashboardDialog}>
                        <KeyboardBackspaceOutlinedIcon fontSize="small" />
                    </IconButton>

                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        onClick={submitForm}
                    >
                        Create Quiz
                    </Button>
                </DialogActions>
            </FormikProvider>
        </Dialog>
    );
}

const makeMapStateToProps = () => {
    const mapStateToProps = (state) => ({
        displayName          : state.settings.displayName,
        peerId               : state.me.id,
        picture              : state.me.picture,
        createQuizDialogOpen : state.quizzes.createQuizDialogOpen,
    });

    return mapStateToProps;
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleCloseCreateQuizDialog : () => {
            dispatch(quizzesActions.setCreateQuizDialogOpen(false));
        },
        handleOpenQuizDashboardDialog : () => {
            dispatch(quizzesActions.setQuizDashboardOpen(true));
            dispatch(quizzesActions.setCreateQuizDialogOpen(false));
        },
    };
};

export default withRoomContext(
    connect(makeMapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                next.quizzes.createQuizDialogOpen ===
                prev.quizzes.createQuizDialogOpen
            );
        },
    })(withStyles(styles)(CreateQuizDialog))
);
