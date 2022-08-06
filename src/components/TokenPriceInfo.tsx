import styled from 'styled-components/native';
import React from 'react';

import {Layout, Text} from '@ui-kitten/components';

export function TokenPriceInfo({tokenPriceInfo}: {tokenPriceInfo: any}) {
  const marketDataKeys = [
    'price_change_percentage_24h',
    'price_change_percentage_7d',
    'price_change_percentage_14d',
    'price_change_percentage_30d',
  ];
  return (
    <Layout>
      <TopRow>
        <Text category="h4">24H</Text>
        <Text category="h4">7D</Text>
        <Text category="h4">14D</Text>
        <Text category="h4">30D</Text>
      </TopRow>
      <TableRow>
        <PriceText
          category="s2"
          positive={tokenPriceInfo.market_data[marketDataKeys[0]] > 0}>
          {tokenPriceInfo.market_data[marketDataKeys[0]].toFixed(2)}%
        </PriceText>
        <PriceText
          category="s2"
          positive={tokenPriceInfo.market_data[marketDataKeys[1]] > 0}>
          {tokenPriceInfo.market_data[marketDataKeys[1]].toFixed(2)}%
        </PriceText>
        <PriceText
          category="s2"
          positive={tokenPriceInfo.market_data[marketDataKeys[2]] > 0}>
          {tokenPriceInfo.market_data[marketDataKeys[2]].toFixed(2)}%
        </PriceText>
        <PriceText
          category="s2"
          positive={tokenPriceInfo.market_data[marketDataKeys[3]] > 0}>
          {tokenPriceInfo.market_data[marketDataKeys[3]].toFixed(2)}%
        </PriceText>
      </TableRow>
    </Layout>
  );
}

const PriceText = styled(Text)<{positive: boolean}>`
  color: ${(props) => (props.positive ? 'green' : 'red')};
`;

const TableRow = styled(Layout)`
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border: solid 1px white;
`;

const TopRow = styled(TableRow)`
  border-top-left-radius: 5px;
  border-bottom-width: 0;
`;
