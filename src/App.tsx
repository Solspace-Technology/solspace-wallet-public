/* eslint-disable react-hooks/exhaustive-deps */
// App State
import {
  defaultState as appDefaultState,
  useAppState,
} from './providers/appState-context';
import {useWallet} from './providers/wallet-context';

// Theme stuff
import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {useGetCurrentColorScheme} from './hooks/useGetCurrentColorScheme';
import {default as mapping} from './styles/mapping.json';
import {default as theme} from './styles/theme.json';

import Toast from 'react-native-toast-message';
import {toastConfig} from './components/Toast';
import {getStoredData} from './modules/utils';

// Views
import React from 'react';
import {RootView} from './views/RootView';

function App() {
  const {dispatch: walletDispatch} = useWallet();
  const {dispatch: appStateDispatch} = useAppState();
  const [isLoaded, setIsLoaded] = React.useState(false);

  const isDarkMode = useGetCurrentColorScheme() === 'dark';

  async function getAndDispatchStoredItem(key, dispatch) {
    const value = getStoredData(key);
    if (value) {
      console.log('Retrieved localStorage data:', key);
      dispatch({type: 'RESTORE_STATE', payload: JSON.parse(value)});
    }
  }

  async function getAndMergeSettingsState() {
    const storedValueString = getStoredData('@appState');

    if (storedValueString) {
      const storedValue = JSON.parse(storedValueString);
      const newSettings = [];
      for (const setting of appDefaultState.settings) {
        const existing = storedValue?.settings?.find(
          (item) => item.name === setting.name,
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
  }

  React.useEffect(() => {
    // Update settings with any new items...
    getAndMergeSettingsState();
    getAndDispatchStoredItem('@walletState', walletDispatch);
    setIsLoaded(true);
  }, []);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        customMapping={mapping}
        {...eva}
        theme={isDarkMode ? {...eva.dark, ...theme} : {...eva.light, ...theme}}>
        <RootView isLoaded={isLoaded} />
        <Toast config={toastConfig} />
      </ApplicationProvider>
    </>
  );
}

export default App;
