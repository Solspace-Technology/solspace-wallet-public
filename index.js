/**
 * @format
 */
// Polyfills
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import './shim.js';
require('node-libs-react-native/globals');

import {NavigationContainer} from '@react-navigation/native';
import {AppRegistry} from 'react-native';
import Config from 'react-native-config';
import {name as appName} from './app.json';
import App from './src/App';

// Error Tracking
import LogRocket from '@logrocket/react-native';
import {getUniqueId} from 'react-native-device-info';

import fetch from 'cross-fetch';
global.fetch = fetch;

import {AppStateProvider} from './src/providers/appState-context';
import {TokensProvider} from './src/providers/tokens-context';
import {WalletProvider} from './src/providers/wallet-context';

if (!__DEV__ && Config.LOGROCKET) {
  // IN DEBUG MODE
  LogRocket.init(Config.LOGROCKET);
  LogRocket.identify(getUniqueId(), {
    // name: 'JupeTheDev',
  });
}

console.log('Config.RPC_URL', Config.RPC_URL);

const Main = () => {
  return (
    <NavigationContainer>
      <AppStateProvider>
        <WalletProvider>
          <TokensProvider>
            <App />
          </TokensProvider>
        </WalletProvider>
      </AppStateProvider>
    </NavigationContainer>
  );
};

AppRegistry.registerComponent(appName, () => Main);
