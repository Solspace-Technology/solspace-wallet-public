import {
  Button,
  ButtonGroup,
  Text,
  Icon,
  Card,
  Layout,
} from '@ui-kitten/components';

import {
  ScreenBase,
  ColorCard,
  WalletChip,
  LightText,
} from '../../components/Common';
import {View} from 'react-native';

import {USDFormatter} from '../../modules/utils';
import {ThemeVariables} from '../../styles/themeVariables';

import {TokenPriceInfo} from '../../components/TokenPriceInfo';
import {ScrollView} from 'react-native-gesture-handler';
import {useTokensState} from '../../providers/tokens-context';
import {useWallet} from '../../providers/wallet-context';
import {StakeAccountsButton} from '../../components/StakeAccountsButton';

const {colors} = ThemeVariables();

export function ViewTokens({route, navigation}) {
  const {state: tokenState} = useTokensState();
  const {
    state: {
      activeWallet: {type: walletType},
    },
  } = useWallet();
  if (route?.params?.tokenHoldings) {
    const {tokenPriceInfo, tokenPriceUSD, tokenMint, tokenName} = route.params;

    const pubKey = route?.params?.pubKey;

    let tokenHoldings = tokenState.SPLTokens.find(
      item => item.mintKey === tokenMint,
    )?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;

    if (!tokenHoldings && tokenName === 'Solana') {
      tokenHoldings = tokenState.SPLTokens.find(
        item => item.tokenInfo?.name === 'Solana',
      )?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    }

    let tokenTotalValue = USDFormatter.format(tokenHoldings * tokenPriceUSD);

    function onSendPress() {
      navigation.navigate('Send Tokens', {...route.params});
    }

    function onReceivePress() {
      navigation.navigate('Receive Tokens', {...route.params});
    }

    return (
      <Container>
        <Layout style={{flex: 1}}>
          <ScrollView>
            <MainCard color="info">
              <CardRow>
                <Text category="p1" style={{marginBottom: 5}}>
                  {tokenName} Balance
                  {tokenPriceUSD &&
                    `: $${tokenPriceUSD?.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}`}
                </Text>
              </CardRow>
              <HoldingsText category="h4" style={{marginBottom: 10}}>
                {tokenHoldings &&
                  tokenHoldings?.toLocaleString(undefined, {
                    maximumFractionDigits: 9,
                  })}
              </HoldingsText>
              {tokenTotalValue && tokenTotalValue !== '$NaN' && (
                <CardRow>
                  <ValueText>({tokenTotalValue})</ValueText>
                </CardRow>
              )}
              {tokenMint && (
                <>
                  <Text
                    category="c1"
                    style={{alignSelf: 'center', marginTop: 5}}>
                    Mint Address:
                  </Text>
                  <View style={{alignItems: 'center'}}>
                    <WalletChip pubKey={tokenMint} keyLength="full" small />
                  </View>
                </>
              )}
            </MainCard>
            <ButtonContainer>
              <StyledButton
                size="giant"
                disabled={walletType && walletType === 'publickey'}
                accessoryLeft={<Icon name="arrow-circle-up-outline" />}
                onPress={onSendPress}>
                Send
              </StyledButton>
              <StyledButton
                size="giant"
                accessoryRight={<Icon name="arrow-circle-down-outline" />}
                onPress={onReceivePress}>
                Receive
              </StyledButton>
            </ButtonContainer>

            {/* //*Staking! */}
            {tokenName.toLowerCase() === 'solana' && <StakeAccountsButton />}
            {tokenPriceInfo ? (
              <>
                <TransactionsHeading category="h5">
                  Price Changes:
                </TransactionsHeading>
                <TokenPriceInfo tokenPriceInfo={tokenPriceInfo} />
              </>
            ) : (
              <>
                <TransactionsHeading category="h5">
                  Recent Transactions:
                </TransactionsHeading>
                <Text>Coming soon...</Text>
              </>
            )}
          </ScrollView>
        </Layout>
      </Container>
    );
  }
  return (
    <Container>
      <Text category="h1">Tokens Error</Text>
    </Container>
  );
}

const ButtonContainer = styled(Layout)`
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-evenly;
`;

const StyledButton = styled(Button)`
margin-top: 10px
  border-radius: 5px;
  min-width: 150px;
`;

export const MainCard = styled(ColorCard)`
  background-color: ${colors.itemBackground};
  border: solid 1px ${colors.primary};
`;

const HoldingsText = styled(Text)`
  align-self: center;
  font-size: 42px;
  font-weight: 400;
`;
const ValueText = styled(Text)`
  margin-top: -10px;
  align-self: center;
  font-size: 36px;
  font-weight: 300;
`;

const CardRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const TransactionsHeading = styled(Text)`
  padding-top: 20px;
  align-self: center;
  margin: 20px 20px;
`;

const Container = styled(ScreenBase)`
  padding: 0px 10px;
`;
