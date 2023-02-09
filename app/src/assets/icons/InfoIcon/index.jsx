import { SvgIcon } from "@material-ui/core";

const InfoIcon = (props) => (
    <SvgIcon
        {...props}
        style={{
            fill : "none",
        }}
    >
        <path
            d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
            stroke="#494B5E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M11.25 11.25H12V16.5H12.75"
            stroke="#494B5E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12.625 7.875C12.625 8.22018 12.3452 8.5 12 8.5C11.6548 8.5 11.375 8.22018 11.375 7.875C11.375 7.52982 11.6548 7.25 12 7.25C12.3452 7.25 12.625 7.52982 12.625 7.875Z"
            fill="#494B5E"
            stroke="#494B5E"
        />
    </SvgIcon>
);

export default InfoIcon;
