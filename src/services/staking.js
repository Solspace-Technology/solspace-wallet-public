import axios from 'axios';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  StakeProgram,
} from '@solana/web3.js';

const API_KEY = 'aum49fvUTj9E1iYYUqzQ3QBs';

// type GetStakingParams = {
//   pubkey: string,
//   options?: {
//     network?: Cluster | string,
//   },
// };
export async function getStakingAccounts(
  pubkeyString,
  {network = 'mainnet-beta'},
) {
  const connection = new Connection(clusterApiUrl(network));

  try {
    let stakeAccounts = await connection.getParsedProgramAccounts(
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

    return {stakeAccounts, error: null};
  } catch (error) {
    return {error};
  }
}

export async function getValidatorDetails(
  stakeAccounts = [],
  {network = 'mainnet-beta'} = {},
) {
  async function getDetails(account) {
    let reqNetwork;
    if (network === 'mainnet-beta') {
      reqNetwork = 'mainnet';
    } else {
      reqNetwork = network;
    }
    let response = await axios.get(
      `https://www.validators.app/api/v1/validators/${reqNetwork}/${account}.json`,
      {
        headers: {
          Token: API_KEY,
        },
      },
    );
    return response;
  }

  const connection = new Connection(clusterApiUrl(network));
  try {
    let currentVoteAccounts = await connection.getVoteAccounts();

    let validators = [];
    let detailRequests = [];

    for (let stakeAccount of stakeAccounts) {
      const {
        account: {
          data: {
            parsed: {
              info: {
                stake: {
                  delegation: {voter},
                },
              },
            },
          },
        },
      } = stakeAccount;
      let voterDetails = currentVoteAccounts.current.find(
        ({votePubkey}) => votePubkey === voter,
      );
      detailRequests.push(getDetails(voterDetails.nodePubkey));
      validators.push({voterDetails, ...stakeAccount});
    }

    let allDetailRequests = await Promise.all(detailRequests);

    for (let [index, item] of validators.entries()) {
      validators[index] = {...item, details: allDetailRequests[index].data};
    }
    return {validators, error: null};
  } catch (error) {
    return {error};
  }
}
