import * as Keychain from 'react-native-keychain';
import {generateSecureRandom} from 'react-native-securerandom';
import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64';

import {getKeypairFromSecretKey} from './walletGeneration';

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'soladexLlave';

export async function getEncryptionKey() {
  const existingCredentials = await Keychain.getGenericPassword();

  if (existingCredentials) {
    return {isFresh: false, key: existingCredentials.password};
  }

  // Generate a new encryption key based on a random string
  const randomBytes = await generateSecureRandom(32);
  const randomBytesString = binaryToBase64(randomBytes);

  const hasSetCredentials = await Keychain.setGenericPassword(
    ENCRYPTION_KEY,
    randomBytesString,
    {
      //! ISSUE WITH LIBRARY...KEEP POSTED FOR FIX
      accessControl: Keychain.ACCESS_CONTROL.USER_PRESENCE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
      authenticationType:
        Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    },
  );

  if (hasSetCredentials) {
    return {isFresh: true, key: randomBytesString};
  }
}

export async function resetEncryptionKey() {
  try {
    let reset = await Keychain.resetGenericPassword();
    console.log('encryption key cleared');
    return reset;
  } catch (error) {
    return {
      error: {
        name: 'EncryptionERR',
        message: 'Unable to reset encryption key.',
        error,
      },
    };
  }
}

export async function encryptData(data) {
  const encryptionKey = await getEncryptionKey();
  let encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey.key);
  return encrypted.toString();
}

export async function decryptData(data) {
  const encryptionKey = await getEncryptionKey();
  let decrypted = CryptoJS.AES.decrypt(data, encryptionKey.key);
  let unParsed = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(unParsed);
}

export async function getKeypairFromEncryptedSecretKey(secretKey) {
  const decryptedKey = await decryptData(secretKey);
  try {
    let keypair = getKeypairFromSecretKey(decryptedKey);
    return {keypair, error: null};
  } catch (e) {
    console.log(e);
    return {
      keypair: null,
      error: {
        name: 'KeypairGenErr',
        message:
          'Unable to get keypair from secret key. Please ensure a secret key was provided.',
        e,
      },
    };
  }
}
