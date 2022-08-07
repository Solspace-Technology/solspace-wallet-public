import React from 'react';
import {WebView} from 'react-native-webview';

export function CustomWebView({url = 'https://solspace.tech'}) {
  return <WebView source={{uri: url}} />;
}
