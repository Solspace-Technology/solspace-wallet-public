/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const defaultSourceExts =
  require('metro-config/src/defaults/defaults').sourceExts;

module.exports = {
  resolver: {
    sourceExts: [...defaultSourceExts, 'cjs'],
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
      fetch: require.resolve('cross-fetch'),
      ...require('node-libs-react-native'),
      crypto: require.resolve('react-native-quick-crypto'),
      path: require.resolve(__dirname, '../../node_modules/path-browserify'),
      fs: require.resolve(
        __dirname,
        '../../node_modules/react-native-level-fs',
      ),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
