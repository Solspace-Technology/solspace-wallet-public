import {Button, Layout, List, Text, Toggle} from '@ui-kitten/components';
import {Alert} from 'react-native';

import {ListItem, ScreenBase} from '../../components/Common';

import {useNavigation} from '@react-navigation/native';
import {useAppState} from '../../providers/appState-context';
import {useTokensState} from '../../providers/tokens-context';
import {useWallet} from '../../providers/wallet-context';

import {resetEncryptionKey} from '../../modules/security';

import {requestAirdrop} from '../../services/transactions';

import React from 'react';
import styled from 'styled-components/native';
import {logAllStoredData} from '../../modules/utils';

export function SettingsScreen() {
  const {state: appState, dispatch: appStateDispatch} = useAppState();
  const {state: walletState, dispatch: walletStateDispatch} = useWallet();
  const {dispatch: tokenDispatch} = useTokensState();

  const navigation = useNavigation();

  const [isAirdropLoading, setIsAirdropLoading] = React.useState(false);
  const network = appState.settings.find(({name}) => name === 'network').value;

  const canAirdrop = network === 'devnet' || network === 'testnet';

  async function clearApplicationState() {
    //TODO: Add an alert here that warns the user about clearing all app state. Wallets, settings, the whole shebang
    Alert.alert(
      'Clearing All Data',
      'You are about to clear all data stored on this device. This includes all wallet data as well as any settings. This cannot be undone so ensure that you have all of your data backed up somewhere safe.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          onPress: () => {
            appStateDispatch({type: 'CLEAR_ALL_STATE'});
            walletStateDispatch({type: 'CLEAR_ALL_STATE'});
            tokenDispatch({type: 'CLEAR_STATE'});
          },
          style: 'destructive',
        },
      ],
    );
  }

  async function pressClearKeychainData() {
    Alert.alert(
      'Clearing All Data',
      'You are about to clear all data stored in iCloud keychain. This means that any keypairs will no longer be accessible and have to be added again. This cannot be undone so ensure that you have all of your data backed up somewhere safe.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          onPress: clearKeychainData,
          style: 'destructive',
        },
      ],
    );
  }

  async function clearKeychainData() {
    console.log('clearing encryption key');
    resetEncryptionKey();
  }

  async function pressImportData() {
    Alert.alert(
      'Replacing Wallet Data',
      'Warning, this will replace existing wallet data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Load Data',
          onPress: () => {
            navigation.navigate('Import Data' as never);
          },
          style: 'destructive',
        },
      ],
    );
  }

  // Screen specific helper functions
  function updateSettings(settingsItem) {
    const newSettings = appState.settings.map((oldItem) => {
      if (oldItem.name === settingsItem.name) {
        return settingsItem;
      }
      return oldItem;
    });
    appStateDispatch({type: 'UPDATE_SETTINGS', payload: newSettings});
  }

  async function consoleLogStoredState() {
    await logAllStoredData();
  }

  function RenderListItem({item}) {
    if (item.name === 'network') {
      return (
        <ListItem left={item?.label}>
          <Button
            onPress={() => navigation.navigate('Network Select' as never)}
            appearance="outline"
            status="info">
            {item.value}
          </Button>
        </ListItem>
      );
    }

    if (item.type === 'toggle') {
      return (
        <ListItem left={item?.label}>
          {item.type === 'toggle' && (
            <Toggle
              status="info"
              checked={item?.value}
              disabled={item.name === 'darkMode' && !__DEV__}
              onChange={() => updateSettings({...item, value: !item.value})}
            />
          )}
        </ListItem>
      );
    }
    if (item.type === 'button') {
      if (item.name === 'importData') {
        return (
          <ListItem
            center={item?.label}
            outline={item.outline}
            onPress={pressImportData}
          />
        );
      }
      if (item.name === 'clearLocalData') {
        return (
          <ListItem
            center={item?.label}
            outline={item.outline}
            onPress={clearApplicationState}
            //! TAKE OUT
            onLongPress={pressClearKeychainData}
          />
        );
      }
      if (item.name === 'exportKeyphrase' && appState.encryptedSeedPhrase) {
        return (
          <ListItem
            center={item?.label}
            outline={item.outline}
            onPress={() => navigation.navigate('Export Keyphrase' as never)}
          />
        );
      } else if (
        item.name === 'exportKeyphrase' &&
        !appState.encryptedSeedPhrase
      ) {
        return null;
      }
      if (item.name === 'exportAllData' && __DEV__) {
        return (
          <ListItem
            center={item?.label}
            outline={item.outline}
            onPress={consoleLogStoredState}
          />
        );
      }
      return (
        <ListItem
          center={item?.label}
          outline={item.outline}
          onPress={item.onPress}
        />
      );
    }
    return null;
  }

  async function onRequestAirdrop() {
    if (walletState?.activeWallet?.pubKeyString) {
      try {
        setIsAirdropLoading(true);
        const {data, error} = await requestAirdrop(
          walletState.activeWallet.pubKeyString,
          navigation,
          {network},
        );
        setIsAirdropLoading(false);
        console.log('data: ', data);
        console.log('error: ', error);
      } catch (e) {
        setIsAirdropLoading(false);
        console.error(e);
      }
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeading category="h1">Settings</ScreenHeading>
      <InnerContainer>
        <StyledList
          renderItem={({item}: {item: any}) => (
            <RenderListItem item={{...item}} />
          )}
          data={appState.settings}
        />
        {canAirdrop && walletState?.activeWallet?.pubKeyString && (
          <Button
            size="giant"
            style={{margin: 10}}
            disabled={isAirdropLoading}
            onPress={onRequestAirdrop}>
            Request 1 SOL Airdrop
          </Button>
        )}
      </InnerContainer>
    </ScreenContainer>
  );
}

const ScreenHeading = styled(Text)`
  padding: 10px;
`;

const StyledList = styled(List)`
  background-color: none;
`;

const InnerContainer = styled(Layout)`
  /* border: solid 1px red; */
  flex: 1;
  margin: 10px;
  align-self: center;
  width: 100%;
  max-width: 800px;
`;

const ScreenContainer = styled(ScreenBase)`
  justify-content: center;
`;
