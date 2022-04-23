import {Layout, Button, Icon, Text, Divider} from '@ui-kitten/components';
import {View, SafeAreaView, LayoutAnimation, Image} from 'react-native';

import {useWallet} from '../providers/wallet-context';
import {ThemeVariables} from '../styles/themeVariables';
import {WalletChip} from './Common';

export function MainHeader(props) {
  const {state: walletState} = useWallet();
  let wallet = walletState?.activeWallet;

  const WalletInfo = () => (
    <Layout style={{flexDirection: 'column', alignItems: 'center'}}>
      <Text category="h3">{wallet.name}</Text>
      <WalletChip pubKey={wallet.pubKeyString} white small keyLength={8} />
    </Layout>
  );

  return (
    // Add title when the screen name is swap or whatever here
    <Layout>
      <SafeAreaView>
        <StyledMainHeader>
          <Button
            appearance="ghost"
            status="basic"
            size="giant"
            accessoryLeft={<Icon name="menu-2-outline" />}
            onPress={() => props.navigation.openDrawer()}
          />
          {wallet ? (
            <WalletInfo />
          ) : (
            <Button
              appearance="ghost"
              status="basic"
              size="giant"
              onPress={() => props.navigation.navigate('Manage Wallets')}>
              Add Wallet
            </Button>
          )}
          <Button
            appearance="ghost"
            status="basic"
            size="giant"
            accessoryLeft={
              <Image source={require('../assets/images/qr-code-scan.png')} />
            }
            onPress={() => props.navigation.navigate('Camera Screen')}
          />
        </StyledMainHeader>
      </SafeAreaView>
    </Layout>
  );
}

const {colors} = ThemeVariables();

const StyledMainHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: 10px;
  border-bottom-width: 3px;
  border-bottom-color: ${colors.itemBackground};
`;

const LeftSpacer = styled(Layout)`
  margin-right: 70px;
`;
