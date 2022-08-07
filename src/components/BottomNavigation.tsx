import styled from 'styled-components/native';
import {
  BottomNavigationTab,
  BottomNavigation,
  Icon,
  IconProps,
} from '@ui-kitten/components';

const WalletIcon = (props: IconProps) => (
  <StyledIcon {...props} name="flash-outline" />
);
const StylesIcon = (props: IconProps) => (
  <StyledIcon {...props} name="settings-2-outline" />
);
const BrowserIcon = (props: IconProps) => (
  <StyledIcon {...props} name="globe-outline" />
);

export const BottomTabBar = ({
  navigation,
  state,
}: {
  navigation: any;
  state: any;
}) => (
  <StyledBottomNavigation
    selectedIndex={state.index}
    onSelect={(index: number) => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title="Wallet" icon={WalletIcon} />
    <BottomNavigationTab title="Browser" icon={BrowserIcon} />
    <BottomNavigationTab title="Settings" icon={StylesIcon} />
  </StyledBottomNavigation>
);

export default BottomTabBar;

const StyledIcon = styled(Icon)`
  margin-top: 10px;
`;

const StyledBottomNavigation = styled(BottomNavigation)`
  padding-bottom: 40px;
`;
