import {Container} from '../CreateNewWallet';
import {Text, Button, Input} from '@ui-kitten/components';

import {getKeypairFromSecretKey} from '../../../modules/walletGeneration';
import {AddWalletScreen} from '../AddWalletScreen';
import {SaveWalletSubScreen} from '../CreateNewWallet/SaveWalletSubScreen';

export function RestoreWalletScreen() {
  const [secretKey, setSecretKey] = React.useState();
  const [error, setError] = React.useState();
  const [keypair, setKeypair] = React.useState();

  function onVerifyClick() {
    let newKeypair = getKeypairFromSecretKey(secretKey);
    if (newKeypair) {
      setKeypair(newKeypair);
    } else {
      setError(true);
    }
  }

  if (keypair) {
    return <SaveWalletSubScreen keypair={keypair} />;
  }

  return (
    <Container noPadding>
      <StyledText category="h5">
        Restore an existing wallet from an exported secret key.
      </StyledText>
      <StyledText category="c1">
        Secret keys are intended to be Base 58 encoded. Please ensure that the
        key you are trying to import is this format.
      </StyledText>

      <Input
        status={error ? 'danger' : 'primary'}
        size="large"
        value={secretKey}
        onChangeText={value => setSecretKey(value)}
      />
      {error && (
        <StyledText category="c1" status="danger">
          Incorrect secret key provided. Please ensure that your key is Base 58
          encoded.
        </StyledText>
      )}
      <StyledButton size="giant" onPress={onVerifyClick}>
        Verify and Add
      </StyledButton>
    </Container>
  );
}

const StyledText = styled(Text)`
  text-align: center;
  margin: 10px;
`;
const StyledButton = styled(Button)`
  margin: 10px;
`;
