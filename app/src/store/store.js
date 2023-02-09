import {
    legacy_createStore as createStore,
    applyMiddleware,
    compose,
} from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import { createMigrate, persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import rootReducer from "./reducers/rootReducer";
import { createBlacklistFilter } from "redux-persist-transform-filter";

const migrations = {
    // initial version 0: we will clean up all historical data
    // from local storage for the time
    // before we began with migration versioning
    // 0 : (state) => {
    //     state = {};

    //     return { ...state };
    // },
    1 : (state) => {
        state.me.loggedIn = false;

        return { ...state };
    }
    // Next version
    //	1 : (state) =>
    //	{
    //		return { ...state };
    //	}
};

const saveSubsetFilter = createBlacklistFilter("me", ["loggedIn"]);

const persistConfig = {
    key             : "root",
    storage,
    // migrate will iterate state over all version-functions
    // from migrations until version is reached
    version         : 1,
    migrate         : createMigrate(migrations, { debug: true }),
    stateReconciler : autoMergeLevel2,
    // whitelist: ["intl", "me"],
    whitelist       : ["settings", "intl", "me"],
    transforms      : [saveSubsetFilter],
};

const reduxMiddlewares = [];

if (
    process.env.REACT_APP_DEBUG === "*" ||
    process.env.NODE_ENV !== "production"
) {
    const LOG_IGNORE = [
        "SET_PEER_VOLUME",
        "SET_ROOM_ACTIVE_SPEAKER",
        "ADD_TRANSPORT_STATS",
    ];
    const reduxLogger = createLogger({
        // filter VOLUME level actions from log
        predicate : (getState, action) => LOG_IGNORE.indexOf(action.type) === -1,
        duration  : true,
        timestamp : false,
        level     : "log",
        logErrors : true,
    });

    reduxMiddlewares.push(reduxLogger);
    reduxMiddlewares.push(thunk)
}

const composeEnhancers =
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const enhancer = composeEnhancers(applyMiddleware(...reduxMiddlewares));

const pReducer = persistReducer(persistConfig, rootReducer);

const initialState = {
    intl : {
        locale   : null,
        messages : null,
    },
    // ...other initialState
};

let createReduxStore = createStore(pReducer, initialState, enhancer);

if (process.env.NODE_ENV === "production") {
    createReduxStore = createStore(pReducer, initialState);
}

export const store = createReduxStore;

export const persistor = persistStore(store);
