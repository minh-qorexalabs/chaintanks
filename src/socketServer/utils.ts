import crypto from "crypto"

const encryptionType = 'aes-256-cbc';
const encryptionEncoding = 'base64';
const bufferEncryption = 'utf-8';

const encrypt = (message = '', key = '', IV = '') => {
  const dKey = Buffer.from(key, bufferEncryption);
  const dIV = Buffer.from(IV, bufferEncryption);
  const cipher = crypto.createCipheriv(encryptionType, dKey, dIV);

  let encrypted = cipher.update(message, bufferEncryption, encryptionEncoding);
  encrypted += cipher.final(encryptionEncoding);

  return encrypted;
}

const decrypt = (message = '', key = '', IV = '') => {
  const dVal = Buffer.from(message, encryptionEncoding);
  const dKey = Buffer.from(key, bufferEncryption);
  const dIV = Buffer.from(IV, bufferEncryption);
  const decipher = crypto.createDecipheriv(encryptionType, dKey, dIV);
  const deciphered = new TextDecoder().decode(Buffer.concat([decipher.update(dVal), decipher.final()]));

  return deciphered;
}

const encryptFromJson = (message = {}) => {
  const key = process.env.CRYPTOKEY || "Full Stack IT Service 198703Game";
  const IV = process.env.CRYPTOIV || "MatGoGameProject";
  return encrypt(JSON.stringify(message), key, IV);
}

const decryptToJson = (message = "") => {
  const key = process.env.CRYPTOKEY || "Full Stack IT Service 198703Game";
  const IV = process.env.CRYPTOIV || "MatGoGameProject";
  return JSON.parse(decrypt(message, key, IV));
}

const securityCode = {
  "getAlltanks": "0xc76de3e9",
  "getEnegy": "0xc76de3f0",
  "update-tank-energy": "0xc76de3f1",
  "getUsertanks": "0xbedf0f4a",
  "addExperience": "0x70f2d602",
  "update-tank": "0x71f2d602",
  "spawn-tank": "0x1ca81c61",
  "error": "0x60b24f52",
  "all-tanks": "0xb4e09d3e",
  "user-tanks": "0xffb3b7f8",

  "login": "0xbadb4288",
  "loginSuccess": "0xd9ee0ad6",
  "authError": "0xadd61e81",
  "loginError": "0xab3d6e41",

  "signup": "0xaa696986",
  "signupSuccess": "0xa02d37fc",
  "signupError": "0x1aae0a86",

  "kicked": "0x1ca80c61",
  "auth-data": "0x38a30261",

  // 12/12
  "getLendingtanks": "0xde09eda4",
  "lend": "0xd0ad9e2e",
  "winRound": "0xc11ca863",
  "loseRound": "0x7d6020f2",
  // leaderbaord
  "getLeaderBoard": "0x38a30265",//in
  "leaderBoard": "0x38a30267",//out
  // rentTank
  "getRentableTanks": "0x38a30262",//in
  "rentable-tanks": "0x38a30263",//out
  "rentTank": "0x38a30264",//in
  "rentTank-result": "0x38a30266",//out
  // chat
  "global-chat": "0x38a30268",
  // defend cheat
  "game-state": "0x38a30269",
}

export {
  securityCode,
  encryptFromJson,
  decryptToJson,
}