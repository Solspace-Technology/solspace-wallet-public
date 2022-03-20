import {ScreenBase} from '../../components/Common';
import {Button, Spinner, Text, Tooltip} from '@ui-kitten/components';

import {useAppState} from '../../providers/appState-context';
import {decryptData} from '../../modules/security';
import {Alert, TouchableWithoutFeedback, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

export function ExportKeyphraseScreen() {
  const {state: appState, dispatch: appStateDispatch} = useAppState();

  const [keyphrase, setKeyphrase] = React.useState();
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  async function getKeyphrase() {
    try {
      let encryptedSeedPhrase = appState?.encryptedSeedPhrase;
      let decryptedSeedPhrase = await decryptData(encryptedSeedPhrase);
      setKeyphrase(decryptedSeedPhrase);
    } catch (error) {
      console.log('Unable to get keychain data', error);
    }
  }

  function copyToClipboard() {
    if (keyphrase) {
      Clipboard.setString(keyphrase);
      setIsTooltipVisible(true);
    }
  }

  function clearSeedPhrase() {
    Alert.alert(
      'Clear Seed Phrase?',
      'This will delete your seed phrase. Please ensure that you have it backed up somewhere before proceeding',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => appStateDispatch({type: 'CLEAR_SEED_PHRASE'}),
        },
      ],
    );
  }

  React.useEffect(() => {
    getKeyphrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderWalletText = () => (
    <TouchableWithoutFeedback onPress={copyToClipboard}>
      <View>
        <KeyPhraseContainer>
          <KeyphraseText selectable>{keyphrase}</KeyphraseText>
        </KeyPhraseContainer>
        <Text style={{alignSelf: 'center', margin: 15}}>
          Touch the phrase to copy it to your clipboard.
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <Container>
      {keyphrase ? (
        <Tooltip
          anchor={renderWalletText}
          visible={isTooltipVisible}
          placement={'top start'}
          onBackdropPress={() => setIsTooltipVisible(false)}>
          Copied!
        </Tooltip>
      ) : (
        <Spinner size="giant" />
      )}

      <Button size="giant" status="danger" onPress={clearSeedPhrase}>
        Delete Keyphrase
      </Button>
    </Container>
  );
}

const Container = styled(ScreenBase)`
  flex: 1;
  align-items: center;
`;

const KeyphraseText = styled(Text)`
  font-size: 24px;
`;

const KeyPhraseContainer = styled.View`
  padding: 20px 30px;
  margin: 20px;
  border-radius: 10px;
  border: solid white 1px;
`;
