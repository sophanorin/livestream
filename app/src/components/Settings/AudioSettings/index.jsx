import React, { useState } from "react";
import { connect } from "react-redux";
import * as appPropTypes from "../../appPropTypes";
import { withStyles } from "@material-ui/core/styles";
import { withRoomContext } from "../../../RoomContext";
import * as settingsActions from "../../../store/actions/settingsActions";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import classnames from "classnames";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import {
    NoiseSlider,
    Select,
    TextButton,
    IOSSwitch,
} from "../../../core/components";
import { ChevronDownIcon, ChevronUpIcon } from "../../../assets/icons";
import styles from "./styles.web";

const insertableStreamsSupported = Boolean(
    RTCRtpSender.prototype.createEncodedStreams
);

const AudioSettings = ({
    setAudioPreset,
    setEchoCancellation,
    setAutoGainControl,
    setNoiseSuppression,
    setVoiceActivatedUnmute,
    setSampleRate,
    setChannelCount,
    setSampleSize,
    setOpusDtx,
    setOpusFec,
    setOpusPtime,
    setEnableOpusDetails,
    roomClient,
    me,
    volume,
    settings,
    classes,
}) => {
    const [openAdvanceSetting, setOpenAdvanceSetting] = useState(false);
    const intl = useIntl();

    let audioDevices;

    if (me.audioDevices) {
        audioDevices = Object.values(me.audioDevices);
    } else {
        audioDevices = [];
    }

    let audioOutputDevices;

    if (me.audioOutputDevices) {
        audioOutputDevices = Object.values(me.audioOutputDevices);
    } else {
        audioOutputDevices = [];
    }

    return (
        <React.Fragment>
            <form className={classes.setting} autoComplete="off">
                {/* ============ SECTION 1 ============ */}
                <div className={classes.padding}>
                    <Typography
                        className={classes.subTitle}
                        variant="subtitle2"
                        component="p"
                        gutterBottom
                    >
                        {intl.formatMessage({
                            id             : "settings.selectAudioDevice",
                            defaultMessage : "Select Audio Device",
                        })}
                    </Typography>
                    <div className={classes.formBlock}>
                        <Typography
                            gutterBottom
                            color="textPrimary"
                            variant="caption"
                        >
                            {audioDevices.length > 0
                                ? intl.formatMessage({
                                    id             : "settings.selectAudio",
                                    defaultMessage :
                                          "Select audio input device",
                                })
                                : intl.formatMessage({
                                    id             : "settings.cantSelectAudio",
                                    defaultMessage :
                                          "Unable to select audio input device",
                                })}
                        </Typography>
                        <FormControl
                            variant="outlined"
                            size="small"
                            className={classes.formControl}
                        >
                            <Select
                                value={settings.selectedAudioDevice || ""}
                                onChange={(event) => {
                                    if (event.target.value) {
                                        roomClient.updateMic({
                                            restart     : true,
                                            newDeviceId : event.target.value,
                                        });
                                    }
                                }}
                                displayEmpty
                                name={intl.formatMessage({
                                    id             : "settings.audio",
                                    defaultMessage : "Audio input device",
                                })}
                                autoWidth
                                className={classes.selectEmpty}
                                disabled={
                                    audioDevices.length === 0 ||
                                    me.audioInProgress
                                }
                            >
                                {audioDevices.map((audio, index) => {
                                    return (
                                        <MenuItem
                                            key={index}
                                            value={audio.deviceId}
                                        >
                                            {audio.label === ""
                                                ? index + 1
                                                : audio.label}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </div>

                    {"audioOutputSupportedBrowsers" in window.config &&
                        window.config.audioOutputSupportedBrowsers.includes(
                            me.browser.name
                        ) && (
                        <>
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="caption"
                            >
                                {audioOutputDevices.length > 0
                                    ? intl.formatMessage({
                                        id             : "settings.selectAudioOutput",
                                        defaultMessage :
                                                  "Select audio output device",
                                    })
                                    : intl.formatMessage({
                                        id             : "settings.cantSelectAudioOutput",
                                        defaultMessage :
                                                  "Unable to select audio output device",
                                    })}
                            </Typography>
                            <FormControl
                                variant="outlined"
                                size="small"
                                className={classes.formControl}
                            >
                                <Select
                                    value={
                                        settings.selectedAudioOutputDevice ||
                                            ""
                                    }
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            roomClient.changeAudioOutputDevice(
                                                event.target.value
                                            );
                                        }
                                    }}
                                    displayEmpty
                                    name={intl.formatMessage({
                                        id             : "settings.audioOutput",
                                        defaultMessage :
                                                "Audio output device",
                                    })}
                                    autoWidth
                                    className={classes.selectEmpty}
                                    disabled={
                                        audioOutputDevices.length === 0 ||
                                            me.audioOutputInProgress
                                    }
                                >
                                    {audioOutputDevices.map(
                                        (audioOutput, index) => {
                                            return (
                                                <MenuItem
                                                    key={index}
                                                    value={
                                                        audioOutput.deviceId
                                                    }
                                                >
                                                    {audioOutput.label}
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </FormControl>
                        </>
                    )}
                </div>

                {/* ============ SECTION 2 ============ */}
                <div className={classes.padding}>
                    <Typography
                        className={classes.subTitle}
                        variant="subtitle2"
                        component="p"
                        gutterBottom
                    >
                        {intl.formatMessage({
                            id             : "settings.audioPreset",
                            defaultMessage : "Select the audio preset",
                        })}
                    </Typography>
                    {settings.audioPresets && (
                        <div className={classes.form}>
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="caption"
                            >
                                {intl.formatMessage({
                                    id             : "settings.audioPreset",
                                    defaultMessage : "Select the audio preset",
                                })}
                            </Typography>

                            <FormControl
                                variant="outlined"
                                size="small"
                                className={classes.formControl}
                            >
                                <Select
                                    value={settings.audioPreset}
                                    onChange={(event) => {
                                        const audioPreset = event.target.value;

                                        if (audioPreset) {
                                            setAudioPreset(audioPreset);

                                            if (
                                                settings.audioPresets &&
                                                settings.audioPresets[
                                                    audioPreset
                                                ]
                                            ) {
                                                const {
                                                    autoGainControl,
                                                    echoCancellation,
                                                    noiseSuppression,
                                                    voiceActivatedUnmute,
                                                    noiseThreshold,
                                                    sampleRate,
                                                    channelCount,
                                                    sampleSize,
                                                    opusDtx,
                                                    opusFec,
                                                    opusPtime,
                                                    opusMaxPlaybackRate,
                                                } =
                                                    settings.audioPresets[
                                                        audioPreset
                                                    ];

                                                setAutoGainControl(
                                                    autoGainControl
                                                );
                                                setEchoCancellation(
                                                    echoCancellation
                                                );
                                                setNoiseSuppression(
                                                    noiseSuppression
                                                );
                                                setVoiceActivatedUnmute(
                                                    voiceActivatedUnmute
                                                );
                                                roomClient._setNoiseThreshold(
                                                    noiseThreshold
                                                );
                                                setSampleRate(sampleRate);
                                                setChannelCount(channelCount);
                                                setSampleSize(sampleSize);
                                                setOpusDtx(opusDtx);
                                                setOpusFec(opusFec);
                                                setOpusPtime(opusPtime);
                                                settingsActions.setOpusMaxPlaybackRate(
                                                    opusMaxPlaybackRate
                                                );
                                            }

                                            roomClient.updateMic();
                                        }
                                    }}
                                    name="Audio preset"
                                    autoWidth
                                    className={classes.selectEmpty}
                                >
                                    {Object.keys(settings.audioPresets).map(
                                        (value) => {
                                            return (
                                                <MenuItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {
                                                        settings.audioPresets[
                                                            value
                                                        ].name
                                                    }
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                    )}
                </div>

                {/* ============ SECTION 3 ============ */}
                <div className={classes.padding}>
                    <TextButton
                        color="primary"
                        disableRipple
                        endIcon={
                            openAdvanceSetting ? (
                                <ChevronUpIcon />
                            ) : (
                                <ChevronDownIcon />
                            )
                        }
                        onClick={() => {
                            setOpenAdvanceSetting(!openAdvanceSetting);
                        }}
                    >
                        {intl.formatMessage({
                            id             : "settings.showAdvancedAudio",
                            defaultMessage : "Advanced audio settings",
                        })}
                    </TextButton>
                </div>
                {openAdvanceSetting && (
                    <List component="div" className={classes.advanceControl}>
                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <FormControlLabel
                                className={classnames(
                                    classes.formControlLabel,
                                    classes.switchLabel
                                )}
                                control={
                                    <IOSSwitch
                                        color="primary"
                                        checked={settings.echoCancellation}
                                        onChange={(event) => {
                                            setEchoCancellation(
                                                event.target.checked
                                            );
                                            roomClient.updateMic();
                                        }}
                                    />
                                }
                                labelPlacement="start"
                                label={intl.formatMessage({
                                    id             : "settings.echoCancellation",
                                    defaultMessage : "Echo cancellation",
                                })}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <FormControlLabel
                                className={classnames(
                                    classes.formControlLabel,
                                    classes.switchLabel
                                )}
                                control={
                                    <IOSSwitch
                                        color="primary"
                                        checked={settings.autoGainControl}
                                        onChange={(event) => {
                                            setAutoGainControl(
                                                event.target.checked
                                            );
                                            roomClient.updateMic();
                                        }}
                                    />
                                }
                                labelPlacement="start"
                                label={intl.formatMessage({
                                    id             : "settings.autoGainControl",
                                    defaultMessage : "Auto gain control",
                                })}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <FormControlLabel
                                className={classnames(
                                    classes.formControlLabel,
                                    classes.switchLabel
                                )}
                                control={
                                    <IOSSwitch
                                        color="primary"
                                        checked={settings.noiseSuppression}
                                        onChange={(event) => {
                                            setNoiseSuppression(
                                                event.target.checked
                                            );
                                            roomClient.updateMic();
                                        }}
                                    />
                                }
                                labelPlacement="start"
                                label={intl.formatMessage({
                                    id             : "settings.noiseSuppression",
                                    defaultMessage : "Noise suppression",
                                })}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <FormControlLabel
                                className={classnames(
                                    classes.formControlLabel,
                                    classes.switchLabel
                                )}
                                control={
                                    <IOSSwitch
                                        color="primary"
                                        checked={settings.voiceActivatedUnmute}
                                        onChange={(event) => {
                                            setVoiceActivatedUnmute(
                                                event.target.checked
                                            );
                                        }}
                                    />
                                }
                                labelPlacement="start"
                                label={intl.formatMessage({
                                    id             : "settings.voiceActivatedUnmute",
                                    defaultMessage : "Voice activated unmute",
                                })}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <Typography gutterBottom>
                                {intl.formatMessage({
                                    id             : "settings.noiseThreshold",
                                    defaultMessage : "Noise threshold",
                                })}
                                :
                            </Typography>
                            <NoiseSlider
                                className={classnames(
                                    classes.slider,
                                    classnames.setting
                                )}
                                key={"noise-threshold-slider"}
                                min={-100}
                                value={settings.noiseThreshold}
                                max={0}
                                valueLabelDisplay={"auto"}
                                onChange={(event, value) => {
                                    roomClient._setNoiseThreshold(value);
                                }}
                                marks={[
                                    {
                                        value : volume,
                                        label : `${volume.toFixed(0)} dB`,
                                    },
                                ]}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="caption"
                            >
                                {intl.formatMessage({
                                    id             : "settings.sampleRate",
                                    defaultMessage :
                                        "Select the audio sample rate",
                                })}
                            </Typography>

                            <FormControl
                                className={classes.formControl}
                                variant="outlined"
                                size="small"
                            >
                                <Select
                                    value={settings.sampleRate || ""}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            setSampleRate(event.target.value);
                                            roomClient.updateMic();
                                        }
                                    }}
                                    name="Sample rate"
                                    autoWidth
                                    className={classes.selectEmpty}
                                >
                                    {[8000, 16000, 24000, 44100, 48000].map(
                                        (sampleRate) => {
                                            return (
                                                <MenuItem
                                                    key={sampleRate}
                                                    value={sampleRate}
                                                >
                                                    {sampleRate / 1000} kHz
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </FormControl>
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="caption"
                            >
                                {intl.formatMessage({
                                    id            : "settings.channelCount",
                                    defaultMessag :
                                        "Select the audio channel count",
                                })}
                            </Typography>

                            <FormControl
                                className={classes.formControl}
                                variant="outlined"
                                size="small"
                            >
                                <Select
                                    value={settings.channelCount || ""}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            setChannelCount(event.target.value);
                                            roomClient.updateMic();
                                        }
                                    }}
                                    name="Channel count"
                                    autoWidth
                                    className={classes.selectEmpty}
                                >
                                    {[1, 2].map((channelCount) => {
                                        return (
                                            <MenuItem
                                                key={channelCount}
                                                value={channelCount}
                                            >
                                                {channelCount} (
                                                {channelCount === 1
                                                    ? "mono"
                                                    : "stereo"}
                                                )
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="caption"
                            >
                                {intl.formatMessage({
                                    id             : "settings.sampleSize",
                                    defaultMessage :
                                        "Select the audio sample size",
                                })}
                            </Typography>

                            <FormControl
                                className={classes.formControl}
                                variant="outlined"
                                size="small"
                            >
                                <Select
                                    value={settings.sampleSize || ""}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            setSampleSize(event.target.value);
                                            roomClient.updateMic();
                                        }
                                    }}
                                    name="Sample size"
                                    autoWidth
                                    className={classes.selectEmpty}
                                >
                                    {[8, 16, 24, 32].map((sampleSize) => {
                                        return (
                                            <MenuItem
                                                key={sampleSize}
                                                value={sampleSize}
                                            >
                                                {sampleSize} bit
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <FormControlLabel
                                className={classnames(
                                    classes.formControlLabel,
                                    classes.switchLabel
                                )}
                                control={
                                    <IOSSwitch
                                        color="primary"
                                        checked={settings.opusDtx}
                                        onChange={(event) => {
                                            setOpusDtx(
                                                Boolean(event.target.checked)
                                            );
                                            roomClient.updateMic();
                                        }}
                                    />
                                }
                                labelPlacement="start"
                                label={intl.formatMessage({
                                    id             : "settings.opusDtx",
                                    defaultMessage :
                                        "Enable Opus Discontinuous Transmission (DTX)",
                                })}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <FormControlLabel
                                className={classnames(
                                    classes.formControlLabel,
                                    classes.switchLabel
                                )}
                                control={
                                    <IOSSwitch
                                        color="primary"
                                        checked={settings.opusFec}
                                        onChange={(event) => {
                                            setOpusFec(event.target.checked);
                                            roomClient.updateMic();
                                        }}
                                    />
                                }
                                labelPlacement="start"
                                label={intl.formatMessage({
                                    id             : "settings.opusFec",
                                    defaultMessage :
                                        "Enable Opus Forward Error Correction (FEC)",
                                })}
                            />
                        </ListItem>

                        <ListItem
                            disableGutters
                            className={classes.nested}
                        >
                            <Typography
                                gutterBottom
                                color="textPrimary"
                                variant="caption"
                            >
                                {intl.formatMessage({
                                    id             : "settings.opusPtime",
                                    defaultMessage :
                                        "Select the Opus frame size",
                                })}
                            </Typography>
                            <FormControl
                                className={classes.formControl}
                                variant="outlined"
                                size="small"
                            >
                                <Select
                                    value={settings.opusPtime || ""}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            setOpusPtime(event.target.value);
                                            roomClient.updateMic();
                                        }
                                    }}
                                    name="Opus frame size"
                                    autoWidth
                                    className={classes.selectEmpty}
                                >
                                    {[3, 5, 10, 20, 30, 40, 50, 60].map(
                                        (opusPtime) => {
                                            return (
                                                <MenuItem
                                                    key={opusPtime}
                                                    value={opusPtime}
                                                >
                                                    {opusPtime} ms
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </FormControl>
                        </ListItem>

                        {insertableStreamsSupported && (
                            <ListItem
                                disableGutters
                                className={classes.nested}
                            >
                                <FormControlLabel
                                    className={classnames(
                                        classes.formControlLabel,
                                        classes.switchLabel
                                    )}
                                    control={
                                        <IOSSwitch
                                            color="primary"
                                            checked={settings.enableOpusDetails}
                                            onChange={(event) => {
                                                setEnableOpusDetails(
                                                    event.target.checked
                                                );
                                            }}
                                        />
                                    }
                                    labelPlacement="start"
                                    label={intl.formatMessage({
                                        id             : "settings.enableOpusDetails",
                                        defaultMessage :
                                            "Enable OPUS details (page reload required)",
                                    })}
                                />
                            </ListItem>
                        )}
                    </List>
                )}
            </form>
        </React.Fragment>
    );
};

AudioSettings.propTypes = {
    roomClient              : PropTypes.any.isRequired,
    setAudioPreset          : PropTypes.func.isRequired,
    setEchoCancellation     : PropTypes.func.isRequired,
    setAutoGainControl      : PropTypes.func.isRequired,
    setNoiseSuppression     : PropTypes.func.isRequired,
    setVoiceActivatedUnmute : PropTypes.func.isRequired,
    setSampleRate           : PropTypes.func.isRequired,
    setChannelCount         : PropTypes.func.isRequired,
    setSampleSize           : PropTypes.func.isRequired,
    setOpusDtx              : PropTypes.func.isRequired,
    setOpusFec              : PropTypes.func.isRequired,
    setOpusPtime            : PropTypes.func.isRequired,
    setEnableOpusDetails    : PropTypes.func.isRequired,
    me                      : appPropTypes.Me.isRequired,
    volume                  : PropTypes.number,
    settings                : PropTypes.object.isRequired,
    classes                 : PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        me       : state.me,
        volume   : state.peerVolumes[state.me.id],
        settings : state.settings,
    };
};

const mapDispatchToProps = {
    setAudioPreset          : settingsActions.setAudioPreset,
    setEchoCancellation     : settingsActions.setEchoCancellation,
    setAutoGainControl      : settingsActions.setAutoGainControl,
    setNoiseSuppression     : settingsActions.setNoiseSuppression,
    setVoiceActivatedUnmute : settingsActions.setVoiceActivatedUnmute,
    setSampleRate           : settingsActions.setSampleRate,
    setChannelCount         : settingsActions.setChannelCount,
    setSampleSize           : settingsActions.setSampleSize,
    setOpusDtx              : settingsActions.setOpusDtx,
    setOpusFec              : settingsActions.setOpusFec,
    setOpusPtime            : settingsActions.setOpusPtime,
    setEnableOpusDetails    : settingsActions.setEnableOpusDetails,
};

export default withRoomContext(
    connect(mapStateToProps, mapDispatchToProps, null, {
        areStatesEqual : (next, prev) => {
            return (
                prev.me === next.me &&
                prev.settings === next.settings &&
                prev.peerVolumes[prev.me.id] === next.peerVolumes[next.me.id]
            );
        },
    })(withStyles(styles)(AudioSettings))
);
