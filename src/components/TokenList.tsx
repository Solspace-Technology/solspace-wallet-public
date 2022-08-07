import React from 'react';
import {useNavigation} from '@react-navigation/native';

import {Text, Spinner, Layout, Button} from '@ui-kitten/components';

import {
  Pressable,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {useGetCurrentColorScheme} from '../hooks/useGetCurrentColorScheme';

import {useAppState} from '../providers/appState-context';
import {useWallet} from '../providers/wallet-context';
import {useTokensState} from '../providers/tokens-context';

import {ThemeVariables} from '../styles/themeVariables';

import {USDFormatter, LightenColor} from '../modules/utils';

import {WalletHeading} from './WalletHeading';
import styled from 'styled-components/native';

export function TokenList() {
  const {width: PAGE_WIDTH} = useWindowDimensions();
  const isDarkMode = useGetCurrentColorScheme() === 'dark';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isError, setIsError] = React.useState(false);

  const [horizontalOffset, setHorizontalOffset] = React.useState(0);

  const {state: appState} = useAppState();
  const {state: walletState} = useWallet();
  const {state: tokenState, dispatch: tokenDispatch} = useTokensState();

  const navigation = useNavigation();

  const horizontalRef = React.useRef(null);

  // Pertinent App Settings:
  const network = appState?.settings?.find(
    ({name}: {name: string}) => name === 'network',
  ).value;
  const showZeroBalances = appState.settings.find(
    ({name}: {name: string}) => name === 'showZeroBalances',
  ).value;

  const showUnnamedTokens = appState.settings.find(
    ({name}: {name: string}) => name === 'showUnnamedTokens',
  ).value;

  React.useEffect(() => {
    // This will force a token price update no matter the time between.
    if (walletState?.activeWallet?.pubKeyString) {
      tokenDispatch({
        type: 'UPDATE_SPL_TOKENS_AND_PRICES',
        payload: {
          pubKeyString: walletState.activeWallet.pubKeyString,
          forceUpdate: true,
          options: {network, showUnnamedTokens, showZeroBalances},
        },
      });
    }
  }, [
    walletState?.activeWallet?.pubKeyString,
    network,
    showUnnamedTokens,
    showZeroBalances,
    tokenDispatch,
  ]);

  function refreshTokens() {
    tokenDispatch({
      type: 'UPDATE_SPL_TOKENS_AND_PRICES',
      payload: {
        pubKeyString: walletState.activeWallet.pubKeyString,
        options: {network, showUnnamedTokens, showZeroBalances},
      },
    });
  }

  function onHeadingPress(heading: string) {
    if (heading === 'tokens') {
      horizontalRef.current.scrollTo({x: 0, animated: true});
      setHorizontalOffset(0);
    }
    if (heading === 'nfts') {
      horizontalRef.current.scrollTo({x: PAGE_WIDTH, animated: true});
      setHorizontalOffset(PAGE_WIDTH);
    }
  }

  function renderTokenItem({item, index}: {item: any; index: number}) {
    const tokenMint = item?.account?.data?.parsed?.info?.mint;
    const isSPLToken = item?.account?.data?.program === 'spl-token';
    const tokenHoldings =
      item?.account?.data?.parsed?.info?.tokenAmount?.uiAmountString;
    const tokenSymbol = item?.tokenInfo?.symbol;
    const tokenName = item?.tokenInfo?.name || 'SPL Token';
    const tokenLogoURI = item?.tokenInfo?.logoURI;
    const tokenDecimals =
      item?.account?.data?.parsed?.info?.tokenAmount?.decimals;

    // Detailed price info:
    const tokenPriceInfo = tokenState?.SPLTokenPrices[index];

    // Shallow price info
    let tokenPriceUSD = item?.shallowPriceInfo?.usd;
    const USDChange24h = item?.shallowPriceInfo?.usd_24h_change;
    const portfolioChange =
      (USDChange24h / 100) * tokenPriceUSD * tokenHoldings;

    const isLogoSVG =
      item?.tokenInfo?.logoURI?.toLowerCase().slice(-3) === 'svg';

    if (
      item?.tokenInfo?.symbol === 'USDC' ||
      item?.tokenInfo?.symbol === 'USDT'
    ) {
      tokenPriceUSD = 1;
    }
    // Hides all balances of less than zero unless explicitly turned on
    if (isSPLToken || tokenSymbol) {
      return (
        <StyledTokenItem
          isDarkMode={isDarkMode}
          key={index}
          onPress={() => {
            navigation.navigate(
              'View Tokens' as never,
              {
                tokenPriceInfo: tokenPriceInfo as never,
                tokenSymbol: tokenSymbol as never,
                tokenName: tokenName as never,
                tokenMint: tokenMint as never,
                isSPLToken: isSPLToken as never,
                tokenPriceUSD: tokenPriceUSD as never,
                tokenHoldings: tokenHoldings as never,
                tokenDecimals: tokenDecimals as never,
                tokenLogoURI: tokenLogoURI as never,
                pubKey: walletState.activeWallet.pubKeyString as never,
              } as never,
            );
          }}>
          <TokenContainerLeft>
            {tokenLogoURI && !isLogoSVG ? (
              <TokenImage uri={tokenLogoURI} />
            ) : (
              <Text category="h1" status="danger" style={{paddingLeft: 15}}>
                ?{' '}
              </Text>
            )}
            <Text category="h6">{tokenSymbol || 'UNKNOWN'}</Text>
          </TokenContainerLeft>
          <TokenContainerRight>
            <Text category="s2">{tokenHoldings}</Text>
            {tokenPriceUSD ? (
              <Text category="p2">
                {USDChange24h && (
                  <Text
                    category="c2"
                    style={{color: USDChange24h > 0 ? 'green' : 'red'}}>
                    ({portfolioChange.toFixed(2)}){' '}
                  </Text>
                )}

                {USDFormatter.format(tokenPriceUSD * tokenHoldings)}
              </Text>
            ) : (
              <Text category="p2">No Price Info</Text>
            )}
          </TokenContainerRight>
        </StyledTokenItem>
      );
    }
  }

  function renderNFTItem({item, index}: {item: any; index: number}) {
    return (
      <NFTItem
        isDarkMode={isDarkMode}
        key={index}
        onPress={() =>
          navigation.navigate('View NFT' as never, item.metaData as never)
        }>
        <Text category="h6">{item?.metaData?.data?.name}</Text>
      </NFTItem>
    );
  }

  const emptyListComponent = () => (
    <NFTItem isDarkMode={isDarkMode} onPress={undefined}>
      <Text category="h6">No items to display =[</Text>
    </NFTItem>
  );

  const ListHeader = () => (
    <React.Fragment>
      <WalletHeading />
      <HeadingContainer>
        <Pressable onPress={() => onHeadingPress('tokens')}>
          <HeadingText category="h2" active={horizontalOffset <= 0}>
            Tokens
          </HeadingText>
        </Pressable>
        <Pressable onPress={() => onHeadingPress('nfts')}>
          <HeadingText category="h2" active={horizontalOffset > 0}>
            NFTs
          </HeadingText>
        </Pressable>
      </HeadingContainer>
    </React.Fragment>
  );

  if (tokenState.SPLTokens?.length > 0) {
    return (
      <View>
        <ScrollView
          ref={horizontalRef}
          contentContainerStyle={{width: '200%'}}
          directionalLockEnabled
          horizontal
          snapToAlignment="start"
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollEndDrag={(e) =>
            setHorizontalOffset(e.nativeEvent.targetContentOffset.x)
          }>
          <View style={{width: '50%'}}>
            <FlatList
              contentContainerStyle={{
                width: '100%',
                maxWidth: 1000,
                alignSelf: 'center',
              }}
              ListFooterComponent={
                <Button size="large" appearance="ghost" onPress={refreshTokens}>
                  Refresh
                </Button>
              }
              ListHeaderComponent={ListHeader}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={emptyListComponent}
              renderItem={renderTokenItem}
              data={tokenState.SPLTokens}
              keyExtractor={(item, index) =>
                (JSON.stringify(item) + index).toString()
              }
              refreshControl={
                <RefreshControl
                  onRefresh={refreshTokens}
                  refreshing={tokenState.isSPLTokensLoading}
                  tintColor={LightenColor(colors.primary, 30)}
                />
              }
            />
          </View>

          <View style={{width: '50%'}}>
            <FlatList
              contentContainerStyle={{
                width: '100%',
                maxWidth: 1000,
                alignSelf: 'center',
              }}
              ListFooterComponent={
                <Button
                  size="large"
                  appearance="ghost"
                  onPress={() => console.log('refetch here')}>
                  Refresh
                </Button>
              }
              ListHeaderComponent={ListHeader}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={emptyListComponent}
              renderItem={renderNFTItem}
              data={tokenState.NFTs}
              keyExtractor={(item, index) =>
                (JSON.stringify(item) + index).toString()
              }
              refreshControl={
                <RefreshControl
                  onRefresh={refreshTokens}
                  refreshing={tokenState.isSPLTokensLoading}
                  tintColor={LightenColor(colors.primary, 30)}
                />
              }
            />
          </View>
        </ScrollView>
      </View>
    );
  }
  if (tokenState.isSPLTokensLoading) {
    // This will only render on the initial load.
    return (
      <Layout style={{flex: 1, alignItems: 'center', marginTop: 20}}>
        <Spinner size="medium" />
      </Layout>
    );
  }
  if (isError) {
    console.log(isError);
    return (
      <Layout style={{flex: 1}}>
        <NoWalletText category="h4" status="danger">
          Network Error
        </NoWalletText>
        <Text category="p1" status="danger" style={{margin: 10}}>
          There was an error making the request. PLease make sure that you have
          a proper network connection and try again.
        </Text>
        <Button
          size="giant"
          status="danger"
          style={{margin: 20}}
          onPress={refreshTokens}>
          Retry
        </Button>
      </Layout>
    );
  }
  return (
    // No wallet added
    // TODO: add new user info here!

    <Layout
      style={{
        maxWidth: 800,
        alignSelf: 'center',
      }}>
      <Text category="h1" style={{alignSelf: 'center', fontSize: 48}}>
        Welcome to Solspace Wallet!
      </Text>
      <Text category="p1" style={{fontSize: 24, margin: 15}}>
        We're really glad you're here. In order to get started with making
        transactions on Solana you will need a Solana wallet. If you already
        have one, you can import either your secret key, or an existing
        mnemonic.
      </Text>
      <Text category="p1" style={{fontSize: 24, margin: 15}}>
        You can also connect and use a Ledger device via bluetooth. Using a
        hardware wallet like Ledger is the most secure way to make transactions
        on Solana. This is because you're secret key lives only on your hardware
        wallet, and is never exposed to any other parties. When you sign a
        transaction using your Ledger, the transaction is passed to your device
        to be signed and then passed back to the wallet to verify.
      </Text>
      <Text category="p1" style={{fontSize: 24, margin: 15}}>
        Once you add a wallet this screen will show all of the tokens and NFTs
        that your wallet holds. Click the 'Add Wallet' button in the header to
        get started!
      </Text>
    </Layout>
  );
}
const {colors} = ThemeVariables();
const HeadingText = styled(Text)<{active?: boolean}>`
  ${(props) => !props.active && 'opacity: 0.3;'};
`;

const HeadingContainer = styled(Layout)`
  flex-direction: row;
  justify-content: space-evenly;
  padding-bottom: 10px;
`;

const StyledTokenItem = styled(TouchableOpacity)<{isDarkMode?: boolean}>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  background-color: ${(props) =>
    props.isDarkMode ? '#ffffff15' : '#00000015'};
  margin: 5px 15px;
  padding: 15px 15px;
`;

const NFTItem = styled(StyledTokenItem)`
  padding: 25px 20px;
`;

const NoWalletText = styled(Text)`
  align-self: center;
  margin: 0 30px;
  padding-top: 30px;
`;

const TokenContainerRight = styled(View)`
  background-color: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

const TokenContainerLeft = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const StyledTokenImage = styled(Image)`
  width: 35px;
  height: 35px;
  margin: 0px 10px;
`;

const TokenImage = ({uri}: {uri: string}) => (
  <StyledTokenImage source={{uri}} />
);
