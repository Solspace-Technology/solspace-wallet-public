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
  ],
};
