/* eslint-disable react-native/no-inline-styles */
import {CardRow, ScreenBase} from '../../components/Common';

import {TOKEN_LIST_URL} from '@jup-ag/core';
import axios from 'axios';

import {useWallet} from '../../providers/wallet-context';
import {useAppState} from '../../providers/appState-context';

import Toast from 'react-native-toast-message';

import {Button, Input, Layout, Spinner, Text} from '@ui-kitten/components';
import {
  executeSwap,
  getPossiblePairsTokenInfo,
  JupiterMain,
  executeJupiterTransactionsLedger,
} from '../../modules/jupiter';
import {useNavigation} from '@react-navigation/native';
import {useSwapTokenState} from '../../providers/swapToken-context';
import {ThemeVariables} from '../../styles/themeVariables';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  View,
  Keyboard,
  FlatList,
} from 'react-native';
import {getKeypairFromEncryptedSecretKey} from '../../modules/security';
import {useTokensState} from '../../providers/tokens-context';
import {
  errorToast,
  processingToast,
  successToast,
} from '../../components/ToastFunctions';
import {ScrollView} from 'react-native-gesture-handler';

export function SwapScreen() {
  const navigation = useNavigation();
  const deviceWidth = Dimensions.get('window').width;

  const {state: walletState} = useWallet();
  const {state: appState} = useAppState();
  const {state: tokenState, dispatch: tokenDispatch} = useTokensState();
  const {state: swapTokens, dispatch: tokensDispatch} = useSwapTokenState();

  const network = appState?.settings?.find(
    ({name}) => name === 'network',
  ).value;

  const {inputTokenList, outputTokenList} = swapTokens;
  const {activeWallet} = walletState;

  const [inputTokenHoldings, setInputTokenHoldings] = React.useState();
  const [jupTokens, setJupTokens] = React.useState();

  const [tokensToSend, setTokensToSend] = React.useState('0.0');
  const [isLoadingRouteInfo, setIsLoadingRouteInfo] = React.useState(false);
  const [routes, setRoutes] = React.useState([]);

  // Transaction states
  const [isTransactionProcessing, setIsTransactionProcessing] =
    React.useState(false);
  const [transactionError, setTransactionError] = React.useState(null);
  const [transactionSignature, setTransactionSignature] = React.useState(null);

  function onTokensUpdate(value) {
    setTokensToSend(value.replace(/[^0-9.]/g, ''));
  }

  function pressClearInputs() {
    // Clears all view specific state.
    setTokensToSend('0');
    tokensDispatch({type: 'CLEAR_STATE'});
    getTokenList();
    setRoutes([]);
    setInputTokenHoldings();
    setTransactionError(null);
    setTransactionSignature(null);
    setIsTransactionProcessing(false);
    setIsLoadingRouteInfo(false);
  }

  async function onInputTokenChange() {
    // When the input token changes we have to check and see what possible tokens we swap for.
    // Only if there is an Input token though...
    setInputTokenHoldings();
    let possibleOutput = await getPossiblePairsTokenInfo(
      swapTokens.inputToken?.address,
      // Can only get routes on mainnet
      // {network},
    );
    // Only show tokens that have a name
    let newPossPairs = possibleOutput.possiblePairsTokenInfo.filter(t => {
      if (t?.name) {
        return true;
      } else {
        return false;
      }
    });
    tokensDispatch({type: 'UPDATE_OUTPUT_TOKEN_LIST', payload: newPossPairs});
    // Solana specific logic...
    if (swapTokens?.inputToken?.symbol === 'SOL') {
      let newInputTokenHoldings = tokenState.SPLTokens.find(
        token => token?.tokenInfo?.symbol === 'SOL',
      )?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      console.log(newInputTokenHoldings);
      setInputTokenHoldings(newInputTokenHoldings);
    } else {
      let newInputTokenHoldings = tokenState.SPLTokens.find(
        token =>
          token?.account?.data?.parsed?.info?.mint ===
          swapTokens?.inputToken?.address,
      )?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      setInputTokenHoldings(newInputTokenHoldings);
    }

    setRoutes([]);
    console.log(newPossPairs.length, ' possible matches');
  }

  async function onFindRoutePress() {
    setRoutes([]);
    Keyboard.dismiss();
    if (!!swapTokens.inputToken && !!swapTokens.outputToken) {
      setIsLoadingRouteInfo(true);
      let getRoutes = await JupiterMain({
        network,
        inputMint: swapTokens.inputToken.address,
        outputMint: swapTokens.outputToken.address,
        tokensToSend,
        inputAmount: tokensToSend,
        userPubKey: activeWallet.pubKeyString,
      });
      if (getRoutes?.routes?.routesInfos?.length > 0) {
        console.log('route: ', getRoutes.routes.routesInfos[0]);
        console.log(
          'allTransactionsRoutes length: ',
          getRoutes.routes.routesInfos.length,
        );

        setRoutes(getRoutes.routes.routesInfos);
      }
      setIsLoadingRouteInfo(false);
    }
  }

  function setError(error) {
    setIsTransactionProcessing(false);
    errorToast(error);
  }

  function setIsProcessing() {
    setIsTransactionProcessing(true);
    processingToast();
  }

  function transactionSuccess(result, mintKeyArray = []) {
    successToast(result.txid, network, navigation);
    // Wait 2 seconds to get new token info
    setTimeout(() => {
      tokenDispatch({
        type: 'UPDATE_SPECIFIC_SPL_TOKENS',
        payload: {
          pubKeyString: walletState?.activeWallet?.pubKeyString,
          mintKeyArray,
          options: {network: 'mainnet-beta'},
        },
      });
    }, 5000);
  }

  function showToast(txName) {
    console.log('running show toast!');
    Toast.hide();
    Toast.show({
      type: 'transactionProcessing',
      autoHide: false,
      position: 'top',
      props: {
        text1: `Processing ${txName} transaction...`,
        text2: 'Please confirm on your Ledger.',
      },
    });
  }

  async function onExecuteSwap(route) {
    console.log('executing');
    console.log(route);
    console.log('getDepositAndFee(): ', await route.getDepositAndFee());

    // Gets the keypair from encrypted secret key.
    let keypair;
    if (activeWallet.type === 'keypair') {
      const {keypair: newKeypair, e} = await getKeypairFromEncryptedSecretKey(
        activeWallet.secretKey,
      );
      if (e) {
        console.error(e);
      }
      keypair = newKeypair;
    }

    // Begin processing transaction
    setIsProcessing();
    let {transactions, execute, error} = await executeSwap({
      network,
      route,
      pubKeyString: activeWallet.pubKeyString,
      keypair,
    }).catch(e => console.log(e));

    if (error) {
      console.log(error);
    }

    if (activeWallet.type === 'keypair') {
      setIsTransactionProcessing(true);
      console.log('executing from secret key');
      // Perform swap using Jupiter here.
      let result = await execute().catch(e => console.log(e));
      console.log('result', result);
      if (result.error) {
        setError(result.error);
      } else if (result.txid) {
        transactionSuccess(result, [
          swapTokens?.inputToken?.address,
          swapTokens?.outputToken?.address,
          '11111111111111111111111111111111',
        ]);
      }
    }

    // Ledger transaction handling:
    if (activeWallet.type === 'ledger') {
      console.log('ledger execution...');
      let result = await executeJupiterTransactionsLedger({
        network,
        fromDerivationPathString: activeWallet.derivationPath,
        deviceId: activeWallet.device.id,
        transactions,
        showToast,
      });
      console.log('result', result);

      if (result.error) {
        setError(result.error);
      } else if (result.txid) {
        transactionSuccess(result, [
          swapTokens?.inputToken?.address,
          swapTokens?.outputToken?.address,
          '11111111111111111111111111111111',
        ]);
        setRoutes([]);
      }
    }

    setIsTransactionProcessing(false);
  }

  async function getTokenList() {
    console.log('getTokenList()');
    let newTokens = jupTokens?.filter(t => {
      if (
        tokenState.SPLTokens.find(
          item => item?.account?.data?.parsed?.info?.mint === t.address,
        )
      ) {
        return t;
      }
      if (t.symbol === 'SOL') {
        return t;
      }
    });
    tokensDispatch({type: 'UPDATE_INPUT_TOKEN_LIST', payload: newTokens});
  }

  async function getJupTokens() {
    let newJupTokens = await axios.get(TOKEN_LIST_URL['mainnet-beta']);
    console.log(newJupTokens.data);
    setJupTokens(newJupTokens.data);
  }

  React.useEffect(() => {
    // Runs on initial mount only.
    if (walletState?.activeWallet?.pubKeyString) {
      getJupTokens();
    }
  }, [walletState?.activeWallet?.pubKeyString]);

  React.useEffect(() => {
    // Clears state whenever the walletId changes
    console.log('wallet change');
    pressClearInputs();
    tokensDispatch({type: 'CLEAR_STATE'});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.id]);

  React.useEffect(() => {
    if (swapTokens.inputToken) {
      // Only run this when there is an actual input token
      console.log('onInputTokenChange()');
      onInputTokenChange();
    }

    if (jupTokens && !inputTokenList) {
      // Only run this when there is no input token list
      //* Might have to edit this for when new tokens are added?
      getTokenList();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenState?.SPLTokens, swapTokens?.inputToken, jupTokens]);

  const renderTokenButton = token => (
    <>
      {token?.logoURI && (
        <Image
          source={{uri: token.logoURI}}
          style={{
            height: 35,
            width: 35,
            marginVertical: -10,
          }}
        />
      )}
      <Text style={{marginLeft: 20}}>{token.symbol}</Text>
    </>
  );

  function renderSingleRoute({item: route}) {
    let markets = route?.marketInfos.reduce((acc, curr) => {
      acc.push(curr?.marketMeta?.amm?.label);
      return acc;
    }, []);
    // only show possible routes
    if (route.outAmountWithSlippage > 0) {
      return (
        <InnerContainer deviceWidth={deviceWidth}>
          <Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              backgroundColor: 'inherit',
            }}>
            <Layout
              style={{flexDirection: 'column', backgroundColor: 'inherit'}}>
              <Text category="s2">Best Route:</Text>
              <Text category="c2">Min with slippage:</Text>
              <Text category="c2">Possible Routes:</Text>
              <Layout
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  backgroundColor: 'inherit',
                }}>
                <Text category="c2">Slippage:</Text>
                <Text category="c2">1%</Text>
              </Layout>
            </Layout>
            <Layout
              style={{
                flexDirection: 'column',
                alignItems: 'flex-end',
                backgroundColor: 'inherit',
              }}>
              <Text category="s2">
                {route?.outAmount /
                  Math.pow(10, swapTokens.outputToken?.decimals)}
              </Text>
              <Text category="c2">
                {route?.outAmountWithSlippage /
                  Math.pow(10, swapTokens.outputToken?.decimals)}
              </Text>
              <Text category="c2">{routes?.length || 'none'}</Text>
              <Layout
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: 'inherit',
                  marginLeft: 15,
                  marginBottom: 15,
                }}>
                <Text category="c2">Platform Fee: </Text>
                <Text category="c2">0.75%</Text>
              </Layout>
            </Layout>
          </Layout>
          {markets.length === 2 && (
            <Layout
              style={{
                alignItems: 'center',
                marginBottom: 10,
                backgroundColor: 'inherit',
              }}>
              <Text category="c2">
                via {markets[0]} & {markets[1]}
              </Text>
            </Layout>
          )}
          {markets.length === 1 && (
            <Layout style={{alignItems: 'center', marginBottom: 10}}>
              <Text category="c2">via {markets[0]}</Text>
            </Layout>
          )}

          <Button
            status="info"
            size="giant"
            onPress={() => onExecuteSwap(route)}
            disabled={isTransactionProcessing}>
            Execute Swap
          </Button>
        </InnerContainer>
      );
    }
  }

  const renderRouteInfo = () => (
    <View style={{flex: 1, flexGrow: 1}}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        centerContent
        contentContainerStyle={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
        style={{flex: 1, flexGrow: 1}}
        data={routes.slice(0, 50)}
        renderItem={renderSingleRoute}
      />
    </View>
  );

  return (
    <>
      <Container>
        <ScrollView
          contentContainerStyle={{
            width: '100%',
            maxWidth: 800,
            alignSelf: 'center',
          }}>
          <View
            style={{
              paddingBottom: 10,
              alignItems: 'center',
            }}>
            <Text category="h1">Token Swap</Text>
            <Text category="c1">Powered by Jupiter Core</Text>
          </View>
          {network !== 'mainnet-beta' && (
            <Text
              category="h5"
              status={'danger'}
              style={{margin: 5, textAlign: 'center'}}>
              Jupiter swaps only perform as expected on mainnet. Proceed with
              caution.
            </Text>
          )}
          <InnerContainer>
            <TokenLabel>Input Token:</TokenLabel>
            <Button
              appearance="outline"
              size="giant"
              disabled={inputTokenList === null || inputTokenList.length === 0}
              onPress={() =>
                navigation.navigate('Swap Token Select', {
                  inputTokenList,
                  type: 'input',
                  title: 'Input Token:',
                })
              }>
              {swapTokens.inputToken?.name
                ? renderTokenButton(swapTokens.inputToken)
                : 'Select Input Token'}
            </Button>

            <TokenLabel>Output Token:</TokenLabel>
            <Button
              appearance="outline"
              size="giant"
              accessoryRight={
                swapTokens?.inputToken &&
                outputTokenList?.length === 0 && <ActivityIndicator />
              }
              disabled={
                outputTokenList?.length === 0 || outputTokenList === null
              }
              onPress={() =>
                navigation.navigate('Swap Token Select', {
                  tokens: outputTokenList,
                  type: 'output',
                  title: 'Output Token:',
                })
              }>
              {swapTokens.outputToken?.name
                ? renderTokenButton(swapTokens.outputToken)
                : 'Select Output Token'}
            </Button>

            <TokenLabel category="s2">Tokens to send:</TokenLabel>
            <Input
              onFocus={() => setTokensToSend('')}
              caption={
                inputTokenHoldings && 'Current Balance: ' + inputTokenHoldings
              }
              size="large"
              value={tokensToSend}
              onChangeText={value => onTokensUpdate(value)}
              status="info"
              style={{
                marginBottom: 10,
              }}
            />
            <CardRow>
              <Button
                appearance="outline"
                onPress={onFindRoutePress}
                disabled={
                  isLoadingRouteInfo ||
                  !swapTokens.inputToken ||
                  !swapTokens.outputToken
                }>
                Find Routes
              </Button>
              <Button
                appearance="outline"
                status="warning"
                onPress={pressClearInputs}
                onLongPress={() => setIsTransactionProcessing(false)}
                style={{marginLeft: 5}}>
                Clear Inputs
              </Button>
            </CardRow>
          </InnerContainer>
          {isLoadingRouteInfo && <Spinner size="giant" />}
          {routes && renderRouteInfo()}
        </ScrollView>
      </Container>
    </>
  );
}

const {colors} = ThemeVariables();

const Container = styled(ScreenBase)``;

//TODO: figure out how to style this better
const InnerContainer = styled(Layout)`
  ${props => props.deviceWidth && 'width: ' + props.deviceWidth + 'px'};
  background-color: ${colors.itemBackground};
  margin: 15px;
  margin-top: 0px;
  padding: 15px 40px;
  padding-top: 10px;

  border-radius: 10px;
  border: solid 1px ${colors.info}90;
`;

const TokenLabel = styled(Text)`
  margin: 5px;
`;
