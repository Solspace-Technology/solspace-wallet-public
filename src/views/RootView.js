// Nav Imports
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

// Screens
import {ManageWalletsScreen} from './ManageWallets/index.js';
import {WalletStack} from './Wallet';
import {SwapStack} from './Swap';
import {Settings} from './Settings';
import {CameraScreen} from './CameraScreen.js';

// Components
import {MainHeader} from '../components/MainHeader.js';
import {StackHeader} from '../components/Common';
import {BottomTabBar} from '../components/BottomNavigation';

// Splash Screen
import RNBootSplash from 'react-native-bootsplash';
import {NavigationContainer} from '@react-navigation/native';

// Drawer Imports
import {DrawerContainer} from '../components/DrawerContainer.js';
import {ViewTransactionScreen} from './ViewTransaction.js';
import {BrowserView} from './Browser/index.tsx';

const BottomTabs = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const DrawerStack = createDrawerNavigator();

const DrawerViews = () => (
  <BottomTabs.Navigator
    screenOptions={{headerShown: false}}
    tabBar={props => <BottomTabBar {...props} />}>
    <BottomTabs.Screen
      name="Wallet"
      component={WalletStack}
      options={{
        headerShown: true,
        header: MainHeader,
      }}
    />
    <BottomTabs.Screen
      name="Swap"
      component={SwapStack}
      options={{
        headerShown: true,
        header: MainHeader,
      }}
    />
    <BottomTabs.Screen name="Browser" component={BrowserView} />
    <BottomTabs.Screen name="Settings" component={Settings} />
  </BottomTabs.Navigator>
);

const MainView = () => (
  <RootStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <RootStack.Screen name="Main" component={DrawerViews} />
    <RootStack.Screen
      name="Manage Wallets"
      component={ManageWalletsScreen}
      options={{
        headerShown: true,
        header: props => (
          <StackHeader
            title="Manage Wallets"
            leftIconName="arrowhead-down-outline"
            {...props}
          />
        ),
        presentation: 'modal',
      }}
    />
    <RootStack.Screen
      name="View Transaction"
      component={ViewTransactionScreen}
      options={{
        headerShown: true,
        header: props => (
          <StackHeader
            title="View Transaction"
            leftIconName="arrowhead-down-outline"
            {...props}
          />
        ),
        presentation: 'modal',
      }}
    />
    <RootStack.Screen
      name="Camera Screen"
      component={CameraScreen}
      options={{
        headerShown: true,
        header: props => (
          <StackHeader
            title="Scan Code"
            leftIconName="arrowhead-down-outline"
            {...props}
          />
        ),
        presentation: 'modal',
      }}
    />
  </RootStack.Navigator>
);

export function RootView({isLoaded}) {
  const [isReady, setIsReady] = React.useState(false);

  function callRootReady() {
    setIsReady(true);
  }

  React.useEffect(() => {
    if (isReady && isLoaded) {
      // Prevents screen flashing while data is loading
      RNBootSplash.hide({fade: true});
    }
  }, [isReady, isLoaded]);

  return (
    <NavigationContainer onReady={callRootReady} independent={true}>
      <DrawerStack.Navigator
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: 300,
          },
          drawerType: 'slide',
          swipeEdgeWidth: 15,
        }}
        drawerContent={props => <DrawerContainer {...props} />}>
        <DrawerStack.Screen name="Root" component={MainView} />
      </DrawerStack.Navigator>
    </NavigationContainer>
  );
}
