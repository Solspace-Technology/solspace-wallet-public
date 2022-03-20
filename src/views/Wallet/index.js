// Navigator
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import {Wallet} from './Wallet';
import {ViewTokens} from './ViewTokens';
import {ViewNFT} from './ViewNFT';
import {SendTokens} from './SendTokens';
import {ReceiveTokens} from './ReceiveTokens';

//Components
import {StackHeader, StackHeaderWithLogo} from '../../components/Common';
import {StakingAccountsScreen} from './StakingAccountsScreen';

//! TODO: Figure out how to add swipe down gestures back to token cards

global.Buffer = global.Buffer || require('buffer').Buffer;
const Stack = createNativeStackNavigator();

export const WalletStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Wallet Home" component={Wallet} />
    <Stack.Screen
      name="View Tokens"
      component={ViewTokens}
      options={{
        gestureResponseDistance: 500,
        headerShown: true,
        header: props => <StackHeaderWithLogo {...props} />,
      }}
    />
    <Stack.Screen
      name="Staking Accounts"
      component={StakingAccountsScreen}
      options={{
        gestureResponseDistance: 500,
        headerShown: true,
        header: props => (
          <StackHeaderWithLogo {...props} title="Staking Accounts" />
        ),
      }}
    />
    <Stack.Screen
      name="Send Tokens"
      component={SendTokens}
      options={{
        gestureResponseDistance: 500,
        headerShown: true,
        header: props => <StackHeaderWithLogo {...props} title="Sending" />,
      }}
    />
    <Stack.Screen
      name="Receive Tokens"
      component={ReceiveTokens}
      options={{
        presentation: 'containedTransparentModal',
        headerShown: true,
        header: props => <StackHeader title="Receive Tokens" {...props} />,
      }}
    />
    <Stack.Screen
      name="View NFT"
      component={ViewNFT}
      options={{
        headerShown: true,
        header: props => <StackHeader title="NFT Detail" {...props} />,
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

export {Wallet} from './Wallet';
