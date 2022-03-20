import {getStakingAccounts} from '../services/staking';
import {useWallet} from '../providers/wallet-context';
import {useAppState} from '../providers/appState-context';
import {ListItem} from './Common';
import {Text, Layout, Spinner, Icon} from '@ui-kitten/components';
import {ThemeVariables} from '../styles/themeVariables';
import {LayoutAnimation, TouchableOpacity} from 'react-native';

import {useNavigation} from '@react-navigation/native';

const {colors} = ThemeVariables();

export function StakeAccountsButton() {
  const {
    state: {
      activeWallet: {pubKeyString},
    },
    dispatch: walletDispatch,
  } = useWallet();
  const {
    state: {settings},
  } = useAppState();
  const navigation = useNavigation();
  let network = settings.find(item => item.name === 'network')?.value;

  const [isStakingLoading, setIsStakingLoading] = React.useState(true);
  const [stakeAccounts, setStakeAccounts] = React.useState();

  React.useEffect(() => {
    setStakeAccounts();
  }, [pubKeyString]);

  React.useEffect(() => {
    const getStakingAccountsAsync = async () => {
      setIsStakingLoading(true);
      const newStakeAccounts = await getStakingAccounts(pubKeyString, {
        network: network,
      });
      if (!newStakeAccounts.error) {
        setStakeAccounts(newStakeAccounts.stakeAccounts);
        walletDispatch({
          type: 'SET_STAKE_ACCOUNTS',
          payload: newStakeAccounts.stakeAccounts,
        });
      } else {
        console.log(newStakeAccounts.error);
      }
      setIsStakingLoading(false);
    };
    getStakingAccountsAsync();
  }, [pubKeyString, network, walletDispatch]);

  return (
    <StakeAccountsItem
      disabled={!stakeAccounts}
      onPress={() =>
        navigation.navigate('Staking Accounts', {
          stakeAccounts: JSON.stringify(stakeAccounts),
        })
      }>
      {isStakingLoading ? (
        <Spinner size="medium" status="info" />
      ) : (
        <Icon
          name="star"
          style={{
            width: 25,
            height: 25,
          }}
          fill={colors.info}
        />
      )}
      <Text category="h5">
        Stake Accounts {stakeAccounts && '(' + stakeAccounts.length + ')'}{' '}
        {!stakeAccounts && !isStakingLoading && '( ! )'}
      </Text>
    </StakeAccountsItem>
  );
}

const StakeAccountsItem = styled(TouchableOpacity)`
  margin: 15px 10px;
  margin-bottom: 0;
  padding: 20px;
  background-color: ${colors.itemBackground};
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;
