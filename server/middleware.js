const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const expressSession = require("express-session");
const RedisStore = require("connect-redis")(expressSession);

const config = require("./config/config");

let expressSessionConfig = {
    secret: config.cookieSecret,
    name: config.cookieName,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // Expire after 1 hour since last request from user
    },
};

module.exports.middleware = (app, options) => {
    if (config.trustProxy) {
        app.set("trust proxy", config.trustProxy);
    }

    app.use(helmet.hsts());

    const sharedCookieParser = cookieParser();

    app.use(sharedCookieParser);
    app.use(bodyParser.json({ limit: "5mb" }));
    app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

    if (options.store) {
        expressSessionConfig = {
            ...expressSessionConfig,
            store: new RedisStore({ client: options.store }),
        };
    }

    const session = expressSession(expressSessionConfig);

    app.use(session);

    return { sharedCookieParser, session };
};
