import {CustomWebView} from '../components/CustomWebView';

export const ViewTransactionScreen = ({route, navigation}) => {
  console.log(route.params);
  return <CustomWebView url={route?.params?.url} />;
};
