import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
    root : {
        width           : "100vw",
        height          : "100vh",
        backgroundColor : "#fff",
    },
    cardRoot : {
        minWidth       : "40vw",
        boxShadow      : "0px 0px 20px rgba(0,0,0,0.1)",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        flexDirection  : "column",
    },
    cardContent : {
        width          : "100%",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
        flexDirection  : "column",
        gap            : theme.spacing(1),
    },
    cardActions : {
        width          : "100%",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center",
    },
});

function EndSession({ classes }) {
    return (
        <Grid
            container
            className={classes.root}
            justifyContent="center"
            alignItems="center"
        >
            <Grid item>
                <Card className={classes.cardRoot}>
                    <CardContent className={classes.cardContent}>
                        <Typography variant="h5" component="h3">
                            The session has ended
                        </Typography>
                        <Typography color="textPrimary">
                            You will be forwarded back to learning
                            platform
                        </Typography>
                    </CardContent>
                    {/* <CardActions className={classes.cardActions}>
            <Button variant="contained" color="primary">
              Ok
            </Button>
          </CardActions> */}
                </Card>
            </Grid>
        </Grid>
    );
}

EndSession.propTypes = {
    classes : PropTypes.object.isRequired,
};

export default withStyles(styles)(EndSession);
