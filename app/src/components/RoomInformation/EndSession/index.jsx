import React from "react";
import PropTypes from "prop-types";
import {
    Card,
    CardActions,
    CardContent,
    Typography,
    Button,
    Grid,
    Box,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { useHistory } from 'react-router-dom'

import styles from "./styles.web";
import { StarIcon } from "../../../assets/icons";
import { useState } from "react";
import { useDebugValue } from "react";
import palette from "../../../theme/palette";

function EndSession({ classes }) {
    const [rate, setRate] = useState(0);
    const history = useHistory()

    const handleReturnHome = () => {
        window.location.reload()
    }

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
                        <Typography
                            className={classes.title}
                            variant="h6"
                            gutterBottom
                        >
                            This classroom has ended
                        </Typography>
                    </CardContent>
                    <Box
                        className={classes.rating}
                        sx={{
                            background : palette.secondary.hover,
                        }}
                        component="div"
                    >
                        <Typography gutterBottom>
                            How was the quality of this call?
                        </Typography>
                        <Box className={classes.stars}>
                            {[...Array(5)].map((_, index) => {
                                const color =
                                    index <= rate - 1 ? "#DFB300" : "#F2F2F2";

                                return (
                                    <StarIcon
                                        key={index}
                                        className={classes.star}
                                        style={{
                                            color,
                                        }}
                                        onClick={(e) => {
                                            const value = ++index;
                                            setRate(value);
                                        }}
                                        viewBox="0 0 36 36"
                                        fontSize="large"
                                    />
                                );
                            })}
                        </Box>
                        <Box className={classes.tags}>
                            <Typography gutterBottom>Poor</Typography>
                            <Typography gutterBottom>Excellent</Typography>
                        </Box>
                    </Box>
                    <CardActions className={classes.cardActions}>
                        <Button variant="contained" color="primary" onClick={handleReturnHome}>
                            Return Home
                        </Button>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    );
}

EndSession.propTypes = {
    classes : PropTypes.object.isRequired,
};

export default withStyles(styles)(EndSession);
