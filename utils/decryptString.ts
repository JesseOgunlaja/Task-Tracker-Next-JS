const CryptoJS = require("crypto-js");

const ENCRYPTION_CLIENT = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const ENCRYPTION_SERVER = process.env.ENCRYPTION_KEY;

export function decryptString(nameGiven: string, client: boolean) {
  const decrypted = CryptoJS.AES.decrypt(
    nameGiven,
    client ? ENCRYPTION_CLIENT : ENCRYPTION_SERVER,
  ).toString(CryptoJS.enc.Utf8);
  const parsed = JSON.parse(decrypted);
  return parsed.nameGiven;
}
