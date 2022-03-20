import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScreenBase} from '../../components/Common';
import {Input, Text, Icon} from '@ui-kitten/components';
import {ThemeVariables} from '../../styles/themeVariables';

import {useSwapTokenState} from '../../providers/swapToken-context';

export function TokenSelectScreen({navigation, route}) {
  const {state, dispatch} = useSwapTokenState();
  let {title, type} = route.params;

  const {inputTokenList, outputTokenList} = state;

  let activeToken;
  let tokens;

  if (type === 'input') {
    activeToken = state.inputToken;
    tokens = inputTokenList;
  }
  if (type === 'output') {
    activeToken = state.outputToken;
    tokens = outputTokenList;
  }

  const [tokensFilter, setTokensFilter] = React.useState('');
  const [tokensToShow, setTokensToShow] = React.useState(tokens);

  function setToken(token) {
    if (type === 'input') {
      dispatch({type: 'UPDATE_INPUT_TOKEN', payload: token});
      navigation.goBack();
    }
    if (type === 'output') {
      dispatch({type: 'UPDATE_OUTPUT_TOKEN', payload: token});
      navigation.goBack();
    }
  }

  React.useEffect(() => {
    if (tokens) {
      let newTokens = tokens.filter(t => {
        if (t?.name?.toLowerCase().includes(tokensFilter.toLowerCase())) {
          return t;
        }
        if (t?.symbol?.toLowerCase().includes(tokensFilter.toLowerCase())) {
          return t;
        }
      });
      setTokensToShow(newTokens);
    }
  }, [tokensFilter, tokens]);

  const renderTokenList = () => (
    <>
      <Input
        style={{marginHorizontal: 50, paddingVertical: 10}}
        autoCorrect={false}
        accessoryRight={<Icon name="search-outline" />}
        size="large"
        status="info"
        value={tokensFilter}
        onChangeText={value => setTokensFilter(value)}
      />
      <ScrollView>
        {tokensToShow?.map(token => (
          <TokenButton key={token.name} onPress={() => setToken(token)}>
            <Text>{token?.name}</Text>
          </TokenButton>
        ))}
      </ScrollView>
    </>
  );

  return (
    <Container noPadding>
      <Text category="h3">{title || 'Select Token'}</Text>
      {activeToken && (
        <>
          <Heading category="s1">Selected Token:</Heading>
          <TokenButton disabled>
            {activeToken?.logoURI && (
              <Image
                source={{uri: activeToken?.logoURI}}
                style={{width: 30, height: 30, marginRight: 15}}
              />
            )}

            <Text>{activeToken?.name}</Text>
          </TokenButton>
        </>
      )}
      <View style={{width: '100%', flex: 1}}>
        <Heading category="s1">Available Tokens:</Heading>
        {/* Only show when there are tokens to show. otherwise show loading spinner */}
        {tokens && typeof tokens === 'object' && renderTokenList()}
        {!tokens && <ActivityIndicator />}
      </View>
    </Container>
  );
}

const {colors} = ThemeVariables();

const Heading = styled(Text)`
  align-self: center;
  margin-top: 30px;
`;

const Container = styled(ScreenBase)`
  flex: 1;
  width: 100%;
  align-items: center;
`;

const TokenButton = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  margin: 3px 50px;
  padding: 10px 50px;
  flex-direction: row;
  background: ${colors.font + 20};
  border-radius: 10px;
`;
