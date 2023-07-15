const CryptoJS = require("crypto-js");
require("dotenv").config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

export function decryptString(nameGiven: String) {
  const decrypted = CryptoJS.AES.decrypt(nameGiven, ENCRYPTION_KEY).toString(
    CryptoJS.enc.Utf8
  );
  const parsed = JSON.parse(decrypted)
  return parsed.nameGiven
}
