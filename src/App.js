/* eslint-disable react-hooks/exhaustive-deps */
// App State
import {useWallet} from './providers/wallet-context';
import {
  useAppState,
  defaultState as appDefaultState,
} from './providers/appState-context';

// Theme stuff
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import {default as theme} from './styles/theme.json';
import {default as mapping} from './styles/mapping.json';
import {useGetCurrentColorScheme} from './hooks/useGetCurrentColorScheme';

import Toast from 'react-native-toast-message';
import {toastConfig} from './components/Toast';
import {getStoredData} from './modules/utils';

// Views
import {RootView} from './views/RootView';

function App() {
  const {state: walletState, dispatch: walletDispatch} = useWallet();
  const {dispatch: appStateDispatch} = useAppState();

  let isDarkMode = useGetCurrentColorScheme() === 'dark';

  async function getAndDispatchStoredItem(key, dispatch) {
    let value = await getStoredData(key);
    if (value) {
      console.log('Retrieved localStorage data:', key);
      dispatch({type: 'RESTORE_STATE', payload: JSON.parse(value)});
    }
  }

  async function getAndMergeSettingsState() {
    let storedValueString = await getStoredData('@appState');
    let storedValue = JSON.parse(storedValueString);

    let newSettings = [];
    for (let setting of appDefaultState.settings) {
      let existing = storedValue?.settings?.find(
        item => item.name === setting.name,
      );
      if (existing) {
        newSettings.push(existing);
      } else {
        newSettings.push(setting);
      }
    }
    console.log('Merged and restored localStorage data: @appState');
    appStateDispatch({
      type: 'RESTORE_STATE',
      payload: {...storedValue, settings: newSettings},
    });
  }

  React.useEffect(() => {
    // Update settings with any new items...
    getAndMergeSettingsState();
    getAndDispatchStoredItem('@walletState', walletDispatch);
  }, []);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        customMapping={mapping}
        {...eva}
        theme={isDarkMode ? {...eva.dark, ...theme} : {...eva.light, ...theme}}>
        <RootView />
        <Toast config={toastConfig} />
      </ApplicationProvider>
    </>
  );
}

export default App;
