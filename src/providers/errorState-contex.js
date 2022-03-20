const ErrorContext = React.createContext();

const defaultErrorState = {
  name: null,
  message: null,
  error: undefined,
};

function errorStateReducer(state, action) {
  switch (action.type) {
    case 'SET_NEW_ERROR': {
      return {...state, ...action.payload};
    }
    case 'CLEAR_ERROR': {
      return {...state};
    }
    default: {
      console.log(`Unhandled action type: ${action.type}`);
      return {
        ...state,
        name: 'UnhandledActionType',
        message: 'Unhandled action typ in error context reducer',
        error: null,
      };
    }
  }
}

function ErrorProvider({children}) {
  const [state, dispatch] = React.useReducer(
    errorStateReducer,
    defaultErrorState,
  );

  const value = {state, dispatch};
  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

function useErrorState() {
  const context = React.useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorState must be used within an ErrorPRovider');
  }
  return context;
}

export {ErrorProvider, useErrorState};
