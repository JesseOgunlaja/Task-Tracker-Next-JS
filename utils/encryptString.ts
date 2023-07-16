const CryptoJS = require("crypto-js");

const ENCRYPTION_CLIENT = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const ENCRYPTION_SERVER = process.env.ENCRYPTION_KEY;


export function encryptString(nameGiven: String, client: Boolean) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ nameGiven }), client ? ENCRYPTION_CLIENT : ENCRYPTION_SERVER).toString();
  return encrypted
}