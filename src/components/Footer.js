import {Button, Layout, Text} from '@ui-kitten/components';

export const DrawerFooter = ({children}) => (
  <FooterContainer>
    <Button>Add New Wallet</Button>
  </FooterContainer>
);

const FooterContainer = styled(Layout)`
  /* padding: 20px; */
  justify-content: center;
  align-items: center;
`;
