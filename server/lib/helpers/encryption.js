const {webcrypto} = require("crypto");

const ENCRYPTION_KEY_BITS = 128;

const generateEncryptKey = async (returnAs) => {
  const key = await webcrypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: ENCRYPTION_KEY_BITS,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  return returnAs === "crypto"
    ? key
    : (await webcrypto.subtle.exportKey("jwk", key)).k;
};

module.exports = {
  generateEncryptKey,
};
