import {LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Button, Icon, Layout, Spinner, Text} from '@ui-kitten/components';
import React from 'react';
import {
  Image,
  LayoutAnimation,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import {ScreenBase} from '../../components/Common';
import {shortenPubKey} from '../../modules/utils';

import {useWallet} from '../../providers/wallet-context';
import {getValidatorDetails} from '../../services/staking';
import {ThemeVariables} from '../../styles/themeVariables';

const {colors} = ThemeVariables();

export function StakingAccountsScreen({navigation}) {
  const {
    state: {
      activeWallet: {stakeAccounts},
    },
  } = useWallet();

  const [stakeDetails, setStakeDetails] = React.useState(stakeAccounts);
  const [validatorError, setValidatorError] = React.useState(null);

  React.useEffect(() => {
    async function startGetValidatorDetails() {
      try {
        const validatorDetail = await getValidatorDetails(stakeAccounts);
        if (validatorDetail.error) {
          throw new Error(validatorDetail.error);
        }
        setValidatorError(null);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (!validatorDetail.error) {
          setStakeDetails(validatorDetail.validators);
        }
        console.log('validatorDetail', validatorDetail);
      } catch (e) {
        setValidatorError(e);
      }
    }
    startGetValidatorDetails();
  }, [stakeAccounts]);

  if (!stakeAccounts) {
    navigation.goBack();
    return null;
  }

  console.log(stakeDetails);

  return (
    <Container>
      <ScrollView>
        <Button
          size="giant"
          accessoryLeft={<Icon name="plus-circle-outline" />}
          status="info"
          style={{marginLeft: 10, marginRight: 10}}>
          Stake SOL
        </Button>
        {/* <Input
          status="info"
          placeholder="Find Staking Account"
          accessoryLeft={<Icon name="search" style={{height: 20, width: 20}} />}
        /> */}
        {stakeDetails &&
          stakeDetails.map(({account, details}, index) => {
            const {
              lamports,
              data: {
                parsed: {info},
              },
            } = account;
            const tokenAmount = lamports / LAMPORTS_PER_SOL;

            return (
              <StakeAccountItem
                key={index}
                onPress={() =>
                  navigation.navigate('View Stake Account', {
                    details,
                    account: JSON.stringify(account),
                    lamports,
                    info: JSON.stringify(info),
                  })
                }>
                {details ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'inherit',
                    }}>
                    {details?.avatar_url && (
                      <ImageContainer>
                        <Image
                          source={{uri: details.avatar_url}}
                          style={{
                            height: 50,
                            width: 50,
                            padding: 0,
                            margin: 0,
                          }}
                        />
                      </ImageContainer>
                    )}
                    <Text category="h5">{details?.name}</Text>
                  </View>
                ) : validatorError ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'inherit',
                      minHeight: 32,
                    }}>
                    <Text>
                      {shortenPubKey(info?.stake?.delegation?.voter, 6)}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'inherit',
                    }}>
                    <ImageContainer style={{backgroundColor: 'inherit'}}>
                      <Spinner size="giant" />
                    </ImageContainer>
                    <Text>
                      {shortenPubKey(info?.stake?.delegation?.voter, 5)}
                    </Text>
                  </View>
                )}

                <Text category="h6">{tokenAmount} SOL</Text>
              </StakeAccountItem>
            );
          })}
      </ScrollView>
    </Container>
  );
}

const ImageContainer = styled(Layout)`
  border-radius: 50px;
  overflow: hidden;
  margin-right: 10px;
  max-height: 50px;
`;

const Container = styled(ScreenBase)`
  flex: 1;
  padding: 0 15px;
  justify-content: center;
`;

const StakeAccountItem = styled(TouchableOpacity)`
  margin: 15px 10px;
  margin-bottom: 0;
  padding: 10px 15px;
  background-color: ${colors.itemBackground};
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
