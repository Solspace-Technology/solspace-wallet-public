import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';

import {AddPublicKeyScreen} from './AddPublicKeyScreen';
import {AddWalletScreen} from './AddWalletScreen';
import {ChooseWalletScreen} from './ChooseWalletScreen';
import {ConnectLedgerScreen} from './ConnectLedgerScreen';
import {CreateNewWalletScreen} from './CreateNewWallet';
import {EditWalletScreen} from './getSolanaAddress';
import {RestoreMnemonicScreen} from './RestoreMnemonic';
import {RestoreWalletScreen} from './RestoreWallet';

import {StackHeader} from '../../components/Common';

const {Navigator, Screen} = createNativeStackNavigator();

const AddWalletHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Add New Wallet'} />
);
const CreateWalletHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Create Wallet'} />
);
const RestoreWalletHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Restore Wallet'} />
);
const RestoreMnemonicHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Restore Mnemonic'} />
);
const ConnectLedgerHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Connect Ledger'} />
);
const AddPublicKeyHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Add Public Key'} />
);
const EditWalletHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} title={'Edit Wallet'} />
);

export function ManageWalletsScreen() {
  return (
    <Navigator screenOptions={{presentation: 'modal'}}>
      <Screen
        name="Select Wallet"
        component={ChooseWalletScreen}
        options={{headerShown: false}}
      />
      <Screen
        name="Add Wallet"
        component={AddWalletScreen}
        options={{
          header: AddWalletHeader,
        }}
      />
      <Screen
        name="Create Wallet"
        component={CreateNewWalletScreen}
        options={{
          header: CreateWalletHeader,
        }}
      />
      <Screen
        name="Restore Wallet"
        component={RestoreWalletScreen}
        options={{
          header: RestoreWalletHeader,
        }}
      />
      <Screen
        name="Restore Mnemonic"
        component={RestoreMnemonicScreen}
        options={{
          header: RestoreMnemonicHeader,
        }}
      />
      <Screen
        name="Connect Ledger"
        component={ConnectLedgerScreen}
        options={{
          header: ConnectLedgerHeader,
        }}
      />
      <Screen
        name="Add Public Key"
        component={AddPublicKeyScreen}
        options={{
          header: AddPublicKeyHeader,
        }}
      />
      <Screen
        name="Edit Wallet"
        component={EditWalletScreen}
        options={{
          header: EditWalletHeader,
        }}
      />
    </Navigator>
  );
}
