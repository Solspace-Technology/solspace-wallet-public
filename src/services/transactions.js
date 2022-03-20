import {
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Connection,
  SystemProgram,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {processingToast, successToast} from '../components/ToastFunctions';

export async function requestAirdrop(
  pubKey,
  navigation,
  {network = 'devnet', amount = 1} = {},
) {
  let publicKey;
  if (typeof pubKey === 'string') {
    publicKey = new PublicKey(pubKey);
  } else {
    publicKey = pubKey;
  }
  let transferAmount = amount * LAMPORTS_PER_SOL;
  let connection = new Connection(clusterApiUrl(network));

  try {
    processingToast();
    let sig = await connection.requestAirdrop(publicKey, transferAmount);
    await connection.confirmTransaction(sig);
    successToast(sig, network, navigation);
    return {data: sig, error: null};
  } catch (e) {
    console.error(e);
    return {data: null, error: e};
  }
}

export function getSendSolanaTransaction({
  fromPubkey,
  toPublicKey,
  lamportsToSend,
}) {
  const ix = SystemProgram.transfer({
    fromPubkey,
    toPubkey: toPublicKey,
    lamports: lamportsToSend,
  });
  return new Transaction({feePayer: fromPubkey}).add(ix);
}

export async function sendSolanaUsingKeyPair({
  keypair,
  toPublicKey,
  lamportsToSend,
  network = 'devnet',
}) {
  let connection = new Connection(clusterApiUrl(network));

  const recentBlockhashObj = await connection.getRecentBlockhash();
  const recentBlockhash = recentBlockhashObj.blockhash;

  const fromWallet = Keypair.fromSecretKey(keypair.secretKey);

  let from_pubkey = new PublicKey(keypair.publicKey.toString());
  let to_pubkey = new PublicKey(toPublicKey);

  const ix = SystemProgram.transfer({
    fromPubkey: from_pubkey,
    toPubkey: to_pubkey,
    lamports: lamportsToSend,
  });

  const tx = new Transaction({
    recentBlockhash,
    feePayer: from_pubkey,
  }).add(ix);

  try {
    let signature = await sendAndConfirmTransaction(connection, tx, [
      fromWallet,
    ]);
    // let signature = await connection.sendTransaction(tx, [fromWallet]);
    console.log('TX Signature: ', signature);
    return {signature, error: null};
  } catch (e) {
    console.log('Transaction failed: ', e);
    return {
      signature: null,
      error: {
        name: 'TransactionErr',
        message:
          'Transaction could not be completed. Make sure you have a high enough balance and try again.',
      },
    };
  }
}

export async function getSendSPLTokenTransaction({
  fromPubKey,
  toPublicKey,
  mint,
  tokensToSend,
  decimals = 6,
  connection,
  network = 'devnet',
}) {
  console.log('runnning');
  console.log('fromPubKey', fromPubKey);
  console.log('toPublicKey', toPublicKey);
  console.log('mint', mint);
  if (!connection) {
    connection = new Connection(clusterApiUrl(network), 'confirmed');
  }
  // SENDER INFO
  let from_pub_key = new PublicKey(fromPubKey);

  // TOKEN INFO
  const mintPublicKey = new PublicKey(mint);
  const mintToken = new Token(
    connection,
    mintPublicKey,
    TOKEN_PROGRAM_ID,
    from_pub_key,
  );

  const from_token_account = await mintToken.getOrCreateAssociatedAccountInfo(
    from_pub_key,
  );

  // RECEIVER INFO
  const to_pubkey = new PublicKey(toPublicKey);
  const to_token_address = await Token.getAssociatedTokenAddress(
    mintToken.associatedProgramId,
    mintToken.programId,
    mintPublicKey,
    to_pubkey,
  );
  const to_token_account = await connection.getAccountInfo(to_token_address);

  const instructions = [];
  if (to_token_account === null) {
    instructions.push(
      Token.createAssociatedTokenAccountInstruction(
        mintToken.associatedProgramId,
        mintToken.programId,
        mintPublicKey,
        to_token_address,
        to_pubkey,
        from_pub_key,
      ),
    );
  }

  instructions.push(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      from_token_account.address,
      to_token_address,
      from_pub_key,
      [],
      tokensToSend * Math.pow(10, decimals),
    ),
  );

  return new Transaction().add(...instructions);
}

export async function sendSPLTokenUsingKeypair({
  keypair,
  toPublicKey,
  mint,
  tokensToSend,
  decimals = 6,
  network = 'devnet',
}) {
  // SENDER INFO
  let connection = new Connection(clusterApiUrl(network), 'confirmed');
  var from_wallet = Keypair.fromSecretKey(keypair.secretKey);

  // TOKEN INFO
  const mintPublicKey = new PublicKey(mint);
  const mintToken = new Token(
    connection,
    mintPublicKey,
    TOKEN_PROGRAM_ID,
    from_wallet.publicKey,
  );

  const from_token_account = await mintToken.getOrCreateAssociatedAccountInfo(
    from_wallet.publicKey,
  );

  // RECEIVER INFO
  const to_pubkey = new PublicKey(toPublicKey);
  const to_token_address = await Token.getAssociatedTokenAddress(
    mintToken.associatedProgramId,
    mintToken.programId,
    mintPublicKey,
    to_pubkey,
  );
  const to_token_account = await connection.getAccountInfo(to_token_address);

  const instructions = [];
  if (to_token_account === null) {
    instructions.push(
      Token.createAssociatedTokenAccountInstruction(
        mintToken.associatedProgramId,
        mintToken.programId,
        mintPublicKey,
        to_token_address,
        to_pubkey,
        from_wallet.publicKey,
      ),
    );
  }

  instructions.push(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      from_token_account.address,
      to_token_address,
      from_wallet.publicKey,
      [],
      tokensToSend * Math.pow(10, decimals),
    ),
  );

  const transaction = new Transaction().add(...instructions);

  try {
    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [from_wallet],
    );

    return {signature: transactionSignature};
  } catch (error) {
    console.log('SPL TOKEN TRANSFER ERROR:', error);
    return {error};
  }
}
