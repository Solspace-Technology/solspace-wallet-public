import {SafeAreaView, View, Image} from 'react-native';
import {
  Drawer,
  DrawerItem,
  Button,
  Layout,
  Icon,
  Text,
} from '@ui-kitten/components';
import {ScrollView} from 'react-native-gesture-handler';
import {ThemeVariables} from '../styles/themeVariables';

import {useWallet} from '../providers/wallet-context';
import {useTokensState} from '../providers/tokens-context';
import {shortenPubKey} from '../modules/utils';
import React, {Ref} from 'react';
import styled from 'styled-components/native';

const FooterRendered = (navigation: any) => (
  <Footer size="giant" onPress={() => navigation.navigate('Manage Wallets')}>
    Manage Wallets
  </Footer>
);

interface DrawerContainerProps {
  navigation: any;
}
export function DrawerContainer({navigation}: DrawerContainerProps) {
  const {state: walletState, dispatch: walletDispatch} = useWallet();
  const {dispatch: tokenDispatch} = useTokensState();

  function setWallet(wallet: any) {
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
          footer={<FooterRendered navigation={navigation} />}
          header={Header}>
          <ScrollView style={{minHeight: 500}}>
            {walletState?.wallets?.map((wallet: any) => (
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

function WalletItem({wallet}: {wallet: any}) {
  const iconRef = React.useRef<any>();

  let walletDisplayName = wallet.name;

  if (wallet.name.length > 10) {
    walletDisplayName = wallet.name.slice(0, 10) + '...';
  }

  React.useEffect(() => {
    if (iconRef && iconRef.current && iconRef.current.startAnimation) {
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

const ActiveIndicator = ({iconRef}: {iconRef: Ref<any>}) => (
  <View style={{flexDirection: 'row', alignItems: 'center'}}>
    <Text category="s2">Active</Text>
    <Icon
      name="star"
      animationConfig={{
        cycles: 'infinity' as never,
        duration: 1000,
        useNativeDriver: true,
      }}
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
