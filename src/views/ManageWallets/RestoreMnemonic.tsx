import {Button, Input, Text} from '@ui-kitten/components';
import {Container} from './CreateNewWallet';

import {
  Alert,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {getKeypairForMnemonicAndDerivePath} from '../../modules/walletGeneration';
import {useAppState} from '../../providers/appState-context';

import {ScrollView} from 'react-native-gesture-handler';
import {decryptData, encryptData} from '../../modules/security';

import {useNavigation} from '@react-navigation/native';
import React from 'react';
import styled from 'styled-components/native';

export function RestoreMnemonicScreen() {
  const {state: appState, dispatch: dispatchAppState} = useAppState();
  const navigation = useNavigation();

  const [mnemonic, setMnemonic] = React.useState('');
  const [newMnemonic, setNewMnemonic] = React.useState('');

  const [phrasesMatch, setPhrasesMatch] = React.useState(false);

  const [error, setError] = React.useState<boolean | string>(false);

  async function onVerifyClick() {
    setError(false);
    const currentMnemonic = await decryptData(appState.encryptedSeedPhrase);
    console.log(currentMnemonic, mnemonic);
    if (currentMnemonic.toLowerCase() === mnemonic.trim().toLowerCase()) {
      setPhrasesMatch(true);
      console.log(phrasesMatch);
      setMnemonic(undefined);
    } else {
      setError('Mnemonic phrases do not match. Please try again.');
    }
  }

  async function saveNewPhrase() {
    const encryptedSeedPhrase = await encryptData(newMnemonic);
    dispatchAppState({
      type: 'UPDATE_SEED_PHRASE',
      payload: encryptedSeedPhrase,
    });
    Alert.alert(
      'Success',
      'Your new mnemonic phrase has been saved. You can add associated public keys from the manage wallet screen!',
      [
        {
          text: 'Add Wallet',
          onPress: () => navigation.navigate('Add Wallet' as never),
        },
      ],
    );
  }

  async function onSaveClick() {
    const newKeypair = await getKeypairForMnemonicAndDerivePath(
      newMnemonic.trim().toLowerCase(),
    );

    if (!newKeypair) {
      return setError('Invalid mnemonic phrase. Please try again.');
    }

    console.log('save');
    Alert.alert(
      'Saving Mnemonic Phrase',
      'This will overwrite your current mnemonic phrase. You will not be able to retrieve your current mnemonic after doing this. The first public key associated with this new phrase is: \n\n' +
        newKeypair.publicKey.toString(),
      [
        {text: 'Cancel'},
        {text: 'Save New Phrase', style: 'destructive', onPress: saveNewPhrase},
      ],
    );
  }

  if (appState.encryptedSeedPhrase) {
    return (
      <>
        <Container noPadding>
          <KeyboardAvoidingView behavior="padding">
            <ScrollView contentContainerStyle={{paddingBottom: 200}}>
              {error && (
                <Text category="h6" style={{color: 'red', alignSelf: 'center'}}>
                  {error as string}
                </Text>
              )}
              <StyledText category="h5">
                Use an existing mnemonic phrase with this application.
              </StyledText>
              {phrasesMatch ? (
                <>
                  <Text
                    category={'h6'}
                    style={{alignSelf: 'center', color: 'lime'}}>
                    Phrases match!{' '}
                  </Text>
                  <StyledText>
                    Please enter the mnemonic phrase that you would like to use
                    below:
                  </StyledText>
                  <Input
                    inputAccessoryViewID="hide-keyboard"
                    multiline={true}
                    status={error ? 'danger' : 'primary'}
                    size="large"
                    value={newMnemonic}
                    onChangeText={(value) => setNewMnemonic(value)}
                  />
                  <StyledButton size="giant" onPress={onSaveClick}>
                    Save Phrase
                  </StyledButton>
                </>
              ) : (
                <>
                  <StyledText category="p1">
                    Please enter your current mnemonic phrase in order to
                    proceed:
                  </StyledText>

                  <Input
                    inputAccessoryViewID="hide-keyboard"
                    multiline={true}
                    status={error ? 'danger' : 'primary'}
                    size="large"
                    value={mnemonic}
                    onChangeText={(value) => setMnemonic(value)}
                  />
                  <StyledText category="p1">
                    If you already created a mnemonic in Soladex Wallet
                    importing a different phrase will overwrite it. You will
                    still be able to use any existing wallets and export those
                    secret keys, but that phrase will no longer be available.
                  </StyledText>
                  <StyledButton size="giant" onPress={onVerifyClick}>
                    Verify Phrase
                  </StyledButton>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Container>
        <InputAccessoryView nativeID={'hide-keyboard'}>
          <Button
            onPress={() => Keyboard.dismiss()}
            status={'basic'}
            style={{
              width: 100,
            }}>
            <Text>Done</Text>
          </Button>
        </InputAccessoryView>
      </>
    );
  }
}

const StyledText = styled(Text)`
  text-align: center;
  margin: 10px;
`;
const StyledButton = styled(Button)`
  margin: 10px;
`;
