import {Text} from '@ui-kitten/components';

import {ScreenBase} from '../../../components/Common';
import {NFTInfo} from './NFTInfo';

import {QueryClient, QueryClientProvider} from 'react-query';
const queryClient = new QueryClient();

export function ViewNFT({route, navigation}) {
  console.log(route.params);
  let {name, uri} = route?.params?.data;

  return (
    <QueryClientProvider client={queryClient}>
      <Container noPadding>
        <Text category="h4">{name}</Text>
        <NFTInfo uri={uri} />
      </Container>
    </QueryClientProvider>
  );
}

const Container = styled(ScreenBase)`
  align-items: center;
`;
