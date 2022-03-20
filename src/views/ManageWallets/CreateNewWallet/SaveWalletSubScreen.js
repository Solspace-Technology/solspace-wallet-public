/* eslint-disable react-native/no-inline-styles */
import {Container} from './index';
import {Text, Input, CheckBox, Button} from '@ui-kitten/components';
import {encryptData} from '../../../modules/security';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import bs58 from 'bs58';
import {useNavigation} from '@react-navigation/native';

import {useWallet} from '../../../providers/wallet-context';

export function SaveWalletSubScreen(props) {
  const {keypair} = props;

  const navigation = useNavigation();

  const {state: walletState, dispatch: walletDispatch} = useWallet();

  const [walletName, setWalletName] = React.useState();
  const [shouldSetActiveWallet, setShouldSetActiveWallet] =
    React.useState(true);

  async function saveNewWallet() {
    let privateKey = bs58.encode(keypair.secretKey);
    let encryptedPrivateKey = await encryptData(privateKey);

    let walletId = uuid();
    let newWallet = {
      id: walletId,
      active: false,
      type: 'keypair',
      name: walletName,
      pubKeyString: keypair.publicKey.toString(),
      derivationPath: undefined,
      device: undefined,
      secretKey: encryptedPrivateKey,
    };
    walletDispatch({type: 'ADD_WALLET', payload: newWallet});

    if (shouldSetActiveWallet) {
      walletDispatch({type: 'SET_ACTIVE_WALLET', payload: walletId});
    }
    navigation.navigate('Main');
  }

  return (
    <Container style={{alignItems: 'center', paddingBottom: 100}}>
      <StyledText category="h5">Derived Solana Address:</StyledText>
      <StyledText category="p1">{keypair?.publicKey?.toString()}</StyledText>

      <Input
        placeholder="Wallet Nickname"
        value={walletName}
        onChangeText={value => setWalletName(value)}
        status="info"
        size="large"
        style={{marginBottom: 15}}
        label={things => (
          <StyledText {...things}>
            Create a nickname for this wallet:
          </StyledText>
        )}
      />
      <CheckBox
        checked={shouldSetActiveWallet}
        onChange={nextChecked => setShouldSetActiveWallet(nextChecked)}
        status="info">
        Set As Active Wallet?
      </CheckBox>
      <Button
        status="success"
        appearance="outline"
        size="giant"
        style={{marginTop: 100}}
        onPress={saveNewWallet}>
        Save & Close
      </Button>
    </Container>
  );
}

const StyledText = styled(Text)`
  margin: 10px;
  margin-bottom: 20px;
`;
