/* eslint-disable no-bitwise */
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import {Buffer} from 'buffer';

import {Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import base58 from 'bs58';

//* LEGDER COMM CONSTANTS
const INS_GET_PUBKEY = 0x05;
const INS_SIGN_MESSAGE = 0x06;
const P1_NON_CONFIRM = 0x00;
const P1_CONFIRM = 0x01;
const P2_EXTEND = 0x01;
const P2_MORE = 0x02;
const MAX_PAYLOAD = 255;
const LEDGER_CLA = 0xe0;
const STATUS_OK = 0x9000;

//* Helper function for chunked send of larger payloads
async function solana_send(transport, instruction, p1, payload) {
  var p2 = 0;
  var payload_offset = 0;
  if (payload.length > MAX_PAYLOAD) {
    while (payload.length - payload_offset > MAX_PAYLOAD) {
      const buf = payload.slice(payload_offset, payload_offset + MAX_PAYLOAD);
      payload_offset += MAX_PAYLOAD;
      console.log(
        'send',
        (p2 | P2_MORE).toString(16),
        buf.length.toString(16),
        buf,
      );
      const reply = await transport.send(
        LEDGER_CLA,
        instruction,
        p1,
        p2 | P2_MORE,
        buf,
      );
      // eslint-disable-next-line eqeqeq
      if (reply.length != 2) {
        throw new Error(
          'solana_send: Received unexpected reply payload',
          'UnexpectedReplyPayload',
        );
      }
      p2 |= P2_EXTEND;
    }
  }
  const buf = payload.slice(payload_offset);
  try {
    const reply = await transport.send(LEDGER_CLA, instruction, p1, p2, buf);
    return reply.slice(0, reply.length - 2);
  } catch (e) {
    if (e.message.includes('UNKNOWN_ERROR (0x6808)')) {
      //TODO: HAndle these errors more gracefully here...
      console.warn('ENABLE BLIND SIGN');
    } else {
      console.warn(e);
    }
  }
}

const BIP32_HARDENED_BIT = (1 << 31) >>> 0;
function _harden(n) {
  return (n | BIP32_HARDENED_BIT) >>> 0;
}

function solana_derivation_path(account, change) {
  let length;
  if (typeof account === 'number') {
    if (typeof change === 'number') {
      length = 4;
    } else {
      length = 3;
    }
  } else {
    length = 2;
  }
  var derivation_path = Buffer.alloc(1 + length * 4);
  var offset = 0;
  offset = derivation_path.writeUInt8(length, offset);
  offset = derivation_path.writeUInt32BE(_harden(44), offset); // Using BIP44
  offset = derivation_path.writeUInt32BE(_harden(501), offset); // Solana's BIP44 path

  if (length > 2) {
    offset = derivation_path.writeUInt32BE(_harden(account), offset);
    if (length === 4) {
      offset = derivation_path.writeUInt32BE(_harden(change), offset);
    }
  }
  return derivation_path;
}

function derivation_path_from_string(string) {
  const inputs = [...string.match(/\d+/gm)];
  if (inputs[2]) {
    if (inputs[3]) {
      return solana_derivation_path(
        parseInt(inputs[2], 10),
        parseInt(inputs[3], 10),
        10,
      );
    } else {
      return solana_derivation_path(parseInt(inputs[2], 10));
    }
  }
  return solana_derivation_path();
}

async function solana_ledger_get_pubkey(transport, derivation_path) {
  return solana_send(
    transport,
    INS_GET_PUBKEY,
    P1_NON_CONFIRM,
    derivation_path,
  );
}

async function solana_ledger_sign_transaction(
  transport,
  derivation_path,
  transaction,
) {
  const msg_bytes = transaction.compileMessage().serialize();

  // XXX: Ledger app only supports a single derivation_path per call ATM
  var num_paths = Buffer.alloc(1);
  num_paths.writeUint8(1);

  const payload = Buffer.concat([num_paths, derivation_path, msg_bytes]);

  return solana_send(transport, INS_SIGN_MESSAGE, P1_CONFIRM, payload);
}

async function solana_ledger_sign_message({
  transport,
  encodedMessage, // base58 encoded message
  derivation_path,
}) {
  const msg_bytes = base58.decode(encodedMessage);

  var num_paths = Buffer.alloc(1);
  num_paths.writeUint8(1);

  const payload = Buffer.concat([num_paths, derivation_path, msg_bytes]);

  return solana_send(transport, INS_SIGN_MESSAGE, P1_CONFIRM, payload);
}

async function process_solana_transactions_ledger({
  fromDerivationPathString,
  deviceId,
  network = 'devnet',
  transactions = [],
  confirmation = 'finalized',
  confirmOptions = {},
  connection,
}) {
  let error = null;

  try {
    if (!connection) {
      connection = new Connection(
        clusterApiUrl(network),
        confirmation || 'finalized',
      );
    }

    const transport = await TransportBLE.open(deviceId).catch((e) => {
      console.log('Ledger Comm Error', e);
      error = {
        name: 'LedgerCommErr',
        message:
          'Unable to communicate with Ledger. Please make sure that bluetooth is turned on.',
      };
    });

    // Get from account info:
    const from_derivation_path = derivation_path_from_string(
      fromDerivationPathString,
    );
    const from_pubkey_bytes = await solana_ledger_get_pubkey(
      transport,
      from_derivation_path,
    ).catch((e) => {
      console.log(e);
      error = {
        name: 'PubkeyErr',
        message:
          'Unable to retrieve publicKey info. Is the Solana app open on your device?',
      };
    });
    const from_pubkey_string = bs58.encode(from_pubkey_bytes);

    // Retrieve recent Blockhash to sign transactions
    const recentBlockhash = (
      await connection.getRecentBlockhash().catch((e) => {
        console.log(e);
        error = {
          name: 'BlockHashErr',
          message:
            'Unable to get recent blockhash. Please check your connection and try again.',
        };
      })
    ).blockhash;

    // Create the transaction for the ledger to sign
    const from_pubkey = new PublicKey(from_pubkey_string);

    // console.log(from_pubkey);

    const tx = new Transaction();
    tx.feePayer = from_pubkey;
    tx.recentBlockhash = recentBlockhash;
    tx.add(...transactions);

    const sig_bytes = await solana_ledger_sign_transaction(
      transport,
      from_derivation_path,
      tx,
    ).catch((e) => {
      console.log(e);
      error = {
        name: 'LedgerNoSignErr',
        message:
          'Transaction could not be signed. Please make sure you confirm the transaction using your Ledger.',
      };
    });

    tx.addSignature(from_pubkey, sig_bytes);

    const signature = await sendAndConfirmRawTransaction(
      connection,
      tx.serialize(),
      confirmOptions,
    ).catch((e) => {
      console.log(e);
      error = {
        name: 'TransactionErr',
        message:
          'Transaction could not be completed. Make sure you have a high enough balance and try again.',
        e,
      };
    });

    // let signature = await connection
    //   .sendRawTransaction(tx.serialize())
    //   .catch(e => {
    //     console.log(e);
    //     error = {
    //       name: 'TransactionErr',
    //       message:
    //         'Transaction could not be completed. Make sure you have a high enough balance and try again.',
    //     };
    //   });
    console.log('TX Signature: ', signature);
    return {signature, error};
  } catch (e) {
    console.log(e);
    return {signature: null, error: {name: 'Sending Error.', e}};
  }
}

export async function sendSolanaUsingLedger({
  fromDerivationPathString,
  fromPubkey,
  deviceId,
  network = 'devnet',
  toPublicKey,
  lamportsToSend,
}) {
  const to_pubkey = new PublicKey(toPublicKey);
  const from_pubkey = new PublicKey(fromPubkey);
  const ix = SystemProgram.transfer({
    fromPubkey: from_pubkey,
    toPubkey: to_pubkey,
    lamports: lamportsToSend,
  });

  return process_solana_transactions_ledger({
    fromDerivationPathString,
    deviceId,
    network,
    transactions: [ix],
  });
}

export async function sendSPLTokenUsingLedger({
  fromDerivationPathString,
  fromPubKeyString,
  deviceId,
  toPublicKey,
  mint,
  tokensToSend,
  decimals = 6,
  network = 'devnet',
  confirmation = 'finalized',
  confirmOptions = {commitment: 'confirmed'},
}) {
  console.log('fromPubKeyString', fromPubKeyString);
  console.log('toPublicKey', toPublicKey);
  console.log('mint', mint);

  let error;
  try {
    const connection = new Connection(clusterApiUrl(network), confirmation);

    const from_pubkey = new PublicKey(fromPubKeyString);
    const to_pubkey = new PublicKey(toPublicKey);
    const mint_public_key = new PublicKey(mint);

    const mint_token = new Token(
      connection,
      mint_public_key,
      TOKEN_PROGRAM_ID,
      from_pubkey,
    );

    const from_token_account = await mint_token
      .getOrCreateAssociatedAccountInfo(from_pubkey)
      .catch((e) => {
        console.log(e);
        error = {
          name: 'TokenAcctErr',
          message:
            'Unable to retrieve token account. Please check your connection and try again.',
        };
      });

    const to_token_address = await Token.getAssociatedTokenAddress(
      mint_token.associatedProgramId,
      mint_token.programId,
      mint_public_key,
      to_pubkey,
    ).catch((e) => {
      console.log(e);
      error = {
        name: 'TokenAcctErr',
        message:
          'Unable to retrieve address for receiver public key. Please make sure you are using a solana address.',
      };
    });

    const to_token_account = await connection
      .getAccountInfo(to_token_address)
      .catch((e) => {
        console.log(e);
        error = {
          name: 'TokenAcctErr',
          message:
            'Unable to retrieve token account. Please check your connection and try again.',
        };
      });

    const ix = [];

    if (to_token_account === null) {
      ix.push(
        Token.createAssociatedTokenAccountInstruction(
          mint_token.associatedProgramId,
          mint_token.programId,
          mint_public_key,
          to_token_address,
          to_pubkey,
          from_pubkey,
        ),
      );
    }

    ix.push(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        from_token_account.address,
        to_token_address,
        from_pubkey,
        [],
        tokensToSend * Math.pow(10, decimals),
      ),
    );

    return process_solana_transactions_ledger({
      fromDerivationPathString,
      deviceId,
      network,
      transactions: ix,
      confirmation,
      confirmOptions,
    });
  } catch (e) {
    console.log(e);
    return {signature: null, error};
  }
}

export async function executeSwapUsingLedger({
  fromDerivationPathString,
  deviceId,
  network = 'devnet',
  confirmation = 'finalized',
  transactions,
  connection,
}) {
  let error;
  try {
    return process_solana_transactions_ledger({
      fromDerivationPathString,
      deviceId,
      network,
      transactions,
      confirmation,
      confirmOptions: {commitment: 'confirmed', skipPreflight: true},
      connection,
    });
  } catch (e) {
    console.log(e);
    return {error};
  }
}

export async function signTransactionUsingLedger({
  fromDerivationPathString,
  deviceId,
  transaction,
}) {
  let error = null;

  try {
    const transport = await TransportBLE.open(deviceId).catch((e) => {
      console.log('Ledger Comm Error', e);
      error = {
        name: 'LedgerCommErr',
        message:
          'Unable to communicate with Ledger. Please make sure that bluetooth is turned on.',
      };
    });

    const sig_bytes = await solana_ledger_sign_transaction(
      transport,
      derivation_path_from_string(fromDerivationPathString),
      transaction,
    ).catch((e) => {
      console.log(e);
      error = {
        name: 'LedgerNoSignErr',
        message:
          'Transaction could not be signed. Please make sure you confirm the transaction using your Ledger.',
      };
    });

    return {rawSignature: sig_bytes, error};
  } catch (e) {
    console.log(e);
    return {rawSignature: null, error: {name: 'Sending Error.', e}};
  }
}

export async function signMessageUsingLedger({
  fromDerivationPathString,
  deviceId,
  encodedMessage,
}) {
  let error = null;

  console.log('fromDerivationPathString', fromDerivationPathString);
  console.log('deviceId', deviceId);
  console.log('encodedMessage', encodedMessage);

  try {
    const transport = await TransportBLE.open(deviceId).catch((e) => {
      console.log('Ledger Comm Error', e);
      error = {
        name: 'LedgerCommErr',
        message:
          'Unable to communicate with Ledger. Please make sure that bluetooth is turned on.',
      };
    });

    const sig_bytes = await solana_ledger_sign_message({
      transport,
      derivation_path: derivation_path_from_string(fromDerivationPathString),
      encodedMessage,
    }).catch((e) => {
      console.log(e);
      error = {
        name: 'LedgerNoSignErr',
        message:
          'Transaction could not be signed. Please make sure you confirm the transaction using your Ledger.',
      };
    });

    return {sigBuffer: sig_bytes, error};
  } catch (e) {
    console.log(e);
    return {rawSignature: null, error: {name: 'Sending Error.', e}};
  }
}
