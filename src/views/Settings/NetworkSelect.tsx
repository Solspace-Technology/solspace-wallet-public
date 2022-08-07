import {Button} from '@ui-kitten/components';
import styled from 'styled-components/native';
import {ScreenBase} from '../../components/Common';

import {useAppState} from '../../providers/appState-context';

export function NetworkSelectScreen() {
  const {state: appState, dispatch} = useAppState();

  function onNetworkSelect(payload) {
    dispatch({type: 'UPDATE_NETWORK', payload});
  }

  const networkOptions = appState.settings.find(({name}) => name === 'network');

  return (
    <Container>
      {networkOptions.possibleValues.map((value) => (
        <NetworkButton
          status="info"
          disabled={value === networkOptions.value}
          size="giant"
          appearance="outline"
          key={value}
          onPress={() => onNetworkSelect(value)}>
          {value}
        </NetworkButton>
      ))}
    </Container>
  );
}

const Container = styled(ScreenBase)`
  flex: 1;
  align-items: center;
`;

const NetworkButton = styled(Button)`
  width: 85%;
  margin-bottom: 20px;
`;
