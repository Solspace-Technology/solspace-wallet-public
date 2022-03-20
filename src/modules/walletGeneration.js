import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import {Keypair} from '@solana/web3.js';
import bs58 from 'bs58';

export function getMnemonicPhrase() {
  //* Generates a new 256 bit mnemonic phrase - 24 words
  // const phrase = bip39.generateMnemonic(256);
  //* 128 bit mnemonic phrase - 12 words
  const phrase = bip39.generateMnemonic(128);
  return phrase;
}

export async function getKeypairForMnemonicAndDerivePath(
  mnemonic,
  derivePath = "m/44'/501'/0'/0'",
) {
  const seed = await bip39.mnemonicToSeed(mnemonic);

  const derivedSeed = ed25519.derivePath(derivePath, seed.toString('hex')).key;
  let keypair = Keypair.fromSeed(derivedSeed);

  return keypair;
}

export async function getListOfKeypairsFromMnemonic(
  mnemonic,
  baseDerivePath = "m/44'/501'/0'/0'",
  numKeypairs = 3,
  lastDerivePath = 0,
) {
  let keypairs = [];

  for (let num of Array(numKeypairs).keys()) {
    let derivePath;
    if (num === 0) {
      derivePath = baseDerivePath;
    } else {
      derivePath = baseDerivePath + `/${lastDerivePath + num - 1}'`;
    }
    console.log(derivePath);
    keypairs.push(getKeypairForMnemonicAndDerivePath(mnemonic, derivePath));
  }

  let newKeypairs = await Promise.all(keypairs);

  return newKeypairs;
}

export function getKeypairFromSecretKey(secretKey) {
  let decodedKey = bs58.decode(secretKey);
  try {
    let keypair = Keypair.fromSecretKey(decodedKey);
    return keypair;
  } catch (error) {
    console.log(error);
    return false;
  }
}
