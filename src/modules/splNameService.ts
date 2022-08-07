import {
  getHashedName,
  getNameAccountKey,
  getTwitterRegistry,
  NameRegistryState,
} from '@bonfida/spl-name-service';
import {Cluster, clusterApiUrl, Connection, PublicKey} from '@solana/web3.js';

const SOL_TLD_AUTHORITY = new PublicKey(
  '58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx',
);
// const ROOT_TLD_AUTHORITY = new PublicKey(
//   'ZoAhWEqTVqHVqupYmEanDobY7dee5YKbQox9BNASZzU',
// );
// const TWITTER_ROOT_PARENT_REGISTRY_KEY = new PublicKey(
//   '4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv',
// );

//* Takes SOL domain with or without .sol
export async function solDomainToPubkey(
  domain: string,
  {network = 'mainnet-beta'}: {network?: Cluster} = {},
) {
  const connection = new Connection(clusterApiUrl(network));
  // Removes the last 4 letters of the domain
  let hashedName;
  if (domain.substring(domain.length - 4) === '.sol') {
    hashedName = await getHashedName(domain.substring(0, domain.length - 4));
  } else {
    hashedName = await getHashedName(domain);
  }
  const domainKey = await getNameAccountKey(
    hashedName,
    undefined,
    SOL_TLD_AUTHORITY,
  );

  try {
    const registry = await NameRegistryState.retrieve(connection, domainKey);
    return registry.registry.owner || null;
  } catch (error) {
    // Invalid name account provided
    console.log(error);
    return null;
  }
}
// (async () => {
//   let owner = await solDomainToPubkey('jupe.sol');
//   console.log(owner?.toString());
// })();

//* Takes a twitter handle minus the @
export async function twitterHandleToPubkey(
  handle: string,
  {network = 'mainnet-beta'}: {network?: Cluster} = {},
) {
  const connection = new Connection(clusterApiUrl(network));

  try {
    const registry = await getTwitterRegistry(connection, handle);
    return registry.owner || null;
  } catch (error) {
    // Invalid name account provided
    console.log(error);
    return null;
  }
}

// (async () => {
//   let owner = await twitterHandleToPubkey('bonfida');
//   console.log(owner?.toString());
// })();
