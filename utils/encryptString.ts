const CryptoJS = require("crypto-js");

const ENCRYPTION = process.env.ENCRYPTION_KEY;


export function encryptString(nameGiven: String) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ nameGiven }), ENCRYPTION).toString();
  return encrypted;
}