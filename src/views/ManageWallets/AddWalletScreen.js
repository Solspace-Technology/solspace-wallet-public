import {Layout, Button} from '@ui-kitten/components';

import {useNavigation} from '@react-navigation/core';

export function AddWalletScreen() {
  const navigation = useNavigation();

  return (
    <Container>
      <ButtonContainer>
        <WalletButton onPress={() => navigation.push('Connect Ledger')}>
          Connect a Ledger
        </WalletButton>
        <WalletButton onPress={() => navigation.push('Create Wallet')}>
          Create wallet (Add from mnemonic)
        </WalletButton>
        <WalletButton onPress={() => navigation.push('Restore Wallet')}>
          Restore from secret key
        </WalletButton>
        <WalletButton onPress={() => navigation.push('Restore Mnemonic')}>
          Restore a mnemonic phrase
        </WalletButton>
        <WalletButton onPress={() => navigation.push('Add Public Key')}>
          Add a Public Key
        </WalletButton>
      </ButtonContainer>
    </Container>
  );
}
const ButtonContainer = styled(Layout)`
  flex: 1;
  align-items: center;
`;

const StyledButton = styled(Button)`
  margin: 15px 25px;
  padding: 25px 10px;
  align-self: stretch;
`;

const WalletButton = props => (
  <StyledButton
    {...props}
    size="giant"
    appearance="outline"
    status={props.status ? props.status : 'info'}>
    {props.children}
  </StyledButton>
);

const Container = styled(Layout)`
  flex: 1;
  justify-content: flex-start;
  align-items: stretch;
`;
