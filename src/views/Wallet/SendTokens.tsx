import {Button, Input, Layout, Text} from '@ui-kitten/components';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  ScrollView,
  View,
} from 'react-native';

// Components
import {MainCard} from './ViewTokens';

import {
  getSendSolanaTransaction,
  getSendSPLTokenTransaction,
} from '../../services/transactions';

import {useAppState} from '../../providers/appState-context';
import {useWallet} from '../../providers/wallet-context';

import {clusterApiUrl, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {WalletChip} from '../../components/Common';
import {
  errorToast,
  processingToast,
  successToast,
} from '../../components/ToastFunctions';
import {
  solDomainToPubkey,
  twitterHandleToPubkey,
} from '../../modules/splNameService';
import {USDFormatter} from '../../modules/utils';
import {useTokensState} from '../../providers/tokens-context';

import {Connection} from '@metaplex/js';
import React from 'react';
import styled from 'styled-components/native';
import {SolspaceWalletProvider} from '../../modules/walletAdapter';

export function SendTokens({route, navigation}) {
  const {
    // pubKey,
    // tokenLogoURI,
    // isSPLToken,
    tokenPriceUSD: tokenPriceUSDFromRoute,
    tokenSymbol: tokenSymbolFromRoute,
    tokenName: tokenNameFromRoute,
    tokenMint: tokenMintFromRoute,
    tokenDecimals: tokenDecimalsFromRoute,
  } = route.params;

  const transactionData = route.params.transactionData;

  const [tokenPriceUSD, setTokenPriceUSD] = React.useState(
    tokenPriceUSDFromRoute,
  );
  const [tokenSymbol, setTokenSymbol] = React.useState(tokenSymbolFromRoute);
  const [tokenName, setTokenName] = React.useState(tokenNameFromRoute);
  const [tokenMint, setTokenMint] = React.useState(tokenMintFromRoute);
  const tokenDecimals = tokenDecimalsFromRoute;
  // const [tokenDecimals, setTokenDecimals] = React.useState(
  //   tokenDecimalsFromRoute,
  // );

  const {state: walletState} = useWallet();
  const {state: tokenState, dispatch: tokenDispatch} = useTokensState();
  const {state: appState} = useAppState();

  const [tokenHoldings, setTokenHoldings] = React.useState<
    string | undefined
  >();

  function refreshTokenBalance() {
    let newTokenHoldings = tokenState.SPLTokens.find(
      (item) => item.mintKey === tokenMint,
    )?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;

    if (!newTokenHoldings && tokenName === 'Solana') {
      newTokenHoldings = tokenState.SPLTokens.find(
        (item) => item.tokenInfo?.name === 'Solana',
      )?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    }

    setTokenHoldings(newTokenHoldings);
  }

  React.useEffect(() => {
    refreshTokenBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenState.SPLTokens]);

  const tokenTotalValue = USDFormatter.format(
    (parseFloat(tokenHoldings) || 0) * tokenPriceUSD,
  );

  const {activeWallet} = walletState;
  const network = appState.settings.find(({name}) => name === 'network').value;

  const [receiverInput, setReceiverInput] = React.useState('');
  const [toPubKey, setToPubKey] = React.useState<string | undefined>();
  const [isSNSLoading, setIsSNSLoading] = React.useState(false);

  const [isSendDisabled, setIsSendDisabled] = React.useState(true);
  const [tokensToSend, setTokensToSend] = React.useState('0');

  const [transactionProcessing, setTransactionProcessing] =
    React.useState(false);

  React.useEffect(() => {
    // need to get token data here... if no token data throw error
    if (transactionData) {
      ('getting tx data');
      const {solana, amount, splToken} = transactionData;

      const tokenInfo = tokenState.SPLTokens.find(
        (item) => item.mintKey === splToken,
      );
      if (tokenInfo) {
        setTokenName(tokenInfo?.tokenInfo?.name);
        setTokenSymbol(tokenInfo?.tokenInfo?.symbol);
        setTokenPriceUSD(tokenInfo?.shallowPriceInfo?.usd);
      }

      setToPubKey(solana);
      updateReceiverInput(solana, true);
      setTokenMint(splToken);
      setTokensToSend(amount);
    }
  }, [transactionData, tokenState.SPLTokens]);

  function clearInput() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setReceiverInput('');
    setToPubKey(undefined);
    setTokensToSend('0');
  }

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(checkForTwitter, 1000);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverInput]);

  async function checkForTwitter() {
    console.log('checking for twitter handle');
    if (receiverInput.startsWith('@')) {
      // set loading
      setIsSNSLoading(true);
      const publicKey = await twitterHandleToPubkey(receiverInput.substring(1));
      setIsSNSLoading(false);
      console.log(publicKey);
      if (publicKey?.toString()) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setIsSendDisabled(false);
        setToPubKey(publicKey?.toString());
        console.log('domain holder:', publicKey?.toString());
      }
    }
  }

  async function updateReceiverInput(value, solanaPay = false) {
    setReceiverInput(value);
    if (value.endsWith('.sol')) {
      setIsSNSLoading(true);
      const publicKey = await solDomainToPubkey(value);
      setIsSNSLoading(false);
      if (publicKey?.toString()) {
        if (!solanaPay) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        }
        setIsSendDisabled(false);
        setToPubKey(publicKey?.toString());
        console.log('domain holder:', publicKey?.toString());
      }
    } else if (value.length === 44) {
      if (!solanaPay) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      }
      setIsSendDisabled(false);
      setToPubKey(value);
    } else {
      if (!solanaPay) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setIsSendDisabled(true);
      setToPubKey(undefined);
    }
  }

  function setIsProcessing() {
    setTransactionProcessing(true);
    processingToast();
  }

  function setSuccessfulSend(sig, mintKeyArray = []) {
    setTransactionProcessing(false);
    successToast(sig, network, navigation);
    setTimeout(() => {
      tokenDispatch({
        type: 'UPDATE_SPECIFIC_SPL_TOKENS',
        payload: {
          pubKeyString: walletState?.activeWallet?.pubKeyString,
          mintKeyArray,
          options: {network},
        },
      });
    }, 3000);
  }

  function setErrorSend(error) {
    setTransactionProcessing(false);
    errorToast(error);
  }

  function onTokensUpdate(value) {
    setTokensToSend(value.replace(/[^0-9.]/g, ''));
  }
  console.log('activeWallet', activeWallet);

  async function onSendSolana() {
    async function beginTransaction() {
      let e;
      // Perform transaction here!
      setIsProcessing();
      const connection = new Connection(clusterApiUrl(network));
      const wallet = new SolspaceWalletProvider({
        connection,
        activeWallet,
      });
      const transaction = getSendSolanaTransaction({
        fromPubkey: new PublicKey(activeWallet.pubKeyString),
        toPublicKey: new PublicKey(toPubKey),
        lamportsToSend: parseFloat(tokensToSend) * LAMPORTS_PER_SOL,
      });
      const signedTransaction = await wallet.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction(
        signedTransaction.serialize(),
      );
      const result = await connection.confirmTransaction(txSig);
      if (result) {
        setSuccessfulSend(txSig, ['11111111111111111111111111111111']);
        // setToPubKey('');
        setTokensToSend('0');
        //TODO: refresh token balances here somehow
      } else {
        const error = {...result} || {
          name: 'Transaction Error',
          message:
            'Transaction could not be processed. There should be more error handling here...',
        };
        setErrorSend(error);
      }
      if (e) {
        setErrorSend(e);
      }
    }
    Alert.alert(
      'Confirm Transaction',
      `Please confirm that you are sending ${tokensToSend} ${tokenSymbol} to ${toPubKey}. This transaction cannot be undone.`,
      [{text: 'Cancel'}, {text: 'Confirm', onPress: beginTransaction}],
    );
  }

  async function onSendSPLToken() {
    async function beginTransaction() {
      let e;
      // Perform transaction here!
      setIsProcessing();
      const connection = new Connection(clusterApiUrl(network));
      const transaction = await getSendSPLTokenTransaction({
        fromPubKey: activeWallet.pubKeyString,
        toPublicKey: toPubKey,
        mint: tokenMint,
        tokensToSend,
        decimals: tokenDecimals,
        connection,
      });
      // TODO: Abstract this into it's own function somewhere...
      const wallet = new SolspaceWalletProvider({connection, activeWallet});
      const signedTX = await wallet.signTransaction(transaction);
      const TXSig = await connection.sendRawTransaction(signedTX.serialize());
      const result = await connection.confirmTransaction(TXSig);
      if (result) {
        setSuccessfulSend(TXSig, [tokenMint]);
        // setToPubKey('');
        setTokensToSend('0');
        //TODO: refresh token balances here somehow
      } else {
        const error = {...result} || {
          name: 'Transaction Error',
          message:
            'Transaction could not be processed. There should be more error handling here...',
        };
        setErrorSend(error);
      }
      if (e) {
        setErrorSend(e);
      }
    }
    Alert.alert(
      'Confirm Transaction',
      `Please confirm that you are sending ${tokensToSend} ${
        tokenSymbol || 'tokens'
      } to ${toPubKey}. This transaction cannot be undone.`,
      [{text: 'Cancel'}, {text: 'Confirm', onPress: beginTransaction}],
    );
  }

  const sendButtonText = `Send ${tokenSymbol === 'SOL' ? 'Solana' : 'Tokens'}`;

  return (
    <Container>
      <ScrollView>
        <KeyboardAvoidingView behavior="position">
          <MainCard color="info">
            <CardRow style={{marginTop: -5}}>
              <Text category="c1">Current Balance:</Text>
            </CardRow>
            <CardRow style={{justifyContent: 'center'}}>
              <Text category="s1">
                {parseFloat(tokenHoldings).toLocaleString(undefined, {
                  maximumFractionDigits: 5,
                })}{' '}
                {tokenSymbol}
              </Text>
              <Text category="p1">
                {tokenTotalValue &&
                  tokenTotalValue !== '$NaN' &&
                  ` (${tokenTotalValue})`}
              </Text>
            </CardRow>
            <CardRow style={{flexWrap: 'wrap', marginTop: 5}}>
              <View>
                <Text category="s1">Sending:</Text>
                {tokenPriceUSD && (
                  <Text style={{alignSelf: 'center'}}>
                    (
                    {(tokenPriceUSD * parseFloat(tokensToSend)).toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'USD',
                      },
                    )}
                    )
                  </Text>
                )}
              </View>
              <SendingText numberOfLines={1} adjustsFontSizeToFit>
                {isNaN(parseFloat(tokensToSend))
                  ? '0.0'
                  : parseFloat(tokensToSend).toLocaleString(undefined, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 9,
                    })}
              </SendingText>
            </CardRow>

            {toPubKey && (
              <>
                <CardRow>
                  <Text>Receiver Address:</Text>
                </CardRow>
                <CardRow>
                  <WalletChip pubKey={toPubKey} keyLength="full" small />
                </CardRow>
              </>
            )}
          </MainCard>

          {/* Inputs */}
          <View style={{flexDirection: 'row', alignSelf: 'center'}}>
            <FormContainer>
              <LabelText category="s2">Amount</LabelText>
              <Input
                size="large"
                keyboardType="numeric"
                value={tokensToSend}
                onChangeText={(value) => onTokensUpdate(value)}
                status="info"
                style={{marginBottom: 10}}
              />
            </FormContainer>
            <FormContainer>
              <LabelText category="s2">Recipient</LabelText>
              <Input
                size="large"
                value={receiverInput}
                autoCorrect={false}
                onChangeText={(value) => updateReceiverInput(value)}
                status="info"
                style={{marginBottom: 10}}
              />
            </FormContainer>
          </View>
          <Button
            style={{width: '90%', alignSelf: 'center'}}
            size="large"
            status="info"
            accessoryLeft={isSNSLoading && <ActivityIndicator />}
            disabled={
              isSendDisabled || tokensToSend === '0' || transactionProcessing
            }
            onPress={tokenSymbol === 'SOL' ? onSendSolana : onSendSPLToken}>
            {sendButtonText}
          </Button>
          <Button
            style={{width: '90%', alignSelf: 'center', marginTop: 10}}
            status="danger"
            size="large"
            onPress={clearInput}>
            Clear Input
          </Button>
        </KeyboardAvoidingView>
      </ScrollView>
    </Container>
  );
}

const SendingText = styled(Text)`
  font-size: 84px;
`;

const CardRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const LabelText = styled(Text)`
  margin-bottom: 5px;
  text-align: center;
`;

const FormContainer = styled(Layout)`
  margin: 5px;
  width: 45%;
`;

const Container = styled(Layout)`
  flex: 1;
  align-items: center;
`;
