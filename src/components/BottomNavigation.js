import {
  BottomNavigationTab,
  BottomNavigation,
  Icon,
} from '@ui-kitten/components';

const WalletIcon = props => <StyledIcon {...props} name="flash-outline" />;
const SwapIcon = props => <StyledIcon {...props} name="swap-outline" />;
const StylesIcon = props => <StyledIcon {...props} name="settings-2-outline" />;
const BrowserIcon = props => <StyledIcon {...props} name="globe-outline" />;

export const BottomTabBar = ({navigation, state}) => (
  <StyledBottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}>
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
