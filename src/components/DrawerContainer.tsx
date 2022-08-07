import {
  Button,
  Drawer,
  DrawerItem,
  Icon,
  Layout,
  Text,
} from '@ui-kitten/components';
import {Image, SafeAreaView, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {ThemeVariables} from '../styles/themeVariables';

import React from 'react';
import styled from 'styled-components/native';
import {shortenPubKey} from '../modules/utils';
import {useTokensState} from '../providers/tokens-context';
import {useWallet} from '../providers/wallet-context';

export function DrawerContainer({navigation}) {
  const {state: walletState, dispatch: walletDispatch} = useWallet();
  const {dispatch: tokenDispatch} = useTokensState();

  function setWallet(wallet) {
    walletDispatch({
      type: 'SET_ACTIVE_WALLET',
      payload: wallet.id,
    });
    tokenDispatch({type: 'CLEAR_STATE'});
    navigation.closeDrawer();
  }
  return (
    <Layout style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <Drawer
          appearance={'default'}
          footer={() => (
            <Footer
              size="giant"
              onPress={() => navigation.navigate('Manage Wallets')}>
              Manage Wallets
            </Footer>
          )}
          header={Header}>
          <ScrollView style={{minHeight: 500}}>
            {walletState?.wallets?.map((wallet) => (
              <DrawerItem
                key={wallet.pubKeyString}
                title={(evaProps) => (
                  <WalletItem {...evaProps} wallet={wallet} />
                )}
                onPress={() => {
                  if (!wallet.active) {
                    setWallet(wallet);
                  } else {
                    navigation.goBack();
                  }
                }}
              />
            ))}
          </ScrollView>
        </Drawer>
      </SafeAreaView>
    </Layout>
  );
}

const {colors} = ThemeVariables();

function WalletItem({wallet}) {
  const iconRef = React.useRef<Icon<Animatable>>();

  let walletDisplayName = wallet.name;

  if (wallet.name.length > 10) {
    walletDisplayName = wallet.name.slice(0, 10) + '...';
  }

  React.useEffect(() => {
    if (iconRef?.current?.startAnimation) {
      iconRef.current.startAnimation();
    }
  }, []);
  return (
    <StyledWalletItem active={wallet.active}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
        <WalletName category="h3">{walletDisplayName}</WalletName>
        {wallet.active && <ActiveIndicator iconRef={iconRef} />}
      </View>
      <Text category="p1">{shortenPubKey(wallet.pubKeyString, 7)}</Text>
    </StyledWalletItem>
  );
}

const ActiveIndicator = ({iconRef}) => (
  <View style={{flexDirection: 'row', alignItems: 'center'}}>
    <Text category="s2">Active</Text>
    <Icon
      name="star"
      animationConfig={{cycles: Infinity, useNativeDriver: true}}
      animation="pulse"
      width={15}
      height={15}
      fill={colors.info}
      style={{marginLeft: 7, marginRight: 7}}
      ref={iconRef}
    />
  </View>
);

const WalletName = styled(Text)`
  margin-bottom: 10px;
`;

const StyledWalletItem = styled(View)<{active?: boolean}>`
  margin: -10px;
  margin-bottom: -5px;
  margin-left: 0px;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 5px;
  border-bottom-width: 5px;
  border-bottom-color: ${(props) =>
    props.active ? colors.info : colors.itemBackground};
  background-color: ${colors.itemBackground};
  flex: 0.95;
`;

const Footer = styled(Button)`
  margin: 15px;
`;

const Header = () => (
  <StyledHeader>
    <HeaderImage
      source={require('../assets/images/banner.png')}
      resizeMode="contain"
    />
  </StyledHeader>
);

const HeaderImage = styled(Image)`
  width: 85%;
`;

const StyledHeader = styled(Layout)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
