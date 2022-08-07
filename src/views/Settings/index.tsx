import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';

import {ExportKeyphraseScreen} from './ExportKeyphraseScreen';
import {NetworkSelectScreen} from './NetworkSelect';
import {SettingsScreen} from './SettingsScreen';

import {StackHeader} from '../../components/Common';
import {ImportDataScreen} from './ImportDataScreen';

const {Navigator, Screen} = createNativeStackNavigator();

const NetworkSelectHeader = (props: NativeStackHeaderProps) => (
  <StackHeader
    title="Select Network"
    leftIconName="arrowhead-down-outline"
    {...props}
  />
);
const ExportKeyphraseHeader = (props: NativeStackHeaderProps) => (
  <StackHeader
    title="Export Keyphrase"
    leftIconName="arrowhead-down-outline"
    {...props}
  />
);
const ImportDataHeader = (props: NativeStackHeaderProps) => (
  <StackHeader
    title="Import Data"
    leftIconName="arrowhead-down-outline"
    {...props}
  />
);

export const Settings = () => (
  <Navigator screenOptions={{headerShown: false}}>
    <Screen name="Settings Main" component={SettingsScreen} />
    <Screen
      name="Network Select"
      component={NetworkSelectScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        header: NetworkSelectHeader,
      }}
    />
    <Screen
      name="Export Keyphrase"
      component={ExportKeyphraseScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        header: ExportKeyphraseHeader,
      }}
    />
    <Screen
      name="Import Data"
      component={ImportDataScreen}
      options={{
        headerShown: true,
        presentation: 'modal',
        header: ImportDataHeader,
      }}
    />
  </Navigator>
);
