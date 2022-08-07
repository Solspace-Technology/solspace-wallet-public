import {Button, CheckBox, Input, Layout, Text} from '@ui-kitten/components';

import {useNavigation} from '@react-navigation/native';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';

import React from 'react';
import {TextProps} from 'react-native-svg';
import styled from 'styled-components/native';
import {useWallet} from '../../providers/wallet-context';

const EnterPubkey = (props: TextProps) => (
  <Text {...props}>Enter Solana PublicKey:</Text>
);
const EnterName = (props: TextProps) => (
  <Text {...props}>Enter Wallet Nickname:</Text>
);

export function AddPublicKeyScreen() {
  const {dispatch} = useWallet();

  const navigation = useNavigation();

  const [publicKey, setPublicKey] = React.useState<string | undefined>();
  const [walletName, setWalletName] = React.useState<string | undefined>();
  const [shouldBeActiveWallet, setShouldBeActiveWallet] = React.useState(true);

  function saveWallet() {
    const walletId = uuid();
    dispatch({
      type: 'ADD_WALLET',
      payload: {
        id: walletId,
        name: walletName,
        type: 'publickey',
        derivationPath: undefined,
        pubKeyString: publicKey,
        device: undefined,
        privateKey: undefined,
      },
    });
    if (shouldBeActiveWallet) {
      dispatch({type: 'SET_ACTIVE_WALLET', payload: walletId});
    }
    navigation.navigate('Main' as never);
  }

  return (
    <Container>
      <Input
        status="primary"
        label={EnterPubkey}
        value={publicKey}
        onChangeText={(value) => setPublicKey(value)}
        style={{marginBottom: 10}}
      />
      <Input
        status="primary"
        label={EnterName}
        value={walletName}
        onChangeText={(value) => setWalletName(value)}
        style={{marginBottom: 10}}
      />
      <CheckBox
        checked={shouldBeActiveWallet}
        onChange={(value) => setShouldBeActiveWallet(value)}>
        Set as active wallet
      </CheckBox>
      {shouldBeActiveWallet && (
        <Text category="c2" style={{margin: 10, textAlign: 'center'}}>
          Even though this will be the 'active wallet' it will not be able to
          make any transactions. You must import a private key to do that.
        </Text>
      )}
      <Button
        status="success"
        size="giant"
        appearance="outline"
        onPress={saveWallet}>
        Save & Close
      </Button>
    </Container>
  );
}

const Container = styled(Layout)`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
`;
