const shortcuts = [
    { key: "h", label: "room.help", defaultMessage: "Help" },
    { key: "m", label: "device.muteAudio", defaultMessage: "Mute Audio" },
    { key: "v", label: "device.stopVideo", defaultMessage: "Mute Video" },
    { key: "1", label: "label.democratic", defaultMessage: "Democratic View" },
    { key: "2", label: "label.filmstrip", defaultMessage: "Filmstrip View" },
    {
        key            : "space",
        label          : "me.mutedPTT",
        defaultMessage : "Push SPACE to talk",
    },
    {
        key            : "a",
        label          : "label.advanced",
        defaultMessage : "Show advanced information",
    },

    /*
	{
		key: `${String.fromCharCode(8592)} ${String.fromCharCode(8594)}`,
		label: 'room.browsePeersSpotlight',
		defaultMessage: 'Browse participants into Spotlight'
	}
	*/
];

export default shortcuts;
