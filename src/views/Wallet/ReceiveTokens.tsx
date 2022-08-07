import {Text} from '@ui-kitten/components';
import {ScreenBase, WalletChip} from '../../components/Common';

import {Image, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import styled from 'styled-components/native';
import {useGetCurrentColorScheme} from '../../hooks/useGetCurrentColorScheme';

export function ReceiveTokens({route}) {
  const isDarkMode = useGetCurrentColorScheme() === 'dark';
  return (
    <Container>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Text category="h2">Receiving {route.params.tokenName} </Text>
        <Image
          source={{uri: route.params.tokenLogoURI}}
          style={{width: 40, height: 40}}
        />
      </View>
      <QRContainer>
        <QRCode value={route.params.pubKey} size={250} />
      </QRContainer>
      <WalletChip pubKey={route.params.pubKey} white={isDarkMode} long />
      <WarningText status="danger">
        This address is only intended to receive {route?.params?.tokenSymbol}.
        Sending anything else to this address could mean that it is lost
        forever.
      </WarningText>
    </Container>
  );
}

const Container = styled(ScreenBase)`
  justify-content: flex-start;
  align-items: center;
`;

const QRContainer = styled(View)`
  border: 5px solid #fff;
  border-radius: 5px;
`;

const WarningText = styled(Text)`
  padding: 10px 20px;
  text-align: center;
`;
