import {WalletSignMessageError} from '@solana/wallet-adapter-base';
import {Connection, Keypair, PublicKey, Transaction} from '@solana/web3.js';
import base58 from 'bs58';
import {
  signMessageUsingLedger,
  signTransactionUsingLedger,
} from './ledgerSolana';
import {getKeypairFromEncryptedSecretKey} from './security';

import nacl from 'tweetnacl';
import {errorToast} from '../components/ToastFunctions';

type Args = {
  connection: Connection;
  activeWallet: any;
};

export class SolspaceWalletProvider {
  // This class mimics the Slope Wallet Provider API so that the Solspace wallet can be used on any
  // website that has slope as an option. Solspace will add it's own wallet adapted in the future.
  publicKey: PublicKey;
  walletType: 'ledger' | 'keypair';
  connection: Connection;
  encryptedSecretKey?: string;
  derivationPath?: string;
  ledgerID?: string;

  constructor(args: Args) {
    this.connection = args.connection;
    this.publicKey = new PublicKey(args.activeWallet.pubKeyString);
    this.walletType = args.activeWallet.type;
    this.derivationPath = args.activeWallet.derivationPath;
    this.ledgerID = args.activeWallet?.device?.id;
    this.encryptedSecretKey = args.activeWallet.secretKey;
  }

  async connect(): Promise<{
    msg: string;
    data: {
      publicKey?: string;
    };
  }> {
    return {
      msg: 'ok',
      data: {
        publicKey: this.publicKey.toString(),
      },
    };
  }

  async disconnect(): Promise<{msg: string}> {
    return {msg: 'ok'};
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    // check for wallet type and sign here then return
    if (this.walletType === 'ledger') {
      // add confirm transaction prompt
      // sign ledger transaction here
      transaction.recentBlockhash = (
        await this.connection.getRecentBlockhash()
      ).blockhash;
      transaction.feePayer = this.publicKey;
      const result = await signTransactionUsingLedger({
        fromDerivationPathString: this.derivationPath,
        deviceId: this.ledgerID,
        transaction,
      });
      console.log('result', result);
      const {rawSignature} = result;
      if (rawSignature) {
        transaction.addSignature(this.publicKey, rawSignature);
        return transaction;
      } else {
        errorToast({
          name: 'Signature Error',
          message: 'Unable to sign transaction.',
        });
      }
    } else if (this.walletType === 'keypair') {
      // sign transaction with keypair here.
      console.log('this.encryptedSecretKey', this.encryptedSecretKey);
      const {keypair, e} = await getKeypairFromEncryptedSecretKey(
        this.encryptedSecretKey,
      );
      console.log('e', e);
      if (keypair) {
        transaction.recentBlockhash = (
          await this.connection.getRecentBlockhash()
        ).blockhash;
        transaction.sign(keypair as Keypair);
        return transaction;
      }
    }
    throw new WalletSignMessageError('Unable to sign transaction.');
  }

  async signTransactionWeb(message: string): Promise<{
    msg: string;
    data: {
      publicKey?: string;
      signature?: string;
    };
  }> {
    // check for wallet type and sign here then return
    if (this.walletType === 'ledger') {
      const result = await signMessageUsingLedger({
        encodedMessage: message,
        fromDerivationPathString: this.derivationPath,
        deviceId: this.ledgerID,
      });
      console.log('result', result);
      return {
        msg: 'ok',
        data: {
          publicKey: this.publicKey.toString(),
          signature: base58.encode(result.sigBuffer),
        },
      };
    } else if (this.walletType === 'keypair') {
      const {keypair, e} = await getKeypairFromEncryptedSecretKey(
        this.encryptedSecretKey,
      );
      if (e) {
        console.log('"keypair error:', e);
      }

      // This is used instead to sign the raw message instead of the transaction
      const signature = nacl.sign.detached(
        base58.decode(message),
        keypair.secretKey,
      );
      return {
        msg: 'ok',
        data: {
          publicKey: this.publicKey.toString(),
          signature: base58.encode(signature),
        },
      };
    }
    throw new WalletSignMessageError('Unable to sign transaction.');
  }

  async signAllTransactionsWeb(messages: string[]): Promise<{
    msg: string;
    data: {
      publicKey?: string;
      signatures?: string[];
    };
  }> {
    // check for wallet type and sign here then return
    if (this.walletType === 'ledger') {
      const signatures = [];
      for (const message of messages) {
        const result = await signMessageUsingLedger({
          encodedMessage: message,
          fromDerivationPathString: this.derivationPath,
          deviceId: this.ledgerID,
        });
        if (result.sigBuffer) {
          signatures.push(base58.encode(result.sigBuffer));
        } else {
          signatures.push(null);
        }
      }
      console.log('signatures', signatures);

      return {
        msg: 'ok',
        data: {
          publicKey: this.publicKey.toString(),
          signatures: signatures,
        },
      };
    } else if (this.walletType === 'keypair') {
      // sign transaction with keypair here.
      const {keypair, e} = await getKeypairFromEncryptedSecretKey(
        this.encryptedSecretKey,
      );
      if (e) {
        console.log('Keypair error', e);
      }

      const signatures = [];

      for (const message of messages) {
        const signature = nacl.sign.detached(
          base58.decode(message),
          keypair.secretKey,
        );
        if (signature) {
          signatures.push(base58.encode(signature));
        } else {
          signatures.push(null);
        }
      }

      console.log('signatures', signatures);

      return {
        msg: 'ok',
        data: {
          publicKey: this.publicKey.toString(),
          signatures,
        },
      };
    }
    throw new WalletSignMessageError('Unable to sign transaction.');
  }
}
