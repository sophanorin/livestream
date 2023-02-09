import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Typography, IconButton, DialogContentText, DialogContent, DialogTitle, Dialog, Link, Box, Grid } from '@material-ui/core';

import { withRoomContext } from '../../../RoomContext';
import * as roomActions from '../../../store/actions/roomActions';
import AboutUsIcon from '../../../assets/icons/AboutUsIcon';
import styles from './styles.web';
import { CloseIcon } from '../../../assets/icons';

const LIVESTREAM_URL = window.config.aboutUrl || 'https://sophanorin.com';
const version = process.env.REACT_APP_VERSION;
const About = ({ aboutOpen, handleCloseAbout, classes }) => {
    const intl = useIntl();

    return (
        <Dialog
            open={aboutOpen}
            onClose={() => handleCloseAbout(false)}
            classes={{
                paper : classes.dialogPaper,
            }}
            maxWidth="md"
        >
            <DialogTitle id="form-dialog-title">
                <div className={classes.dialogHeader}>
                    <IconButton onClick={() => handleCloseAbout(false)} className={classes.closeBtn}>
                        <CloseIcon />
                    </IconButton>
                    <Box className={classes.about}>
                        <Typography variant="p">
                            {intl.formatMessage({
                                id             : 'room.about',
                                defaultMessage : 'About',
                            })}
                        </Typography>
                        <Typography variant="caption" color="primary">
                            {intl.formatMessage({
                                id             : 'room.verion',
                                defaultMessage : 'Version',
                            })}
                            {` ${version}`}
                        </Typography>
                    </Box>
                </div>
            </DialogTitle>
            <DialogContent>
                <Grid container item direction="column">
                    <Grid item>
                        <Typography variant="h5" className={classes.title}>
                            {/* {intl.formatMessage({
                                id: "room.title",
                                defaultMessage: "About",
                            })} */}
                            Livestream
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        className={classes.content}
                        spacing={4}
                    >
                        <Grid item md={6}>
                            <DialogContentText paragraph color="textPrimary">
                                The Livestream project is revolutionizing the way we approach online education. It's a platform like no
                                other, offering a suite of cutting-edge features that allow educators and students to connect, collaborate
                                and communicate in real-time, creating an environment that is both interactive and engaging. With audio and
                                video streaming, video layouts, screen sharing, file sharing, chat messaging, raise hand, sharing YouTube,
                                and authentication, the Livestream project is providing a comprehensive solution for online education that
                                is flexible and scalable, suitable for both private and secure streams, as well as more open and inclusive
                                learning experiences.
                            </DialogContentText>
                        </Grid>
                        <Grid item md>
                            <AboutUsIcon className={classes.aboutIcon} />
                        </Grid>
                    </Grid>
                    <Grid item container justifyContent="center" alignItems="center" direction="column">
                        <Link href={LIVESTREAM_URL} target="_blank" rel="noreferrer" color="primary" className={classes.link}>
                            {LIVESTREAM_URL}
                        </Link>
                        <Link
                            href={window.config.privacyUrl ? window.config.privacyUrl : 'privacy/privacy.html'}
                            target="_blank"
                            rel="noreferrer"
                            color="secondary"
                            className={classnames(classes.link, classes.privacy)}
                        >
                            Data protection and Privacy Policy
                        </Link>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

About.propTypes = {
    roomClient       : PropTypes.object.isRequired,
    aboutOpen        : PropTypes.bool.isRequired,
    handleCloseAbout : PropTypes.func.isRequired,
    classes          : PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    aboutOpen : state.room.aboutOpen,
});

const mapDispatchToProps = {
    handleCloseAbout : roomActions.setAboutOpen,
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return prev.room.aboutOpen === next.room.aboutOpen;
        },
    })(withStyles(styles)(About)),
);
