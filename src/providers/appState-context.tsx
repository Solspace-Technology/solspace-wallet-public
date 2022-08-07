// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import React from 'react';
import {setStoredData} from '../modules/utils';

export const defaultState = {
  activeWallet: undefined,
  encryptedSeedPhrase: undefined,
  settings: [
    {
      name: 'network',
      label: 'Select Network',
      type: 'select',
      value: 'mainnet-beta',
      possibleValues: ['mainnet-beta', 'devnet', 'testnet'],
    },
    {
      name: 'darkMode',
      label: 'Use Dark Mode',
      type: 'toggle',
      value: true,
    },
    {
      name: 'showZeroBalances',
      label: 'Show Accounts with Zero Balances',
      type: 'toggle',
      value: false,
    },
    {
      name: 'showUnnamedTokens',
      label: 'Show SPL Tokens without names.',
      type: 'toggle',
      value: false,
    },
    {
      name: 'exportKeyphrase',
      label: 'View and copy your BIP39 keyphrase',
      type: 'button',
      outline: 'warning',
      // Somehow point to the function here...
      onPress: () => console.log('exportKeyphrase'),
    },
    {
      name: 'clearLocalData',
      label: 'Clear all stored local data',
      type: 'button',
      outline: 'danger',
      // Somehow point to the function here...
      onPress: () => console.log('clear data pressed'),
    },
    {
      name: 'importData',
      label: 'Import data from json object.',
      type: 'button',
      outline: 'success',
      onPress: () => console.log('load data pressed'),
    },
    {
      name: 'exportAllData',
      label: 'Export all data.',
      type: 'button',
      outline: 'danger',
      onPress: () => console.log('load data pressed'),
    },
  ],
};

const AppStateContext = React.createContext<any>();

async function storeState(state: any) {
  const value = JSON.stringify(state);
  setStoredData({key: '@appState', value});
}

function appStateReducer(state: any, action: any) {
  switch (action.type) {
    case 'CLEAR_SEED_PHRASE': {
      const newState = {...state, encryptedSeedPhrase: undefined};
      storeState(newState);
      return newState;
    }
    case 'UPDATE_SEED_PHRASE': {
      const newState = {...state, encryptedSeedPhrase: action.payload};
      storeState(newState);
      return newState;
    }
    case 'UPDATE_NETWORK': {
      const newState = {
        ...state,
        settings: [
          ...state.settings.filter(
            ({name}: {name: string}) => name !== 'network',
          ),
        ],
      };
      newState.settings.unshift({
        name: 'network',
        label: 'Select Network',
        type: 'select',
        value: action.payload,
        possibleValues: ['mainnet-beta', 'devnet', 'testnet'],
      });
      storeState(newState);
      return newState;
    }
    case 'UPDATE_SETTINGS': {
      //Todo: if updating network setting clear the token_holdings
      const newState = {...state, settings: action.payload};
      storeState(newState);
      return newState;
    }
    case 'CLEAR_ALL_STATE': {
      storeState(defaultState);
      return defaultState;
    }
    case 'RESTORE_STATE': {
      return {...action.payload};
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function AppStateProvider({children}: React.PropsWithChildren) {
  const [state, dispatch] = React.useReducer(appStateReducer, defaultState);

  const value = {state, dispatch};
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

function useAppState() {
  const context = React.useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export {AppStateProvider, useAppState};
