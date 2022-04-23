import {MMKV} from 'react-native-mmkv';
import { decryptData } from './security';

/* eslint-disable no-bitwise */
export const USDFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function LightenColor(color, percent) {
  var num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = ((num >> 8) & 0x00ff) + amt,
    G = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
      (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export function shortenPubKey(pubKeyString, length = 4) {
  return (
    pubKeyString.slice(0, length) + '...' + pubKeyString.slice(-1 * length)
  );
}

export function isFunctionComponent(component) {
  return (
    typeof component === 'function' &&
    String(component).includes('return React.createElement')
  );
}

export function setStoredData({key, value}: {key: string, value: string}) {
  // Assumes that the value parametes is already stringified
  try {
    const storage = new MMKV();
    storage.set(key, value)
  } catch (e) {
    // Error saving data
    console.log(e);
    return {error: {name: 'SetStorageErr', error: e}};
  }
}

export function getStoredData(key: string) {
  try {
    const storage = new MMKV();
    const value = storage.getString(key);
    return value;
    // must handle error in use when this is null
  } catch (e) {
    // Error getting data
    console.log(e);
    return {error: {name: 'GetStorageError', error: e}};
  }
}

export async function logAllStoredData() {
  // All storage is assumed to be a string
  try {
    const storage = new MMKV();
    const storageKeys = storage.getAllKeys();

    for (let key of storageKeys) {
      let data = JSON.parse(storage.getString(key));
      if (key === "@walletState") {
        for (let wallet of data.wallets) {
          if (wallet.secretKey) {
            console.log("trying")
            let decrypted = await decryptData(wallet.secretKey);
            console.log('decrypted', decrypted);
            wallet.secretKey = decrypted;
          }
        }
      } else if (key === "@appState") {
        delete data.encryptedSeedPhrase;
      }
      console.log({key, data})
    }
  } catch (e) {
    console.log("Error getting data: ", e)
  }
}
