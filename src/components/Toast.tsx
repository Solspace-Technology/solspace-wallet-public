import {ActivityIndicator, Alert} from 'react-native';

import {BaseToast} from 'react-native-toast-message';
import {LightenColor} from '../modules/utils';
import {ThemeVariables} from '../styles/themeVariables';

const {colors} = ThemeVariables();

export const toastConfig = {
  transactionProcessing: ({props}: {props: any}) => (
    <BaseToast
      style={{
        borderLeftColor: colors.info,
        backgroundColor: LightenColor(colors.basic, 10),
      }}
      text1Style={{color: colors.font, fontSize: 20}}
      text1={props.text1 || 'Processing Transaction...'}
      text2={props.text2}
      renderLeadingIcon={() => (
        <ActivityIndicator style={{marginLeft: 15, marginRight: -10}} />
      )}
    />
  ),
  transactionSuccess: ({props}: {props: any}) => {
    return (
      <BaseToast
        style={{
          borderLeftColor: colors.success,
          backgroundColor: LightenColor(colors.basic, 10),
        }}
        text1Style={{color: colors.font, fontSize: 20}}
        text1="Transaction Successful!"
        text2="Click on this message to view the transaction."
        onPress={() =>
          props.navigation.navigate('View Transaction', {
            url: `https://explorer.solana.com/tx/${props.tx}?cluster=${props.network}`,
          })
        }
        text2Style={{color: colors.font, fontSize: 12}}
      />
    );
  },
  transactionError: ({props}: {props: any}) => (
    <BaseToast
      style={{
        borderLeftColor: colors.danger,
        backgroundColor: LightenColor(colors.basic, 10),
      }}
      text1Style={{color: colors.font, fontSize: 20}}
      text1="Transaction Error."
      text2="Click on this message to view the details."
      onPress={() =>
        Alert.alert(
          props?.error?.name || props?.error?.e?.name || 'Error',
          props?.error?.e?.message ||
            props?.error?.message ||
            'There was an unexpected error. Please report this to @jupeTheDev!',
        )
      }
      text2Style={{color: colors.font, fontSize: 12}}
    />
  ),
};
