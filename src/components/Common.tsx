import {Button, Card, Icon, Layout, Text, Tooltip} from '@ui-kitten/components';
import {
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import React, {PropsWithChildren} from 'react';
import styled from 'styled-components/native';
import {useGetCurrentColorScheme} from '../hooks/useGetCurrentColorScheme';
import {isFunctionComponent, shortenPubKey} from '../modules/utils';
import {ThemeVariables} from '../styles/themeVariables';
const {colors} = ThemeVariables();

export const ColorCard = styled(Card)<{color?: string}>`
  background-color: ${(props) =>
    colors[props.color as keyof typeof colors] || 'blue'};
  align-self: center;
  width: 95%;
  border-radius: 10px;
  margin-bottom: 10px;
`;

export const CardRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const DarkText = styled.Text`
  color: ${colors.dark};
  margin-bottom: 5px;
`;

export const LightText = styled.Text`
  color: ${colors.light};
  margin-bottom: 10px;
`;

//* Components:
interface ListItemProps extends PropsWithChildren<any> {
  left?: any;
  right?: any;
  center?: any;
  onPress?: () => void;
  outline?: any;
}
export function ListItem(props: ListItemProps) {
  const isDarkMode = useGetCurrentColorScheme() === 'dark';
  const {left, right, center, children} = props;

  if (props.onPress) {
    return (
      <TouchableOpacity onPress={props.onPress && (() => props.onPress())}>
        <StyledListItem outline={props.outline} isDarkMode={isDarkMode}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {isFunctionComponent(left) ? left() : <Text>{left}</Text>}
            {isFunctionComponent(center) ? center() : <Text>{center}</Text>}
            {isFunctionComponent(right) ? right() : <Text>{right}</Text>}
            {children && children}
          </View>
        </StyledListItem>
      </TouchableOpacity>
    );
  }

  return (
    <StyledListItem outline={props.outline} isDarkMode={isDarkMode}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {isFunctionComponent(left) ? (
          left()
        ) : (
          <Text
            style={{
              maxWidth: children && '85%',
            }}>
            {left}
          </Text>
        )}
        {isFunctionComponent(center) ? center() : <Text>{center}</Text>}
        {isFunctionComponent(right) ? right() : <Text>{right}</Text>}
        {children && children}
      </View>
    </StyledListItem>
  );
}

const StyledListItem = styled(View)<{outline?: string; isDarkMode?: boolean}>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  border: ${(props) =>
    props.outline
      ? `solid 1px ${
          colors[props.outline as keyof typeof colors] || colors.primary
        };`
      : 'none'};
  background-color: ${(props) =>
    props.isDarkMode ? '#ffffff15' : '#00000015'};
  margin: 5px 5px;
  padding: 15px 15px;
`;

interface WalletChipProps {
  pubKey: string;
  long?: boolean;
  small?: boolean;
  white?: boolean;
  keyLength?: number | string;
}

export function WalletChip({pubKey, long, small, keyLength}: WalletChipProps) {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
  const isDarkMode = useGetCurrentColorScheme() === 'dark';

  function copyToClipboard(string: string) {
    if (string) {
      Clipboard.setString(string);
      setIsTooltipVisible(true);
    }
  }

  const renderWalletChip = () => (
    <WalletChipButton
      onPress={() => copyToClipboard(pubKey)}
      white={isDarkMode}
      long={long}
      small={small}>
      <WalletChipText white={isDarkMode} long={long} small={small}>
        {keyLength === 'full'
          ? pubKey
          : pubKey
          ? long
            ? pubKey
            : shortenPubKey(pubKey, keyLength as number)
          : 'No Wallet'}

        {long && pubKey && (
          <Icon
            name="copy-outline"
            style={{
              width: small ? 10 : 20,
              height: small ? 10 : 20,
              marginLeft: 8,
            }}
            fill={isDarkMode ? '#fff' : WalletChipColor}
          />
        )}
      </WalletChipText>
      {!long && pubKey && (
        <Icon
          name="copy-outline"
          style={{
            width: small ? 15 : 20,
            height: small ? 15 : 20,
            marginLeft: 8,
          }}
          fill={isDarkMode ? '#fff' : WalletChipColor}
        />
      )}
    </WalletChipButton>
  );
  return (
    //TODO: fix the styling of this here
    <Tooltip
      anchor={renderWalletChip}
      visible={isTooltipVisible}
      placement={'top start'}
      onBackdropPress={() => setIsTooltipVisible(false)}>
      Copied!
    </Tooltip>
  );
}

const WalletChipColor = colors.dark;

const WalletChipText = styled(Text)<{
  white?: boolean;
  long?: boolean;
  small?: boolean;
}>`
  /* font-size: 18px; */
  color: ${(props) => (props.white ? '#fff' : WalletChipColor)};
  font-size: ${(props) => (props.long ? '24px' : '18px')};
  ${(props) => props.small && 'font-size: 12px'};
`;

const WalletChipButton = styled(TouchableOpacity)<{
  white?: boolean;
  long?: boolean;
  small?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  border: 1px solid ${(props) => (props.white ? '#fff' : WalletChipColor)};
  padding: 5px;
  ${(props) => props.small && 'padding: 3px;'};
  margin-top: ${(props) => (props.long ? '20px' : '3px')};
  border-radius: 5px;
  max-width: ${(props) => (props.long ? '85%' : '100%')};
`;

//TODO: Add an alert icon here. For some reason it doesn't work simply
export const ErrorMessage = (props: {error?: any}) => (
  <ErrorContainer>
    <Text status="danger" category="h3">
      {props?.error?.name || 'Unexpected Error'}
      {console.log(props.error.error.message)}
    </Text>
    <Text status="danger" category="s1">
      {props?.error?.message ||
        props?.error?.error?.message ||
        'There should be a more descriptive error here...'}
    </Text>
  </ErrorContainer>
);

const ErrorContainer = styled(Layout)``;

export function StackHeaderWithLogo(props: any) {
  const tokenLogoURI = props?.route?.params?.tokenLogoURI;
  const isLogoSVG = props?.route?.params?.isLogoSVG;
  const tokenSymbol = props?.route?.params?.tokenSymbol;

  return (
    <TokensHeader>
      <Row>
        <TokenHeaderButton
          accessoryLeft={<Icon name="arrow-ios-back-outline" />}
          appearance="ghost"
          size="giant"
          status="basic"
          onPress={props.navigation.goBack}
        />
        <Layout
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}>
          {tokenLogoURI && !isLogoSVG && (
            <Layout style={{flexDirection: 'row'}}>
              <Image
                source={{uri: tokenLogoURI}}
                style={{width: 35, height: 35, marginRight: 5}}
              />
            </Layout>
          )}
          {props.title && <Text category="h2">{props.title + ' '}</Text>}
          {tokenSymbol && <Text category="h2">{tokenSymbol}</Text>}
          {!props.title && !tokenSymbol && (
            <Text category="h2">Stack Header</Text>
          )}
        </Layout>
        <Layout style={{paddingRight: 80}} />
      </Row>
    </TokensHeader>
  );
}

const Row = styled(Layout)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TokenHeaderButton = styled(Button)`
  align-self: flex-start;
  left: 0;
`;

const TokensHeader = styled(Layout)`
  /* background-color: red; */
  border-bottom: none;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

interface StackHeaderProps extends React.PropsWithChildren {
  navigation: any;
  noMargin?: boolean;
  accessoryLeft?: React.ReactElement;
  accessoryRight?: React.ReactElement;
  leftIconName?: string;
  title?: string;
  onPress?: () => void;
}
export const StackHeader = (props: StackHeaderProps) => (
  <SafeAreaView>
    <WalletsHeaderContainer noMargin={props.noMargin}>
      <WalletHeaderButton
        style={{position: 'absolute'}}
        accessoryLeft={
          props.accessoryLeft || (
            <Icon name={props.leftIconName || 'arrowhead-down-outline'} />
          )
        }
        accessoryRight={props.accessoryRight}
        appearance="ghost"
        size="giant"
        status="basic"
        onPress={props.onPress || props.navigation.goBack}
      />
      {props.children || (
        <Text category="h3">{props.title || 'STACK HEADER'}</Text>
      )}
    </WalletsHeaderContainer>
  </SafeAreaView>
);

const WalletHeaderButton = styled(Button)`
  position: absolute;
  left: 0;
`;

const WalletsHeaderContainer = styled(Layout)<{noMargin?: boolean}>`
  border-bottom: none;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* margin-top: ${(props) => (props.noMargin ? '0px' : '20px')}; */
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px 10px;
`;

export const CancelButton = (
  props: React.PropsWithChildren | React.ComponentProps<any>,
) => (
  <Button
    status="danger"
    size="small"
    appearance="outline"
    {...props}
    style={{marginTop: 'auto'}}>
    {props.children || 'Cancel'}
  </Button>
);

export const ScreenBase = (props: React.PropsWithChildren) => (
  <>
    <StatusBar />
    <Layout style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <ScreenContainer {...props}>{props.children}</ScreenContainer>
      </SafeAreaView>
    </Layout>
  </>
);

export const ScreenContainer = styled(Layout)<{debug?: boolean}>`
  border: ${(props) => (props.debug ? 'solid 2px red' : 'none')};
  flex: 1;
`;
