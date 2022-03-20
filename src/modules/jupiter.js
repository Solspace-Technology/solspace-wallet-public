import {getPlatformFeeAccounts, Jupiter, TOKEN_LIST_URL} from '@jup-ag/core';
import {clusterApiUrl, Connection, PublicKey} from '@solana/web3.js';
import axios from 'axios';
import {executeSwapUsingLedger} from './ledgerSolana';
import Config from 'react-native-config';

export async function getPossiblePairsTokenInfo(
  inputMint,
  {network = 'mainnet-beta'} = {},
) {
  let error;
  try {
    const result = await axios.get(TOKEN_LIST_URL[network]).catch(e => {
      error = {
        name: 'TokensLoadErr',
        message: 'Unable to load tokens list.',
        e,
      };
    });
    const tokens = result.data;
    let inputToken = tokens.find(t => t.address === inputMint);
    let connection = new Connection(clusterApiUrl(network));

    // Using without the fee accounts makes this a bit
    const jupiter = await Jupiter.load({
      connection,
      cluster: network,
      user: undefined,
    }).catch(e => {
      error = {
        name: 'JupiterConnErr',
        message: 'Unable to create Jupiter connection',
        e,
      };
    });

    const routeMap = jupiter.getRouteMap();

    const possiblePairs = inputToken
      ? routeMap.get(inputToken.address) || []
      : [];

    const possiblePairsTokenInfo = [];
    possiblePairs.forEach(address => {
      possiblePairsTokenInfo.push(
        tokens.find(t => {
          return t.address === address;
        }),
      );
    });
    return {possiblePairsTokenInfo, error: null};
  } catch (e) {
    console.log(e);
    return {error};
  }
}

async function createJupiter(
  connection,
  network = 'mainnet-beta',
  userPubKey = undefined,
  keypair = undefined,
) {
  console.log(connection);
  const platformFeeAndAccounts = {
    feeBps: 75, // 0.75%
    feeAccounts: await getPlatformFeeAccounts(
      connection,
      Config.COMMISSION_PUBKEY
        ? new PublicKey(Config.COMMISSION_PUBKEY)
        : undefined,
    ).catch(e => console.log(e)),
  };
  let publicKey = new PublicKey(userPubKey);
  console.log('Fee accounts loaded.');
  console.log('keypair || userPubKey', keypair || userPubKey);
  return await Jupiter.load({
    connection,
    cluster: network,
    user: keypair || publicKey,
    platformFeeAndAccounts,
  }).catch(e => console.log(e));
}

//TODO: refactor this to just be execute route, not JupiterMain...
export async function JupiterMain({
  network = 'mainnet-beta',
  inputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  outputMint = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  confirmation = 'confirmed',
  keypair = undefined,
  userPubKey,
  inputAmount = 1, // 1 unit in UI
  slippage = 1, // 1% slippage
}) {
  let error = null;

  const connection = new Connection(
    Config.RPC_URL || clusterApiUrl(network),
    confirmation,
  );
  try {
    const tokens = await (await axios.get(TOKEN_LIST_URL[network])).data;

    // Load Jupiter here
    const jupiter = await createJupiter(
      connection,
      network,
      userPubKey,
      keypair,
    ).catch(e => {
      error = {
        name: 'JupiterConnErr',
        message: 'Unable to create Jupiter connection',
        e,
      };
    });

    const inputToken = tokens.find(t => t.address === inputMint);
    const outputToken = tokens.find(t => t.address === outputMint);

    const routesResult = await getRoutes({
      jupiter,
      inputToken,
      outputToken,
      inputAmount,
      slippage,
    }).catch(e => {
      console.log(e);
    });

    return {...routesResult, error: null};
  } catch (e) {
    console.log(e);
    return {error};
  }
}

async function getRoutes({
  jupiter,
  inputToken,
  outputToken,
  inputAmount,
  slippage,
}) {
  let error;
  try {
    if (!inputToken || !outputToken) {
      error = {
        name: 'NoTokenErr',
        message: 'Either no input or output token passed in.',
      };
      return {error};
    }
    console.log('getting routes now...');
    const inputAmountLamports = inputToken
      ? Math.round(inputAmount * 10 ** inputToken.decimals)
      : 0;

    const routes =
      inputToken && outputToken
        ? await jupiter
            .computeRoutes(
              new PublicKey(inputToken.address),
              new PublicKey(outputToken.address),
              inputAmountLamports,
              slippage,
              true,
            )
            .catch(e => {
              console.log(e);
            })
        : null;

    if (routes && routes.routesInfos) {
      return {routes, error: null, outputToken, inputToken};
    } else {
      return {error};
    }
  } catch (e) {
    console.log(e);
    return {error};
  }
}

export async function executeSwap({
  route,
  network = 'mainnet-beta',
  pubKeyString,
  keypair = undefined,
}) {
  let error;
  try {
    // Testing this different RPC connection to see if error goes away
    //* This works but throws a 410 error...
    // let connection = new Connection(clusterApiUrl(network));
    //* This seems to get rate limited real easily
    let connection = new Connection('Config.RPC_URL || clusterApiUrl(network)');
    let jupiter = await createJupiter(
      connection,
      network,
      new PublicKey(pubKeyString),
      keypair,
    ).catch(e => {
      console.log(e);
    });
    // Prepare exchange route
    const {transactions, execute} = await jupiter.exchange({route}).catch(e => {
      console.log(e);
    });
    return {transactions, execute};
  } catch (e) {
    console.log(e);
    return {error};
  }
}

export async function executeJupiterTransactionsLedger({
  fromDerivationPathString,
  deviceId,
  network = 'mainnet-beta',
  transactions,
  confirmation = 'confirmed',
  showToast,
}) {
  let error;
  let finalTX;
  try {
    let connection = new Connection(
      Config.RPC_URL || clusterApiUrl(network),
      confirmation,
    );
    console.log(transactions.length, ' transactions...');
    console.log(transactions);

    for (const leg in transactions) {
      if (transactions[leg]) {
        const tx = transactions[leg];
        let txName;
        if (leg === 'setupTransaction') {
          console.log('Performing setup transaction.');
          txName = 'setup';
        } else if (leg === 'swapTransaction') {
          console.log('Performing swap transaction.');
          txName = 'swap';
        } else if (leg === 'cleanupTransaction') {
          console.log('Performing cleanup transaction.');
          txName = 'cleanup';
        } else {
          error = {
            name: 'UnknownTxName',
            message: `Unknown jupiter transaction name: ${leg}`,
          };
          return {error};
        }
        console.log(`Attempting to sign ${txName} transaction...`);
        showToast(txName);

        console.log('post toast');
        let signedTX = await executeSwapUsingLedger({
          fromDerivationPathString,
          deviceId,
          network,
          transactions: [tx],
          connection,
        }).catch(e => {
          console.log(e);
          error = {
            name: 'LedgerSignErr',
            message:
              'Unable to sign transaction using ledger. PLease be sure to approve the transaction.',
            e,
          };
          return {error};
        });
        if (!signedTX.signature) {
          error = {
            name: 'TransErr',
            message: 'Unable to retrieve signed transaction for transaction.',
          };
          return {error};
        }
        finalTX = signedTX.signature;
      }
    }
    // All transactions were successful here.
    return {error: null, txid: finalTX};
  } catch (e) {
    console.log(e);
    if (error) {
      return {error};
    }
    return {
      error: {
        name: 'UnknownError',
        message: 'Uncaught error. Please report this to @jupethedev',
        e,
      },
    };
  }
}
