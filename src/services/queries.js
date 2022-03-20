import {Buffer} from 'buffer';
import axios from 'axios';
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
} from '@solana/web3.js';

import {TokenListProvider} from '@solana/spl-token-registry';

//! THIS IS PINNED AT 4.7.0, have to figure out how to upgrade
import {programs} from '@metaplex/js/';

import {metadata} from '@metaplex/js/lib/utils';
const {
  metadata: {MetadataData},
} = programs;

function allSettled(promises) {
  return Promise.all(
    promises.map(promise =>
      promise
        .then(value => ({status: 'fulfilled', value}))
        .catch(reason => ({status: 'rejected', reason})),
    ),
  );
}

function getSolanaInfo(
  solanaBalance,
  mintKey = '11111111111111111111111111111111',
) {
  return {
    account: {
      data: {
        parsed: {
          info: {
            tokenAmount: {
              amount: solanaBalance,
              decimals: 9,
              uiAmount: solanaBalance / LAMPORTS_PER_SOL,
              uiAmountString: (solanaBalance / LAMPORTS_PER_SOL).toString(),
            },
          },
          mint: '11111111111111111111111111111111',
        },
      },
    },
    tokenInfo: {
      address: mintKey,
      decimals: 9,
      logoURI: 'https://solana.com/branding/new/exchange/exchange-black.png',
      name: 'Solana',
      symbol: 'SOL',
      extensions: {
        coingeckoId: 'solana',
      },
    },
    mintKey: mintKey,
  };
}

// Metaplex NFTs
async function fetchMetadataAccountForNFT(nftMintKey) {
  const metadataBuffer = Buffer.from('metadata');
  const metadataProgramIdPublicKey = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  );

  const metadataAccount = (
    await PublicKey.findProgramAddress(
      [
        metadataBuffer,
        metadataProgramIdPublicKey.toBuffer(),
        nftMintKey.toBuffer(),
      ],
      metadataProgramIdPublicKey,
    )
  )[0];

  return metadataAccount;
}

export async function getTokenInfoFromMint(mint) {
  let tokenList = await new TokenListProvider().resolve();

  let tokens = tokenList.tokenList.filter(token => token.address === mint);
  return tokens[0];
}

export async function getAllTokenAccountBalances(
  pubKeyString,
  {network = 'devnet', showZeroBalances = false, showUnnamedTokens = false},
) {
  let publicKey = new PublicKey(pubKeyString);
  const connection = new Connection(clusterApiUrl(network));
  let allTokens = (
    await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    })
  ).value;

  let allTokensWithKey = allTokens.map(item => {
    return {...item, mintKey: item?.account?.data?.parsed?.info?.mint};
  });

  const tokens = allTokensWithKey.filter(
    ({
      account: {
        data: {
          parsed: {info},
        },
      },
    }) => {
      if (!showZeroBalances) {
        return info.tokenAmount.uiAmount > 0;
      } else {
        return true;
      }
    },
  );

  // Sorting by number of tokens in order to prioritize requests
  tokens.sort(
    (
      {
        account: {
          data: {
            parsed: {
              info: {
                tokenAmount: {uiAmount: a},
              },
            },
          },
        },
      },
      {
        account: {
          data: {
            parsed: {
              info: {
                tokenAmount: {uiAmount: b},
              },
            },
          },
        },
      },
    ) => {
      return b - a;
    },
  );

  let solanaBalance = await connection.getBalance(publicKey);
  let solanaTokenInfo = getSolanaInfo(solanaBalance);

  let SPLTokens = [];

  const tokenInfoReqs = [];
  const NFTAccountReqs = [];

  for (let [index, token] of tokens.entries()) {
    // Coin gecko only allows 50 requests per minute, so this is to avoid 429 errors
    if (index < 48) {
      try {
        tokenInfoReqs.push(
          getTokenInfoFromMint(token?.account?.data?.parsed?.info?.mint),
        );
        NFTAccountReqs.push(
          fetchMetadataAccountForNFT(
            new PublicKey(token?.account?.data?.parsed?.info?.mint),
          ),
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  // Is error handling necessary here?
  let tokenInfoArray = await Promise.all(tokenInfoReqs);
  let NFTAccountArray = await Promise.all(NFTAccountReqs);

  let NFTAccounts = [];
  let NFTs = [];

  for (let [index, item] of tokenInfoArray.entries()) {
    if (item) {
      SPLTokens.push({
        ...tokens[index],
        tokenInfo: item,
      });
    } else {
      NFTs.push({...tokens[index]});
      NFTAccounts.push(NFTAccountArray[index]);
    }
  }

  let NFTAcInfo = await connection.getMultipleAccountsInfo(
    NFTAccounts,
    'processed',
  );

  NFTAcInfo?.map((info, index) => {
    if (info?.data) {
      let metaData = MetadataData.deserialize(info?.data);
      NFTs[index] = {...NFTs[index], metaData};
    } else {
      if (showUnnamedTokens) {
        SPLTokens.push({...NFTs[index]});
      }
    }
  });

  SPLTokens.unshift(solanaTokenInfo);
  let coingeckoIds = SPLTokens.map(
    item => item?.tokenInfo?.extensions?.coingeckoId,
  );
  let reqIds = coingeckoIds.join(',');
  let shallowPriceInfo = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${reqIds}}&vs_currencies=usd&include_24hr_change=true`,
  );

  SPLTokens.forEach(
    (
      {
        tokenInfo: {
          extensions: {coingeckoId},
        },
      },
      index,
    ) => {
      SPLTokens[index] = {
        ...SPLTokens[index],
        shallowPriceInfo: shallowPriceInfo?.data[coingeckoId] || null,
      };
    },
  );

  let totalTokenValueUSD = SPLTokens.reduce((acc, curr, index) => {
    if (curr?.shallowPriceInfo) {
      acc +=
        curr.shallowPriceInfo.usd *
        curr?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    }
    return acc;
  }, 0);

  let filteredNFTs = NFTs.filter(item => !!item?.metaData);

  return {SPLTokens, NFTs: filteredNFTs, totalTokenValueUSD};
}

export async function getAllSPLTokenPriceInfo(SPLTokens) {
  // Only get tokens that will be displayed (unnamed & zero balances...)
  let coinGeckoReqs = [];
  for (let [index, token] of SPLTokens.entries()) {
    let coinId = token?.tokenInfo?.extensions?.coingeckoId;
    if (coinId) {
      coinGeckoReqs.push(
        axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`),
      );
    } else {
      coinGeckoReqs.push(null);
    }
  }
  let priceInfo = await Promise.all(coinGeckoReqs);

  let SPLTokenPrices = priceInfo.map((item, index) => {
    return item?.data || null;
  });

  let totalTokenValueUSD = SPLTokenPrices.reduce((acc, curr, index) => {
    if (curr) {
      acc +=
        curr.market_data.current_price.usd *
        SPLTokens[index].account.data.parsed.info.tokenAmount.uiAmount;
    }
    return acc;
  }, 0);

  return {SPLTokenPrices, totalTokenValueUSD};
}

// Update individual tokens for after swap or transfer
export async function getSpecificTokenBalances(
  pubKeyString,
  mintKeyArray,
  SPLTokens,
  {network = 'devnet', showZeroBalances = false, showUnnamedTokens = false},
) {
  let publicKey = new PublicKey(pubKeyString);
  const connection = new Connection(clusterApiUrl(network));
  let allTokens = (
    await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    })
  ).value;

  let desiredTokens = [];
  let solanaBalance = await connection.getBalance(publicKey);
  let solanaTokenInfo;

  mintKeyArray.forEach(mintKey => {
    // Have to check for solana token here...
    if (
      mintKey === 'So11111111111111111111111111111111111111112' ||
      mintKey === '11111111111111111111111111111111'
    ) {
      // push solana info
      solanaTokenInfo = getSolanaInfo(solanaBalance, mintKey);
      desiredTokens.push(solanaTokenInfo);
    } else {
      desiredTokens.push(
        allTokens.find(
          item => item?.account?.data?.parsed?.info?.mint === mintKey,
        ),
      );
    }
  });

  let tokenInfoReqs = [];

  for (let [index, token] of desiredTokens.entries()) {
    try {
      tokenInfoReqs.push(getTokenInfoFromMint(mintKeyArray[index]));
    } catch (error) {
      console.log(error);
    }
  }

  let tokenInfo = await Promise.all(tokenInfoReqs);

  let newTokenInfo = desiredTokens.map((item, index) => {
    if (
      mintKeyArray[index] === 'So11111111111111111111111111111111111111112' ||
      mintKeyArray[index] === '11111111111111111111111111111111'
    ) {
      return {
        ...item,
        mintKey: mintKeyArray[index],
        tokenInfo: solanaTokenInfo.tokenInfo,
      };
    } else {
      return {
        ...item,
        mintKey: mintKeyArray[index],
        tokenInfo: tokenInfo[index],
      };
    }
  });

  console.log('newTokenInfo', newTokenInfo);

  //TODO: make sure this works?
  newTokenInfo.forEach(token => {
    let SPLIndex = SPLTokens.findIndex(item => item.mintKey === token.mintKey);
    if (SPLIndex >= 0) {
      SPLTokens[SPLIndex] = {
        // test: 'UPDATED FROM SPECIFIC FUNCTION',
        ...SPLTokens[SPLIndex],
        ...token,
      };
    }
  });

  return {SPLTokens};
}
