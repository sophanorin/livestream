import React from "react";
import { connect } from "react-redux";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Slide,
    Typography,
} from "@material-ui/core";
import MinimizeIcon from "@material-ui/icons/Minimize";
import { withStyles } from "@material-ui/core/styles";
import * as quizzesActions from "../../store/actions/quizActions";
import * as dockActions from "../../store/actions/dockActions";

import { FormattedMessage } from "react-intl";
import { CloseIcon, PlusIcon } from "../../assets/icons";
import ListQuiz from "./ListQuiz";
import palette from "../../theme/palette";
import {
    makePermissionSelector,
    quizzesSortedSelector,
} from "../../store/selectors";
import { permissions } from "../../permissions";

const Transition = React.forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />;
});

const QUIZ = "Quiz";

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
    button : {
        transform                      : "translateX(50%)",
        [theme.breakpoints.down("xs")] : {
            transform : "translateX(0%)",
        },
    },
    addButton : {
        backgroundColor : palette.primary.main,
        color           : palette.basic.white,
        "&:hover"       : {
            backgroundColor : palette.primary.hover,
        },
    },
});

function QuizDashboardDialog(props) {
    const {
        classes,
        quizDashboardDialogOpen,
        handleCloseQuizDashboardDialog,
        handleOpenCreateQuizDialog,
        handleClearSelectedQuiz,
        quizzes,
        canCreateQuiz,
        handleMinimizeLaTeX,
    } = props;

    return (
        <Dialog
            className={classes.root}
            open={quizDashboardDialogOpen}
            onClose={handleCloseQuizDashboardDialog}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="md"
            fullWidth
            TransitionProps={{
                onExited : handleClearSelectedQuiz,
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
                            id="label.quickQuizzes"
                            defaultMessage="Quick Quizzes"
                        />
                    </Typography>
                    <Box component="div" display="flex" flexDirection="row">
                        <IconButton
                            className={classes.button}
                            size="small"
                            onClick={handleMinimizeLaTeX}
                        >
                            <MinimizeIcon />
                        </IconButton>
                        <IconButton
                            className={classes.button}
                            onClick={() => handleCloseQuizDashboardDialog()}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <ListQuiz quizzes={quizzes} />
            </DialogContent>
            <DialogActions>
                {canCreateQuiz && (
                    <IconButton
                        className={classes.addButton}
                        onClick={handleOpenCreateQuizDialog}
                    >
                        <PlusIcon />
                    </IconButton>
                )}
            </DialogActions>
        </Dialog>
    );
}

const mapStateToProps = (state) => {
    const hasPermissionCreateQuiz = makePermissionSelector(
        permissions.SEND_QUIZ
    );

    return {
        canCreateQuiz           : hasPermissionCreateQuiz(state),
        quizzes                 : quizzesSortedSelector(state),
        quizDashboardDialogOpen : state.quizzes.quizDashboardDialogOpen,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleClearSelectedQuiz : () => {
            dispatch(quizzesActions.clearSelectedQuiz());
        },
        handleCloseQuizDashboardDialog : () => {
            dispatch(quizzesActions.setQuizDashboardOpen(false));
        },
        handleOpenCreateQuizDialog : () => {
            dispatch(quizzesActions.setQuizDashboardOpen(false));
            dispatch(quizzesActions.setCreateQuizDialogOpen(true));
        },
        handleMinimizeLaTeX : () => {
            dispatch(
                dockActions.addDockItem({
                    id   : QUIZ,
                    type : QUIZ,
                    name : "Quiz Dashboard",
                    open : () => {
                        dispatch(quizzesActions.setQuizDashboardOpen(true));
                        dispatch(dockActions.removeDockItem("Quiz"));
                    },
                })
            );

            dispatch(quizzesActions.setQuizDashboardOpen(false));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
    areStatesEqual : (next, prev) => {
        return (
            next.me.roles === prev.me.roles &&
            next.quizzes.quizzes === prev.quizzes.quizzes &&
            next.quizzes.quizDashboardDialogOpen ===
                prev.quizzes.quizDashboardDialogOpen
        );
    },
})(withStyles(styles)(QuizDashboardDialog));
