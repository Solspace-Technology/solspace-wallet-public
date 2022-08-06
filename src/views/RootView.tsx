// Nav Imports
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import {CameraScreen} from './CameraScreen';
import {ManageWalletsScreen} from './ManageWallets/index';
import {Settings} from './Settings';
import {WalletStack} from './Wallet';

// Components
import {BottomTabBar} from '../components/BottomNavigation';
import {StackHeader} from '../components/Common';
import {MainHeader} from '../components/MainHeader';

// Splash Screen
import {NavigationContainer} from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';

// Drawer Imports
import React from 'react';
import {DrawerContainer} from '../components/DrawerContainer';
import {BrowserView} from './Browser/index';
import {ViewTransactionScreen} from './ViewTransaction';

const BottomTabs = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const DrawerStack = createDrawerNavigator();

const DrawerViews = () => (
  <BottomTabs.Navigator
    screenOptions={{headerShown: false}}
    tabBar={(props) => <BottomTabBar {...props} />}>
    <BottomTabs.Screen
      name="Wallet"
      component={WalletStack}
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
        header: (props) => (
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
        header: (props) => (
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
        header: (props) => (
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
        drawerContent={(props) => <DrawerContainer {...props} />}>
        <DrawerStack.Screen name="Root" component={MainView} />
      </DrawerStack.Navigator>
    </NavigationContainer>
  );
}
