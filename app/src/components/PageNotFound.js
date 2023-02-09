import React from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
    root : {
        width           : "100vw",
        height          : "100vh",
        backgroundColor : "#e6e6e6",
    },
    item : {
        backgroundColor : "white",
        borderRadius    : theme.spacing(1),
        boxShadow       :
            "0px 0px 30px 10px rgba(0,0,0,0.1), 0px 0px 30px 15px rgba(0,0,0,0.1)",
        padding : `${theme.spacing(2)}px ${theme.spacing(8)}px`,
    },
    status : {
        fontFamily : "Fruktur, cursive",
        animation  : "jump-abit 1s linear infinite",
        "& > div"  : {
            fontSize : "7rem",
        },
    },
    zero : {
        color : "#1183ca",
    },
    text : {
        fontSize   : "2rem",
        fontWeight : "400",
        fontFamily : "EB Garamond, serif",
    },
    button : {
        marginTop : theme.spacing(3),
        animation : "jump-abit 1s 0.5s linear infinite",
    },
});

function PageNotFound({ classes }) {
    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            className={classes.root}
        >
            <Grid items className={classes.item}>
                <Grid
                    container
                    direction="column"
                    alignItems="center"
                    className={classes.contents}
                >
                    <Grid item className={classes.status}>
                        <Box component="div">
                            4<span className={classes.zero}>0</span>4
                        </Box>
                    </Grid>
                    <Grid item className={classes.text}>
                        <Box component="div">This page is missing.</Box>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                        >
                            Go Home
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(PageNotFound);
