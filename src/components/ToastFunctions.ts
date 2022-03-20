import {Cluster} from '@solana/web3.js';
import Toast from 'react-native-toast-message';

export const processingToast = () => {
  Toast.hide();
  Toast.show({
    type: 'transactionProcessing',
    autoHide: false,
    position: 'top',
  });
};

export const successToast = (
  tx: string,
  network: Cluster,
  navigation: Navigator,
) => {
  Toast.hide();
  Toast.show({
    type: 'transactionSuccess',
    visibilityTime: 6000,
    props: {
      tx,
      network,
      navigation,
    },
  });
};

type ErrorToastProps = {
  name?: string;
  message?: string;
  e?: {
    message: string;
    name: string;
  };
};
export const errorToast = (error: ErrorToastProps) => {
  Toast.hide();
  Toast.show({
    type: 'transactionError',
    props: {error},
    visibilityTime: 6000,
  });
};
