import {Button, Input, Text} from '@ui-kitten/components';
import {ScreenBase} from '../../../components/Common';

import {ThemeVariables} from '../../../styles/themeVariables';

import {encryptData} from '../../../modules/security';
import {getMnemonicPhrase} from '../../../modules/walletGeneration';

// Sub Screens
import {useAppState} from '../../../providers/appState-context';

import React from 'react';
import styled from 'styled-components/native';
import {SaveWalletSubScreen} from './SaveWalletSubScreen';
import {SelectPubkeySubScreen} from './SelectPubkey';

const {colors} = ThemeVariables();

export function CreateNewWalletScreen() {
  const {state: appState, dispatch: appDispatch} = useAppState();

  const [phrase, setPhrase] = React.useState<string | undefined>();
  const [keypair, setKeypair] = React.useState<any>();

  const hasSeedPhrase = !!appState.encryptedSeedPhrase;

  async function generateMnemonic() {
    const result = await getMnemonicPhrase();
    setPhrase(result);
  }

  async function onSavePress() {
    if (phrase) {
      const encrypted = await encryptData(phrase);
      appDispatch({type: 'UPDATE_SEED_PHRASE', payload: encrypted});
      console.log('Encrypted seed phrase saved to App State');
    } else {
      console.log('Error, no phrase');
    }
  }

  React.useEffect(() => {
    generateMnemonic();
  }, []);

  if (keypair) {
    return <SaveWalletSubScreen keypair={keypair} />;
  }

  if (hasSeedPhrase) {
    return <SelectPubkeySubScreen setKeypair={setKeypair} />;
  }
  return (
    <Container noPadding>
      <Text category="h4">Create a new wallet from mnemonic phrase</Text>
      <StyledButton size="giant" onPress={generateMnemonic}>
        Generate new key phrase
      </StyledButton>

      {/* // TODO: create my own component that does this a little better */}
      <WalletPhraseBox
        multiline={true}
        textStyle={{
          minHeight: 128,
          color: colors.font,
          fontSize: 24,
          textAlign: 'justify',
          justifyContent: 'center',
          opacity: 0.7,
        }}
        status="primary"
        disabled
        value={phrase}
      />
      {/* //TODO : Add confirmation of seed being saved here! */}
      <StyledButton size="giant" onPress={onSavePress}>
        Store Phrase
      </StyledButton>
    </Container>
  );
}

export const Container = (props) => (
  <StyledContainer {...props}>{props.children}</StyledContainer>
);

const StyledButton = styled(Button)`
  margin: 10px 0px;
`;

export const StyledContainer = styled(ScreenBase)`
  align-items: center;
`;

const WalletPhraseBox = styled(Input)`
  border: solid 3px ${colors.font};
  margin-top: 10px;
`;
