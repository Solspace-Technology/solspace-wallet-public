import {Button, Spinner, Text} from '@ui-kitten/components';
import {Container} from '.';

import {decryptData} from '../../../modules/security';
import {useAppState} from '../../../providers/appState-context';

import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {getListOfKeypairsFromMnemonic} from '../../../modules/walletGeneration';

export function SelectPubkeySubScreen(props) {
  const {state: appState} = useAppState();

  const [keypairs, setKeypairs] = React.useState([]);
  const [seedPhrase, setSeedPhrase] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);

  async function getSeedPhrase() {
    const newSeedPhrase = await decryptData(appState.encryptedSeedPhrase);
    setSeedPhrase(newSeedPhrase);
  }

  async function getKeypairs() {
    // TODO: need to filter out keypairs that are already in walletState.wallets
    // TODO: Also add a way to add more keypairs here if necessary i suppose?

    const newKeypairs = await getListOfKeypairsFromMnemonic(seedPhrase);
    setIsLoading(false);

    setKeypairs(newKeypairs);
  }
  React.useEffect(() => {
    if (seedPhrase && keypairs.length === 0) {
      getKeypairs();
    } else {
      getSeedPhrase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPhrase]);

  return (
    <Container>
      <Text category="h5" style={{marginBottom: 15}}>
        Select which public key you would like to use for the new wallet:
      </Text>
      {isLoading && <Spinner size="giant" style={{alignSelf: 'center'}} />}
      <ScrollView>
        {keypairs.map((keypair) => (
          <PubKeyButton
            key={keypair.publicKey.toString()}
            size="large"
            appearance="outline"
            status="info"
            onPress={() => props.setKeypair(keypair)}>
            {keypair.publicKey.toString()}
          </PubKeyButton>
        ))}
      </ScrollView>
    </Container>
  );
}

const PubKeyButton = styled(Button)`
  margin: 10px;
`;
