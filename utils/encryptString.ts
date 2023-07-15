const CryptoJS = require("crypto-js");
require('dotenv').config()

const ENCRYPTION_KEY_CLIENT = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const ENCRYPTION_KEY_SERVER = process.env.ENCRYPTION_KEY;

export function encryptString(nameGiven: String, client: boolean) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ nameGiven }), client ? ENCRYPTION_KEY_CLIENT : ENCRYPTION_KEY_SERVER).toString();
  return encrypted;
}
