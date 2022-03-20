import {ScreenBase} from '../../components/Common';
import {Button, Icon, Text} from '@ui-kitten/components';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useGetCurrentColorScheme} from '../../hooks/useGetCurrentColorScheme';

// Providers
import {useWallet} from '../../providers/wallet-context';

// Modules
import {shortenPubKey} from '../../modules/utils';
import {useTokensState} from '../../providers/tokens-context';
import {ThemeVariables} from '../../styles/themeVariables';

export function ChooseWalletScreen() {
  const navigation = useNavigation();
  const isDarkMode = useGetCurrentColorScheme() === 'dark';
  const iconRef = React.useRef();

  const {state: walletState, dispatch} = useWallet();
  const {dispatch: tokenDispatch} = useTokensState();
  // console.log(walletState);

  function setActiveWallet(wallet) {
    dispatch({type: 'SET_ACTIVE_WALLET', payload: wallet.id});
  }

  React.useEffect(() => {
    if (iconRef?.current?.startAnimation) {
      iconRef.current.startAnimation();
    }
  }, []);

  const walletTypeLabels = [
    {label: '(Ledger)', value: 'ledger'},
    {label: '(Local Keypair)', value: 'keypair'},
    {label: '(Public Key)', value: 'publickey'},
  ];

  return (
    <ScreenBase noPadding>
      {/* //Todo: If no wallets are available, then don't even show this view */}
      <Text style={{alignSelf: 'center', margin: 5}} category="c1">
        (Long press to edit)
      </Text>
      <View style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {walletState?.wallets &&
            walletState.wallets.map(wallet => (
              <StyledWalletItem
                isDarkMode={isDarkMode}
                color="info"
                active={wallet.active}
                key={JSON.stringify(wallet)}
                onPress={() => {
                  if (!wallet.active) {
                    tokenDispatch({type: 'CLEAR_STATE'});
                    setActiveWallet(wallet);
                    navigation.goBack();
                  }
                }}
                onLongPress={() => navigation.navigate('Edit Wallet', wallet)}>
                <>
                  <Row>
                    <DarkText category="h4" style={{marginBottom: 0}}>
                      {wallet.name}
                    </DarkText>
                    {wallet.active && (
                      <Row
                        style={{
                          marginLeft: 5,
                          top: 0,
                          right: -5,
                        }}>
                        <DarkText category="s1">Active</DarkText>
                        <Icon
                          name="star"
                          animationConfig={{cycles: 'infinity', duration: 1000}}
                          animation="pulse"
                          width={20}
                          height={20}
                          fill={colors.info}
                          style={{marginLeft: 7, marginRight: 7}}
                          ref={iconRef}
                        />
                      </Row>
                    )}
                  </Row>
                  <DarkText category="c1" style={{marginBottom: 7}}>
                    {walletTypeLabels.find(item => item.value === wallet.type)
                      ?.label || 'Error'}
                  </DarkText>
                  <DarkText category="p1">
                    {shortenPubKey(wallet.pubKeyString, 12)}
                  </DarkText>
                </>
              </StyledWalletItem>
            ))}
        </ScrollView>
      </View>

      <AddWalletButton
        status="primary"
        onPress={() => navigation.push('Add Wallet')}
        size="giant"
        accessoryLeft={
          <Icon name="plus-circle-outline" width={40} height={40} />
        }>
        Add SOL Wallet
      </AddWalletButton>
    </ScreenBase>
  );
}

const {colors} = ThemeVariables();

const DarkText = props => <StyledText {...props}>{props.children}</StyledText>;

const StyledText = styled(Text)`
  color: #fff;
`;

const StyledWalletItem = styled(Pressable)`
  margin: 5px 10px;
  padding: 7px 15px;
  border-radius: 10px;
  background-color: ${colors.itemBackground};
  border: solid 1px ${colors.font + '66'};
`;

const AddWalletButton = styled(Button)`
  margin: 10px;
  border: solid 3px ${colors.font};
`;

const Row = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
