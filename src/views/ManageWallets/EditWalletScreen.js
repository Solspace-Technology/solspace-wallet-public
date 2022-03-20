import {Text, Button, Layout} from '@ui-kitten/components';

import {ScreenBase} from '../../components/Common';
import {Alert} from 'react-native';

import {useWallet} from '../../providers/wallet-context';
import {ThemeVariables} from '../../styles/themeVariables';

import {decryptData} from '../../modules/security';

import Clipboard from '@react-native-clipboard/clipboard';

export function EditWalletScreen({route, navigation}) {
  const wallet = route.params;

  const {dispatch: walletStateDispatch} = useWallet();

  function deleteWallet() {
    function confirmedDelete() {
      walletStateDispatch({type: 'REMOVE_WALLET', payload: wallet.id});
      navigation.goBack();
    }
    Alert.alert(
      'Removing Wallet',
      'You cannot undo this action. Once this wallet is deleted there is no way to regain access to it without the secret key.',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: confirmedDelete,
        },
      ],
    );
  }

  async function showSecretKey() {
    let decryptedSecretKey = await decryptData(wallet.secretKey);
    Alert.alert('Secret Key', `${decryptedSecretKey}`, [
      {
        text: 'Copy Key',
        onPress: () => {
          Clipboard.setString(decryptedSecretKey);
        },
      },
      {
        text: 'OK',
      },
    ]);
  }

  console.log(wallet);
  return (
    <>
      <Container>
        <WalletCard>
          <StyledText category="h2">{wallet.name}</StyledText>
          <StyledText category="s1" margin={'0px'}>
            Type:{' '}
          </StyledText>
          <StyledText category="s1">{wallet.type} </StyledText>
          <StyledText category="s1" margin={'0px'}>
            PubKey:
          </StyledText>
          <StyledText>{wallet.pubKeyString}</StyledText>
        </WalletCard>
        <Row>
          {/* //TODO: Add functionality for exporting wallet secret keys */}
          {wallet.secretKey && (
            <StyledButton size="giant" onPress={showSecretKey}>
              Export Private Key
            </StyledButton>
          )}
          <StyledButton size="giant" status="danger" onPress={deleteWallet}>
            {evaProps => (
              <Text {...evaProps} style={{color: 'black', fontWeight: '800'}}>
                Remove Wallet
              </Text>
            )}
          </StyledButton>
        </Row>
      </Container>
    </>
  );
}

const {colors} = ThemeVariables();

const WalletCard = styled(Layout)`
  background-color: ${colors.font + '15'};
  border: solid 2px ${colors.info};
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
`;

const StyledText = styled(Text)`
  margin-bottom: 20px;
  ${props => props.margin && 'margin: ' + props.margin};'};
`;

const Container = styled(ScreenBase)`
  align-items: center;
  padding-top: 0px;
`;

const Row = styled(Layout)`
  flex-direction: row;
`;

const StyledButton = styled(Button)`
  margin: 0 10px;
`;
