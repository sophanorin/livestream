const https = require("https");
const tls = require("tls");
const fs = require("fs");
const Logger = require("../lib/logger/Logger");
const config = require("../config/config");

const log = new Logger();

const certs = config.tls;

// certs formation
// const certs = {
//   localhost: {
//     key: "./certs/localhost.key",
//     cert: "./certs/localhost.crt",
//   },
//   "example.com": {
//     key: "./certs/example.key",
//     cert: "./certs/example.cert",
//     ca: "./certs/example.ca",
//   },
// };

// TLS server configuration.
const tls_options = {
  secureOptions: "tlsv12",
  ciphers: [
    "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384",
    "ECDHE-ECDSA-CHACHA20-POLY1305",
    "ECDHE-RSA-CHACHA20-POLY1305",
    "DHE-RSA-AES128-GCM-SHA256",
    "DHE-RSA-AES256-GCM-SHA384",
  ].join(":"),
  honorCipherOrder: true,
};

function getSecureContexts(certs) {
  if (!certs || Object.keys(certs).length === 0) {
    throw new Error("Any certificate wasn't found.");
  }

  const certsToReturn = {};

  for (const serverName of Object.keys(certs)) {
    const appCert = certs[serverName];

    certsToReturn[serverName] = tls.createSecureContext({
      key: fs.readFileSync(appCert.key),
      cert: fs.readFileSync(appCert.cert),
      // If the 'ca' option is not given, then node.js will use the default
      ca: appCert.ca ? sslCADecode(fs.readFileSync(appCert.ca, "utf8")) : null,
    });
  }

  return certsToReturn;
}

function sslCADecode(source) {
  if (!source || typeof source !== "string") {
    return [];
  }

  return source
    .split(/-----END CERTIFICATE-----[\s\n]+-----BEGIN CERTIFICATE-----/)
    .map((value, index, array) => {
      if (index) {
        value = "-----BEGIN CERTIFICATE-----" + value;
      }
      if (index !== array.length - 1) {
        value = value + "-----END CERTIFICATE-----";
      }
      value = value.replace(/^\n+/, "").replace(/\n+$/, "");
      return value;
    });
}

const secureContexts = getSecureContexts(certs);

const options = {
  // A function that will be called if the client supports SNI TLS extension.
  SNICallback: (servername, cb) => {
    const ctx = secureContexts[servername];

    if (!ctx) {
      log.debug(`Not found SSL certificate for host: ${servername}`);
    } else {
      log.debug(`SSL certificate has been found and assigned to ${servername}`);
    }

    if (cb) {
      cb(null, ctx);
    } else {
      return ctx;
    }
  },
  ...tls_options,
};

module.exports = {
  options,
};
