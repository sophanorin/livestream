const config = require("../../config/config");

const takenPortSet = new Set();

module.exports.getPort = async () => {
  let port = getRandomPort();

  while (takenPortSet.has(port)) {
    port = getRandomPort();

    try {
      // Check that the port is available to use
      await isPortOpen(port);
    } catch (error) {
      console.error("getPort() port is taken [port:%d]", port);
      takenPortSet.add(port);
    }
  }

  takenPortSet.add(port);

  return port;
};

module.exports.releasePort = (port) => takenPortSet.delete(port);

const getRandomPort = () =>
  Math.floor(
    Math.random() *
      (config.mediasoup.worker.rtcMaxPort -
        config.mediasoup.worker.rtcMinPort +
        1) +
      config.mediasoup.worker.rtcMinPort
  );

// Users a socket to check that the port is open
const isPortOpen = (port) => {
  return new Promise((resolve, reject) => {
    socket.once("connect", () => resolve);

    socket.setTimeout(config.requestTimeout);
    socket.once("timeout", () => reject);
    socket.once("error", (error) => reject());

    socket.connect(port, config.listeningHost);
  });
};
