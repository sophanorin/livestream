import { Box, IconButton, Tooltip, Typography, withStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';
import React from 'react'
import { connect } from 'react-redux'
import * as requestActions from "../../../store/actions/requestActions";
import palette from '../../../theme/palette';


const styles = (theme) => ({
    root : {
        position : 'fixed',
        bottom   : 8,
        left     : 8,
        right    : 8,
        
        padding      : theme.spacing(1),
        background   : palette.basic.dark,
        borderRadius : theme.spacing(1),
        color        : palette.basic.white
        
    }
});

const LINK = window.location.href;

export const MeetingInfo = (props) => {
    const { classes, handleNotify } = props
  
    const handleCopyMeetingInfo = (text) => {
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            handleNotify(text)
        }, (err) => {
            console.error('Async: Could not copy text: ', err);
        });
    }

    return (
        <Box className={classes.root}>
            <Typography variant='body1' component="h6" style={{ 
                fontWeight : 'bold',
            }}>
            Meeting Info
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography noWrap variant='body2' style={{
                    flexGrow   : 'auto',
                    fontWeight : 'bold'
                }}>
                    {LINK}
                </Typography>
                <Tooltip
                    title="Copy meeting info"
                >
                    <IconButton
                        onClick={() => {
                            handleCopyMeetingInfo('Copied meeting info')
                        }}
                        disableElevation
                        disableRipple
                        size='small'
                        color='inherit'
                    >
                        <CopyIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Typography variant='caption'>
                Share this meeting link with the others you want in the meeting
            </Typography>
        </Box>
    )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => {
    return {
        handleNotify : (text) =>  dispatch(requestActions.notify({
            type : "info",
            text
        }))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MeetingInfo))