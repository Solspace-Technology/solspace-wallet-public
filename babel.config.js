module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__scanQRCodes'],
      },
    ],
    [
      'import-globals',
      {
        React: 'react',
        styled: 'styled-components/native',
      },
    ],
       [
     'module-resolver',
     {
       alias: {
         'crypto': 'react-native-quick-crypto',
         'stream': 'stream-browserify',
         'buffer': '@craftzdog/react-native-buffer',
       },
     },
   ],
  ],
};
