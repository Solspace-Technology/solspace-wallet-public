import {Button, Input, Text} from '@ui-kitten/components';
import {Container} from '../CreateNewWallet';

import {Keypair} from '@solana/web3.js';
import React from 'react';
import styled from 'styled-components/native';
import {getKeypairFromSecretKey} from '../../../modules/walletGeneration';
import {SaveWalletSubScreen} from '../CreateNewWallet/SaveWalletSubScreen';

export function RestoreWalletScreen() {
  const [secretKey, setSecretKey] = React.useState<string | undefined>();
  const [error, setError] = React.useState<any>();
  const [keypair, setKeypair] = React.useState<Keypair | undefined>();

  function onVerifyClick() {
    const newKeypair = getKeypairFromSecretKey(secretKey);
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
        onChangeText={(value) => setSecretKey(value)}
        data-private="lipsum"
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
