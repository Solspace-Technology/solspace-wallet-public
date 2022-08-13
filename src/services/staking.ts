import axios from 'axios';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  StakeProgram,
} from '@solana/web3.js';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';

const API_KEY =
  process.env.VALIDATORS_APP_API_KEY || 'QoxUniG2ffGVZHQgKAiBopgH';

export async function getStakingAccounts(
  pubkeyString: string,
  {
    network = WalletAdapterNetwork.Mainnet,
    connection,
  }: {network?: WalletAdapterNetwork; connection?: Connection} = {},
) {
  if (!connection) {
    connection = new Connection(clusterApiUrl(network));
  }

  try {
    const stakeAccounts = await connection.getParsedProgramAccounts(
      new PublicKey(StakeProgram.programId),
      {
        commitment: 'recent',
        filters: [
          {
            memcmp: {
              offset: 44,
              bytes: pubkeyString,
            },
          },
        ],
      },
    );
    const stakeAccountsEarning = await connection.getInflationReward(
      stakeAccounts.map((account) => account.pubkey),
    );

    const stakeAccountsWithRewards: any = [];

    stakeAccounts.forEach((item, index) => {
      stakeAccountsWithRewards.push({
        ...stakeAccounts[index],
        earnings: stakeAccountsEarning[index],
      });
    });

    return {stakeAccounts: stakeAccountsWithRewards, error: null};
  } catch (error) {
    return {error};
  }
}

async function getDetails(account: any, network: WalletAdapterNetwork) {
  let reqNetwork;
  if (network === 'mainnet-beta') {
    reqNetwork = 'mainnet';
  } else {
    reqNetwork = network;
  }
  try {
    const response = await axios.get(
      `https://www.validators.app/api/v1/validators/${reqNetwork}/${account}.json`,
      {
        headers: {
          Token: API_KEY,
        },
      },
    );
    return response;
  } catch (e) {
    console.log('Validator error: ', e);
    return {data: null, error: e};
  }
}

export async function getValidatorDetails(
  stakeAccounts: any[] = [],
  {
    network = WalletAdapterNetwork.Mainnet,
    connection,
  }: {network?: WalletAdapterNetwork; connection?: Connection} = {},
) {
  if (!connection) {
    connection = new Connection(clusterApiUrl(network));
  }

  try {
    const currentVoteAccounts = await connection.getVoteAccounts();

    const validators = [];
    const detailRequests = [];

    for (const stakeAccount of stakeAccounts) {
      const {
        account: {
          data: {
            parsed: {
              info: {stake},
            },
          },
        },
      } = stakeAccount;
      let voterDetails;
      if (stake?.delegation?.voter) {
        const voter = stake.delegation.voter;
        voterDetails = currentVoteAccounts.current.find(
          ({votePubkey}) => votePubkey === voter,
        );
        if (!voterDetails) {
          voterDetails = currentVoteAccounts.delinquent.find(
            ({votePubkey}) => votePubkey === voter,
          );
          stakeAccount.delinquent = true;
        }
      }
      if (voterDetails) {
        detailRequests.push(getDetails(voterDetails.nodePubkey, network));
        validators.push({voterDetails, ...stakeAccount});
      } else {
        detailRequests.push(null);
        validators.push({...stakeAccount});
      }
    }

    const allDetailRequests = await Promise.all(detailRequests);

    for (const [index, item] of validators.entries()) {
      // for some reason these aren't getting paired up properly...
      validators[index] = {
        ...item,
        details: allDetailRequests[index]?.data,
      };
    }
    return {validators, error: null};
  } catch (error) {
    console.log('error: ', error);
    return {error};
  }
}

export async function getValidatorDetailsList(network: WalletAdapterNetwork) {
  let reqNetwork;
  if (network === 'mainnet-beta') {
    reqNetwork = 'mainnet';
  } else {
    reqNetwork = network;
  }
  try {
    const response = await axios.get(
      `https://www.validators.app/api/v1/validators/${reqNetwork}.json`,
      {
        headers: {
          Token: API_KEY,
        },
      },
    );
    return response;
  } catch (e) {
    console.log('Validator error: ', e);
    return {data: null, error: e};
  }
}
