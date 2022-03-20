const SwapTokenContext = React.createContext();

const defaultSwapTokenState = {
  inputToken: null,
  outputToken: null,
  inputTokenList: null,
  outputTokenList: null,
};

function swapTokenStateReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_INPUT_TOKEN': {
      console.log('updating state');
      return {...state, inputToken: action.payload};
    }
    case 'UPDATE_OUTPUT_TOKEN': {
      return {...state, outputToken: action.payload};
    }
    case 'UPDATE_INPUT_TOKEN_LIST': {
      return {...state, inputTokenList: action.payload};
    }
    case 'UPDATE_OUTPUT_TOKEN_LIST': {
      return {...state, outputTokenList: action.payload};
    }
    case 'CLEAR_STATE': {
      return {...defaultSwapTokenState};
    }
    default: {
      console.log(`Unhandled action type: ${action.type}`);
      return {
        ...state,
        name: 'UnhandledActionType',
        message: 'Unhandled action typ in swapToken context reducer',
        error: null,
      };
    }
  }
}

function SwapTokenProvider({children}) {
  const [state, dispatch] = React.useReducer(
    swapTokenStateReducer,
    defaultSwapTokenState,
  );

  const value = {state, dispatch};
  return (
    <SwapTokenContext.Provider value={value}>
      {children}
    </SwapTokenContext.Provider>
  );
}

function useSwapTokenState() {
  const context = React.useContext(SwapTokenContext);
  if (context === undefined) {
    throw new Error(
      'uswSwapTokenState must be used within a SwapTokenProvider',
    );
  }
  return context;
}

export {SwapTokenProvider, useSwapTokenState};
