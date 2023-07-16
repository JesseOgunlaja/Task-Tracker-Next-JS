const CryptoJS = require("crypto-js");
require("dotenv").config();

const ENCRYPTION = process.env.ENCRYPTION_KEY;

export function decryptString(nameGiven: String) {
  const decrypted = CryptoJS.AES.decrypt(nameGiven, ENCRYPTION).toString(
    CryptoJS.enc.Utf8
  );
  const parsed = JSON.parse(decrypted)
  return parsed.nameGiven
}
