import { SvgIcon } from "@material-ui/core";

const ConfirmIcon = (props) => (
    <SvgIcon {...props}>
        <path
            d="M20.94 10.94C20.94 14.59 16.47 19.01 13.81 21.32C13.29 21.77 12.65 22 12 22C11.35 22 10.71 21.77 10.19 21.32C7.53 19.01 3.06 14.59 3.06 10.94C3.06 6.01 7.07 2 12 2C16.93 2 20.94 6.01 20.94 10.94Z"
            fill="url(#paint0_linear_1093_1437)"
        />
        <path
            d="M12 12C11.45 12 11 11.55 11 11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11C13 11.55 12.55 12 12 12Z"
            fill="url(#paint1_linear_1093_1437)"
        />
        <path
            d="M12 16C11.45 16 11 15.55 11 15V14C11 13.45 11.45 13 12 13C12.55 13 13 13.45 13 14V15C13 15.55 12.55 16 12 16Z"
            fill="url(#paint2_linear_1093_1437)"
        />
        <defs>
            <linearGradient
                id="paint0_linear_1093_1437"
                x1="12"
                y1="2"
                x2="12"
                y2="22"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#518FF5" />
                <stop offset="1" stopColor="#1855AB" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_1093_1437"
                x1="12"
                y1="7"
                x2="12"
                y2="12"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#A6C5FA" />
                <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient
                id="paint2_linear_1093_1437"
                x1="12"
                y1="13"
                x2="12"
                y2="16"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#A6C5FA" />
                <stop offset="1" stopColor="white" />
            </linearGradient>
        </defs>
    </SvgIcon>
);

export default ConfirmIcon;
