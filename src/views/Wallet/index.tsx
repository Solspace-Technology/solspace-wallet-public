// Navigator
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';

// Screens
import {ReceiveTokens} from './ReceiveTokens';
import {SendTokens} from './SendTokens';
import {ViewNFT} from './ViewNFT';
import {ViewTokens} from './ViewTokens';
import {Wallet} from './Wallet';

//Components
import {StackHeader, StackHeaderWithLogo} from '../../components/Common';
import {StakingAccountsScreen} from './StakingAccountsScreen';

//! TODO: Figure out how to add swipe down gestures back to token cards
const Stack = createNativeStackNavigator();

const StakingAccountsHeader = (props: NativeStackHeaderProps) => (
  <StackHeaderWithLogo {...props} title="Staking Accounts" />
);
const SendingHeader = (props: NativeStackHeaderProps) => (
  <StackHeaderWithLogo {...props} title="Sending" />
);
const ReceiveTokensHeader = (props: NativeStackHeaderProps) => (
  <StackHeader title="Receive Tokens" {...props} />
);
const NFTDetailHeader = (props: NativeStackHeaderProps) => (
  <StackHeader title="NFT Detail" {...props} />
);

export const WalletStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Wallet Home" component={Wallet} />
    <Stack.Screen
      name="View Tokens"
      component={ViewTokens}
      options={{
        headerShown: true,
        header: StackHeaderWithLogo,
      }}
    />
    <Stack.Screen
      name="Staking Accounts"
      component={StakingAccountsScreen}
      options={{
        headerShown: true,
        header: StakingAccountsHeader,
      }}
    />
    <Stack.Screen
      name="Send Tokens"
      component={SendTokens}
      options={{
        headerShown: true,
        header: SendingHeader,
      }}
    />
    <Stack.Screen
      name="Receive Tokens"
      component={ReceiveTokens}
      options={{
        presentation: 'containedTransparentModal',
        headerShown: true,
        header: ReceiveTokensHeader,
      }}
    />
    <Stack.Screen
      name="View NFT"
      component={ViewNFT}
      options={{
        headerShown: true,
        header: NFTDetailHeader,
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

export {Wallet} from './Wallet';
