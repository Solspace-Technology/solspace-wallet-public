import {Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {
  Cluster,
  clusterApiUrl,
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
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
  const transferAmount = amount * LAMPORTS_PER_SOL;
  const connection = new Connection(clusterApiUrl(network as Cluster));

  try {
    processingToast();
    const sig = await connection.requestAirdrop(publicKey, transferAmount);
    await connection.confirmTransaction(sig);
    successToast(sig, network as Cluster, navigation);
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
  const tx = new Transaction();
  tx.feePayer = fromPubkey;
  tx.add(ix);

  return tx;
}

export async function sendSolanaUsingKeyPair({
  keypair,
  toPublicKey,
  lamportsToSend,
  network = 'devnet',
}) {
  const connection = new Connection(clusterApiUrl(network as Cluster));

  const recentBlockhashObj = await connection.getRecentBlockhash();
  const recentBlockhash = recentBlockhashObj.blockhash;

  const fromWallet = Keypair.fromSecretKey(keypair.secretKey);

  const from_pubkey = new PublicKey(keypair.publicKey.toString());
  const to_pubkey = new PublicKey(toPublicKey);

  const ix = SystemProgram.transfer({
    fromPubkey: from_pubkey,
    toPubkey: to_pubkey,
    lamports: lamportsToSend,
  });

  const tx = new Transaction();
  tx.feePayer = from_pubkey;
  tx.recentBlockhash = recentBlockhash;
  tx.add(ix);

  try {
    const signature = await sendAndConfirmTransaction(connection, tx, [
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
  if (!connection) {
    connection = new Connection(clusterApiUrl(network as Cluster), 'confirmed');
  }
  // SENDER INFO
  const from_pub_key = new PublicKey(fromPubKey);

  // TOKEN INFO
  const mintPublicKey = new PublicKey(mint);
  const mintToken = new Token(
    connection,
    mintPublicKey,
    TOKEN_PROGRAM_ID,
    //* Signing out of band
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
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
  const connection = new Connection(
    clusterApiUrl(network as Cluster),
    'confirmed' as Commitment,
  );
  const from_wallet = Keypair.fromSecretKey(keypair.secretKey);

  // TOKEN INFO
  const mintPublicKey = new PublicKey(mint);
  const mintToken = new Token(
    connection,
    mintPublicKey,
    TOKEN_PROGRAM_ID,
    //* Signing out of band
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
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
