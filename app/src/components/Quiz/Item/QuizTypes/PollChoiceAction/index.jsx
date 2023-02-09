import React, { useState } from "react";
import classnames from "classnames";
import { useIntl, FormattedTime, FormattedMessage } from "react-intl";
import { withStyles } from "@material-ui/styles";
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    Paper,
    RadioGroup,
    Typography,
} from "@material-ui/core";
import palette from "../../../../../theme/palette";
import { withRoomContext } from "../../../../../RoomContext";

const styles = (theme) => ({
    root : {
        flexGrow       : 1,
        display        : "flex",
        flexDirection  : "column",
        justifyContent : "center",
        alignItems     : "center",
        gap            : theme.spacing(1),
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
        fontSize : "14px",
    },
    radioGroup : {
        display       : "flex",
        flexDirection : "column",
        gap           : theme.spacing(1),
        "& .answered" : {
            background : palette.secondary.hover,
        },
    },
});
function PollChoiceAction(props) {
    const {
        roomClient,
        classes,
        answered,
        answeredIndex,
        quiz,
        disabled,
        closed,
        sender,
    } = props;

    const intl = useIntl();

    const [value, setValue] = useState(
        answeredIndex === null || answeredIndex === undefined
            ? -1
            : answeredIndex
    );

    const handleRadioChange = (event) => {
        setValue(Number(event.target.value));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        roomClient.submitQuiz(quiz, value);
    };

    return (
        <form className={classes.root} onSubmit={handleSubmit}>
            <FormControl disabled={disabled} fullWidth>
                <RadioGroup
                    onChange={handleRadioChange}
                    value={value}
                    className={classes.radioGroup}
                >
                    {quiz.answers.map((answer, index) => {
                        return (
                            <FormControlLabel
                                classes={{
                                    label : classes.answerLabel,
                                }}
                                className={classnames(
                                    classes.answer,
                                    value === index && "answered"
                                )}
                                value={Number(index)}
                                control={<Radio size="small" />}
                                labelPlacement="start"
                                label={answer}
                                key={`${index}-${answer}`}
                            />
                        );
                    })}
                </RadioGroup>
            </FormControl>

            <Button
                disabled={value === -1 || closed || sender || answered}
                variant="contained"
                color="primary"
                type="submit"
            >
                {answered && value !== -1
                    ? intl.formatMessage({
                        id             : "quiz.submited",
                        defaultMessage : "Submited",
                    })
                    : intl.formatMessage({
                        id             : "quiz.submit",
                        defaultMessage : "Submit",
                    })}
            </Button>
        </form>
    );
}

export default withRoomContext(withStyles(styles)(PollChoiceAction));
