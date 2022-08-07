import {Button, Text} from '@ui-kitten/components';
import {ScreenBase} from '../../components/Common';

import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import {encryptData} from '../../modules/security';
import {useTokensState} from '../../providers/tokens-context';
import {useWallet} from '../../providers/wallet-context';

export function ImportDataScreen() {
  const {dispatch: walletDispatch} = useWallet();
  const {dispatch: tokenDispatch} = useTokensState();

  const navigation = useNavigation();

  const [inputState, setInputState] = React.useState<string | undefined>();

  async function onImportPress() {
    const data = JSON.parse(inputState);
    console.log('importing wallet data');
    if (data?.value?.wallets && data?.value?.activeWallet) {
      tokenDispatch({type: 'CLEAR_STATE'});
      walletDispatch({type: 'RESTORE_STATE', payload: data.value});
      // re encrypt secret keys here:
      for (const wallet of data.value.wallets) {
        if (wallet.type === 'keypair') {
          wallet.secretKey = await encryptData(wallet.secretKey);
          console.log(' wallet.secretKey', wallet.secretKey);
        }
      }
      Alert.alert('Success', 'Wallet data imported successfully');
      navigation.goBack();
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <Text>Please paste your @walletState data below:</Text>
            <TextInput
              multiline
              value={inputState}
              onChange={(text) => setInputState(text.nativeEvent.text)}
              style={{
                backgroundColor: '#ffffff90',
                marginBottom: 5,
                height: 100,
                borderRadius: 10,
                padding: 10,
                fontSize: 24,
              }}
            />
            <Button size="giant" status="info" onPress={onImportPress}>
              Import Wallet Data
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  );
}

const Container = styled(ScreenBase)`
  flex: 1;
  align-items: center;
`;
