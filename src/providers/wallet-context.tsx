// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {setStoredData} from '../modules/utils';

const WalletContext = React.createContext<any>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const walletItemState = {
  id: 'uuid',
  active: false,
  type: 'ledger' || 'keypair' || 'publickey',
  name: 'User Name for Wallet',
  pubKeyString: 'publicKeyString',
  derivationPath: 'somePath' || undefined,
  device: 'ledgerInfo ' || undefined,
  // The wallet should be encrypted when stored on the device
  secretKey: 'wallet privateKey' || undefined,
  tokenState: undefined,
  stakeAccounts: [],
};

const defaultState = {
  error: undefined,
  activeWallet: undefined,
  wallets: [],
};

async function storeState(state) {
  const value = JSON.stringify(state);
  setStoredData({key: '@walletState', value});
}

function walletReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DERIVATION_PATH': {
      const newState = {...state, derivationPath: action.payload};
      storeState(newState);
      return newState;
    }
    case 'UPDATE_LEDGER_DEVICE': {
      const newState = {...state, ledgerDevice: action.payload};
      storeState(newState);
      return newState;
    }
    case 'ADD_WALLET': {
      //* Adds a new wallet to the list of wallets, always in the inactive state. Payload is the wallet object
      const newState = {
        ...state,
        wallets: [...state.wallets, {...action.payload, active: false}],
      };
      storeState(newState);
      return newState;
    }
    case 'REMOVE_WALLET': {
      // Removes a wallet and sets the first one as active if there is no other active wallet
      const newWallets = state.wallets.filter(({id}) => id !== action.payload);
      const newState = {
        ...state,
        wallets: newWallets,
      };
      console.log(newState);
      storeState(newState);
      return newState;
    }
    case 'SET_ACTIVE_WALLET': {
      // Take in a walletId, then ensure that all wallets active=false then set this wallet active=true
      const newWalletState = {...state};
      let activeWallet;
      let walletIndex = 0;
      for (const wallet of state.wallets) {
        if (wallet.id === action.payload) {
          // console.log('activeWallet', wallet);
          newWalletState.wallets[walletIndex] = {...wallet, active: true};
          activeWallet = newWalletState.wallets[walletIndex];
        } else {
          newWalletState.wallets[walletIndex] = {...wallet, active: false};
        }
        walletIndex = walletIndex + 1;
      }
      const newState = {...newWalletState, activeWallet};
      storeState(newState);
      return newState;
    }
    case 'SET_STAKE_ACCOUNTS': {
      const newState = {
        ...state,
        activeWallet: {...state.activeWallet, stakeAccounts: action.payload},
      };
      storeState(newState);
      return newState;
    }
    case 'CLEAR_ALL_STATE': {
      storeState(defaultState);
      return defaultState;
    }
    case 'RESTORE_STATE': {
      const newWalletState = {...action.payload};
      storeState(newWalletState);
      return {...action.payload};
    }
    case 'ERROR': {
      return {...state, error: {...action.payload}};
    }
    default: {
      console.error(new Error(`Unhandled action type: ${action.type}`));
      // throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function WalletProvider({children}) {
  const [state, dispatch] = React.useReducer(walletReducer, defaultState);

  const value = {state, dispatch};
  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

function useWallet() {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export {WalletProvider, useWallet};
