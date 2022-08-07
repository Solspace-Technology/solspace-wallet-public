import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {SettingsScreen} from './SettingsScreen';
import {NetworkSelectScreen} from './NetworkSelect';
import {ExportKeyphraseScreen} from './ExportKeyphraseScreen';

import {StackHeader} from '../../components/Common';
import {ImportDataScreen} from './ImportDataScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const Settings = () => (
  <Navigator screenOptions={{headerShown: false}}>
    <Screen name="Settings Main" component={SettingsScreen} />
    <Screen
      name="Network Select"
      component={NetworkSelectScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        header: props => (
          <StackHeader
            title="Select Network"
            leftIconName="arrowhead-down-outline"
            {...props}
          />
        ),
      }}
    />
    <Screen
      name="Export Keyphrase"
      component={ExportKeyphraseScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        header: props => (
          <StackHeader
            title="Export Keyphrase"
            leftIconName="arrowhead-down-outline"
            {...props}
          />
        ),
      }}
    />
    <Screen
      name="Import Data"
      component={ImportDataScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        header: props => (
          <StackHeader
            title="Import Data"
            leftIconName="arrowhead-down-outline"
            {...props}
          />
        ),
      }}
    />
  </Navigator>
);
