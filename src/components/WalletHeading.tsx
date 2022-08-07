import React from 'react';
import styled from 'styled-components/native';
import {Layout, Spinner, Text} from '@ui-kitten/components';

import {useTokensState} from '../providers/tokens-context';
import {useGetCurrentColorScheme} from '../hooks/useGetCurrentColorScheme';

export function WalletHeading() {
  const {state: tokenState} = useTokensState();

  const [totalPortfolioChange, setTotalPortfolioChange] = React.useState<any>({
    content: 0,
    color: 'black',
  });
  const isDarkMode = useGetCurrentColorScheme() === 'dark';

  React.useEffect(() => {
    const newChange = tokenState.SPLTokens.reduce((acc: number, curr: any) => {
      if (
        curr?.shallowPriceInfo?.usd_24h_change &&
        curr?.account?.data?.parsed?.info?.tokenAmount?.uiAmount &&
        curr?.shallowPriceInfo?.usd
      ) {
        const tokenHoldings =
          curr?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        const tokenPriceUSD = curr?.shallowPriceInfo?.usd;
        const USDChange24h = curr?.shallowPriceInfo?.usd_24h_change;
        const portfolioChange =
          (USDChange24h / 100) * tokenPriceUSD * tokenHoldings;
        acc += portfolioChange;
      }

      return acc;
    }, 0).toFixed(2);

    let changeString: string;
    let color: string;

    if (newChange > 0) {
      changeString = '+$' + newChange;
      color = 'green';
    } else if (newChange < 0) {
      changeString = '-$' + newChange.substring(1);
      color = 'red';
    } else {
      changeString = '$' + newChange;
      color = 'white';
    }

    setTotalPortfolioChange({content: changeString, color});
  }, [tokenState.SPLTokens.length]);

  return (
    <MainCard color="info" isDarkMode={isDarkMode}>
      {tokenState.SPLTokens.length === 0 && tokenState.isSPLTokensLoading ? (
        <Spinner size="giant" />
      ) : (
        <>
          <CardRow>
            {tokenState?.totalTokenValueUSD ? (
              <MainCardText
                category="h1"
                adjustsFontSizeToFit
                numberOfLines={1}>
                {tokenState?.totalTokenValueUSD
                  ? tokenState?.totalTokenValueUSD.toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    })
                  : 'Balance Unavailable'}
              </MainCardText>
            ) : (
              <Text category="h4">Balance Unavailable</Text>
            )}
          </CardRow>
          <CardRow>
            <ChangeText color={totalPortfolioChange.color}>
              ({totalPortfolioChange.content})
            </ChangeText>
          </CardRow>
        </>
      )}
    </MainCard>
  );
}

const MainCard = styled(Layout)<{isDarkMode: boolean; color: string}>`
  min-height: 130px;
  margin: 10px 20px;
  border-radius: 10px;
  padding: 5px 25px;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => (props.isDarkMode ? '#ffffff50' : '#00000050')};
  background-color: ${(props) =>
    props.isDarkMode ? '#ffffff15' : '#00000015'};
`;

const MainCardText = styled(Text)`
  margin-bottom: 0;
  font-size: 72px;
  font-weight: 600;
`;

const ChangeText = styled(Text)<{color: string}>`
  color: ${(props) => props.color};
  margin-top: -15px;
  margin-bottom: 0;
  font-size: 32px;
  font-weight: 400;
`;

const CardRow = styled(Layout)`
  background-color: inherit;
  flex-direction: row;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 5px 0px;
  padding-bottom: 10px;
`;
