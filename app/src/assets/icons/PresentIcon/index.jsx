import { SvgIcon } from "@material-ui/core";

const PresentIcon = (props) => (
    <SvgIcon style={{ fill: "none" }} {...props}>
        <path
            d="M9 20H15M3 4H21H3ZM4 4V14C4 14.5304 4.21071 15.0391 4.58579 15.4142C4.96086 15.7893 5.46957 16 6 16H18C18.5304 16 19.0391 15.7893 19.4142 15.4142C19.7893 15.0391 20 14.5304 20 14V4H4ZM12 16V20V16Z"
            stroke="#494B5E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M8 12L11 9L13 11L16 8"
            stroke="#494B5E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </SvgIcon>
);

export default PresentIcon;
