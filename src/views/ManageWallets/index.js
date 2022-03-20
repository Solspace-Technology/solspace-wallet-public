import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Layout, Text} from '@ui-kitten/components';

import {ChooseWalletScreen} from './ChooseWalletScreen';
import {AddWalletScreen} from './AddWalletScreen';
import {CreateNewWalletScreen} from './CreateNewWallet';
import {RestoreWalletScreen} from './RestoreWallet';
import {ConnectLedgerScreen} from './ConnectLedgerScreen';
import {AddPublicKeyScreen} from './AddPublicKeyScreen';
import {EditWalletScreen} from './EditWalletScreen';
import {RestoreMnemonicScreen} from './RestoreMnemonic';

import {StackHeader} from '../../components/Common';

const {Navigator, Screen} = createNativeStackNavigator();

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
          header: props => <StackHeader {...props} title={'Add New Wallet'} />,
        }}
      />
      <Screen
        name="Create Wallet"
        component={CreateNewWalletScreen}
        options={{
          header: props => <StackHeader {...props} title={'Create Wallet'} />,
        }}
      />
      <Screen
        name="Restore Wallet"
        component={RestoreWalletScreen}
        options={{
          header: props => <StackHeader {...props} title={'Restore Wallet'} />,
        }}
      />
      <Screen
        name="Restore Mnemonic"
        component={RestoreMnemonicScreen}
        options={{
          header: props => (
            <StackHeader {...props} title={'Restore Mnemonic'} />
          ),
        }}
      />
      <Screen
        name="Connect Ledger"
        component={ConnectLedgerScreen}
        options={{
          header: props => <StackHeader {...props} title={'Connect Ledger'} />,
        }}
      />
      <Screen
        name="Add Public Key"
        component={AddPublicKeyScreen}
        options={{
          header: props => <StackHeader {...props} title={'Add Public Key'} />,
        }}
      />
      <Screen
        name="Edit Wallet"
        component={EditWalletScreen}
        options={{
          header: props => <StackHeader {...props} title={'Edit Wallet'} />,
        }}
      />
    </Navigator>
  );
}
const Container = styled(Layout)`
  flex: 1;
  align-items: center;
`;
