import {CustomWebView} from '../components/CustomWebView';

export const ViewTransactionScreen = ({
  route,
}: {
  route?: {params?: {url?: string}};
}) => {
  return <CustomWebView url={route?.params?.url} />;
};
