import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

import {
  Button,
  CheckBox,
  Input,
  Layout,
  List,
  Spinner,
  Text,
} from '@ui-kitten/components';

import {ErrorMessage} from '../../components/Common';

import {useNavigation} from '@react-navigation/core';

import Solana from '@ledgerhq/hw-app-solana';
import {PublicKey} from '@solana/web3.js';
import {useGetBTState} from '../../modules/ledger';
import {useWallet} from '../../providers/wallet-context';

import React from 'react';
import {View} from 'react-native';
import 'react-native-get-random-values';
import styled from 'styled-components/native';
import {v4 as uuid} from 'uuid';

export function ConnectLedgerScreen() {
  const {dispatch} = useWallet();
  // console.log(walletState);

  const {isBTAvail, BTError} = useGetBTState();

  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [deviceList, setDeviceList] = React.useState([]);

  BTError && setError(BTError);

  const DERIVATION_PATHS = [
    "44'/501'",
    "44'/501'/0'",
    "44'/501'/0'/0'",
    "44'/501'/0'/1'",
  ];
  const [derivationPath, setDerivationPath] = React.useState<
    string | undefined
  >();

  const [transport, setTransport] = React.useState<null>(null);

  const [solanaAddress, setSolanaAddress] = React.useState<string | null>(null);
  const [newWalletState, setNewWalletState] = React.useState<any | null>(null);

  const [walletName, setWalletName] = React.useState<string | undefined>();
  const [shouldSetActiveWallet, setShouldSetActiveWallet] =
    React.useState(true);

  const navigation = useNavigation();

  async function updateTransport() {
    try {
      const newTransport = await TransportBLE.open(newWalletState?.device.id);
      console.log('transport created!');
      setTransport(newTransport);
    } catch (e) {
      setError({name: 'Ledger Communication Error', error: e});
      console.log(e);
    }
  }

  React.useEffect(() => {
    if (!newWalletState?.device) {
      TransportBLE.listen({
        complete: (e) => {
          console.log('complete', e);
          setError(null);
          setRefreshing(false);
        },
        next: (e) => {
          if (e.type === 'add') {
            const device = e.descriptor;
            const newItems = deviceList.filter((item) => item.id !== device.id);
            if (deviceList.length === 0) {
              setDeviceList([device]);
            }
            if (newItems) {
              setDeviceList((prevState) => [...prevState, ...newItems]);
            }
          }
        },
        error: (e) => {
          console.log('Error scanning for devices.', e);
          setRefreshing(false);
          setError({name: 'Scanning Devices Error', error: e});
        },
      });
    } else {
      updateTransport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWalletState?.device]);

  if (!isBTAvail) {
    return (
      <Container>
        <Text category="h4">Bluetooth is turned off!</Text>
        <Text category="s1">
          You must enable bluetooth to connect to a Ledger.
        </Text>
      </Container>
    );
  }

  if (isBTAvail && !newWalletState?.device && deviceList.length === 0) {
    return (
      <Container>
        {refreshing ? (
          <StyledHeader category="h5">
            Searching for nearby devices
          </StyledHeader>
        ) : (
          <>
            <StyledHeader category="h5">
              No known Ledger devices found.
            </StyledHeader>
            <StyledMainText category="p1">
              Please make sure your Ledger is turned on and nearby with
              Bluetooth turned on. You must also have the Solana application
              installed and open.
            </StyledMainText>
            <Spinner size="giant" />
          </>
        )}
      </Container>
    );
  }

  if (isBTAvail && !newWalletState?.device && deviceList.length > 0) {
    const renderDevice = ({item}) => (
      <View style={{flex: 1}}>
        <StyledHeader category="h5">
          Select your device to continue:{' '}
        </StyledHeader>
        <StyledButton
          appearance="outline"
          status="basic"
          size="giant"
          onPress={() =>
            setNewWalletState((prevState) => ({...prevState, device: item}))
          }>
          {item?.name}
        </StyledButton>
      </View>
    );
    return (
      <Container>
        <StyledList data={deviceList} renderItem={renderDevice} />
      </Container>
    );
  }
  if (newWalletState?.device && !derivationPath) {
    //TODO: Add some more derivation path guidance here...
    return (
      <>
        <Container>
          <StyledHeader category="h5">
            Connecting to {newWalletState?.device.name}
          </StyledHeader>
          <StyledMainText category="s1">
            Please select the desired derivation path. If you aren't sure choose
            the first option.
          </StyledMainText>
          <Layout style={{flex: 5, width: '100%', alignItems: 'center'}}>
            {DERIVATION_PATHS.map((path) => (
              <StyledButton
                key={path}
                appearance="outline"
                status="basic"
                size="giant"
                onPress={() => setDerivationPath(path)}>
                {path}
              </StyledButton>
            ))}
          </Layout>
        </Container>
      </>
    );
  }
  async function getSolanaAddress() {
    try {
      updateTransport();
      const solana = new Solana(transport);
      const r = await solana.getAddress(derivationPath);
      const solPubKey = new PublicKey(r.address).toString();
      console.log(solPubKey);
      setSolanaAddress(solPubKey);
      const walletToAdd = {
        type: 'ledger',
        // name: 'ADD NAME FIELD',
        pubKeyString: solPubKey,
        device: newWalletState?.device,
        privateKey: undefined,
      };
      setNewWalletState(walletToAdd);
      // dispatch({type: 'SET_ACTIVE_WALLET', payload: newActiveWallet});
      setError(null);
    } catch (e) {
      console.log('error: ', e);
      setError({
        name: 'Error getting Solana PubKey',
        message:
          'Make sure the Solana app is open, then wait a few seconds and try again.',
        error: e,
      });
    }
  }

  if (derivationPath && !newWalletState?.pubKeyString) {
    return (
      <Container>
        <StyledHeader category="h6">Retrieve Solana Account Info</StyledHeader>
        <StyledMainText category="s1">
          Please ensure the Solana app is open.
        </StyledMainText>
        <StyledButton
          appearance="outline"
          status="basic"
          size="giant"
          disabled={!transport}
          onPress={getSolanaAddress}>
          Get Solana Address
        </StyledButton>
        {error && <ErrorMessage error={error} />}
      </Container>
    );
  }

  function saveNewWallet() {
    const newWallet = {
      ...newWalletState,
      name: walletName,
      id: uuid(),
      derivationPath,
    };
    dispatch({
      type: 'ADD_WALLET',
      payload: {...newWallet},
    });
    if (shouldSetActiveWallet) {
      dispatch({
        type: 'SET_ACTIVE_WALLET',
        payload: newWallet.id,
      });
    }
    navigation.navigate('Main' as never);
  }

  return (
    <Container style={{alignItems: 'center', paddingBottom: 100}}>
      <StyledText category="h5">Active Wallet Successfully Updated!</StyledText>
      <StyledText category="s1">Derived Solana Address: </StyledText>
      <StyledText category="p1">{solanaAddress}</StyledText>

      <Input
        placeholder="Wallet Nickname"
        value={walletName}
        onChangeText={(value) => setWalletName(value)}
        status="info"
        size="large"
        style={{marginBottom: 15}}
        label={(props) => (
          <Text {...props}>Create a nickname for this wallet:</Text>
        )}
      />
      <CheckBox
        checked={shouldSetActiveWallet}
        onChange={(nextChecked) => setShouldSetActiveWallet(nextChecked)}
        status="info">
        Set As Active Wallet?
      </CheckBox>
      <StyledButton
        status="success"
        appearance="outline"
        size="giant"
        style={{marginTop: 100}}
        onPress={saveNewWallet}>
        Save & Close
      </StyledButton>
    </Container>
  );
}

const StyledHeader = styled(Text)`
  padding-top: 10px;
  padding-bottom: 30px;
`;

const StyledMainText = styled(Text)`
  padding: 10px 50px;
  padding-bottom: 30px;
`;

const StyledText = styled(Text)`
  margin: 10px;
  margin-bottom: 20px;
`;

const StyledButton = styled(Button)`
  margin-bottom: 10px;
  width: 90%;
`;

const StyledList = styled(List)`
  background-color: none;
  flex: 1;
`;

const Container = styled(Layout)`
  flex: 1;
  align-items: center;
`;
