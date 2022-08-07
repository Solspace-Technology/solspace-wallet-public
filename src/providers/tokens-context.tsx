// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import {useReducerAsync} from 'use-reducer-async';
import {
  getAllTokenAccountBalances,
  getAllSPLTokenPriceInfo,
  getSpecificTokenBalances,
} from '../services/queries';

const TokensContext = React.createContext<any>();

const emptySingleSPLToken = {
  account: undefined,
  tokenInfo: undefined,
};
const emptySingleNFT = {
  account: undefined,
  metadata: undefined,
};

const defaultTokensState = {
  // TODO: add solana separately
  solana: undefined,
  isSPLTokensLoading: false,
  isSPLPriceLoading: false,
  lastPriceUpdate: undefined,
  lastSPLUpdate: undefined,
  totalTokenValueUSD: undefined,
  SPLTokenPrices: [],
  SPLTokens: [],
  NFTs: [],
};

function tokensStateReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_ALL_TOKEN_BALANCES_STARTED': {
      //* Updates all types of tokens balances
      return {...state, isSPLTokensLoading: true};
    }
    case 'UPDATE_ALL_TOKEN_BALANCES_FINISHED': {
      return {
        ...state,
        isSPLTokensLoading: false,
        SPLTokens: action?.data?.SPLTokens,
        lastSPLUpdate: Math.floor(Date.now() / 1000),
        totalTokenValueUSD: action?.data?.totalTokenValueUSD,
        NFTs: action?.data?.NFTs,
      };
    }
    case 'UPDATE_SPECIFIC_TOKENS_STARTED': {
      return {...state};
    }
    case 'UPDATE_SPECIFIC_TOKENS_FINISHED': {
      return {...state, SPLTokens: action?.data?.SPLTokens || state.SPLTokens};
    }
    case 'UPDATE_ALL_SPL_TOKEN_PRICES_START': {
      //* Updates the price info for all SPL tokens
      return {...state, isSPLPriceLoading: true};
    }
    case 'UPDATE_ALL_SPL_TOKEN_PRICES_FINISH': {
      //* Updates the price info for all SPL tokens
      return {
        ...state,
        isSPLPriceLoading: false,
        lastPriceUpdate: Math.floor(Date.now() / 1000),
        totalTokenValueUSD: action.data.totalTokenValueUSD,
        SPLTokenPrices: action.data.SPLTokenPrices,
      };
    }
    case 'UPDATE_ALL_NFT_METADATA': {
      //* Updates metadata for all NFTs
      return {...state};
    }
    // NOT USED...
    case 'RESTORE_TOKEN_STATE': {
      return {...action.payload};
    }
    case 'CLEAR_STATE': {
      //* Clears all state
      return {...defaultTokensState};
    }
    default: {
      console.log(`Unhandled action type: ${action.type}`);
      return {
        ...state,
        name: 'UnhandledActionType',
        message: 'Unhandled action type in tokens context reducer',
        error: null,
      };
    }
  }
}

const asyncActionHandlers = {
  UPDATE_ALL_TOKEN_BALANCES:
    ({dispatch}) =>
    async (action) => {
      dispatch({type: 'UPDATE_ALL_TOKEN_BALANCES_STARTED'});
      const response = await getAllTokenAccountBalances(
        action.payload.pubKeyString,
        action.payload.options,
      );
      dispatch({
        type: 'UPDATE_ALL_TOKEN_BALANCES_FINISHED',
        data: response,
      });
    },
  UPDATE_ALL_SPL_TOKEN_PRICES:
    ({dispatch, getState}) =>
    async (action) => {
      dispatch({type: 'UPDATE_ALL_SPL_TOKEN_PRICES_START'});
      if (
        getState().lastPriceUpdate === undefined ||
        getState().lastPriceUpdate + 60 * 2 < Date.now() / 1000 ||
        action.payload.forceUpdate
      ) {
        console.log('updating price info');
        const response = await getAllSPLTokenPriceInfo(getState().SPLTokens);
        dispatch({type: 'UPDATE_ALL_SPL_TOKEN_PRICES_FINISH', data: response});
      } else {
        console.log('not updating price because of time');
        dispatch({
          type: 'UPDATE_ALL_SPL_TOKEN_PRICES_FINISH',
          data: {
            SPLTokenPrices: getState().SPLTokenPrices,
            totalTokenValueUSD: getState().totalTokenValueUSD,
          },
        });
      }
    },
  UPDATE_SPL_TOKENS_AND_PRICES:
    ({dispatch}) =>
    async (action) => {
      dispatch({type: 'UPDATE_ALL_TOKEN_BALANCES_STARTED'});
      const response = await getAllTokenAccountBalances(
        action.payload.pubKeyString,
        action.payload.options,
      );
      dispatch({
        type: 'UPDATE_ALL_TOKEN_BALANCES_FINISHED',
        data: response,
      });
      dispatch({
        type: 'UPDATE_ALL_SPL_TOKEN_PRICES',
        payload: {
          forceUpdate: action.payload.forceUpdate,
        },
      });
    },
  UPDATE_SPECIFIC_SPL_TOKENS:
    ({dispatch, getState}) =>
    async (action) => {
      dispatch({type: 'UPDATE_SPECIFIC_TOKENS_STARTED'});
      const response = await getSpecificTokenBalances(
        action.payload.pubKeyString,
        action.payload.mintKeyArray,
        getState().SPLTokens,
        action.payload.options,
      );
      dispatch({type: 'UPDATE_SPECIFIC_TOKENS_STARTED', data: response});
    },
};

function TokensProvider({children}) {
  const [state, dispatch] = useReducerAsync(
    tokensStateReducer,
    defaultTokensState,
    asyncActionHandlers,
  );

  const value = {state, dispatch};
  return (
    <TokensContext.Provider value={value}>{children}</TokensContext.Provider>
  );
}

function useTokensState() {
  const context = React.useContext(TokensContext);
  if (context === undefined) {
    throw new Error('useErrorState must be used within an ErrorPRovider');
  }
  return context;
}

export {TokensProvider, useTokensState};
