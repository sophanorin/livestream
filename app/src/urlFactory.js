import { useLocation } from "react-router-dom";
export function getSignalingUrl({
    roomId,
    roomKey,
    peerId,
    roleIds,
    displayName,
    picture,
    email
}) {
    const isProduction = process.env.NODE_ENV === "production";

    const port = isProduction
        ? window.config.productionPort
        : window.config.developmentPort;

    const hostname = window.location.hostname;

    const params = {
        roomId,
        peerId,
        roleIds,
        picture,
        displayName,
        email,
    }

    const data64 = Buffer.from(JSON.stringify(params)).toString('base64');

    return `wss://${hostname}:${port}/?data64=${data64}`;
}

export function useQuery() {
    return new URLSearchParams(useLocation().search);
}
