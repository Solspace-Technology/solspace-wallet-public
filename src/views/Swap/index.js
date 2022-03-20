import {SwapScreen} from './Swap';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

const {Navigator, Screen} = createNativeStackNavigator();

import {StackHeader} from '../../components/Common';
import {TokenSelectScreen} from './TokenSelect';

import {SwapTokenProvider} from '../../providers/swapToken-context';
import {MainHeader} from '../../components/MainHeader';

export const SwapStack = props => (
  <SwapTokenProvider>
    <Navigator screenOptions={{headerShown: false}} {...props}>
      <Screen name="Swap Home" component={SwapScreen} />
      <Screen
        name="Swap Token Select"
        component={TokenSelectScreen}
        options={{
          headerShown: true,
          header: newProps => (
            <StackHeader title="Token Select" noMargin={true} {...newProps} />
          ),
          presentation: 'modal',
        }}
      />
    </Navigator>
  </SwapTokenProvider>
);
