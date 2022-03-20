import {Layout, Input, CheckBox, Text, Button} from '@ui-kitten/components';

import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import {useNavigation} from '@react-navigation/native';

import {useWallet} from '../../providers/wallet-context';

export function AddPublicKeyScreen() {
  const {dispatch} = useWallet();

  const navigation = useNavigation();

  const [publicKey, setPublicKey] = React.useState();
  const [walletName, setWalletName] = React.useState();
  const [shouldBeActiveWallet, setShouldBeActiveWallet] = React.useState(true);

  function saveWallet() {
    let walletId = uuid();
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
    navigation.navigate('Main');
  }

  return (
    <Container>
      <Input
        status="primary"
        label={props => <Text {...props}>Enter Solana PublicKey:</Text>}
        value={publicKey}
        onChangeText={value => setPublicKey(value)}
        style={{marginBottom: 10}}
      />
      <Input
        status="primary"
        label={props => <Text {...props}>Enter Wallet Nickname:</Text>}
        value={walletName}
        onChangeText={value => setWalletName(value)}
        style={{marginBottom: 10}}
      />
      <CheckBox
        checked={shouldBeActiveWallet}
        onChange={value => setShouldBeActiveWallet(value)}>
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
