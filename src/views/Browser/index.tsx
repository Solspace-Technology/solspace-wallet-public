import React from 'react';
import styled from 'styled-components';
import {Alert} from 'react-native';

import {Button, Icon, Input, Layout, Text} from '@ui-kitten/components';
import {ScreenBase} from '../../components/Common';
import {WebView} from 'react-native-webview';

import {useWallet} from '../../providers/wallet-context';
import {useAppState} from '../../providers/appState-context';
import {clusterApiUrl, Connection} from '@solana/web3.js';
import {SolspaceWalletProvider} from '../../modules/walletAdapter';

import {Pressable} from 'react-native';

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export const BrowserView = () => {
  const {state: walletState, dispatch} = useWallet();
  const {state: appState} = useAppState();

  const forceUpdate = useForceUpdate();

  const [addressBarContent, setAddressBarContent] = React.useState(
    'https://solspace.tech',
  );
  const [uri, setUri] = React.useState(addressBarContent);

  const network = appState.settings.find(({name}) => name === 'network').value;

  const {activeWallet} = walletState;
  const connection = new Connection(clusterApiUrl(network));

  let SolspaceWallet: SolspaceWalletProvider | null = null;
  if (activeWallet) {
    SolspaceWallet = new SolspaceWalletProvider({connection, activeWallet});
  }

  async function promptUserForTX({
    host = 'HOST',
    title = 'TITLE',
    message,
    onSuccess,
    action,
    onCancel = () => returnDataToWebview(action, false),
  }: {
    action: string;
    onSuccess: () => void;
    host?: string;
    title?: string;
    message?: string;
    onCancel?: () => void;
  }) {
    if (!message) {
      message = `${title} at ${host} is requesting approval for a transaction. Please make sure that you trust this website before proceeding.`;
    }
    return Alert.alert('Confirm Process Transaction', message, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Proceed',
        onPress: onSuccess,
        style: 'OK',
      },
    ]);
  }

  function returnDataToWebview(message, data) {
    webviewRef.current.postMessage(JSON.stringify({message, data}));
  }

  async function commHandler(payload: any) {
    let parsed = JSON.parse(payload);
    switch (parsed.message) {
      case 'connect': {
        console.log(parsed.payload);
        let connectResult = await SolspaceWallet.connect();
        returnDataToWebview('connect', {...connectResult});
        //* This is disabled as the app is only able to view public key from this action
        // promptUserForTX({
        //   host: parsed.payload.info.host,
        //   title: parsed.payload.info.title,
        //   action: 'connect',
        //   onSuccess: async () => {
        //     let connectResult = await SolspaceWallet.connect();
        //     returnDataToWebview('connect', {...connectResult});
        //   },
        // });
        break;
      }
      case 'disconnect': {
        let disconnectResult = await SolspaceWallet.disconnect();
        returnDataToWebview('disconnect', {...disconnectResult});
        break;
      }
      case 'signTransaction': {
        // Payload should be the transaction
        console.log('parsed.payload', parsed.payload);
        promptUserForTX({
          host: parsed.payload.info.host,
          title: parsed.payload.info.title,
          action: 'signTransaction',
          onSuccess: async () => {
            let signedTxData = await SolspaceWallet.signTransactionWeb(
              parsed.payload.transaction,
            );
            returnDataToWebview('signTransaction', signedTxData);
          },
        });
        break;
      }
      case 'signAllTransactions': {
        // Payload should be the transaction
        console.log(parsed.payload);
        promptUserForTX({
          host: parsed.payload.info.host,
          title: parsed.payload.info.title,
          action: 'signAllTransactions',
          onSuccess: async () => {
            let signedTxData = await SolspaceWallet.signAllTransactionsWeb(
              parsed.payload.transactions,
            );
            returnDataToWebview('signAllTransactions', signedTxData);
          },
        });

        break;
      }
    }
  }

  const runFirst = `
        class Slope {
        async communicate(messageName) {
          return new Promise(function (resolve, reject) {
            function eventListener(event) {
              try {
                let parsed = JSON.parse(event.data);
                if (parsed.message === messageName) {
                  window.removeEventListener('message', eventListener);
                  resolve(parsed.data);
                }
              } catch (e) {
                reject(e);
              }
            }
            window.addEventListener('message', eventListener);
          });
        }

        async connect() {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              message: 'connect',
              payload: {
                info: {
                  title: document.title, 
                  host: window.location.host
                }
              }
            }),
          );
          let connectData = await this.communicate('connect');
          return connectData;
        }

        async disconnect() {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({message: 'disconnect'}),
          );
          let disconnectData = this.communicate('disconnect');
          return disconnectData;
        }

        async signTransaction(payload) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              message: 'signTransaction', payload: {
                transaction: payload,
              info: {
                  title: document.title, 
                  host: window.location.host
                }
              }
            }),
          );
          let txData = await this.communicate('signTransaction');
          console.log("txData", txData);
          return txData;
        }

        async signAllTransactions(payload) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              message: 'signAllTransactions', 
              payload: {
                transactions: payload,
                info: {
                  title: document.title, 
                  host: window.location.host
                }
              }
            }),
          );
          let txData = await this.communicate('signAllTransactions');
          console.log('txData', txData);
          return txData;
        }
      };
  window.Slope = Slope;
  true;
  `;

  const renderClearIcon = props => (
    <Pressable onPress={() => setAddressBarContent('https://')}>
      <Icon {...props} name="close-circle-outline" status="basic" />
    </Pressable>
  );

  const webviewRef = React.useRef();

  return (
    //TODO: re render the page after a wallet change
    <ScreenBase>
      <BrowserHeader>
        <Layout
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingLeft: 15,
            paddingRight: 15,
          }}>
          <Pressable onPress={() => webviewRef.current.goBack()}>
            <Text category="h1">{'←'}</Text>
          </Pressable>
          <Pressable onPress={forceUpdate}>
            <Text category="h2" style={{marginTop: 5, marginBottom: 10}}>
              Solspace Browser
            </Text>
          </Pressable>
          <Pressable onPress={() => webviewRef.current.goForward()}>
            <Text category="h1">{'→'}</Text>
          </Pressable>
        </Layout>
        <Layout style={{flexDirection: 'row', width: '100%'}}>
          <Input
            enableReturnKeyAutomatically
            returnKeyType="go"
            onSubmitEditing={() => setUri(addressBarContent)}
            autoCorrect={false}
            autoComplete={false}
            autoCapitalize={false}
            size="large"
            value={addressBarContent}
            onChangeText={(text: string) => setAddressBarContent(text)}
            accessoryRight={renderClearIcon}
            style={{
              borderColor: 'white',
              flex: 1,
              marginRight: 5,
              marginLeft: 5,
            }}
          />
          <Button status="basic" onPress={() => setUri(addressBarContent)}>
            Go
          </Button>
        </Layout>
      </BrowserHeader>
      {/* Test this to see if it works */}
      {activeWallet && (
        <WebView
          ref={webviewRef}
          source={{uri}}
          injectedJavaScriptBeforeContentLoaded={activeWallet && runFirst}
          onMessage={(event: any) => commHandler(event.nativeEvent.data)}
          allowsBackForwardNavigationGestures={true}
          onNavigationStateChange={navigationState => {
            setAddressBarContent(navigationState.url);
          }}
          pullToRefreshEnabled={true}
        />
      )}
    </ScreenBase>
  );
};

const BrowserHeader = styled(Layout)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  padding-bottom: 5px;
`;
