import {LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Button, Layout, Text} from '@ui-kitten/components';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {ScreenBase} from '../../../components/Common';
import {shortenPubKey} from '../../../modules/utils';

export function ViewStakingAccountScreen(props) {
  console.log('props', props);
  const {
    route: {
      params: {account: accountString, details, info: infoString, lamports},
    },
  } = props;
  const info = JSON.parse(infoString);
  const account = JSON.parse(accountString);

  const validatorName =
    details?.name || shortenPubKey(info?.stake?.delegation?.voter, 6);
  const status = account.data.parsed.type;
  const {rentExemptReserve} = account?.data?.parsed?.info?.meta || {};
  const activeStake = lamports - rentExemptReserve;
  // const rewards = info?.stake?.creditsObserved;

  function roundToFiveDecimals(value: number) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 5,
    });
  }

  return (
    <OuterContainer>
      <InnerContainer>
        <View>
          <Row>
            <View>
              <Text category="h5">{validatorName}</Text>
            </View>
            <View>
              <Text category="h5">{status}</Text>
            </View>
          </Row>
          <Row>
            <View>
              <Text category="h5">Stake Account</Text>
            </View>
            <View>
              <Text category="h5" />
            </View>
          </Row>
          <Row>
            <View>
              <Text category="h5">Balance</Text>
            </View>
            <View>
              <Text category="h5">
                {roundToFiveDecimals(lamports / LAMPORTS_PER_SOL)}
              </Text>
            </View>
          </Row>
          <Row>
            <View>
              <Text category="h5">Rent Reserve</Text>
            </View>
            <View>
              <Text category="h5">
                {roundToFiveDecimals(rentExemptReserve / LAMPORTS_PER_SOL)}
              </Text>
            </View>
          </Row>
          <Row>
            <View>
              <Text category="h5">Active Stake</Text>
            </View>
            <View>
              <Text category="h5">
                {roundToFiveDecimals(activeStake / LAMPORTS_PER_SOL)}
              </Text>
            </View>
          </Row>
          {/* <Row>
            <View>
              <Text category="h5">Rewards</Text>
            </View>
            <View>
              <Text category="h5">
                {roundToFiveDecimals(rewards / LAMPORTS_PER_SOL)}
              </Text>
            </View>
          </Row> */}
        </View>
        <Layout>
          <Button status="danger">Unstake</Button>
        </Layout>
      </InnerContainer>
    </OuterContainer>
  );
}

const Row = styled(Layout)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  margin: 1px 0;
  background: #ffffff20;
  border-radius: 5px;
`;

const InnerContainer = styled(Layout)`
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 20px;
`;

const OuterContainer = styled(ScreenBase)`
  flex: 1;
  height: 100%;
  padding: 0 15px;
`;
