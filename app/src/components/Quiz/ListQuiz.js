import {
    Avatar,
    Box,
    Grid,
    IconButton,
    Typography,
    withStyles,
} from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { PlusIcon, QuizIcon } from "../../assets/icons";
import palette from "../../theme/palette";
import QuizItem from "./QuizItem";

import * as quizzesActions from "../../store/actions/quizActions";

const styles = (theme) => ({
    root : {},
    list : {},
});

function ListQuiz(props) {
    const { classes, quizzes, quizCount, setIsQuizRead } = props;
    const intl = useIntl();
    const quizzesRef = useRef();

    const isQuizSeen = () => {
        const list = quizzesRef.current;

        if (!list) {return;}

        const listRect = list.getBoundingClientRect();

        const items = [...list.childNodes];

        let isSeen = null;

        items.forEach((item) => {
            const itemRect = item.getBoundingClientRect();

            isSeen = itemRect.top <= listRect.bottom;

            if (item.tagName === "DIV") {
                if (isSeen && item.dataset.isseen === "false") {
                    setIsQuizRead(item.dataset.time, true);
                }
            }
        });
    };

    useEffect(() => {
        isQuizSeen();
    }, [quizCount]);

    return (
        <Box className={classes.root}>
            <Grid container>
                <Grid xs sm md item>
                    <Typography
                        component="p"
                        variant="subtitle2"
                        color="primary"
                    >
                        {intl.formatMessage({
                            id             : "quiz.recently",
                            defaultMessage : "Recently Created",
                        })}
                    </Typography>
                </Grid>
                <Grid xs={3} sm={3} md={3} item>
                    <Typography
                        component="p"
                        variant="subtitle2"
                        color="primary"
                    >
                        {intl.formatMessage({
                            id             : "quiz.createdBy",
                            defaultMessage : "Created by",
                        })}
                    </Typography>
                </Grid>
                <Grid xs={3} sm={2} md={2} item></Grid>
            </Grid>
            {quizzes.length > 0 ? (
                <div className={classes.list} ref={quizzesRef}>
                    {quizzes.map((quiz, index) => (
                        <QuizItem
                            key={index}
                            quiz={quiz}
                            time={quiz.time}
                            isseen={quiz.isRead}
                        />
                    ))}
                </div>
            ) : (
                <Grid container justifyContent="center">
                    <Typography
                        component="p"
                        variant="subtitle2"
                        color="textSecondary"
                    >
                        No quiz available
                    </Typography>
                </Grid>
            )}
        </Box>
    );
}

const mapStateToProps = (state) => {
    return {
        quizCount : state.quizzes.count,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setIsQuizRead : (id, isRead) => {
            dispatch(quizzesActions.setIsQuizRead(id, isRead));
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(ListQuiz));
