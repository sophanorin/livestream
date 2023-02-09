import domready from "domready";
import React, { Suspense } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import isElectron from "is-electron";
import { createIntl } from "react-intl";
import { IntlProvider } from "react-intl-redux";
import { Route, HashRouter, BrowserRouter, Switch } from "react-router-dom";
import debug from "debug";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import { PersistGate } from "redux-persist/lib/integration/react";
import { SnackbarProvider } from "notistack";
import { detectDevice } from "mediasoup-client";

import * as meActions from "./store/actions/meActions";
import Logger from "./Logger";
import RoomClient from "./RoomClient";
import RoomContext from "./RoomContext";
import deviceInfo from "./deviceInfo";
import UnsupportedBrowser from "./components/UnsupportedBrowser";
import { ThreeDotsLoading } from "./components/Loading";
import * as serviceWorker from "./serviceWorker";
import { ReactLazyPreload } from "./components/ReactLazyPreload";
import { persistor, store } from "./store/store";
import customTheme from "./theme";

import "./index.css";
import StyledSnackBarProvider from "./core/snackbar";
import { getLinkData } from "./utils";
import randomString from "random-string";
import StartMeeting from "./components/StartMeeting/StartMeeting";

const App = ReactLazyPreload(() =>
    import(/* webpackChunkName: "app" */ "./components/App")
);

const supportedBrowsers = {
    windows : {
        "internet explorer" : ">12",
        "microsoft edge"    : ">18",
    },
    safari                         : ">12",
    firefox                        : ">=60",
    chrome                         : ">=74",
    chromium                       : ">=74",
    opera                          : ">=62",
    "samsung internet for android" : ">=11.1.1.52",
};

const intl = createIntl({ locale: "en", defaultLocale: "en" });

if (
    process.env.REACT_APP_DEBUG === "*" ||
    process.env.NODE_ENV !== "production"
) {
    debug.enable("* -engine* -socket* -RIE* *WARN* *ERROR*");
}

const logger = new Logger();

let roomClient;

RoomClient.init({ store });

const theme = createTheme(customTheme);

let Router;

if (isElectron()) {
    Router = HashRouter;
} else {
    Router = BrowserRouter;
}

domready(() => {
    logger.debug("DOM ready");

    run();
});

function run() {
    logger.debug("run() [environment:%s]", process.env.NODE_ENV);

    const peerId = randomString({ length: 8 }).toLowerCase();

    const urlParser = new URL(window.location);
    const parameters = urlParser.searchParams;
    const accessCode = parameters.get("code");
    const produce = parameters.get("produce") !== "false";
    const forceTcp = parameters.get("forceTcp") === "true";
    const muted = parameters.get("muted" === "true");
    // const { roomId, roomKey, tk } = getLinkData(window.location.search);

    // const showConfigDocumentationPath = parameters.get("config") === "true";

    const { pathname } = window.location;

    let basePath = pathname.substring(0, pathname.lastIndexOf("/"));

    if (!basePath) {
        basePath = "/";
    }

    // Get current device.
    const device = deviceInfo();

    const unsupportedBrowser = false;

    const webrtcUnavailable = false;

    if (detectDevice() === undefined) {
        logger.error('Your browser is not supported [deviceInfo:"%o"]', device);

        unsupportedBrowser = true;
    } else if (
        navigator.mediaDevices === undefined ||
        navigator.mediaDevices.getUserMedia === undefined ||
        window.RTCPeerConnection === undefined
    ) {
        logger.error('Your browser is not supported [deviceInfo:"%o"]', device);

        webrtcUnavailable = true;
    } else if (
        !device.bowser.satisfies(config.supportedBrowsers || supportedBrowsers)
    ) {
        logger.error('Your browser is not supported [deviceInfo:"%o"]', device);

        unsupportedBrowser = true;
    } else {
        logger.debug('Your browser is supported [deviceInfo:"%o"]', device);
    }

    if (unsupportedBrowser || webrtcUnavailable) {
        render(
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <IntlProvider value={intl}>
                        <UnsupportedBrowser
                            webrtcUnavailable={webrtcUnavailable}
                            platform={device.platform}
                        />
                    </IntlProvider>
                </MuiThemeProvider>
            </Provider>,
            document.getElementById("livestream")
        );

        return;
    }

    // if (showConfigDocumentationPath) {
    //   render(
    //     <Provider store={store}>
    //       <MuiThemeProvider theme={theme}>
    //         <IntlProvider value={intl}>
    //           <ConfigDocumentation />
    //         </IntlProvider>
    //       </MuiThemeProvider>
    //     </Provider>,
    //     document.getElementById("livestream")
    //   );

    //   return;
    // }

    // if (configError) {
    //   render(
    //     <Provider store={store}>
    //       <MuiThemeProvider theme={theme}>
    //         <IntlProvider value={intl}>
    //           <ConfigError configError={configError} />
    //         </IntlProvider>
    //       </MuiThemeProvider>
    //     </Provider>,
    //     document.getElementById("livestream")
    //   );
    // }

    store.dispatch(
        meActions.setMe({
            peerId,
            loginEnabled : config.loginEnabled,
        })
    );

    roomClient = new RoomClient({
        accessCode,
        device,
        produce,
        forceTcp,
        basePath,
        muted,
        peerId,
    });

    global.CLIENT = roomClient;

    render(
        <Provider store={store}>
            <MuiThemeProvider theme={theme}>
                <IntlProvider value={intl}>
                    <PersistGate
                        loading={<ThreeDotsLoading />}
                        persistor={persistor}
                    >
                        <RoomContext.Provider value={roomClient}>
                            <StyledSnackBarProvider
                                maxSnack={config.notistack.maxSnack}
                            >
                                <Router basename={basePath}>
                                    <Suspense fallback={<ThreeDotsLoading />}>
                                        <React.Fragment>
                                            <Switch>
                                                {/* <Route
                                                    exact
                                                    path="/"
                                                    component={App}
                                                /> */}
                                                <Route exact path='/' component={StartMeeting} />
                                                {/* <Route exact path='/login_dialog' component={LoginDialog} /> */}
                                                <Route path='/:id' component={App} />
                                            </Switch>
                                        </React.Fragment>
                                    </Suspense>
                                </Router>
                            </StyledSnackBarProvider>
                        </RoomContext.Provider>
                    </PersistGate>
                </IntlProvider>
            </MuiThemeProvider>
        </Provider>,
        document.getElementById("livestream")
    );
}

serviceWorker.unregister();
