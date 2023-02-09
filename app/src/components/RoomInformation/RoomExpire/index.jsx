import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import React from "react";
import { ConfirmIcon, RoomExpiredIcon } from "../../../assets/icons";

import styles from "./styles.web";

function RoomExpire(props) {
    const { classes } = props;
    return (
        <Box
            className={classes.root}
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Card className={classes.cardRoot}>
                <CardContent className={classes.cardContent}>
                    <Grid container direction="row" spacing={4}>
                        <Grid item container sm md spacing={2}>
                            <Grid
                                item
                                container
                                justifyContent="flex-start"
                                alignItems="center"
                                className={classes.titleWrapper}
                            >
                                <ConfirmIcon fontSize="small" />
                                <Typography
                                    component="h2"
                                    variant="subtitle1"
                                    className={classes.title}
                                >
                                    This room has ended
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography component="p" varaint="subtitle2">
                                    The room that you’re trying to enter has
                                    already ended.
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid
                            item
                            container
                            justifyContent="center"
                            alignItems="center"
                            xs={12}
                            sm={4}
                            md={5}
                        >
                            <RoomExpiredIcon />
                        </Grid>
                    </Grid>
                    <Grid container md={5}>
                        <Button fullWidth className={classes.button}>
                            Okay
                        </Button>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}

export default withStyles(styles)(RoomExpire);
