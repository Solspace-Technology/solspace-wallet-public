import {ScreenBase} from '../../../components/Common';
import {Text, Button, Input} from '@ui-kitten/components';

import {ThemeVariables} from '../../../styles/themeVariables';

import {getMnemonicPhrase} from '../../../modules/walletGeneration';
import {encryptData} from '../../../modules/security';

// Sub Screens
import {useAppState} from '../../../providers/appState-context';

import {SelectPubkeySubScreen} from './SelectPubkey';
import {SaveWalletSubScreen} from './SaveWalletSubScreen';

const {colors} = ThemeVariables();

export function CreateNewWalletScreen() {
  const {state: appState, dispatch: appDispatch} = useAppState();

  const [phrase, setPhrase] = React.useState();
  const [keypair, setKeypair] = React.useState();

  const hasSeedPhrase = !!appState.encryptedSeedPhrase;

  async function generateMnemonic() {
    let result = await getMnemonicPhrase();
    setPhrase(result);
  }

  async function onSavePress() {
    if (phrase) {
      let encrypted = await encryptData(phrase);
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
        // eslint-disable-next-line react-native/no-inline-styles
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

export const Container = props => (
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
