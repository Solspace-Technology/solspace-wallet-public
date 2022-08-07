import {Text} from '@ui-kitten/components';

import {ScreenBase} from '../../../components/Common';
import {NFTInfo} from './NFTInfo';

import {QueryClient, QueryClientProvider} from 'react-query';
import styled from 'styled-components/native';
const queryClient = new QueryClient();

export function ViewNFT({route}) {
  const {name, uri} = route?.params?.data;

  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        <Text category="h4">{name}</Text>
        <NFTInfo uri={uri} />
      </Container>
    </QueryClientProvider>
  );
}

const Container = styled(ScreenBase)`
  align-items: center;
`;
