import {Alert, View} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanQRCodes} from 'vision-camera-qrcode-scanner';

import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Layout, Text} from '@ui-kitten/components';
import {runOnJS} from 'react-native-reanimated';
import styled from 'styled-components';

import React from 'react';
import {ThemeVariables} from '../styles/themeVariables';

const {colors} = ThemeVariables();

export function CameraScreen() {
  const navigation = useNavigation();
  const [cameraPermission, setCameraPermissions] = React.useState<
    string | undefined
  >();
  // const [cameraRequestResult, setCameraRequestResult] = React.useState<
  //   string | undefined
  // >();
  const [codeBoxColor, setCodeBoxColor] = React.useState('white');

  const [qrCodes, setQrCodes] = React.useState([]);

  const devices = useCameraDevices();
  let device;
  device = devices?.back;
  // console.log('device', device);

  const [isFocused, setIsFocused] = React.useState(useIsFocused());

  async function getCameraPermissionStatus() {
    const newCameraPermissions = await Camera.getCameraPermissionStatus();
    setCameraPermissions(newCameraPermissions);
  }
  async function requestCameraPermission() {
    const result = await Camera.requestCameraPermission();
    console.log('result', result);
    // setCameraRequestResult(result);
  }

  const QRFrameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const qrCode = scanQRCodes(frame);
    runOnJS(setQrCodes)(qrCode);
  }, []);

  function parseSolanaPay(code) {
    const solanaRegex = /^(?=.*solana:([^?]+)|)/;
    const solana = code.match(solanaRegex)[1];

    const amountRegex = /(?=.*amount=([^&]+)|)/;
    const amount = code.match(amountRegex)[1];

    const splTokenRegex = /(?=.*spl-token=([^&]+)|)/;
    const splToken = code.match(splTokenRegex)[1];

    const referenceRegex = /(?=.*reference=([^&]+)|)/;
    const reference = code.match(referenceRegex)[1];

    const labelRegex = /(?=.*label=([^&]+)|)/;
    const label = code.match(labelRegex)[1];
    console.log(solana);

    return {
      solana,
      amount,
      splToken,
      reference,
      label,
    };
  }

  /*
  Solana Pay example data:
  solana:AmtW4L39QwE2DGU3f3uEoL1rVCgwwit5W4UhjxiM35Nt?amount=1&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=72FrP58fnrD24Fo48jKR2PoyjjaTcKQJHM9inPV6TFGn&label=Solana%20Pay
  */

  React.useEffect(() => {
    // Check if QR code is a pubkey or solanaPay address
    // If it is, navigate to the send tokens screen with appropriate params
    if (qrCodes.length === 0) {
      setCodeBoxColor('white');
    }
    if (qrCodes.length > 0) {
      setCodeBoxColor('green');
      const code = qrCodes[0]?.displayValue;
      const transactionData = parseSolanaPay(code);
      // Solana Pay Code here
      if (
        transactionData.solana &&
        transactionData.amount &&
        transactionData.splToken
      ) {
        setIsFocused(false);
        Alert.alert(
          'QR Code',
          'Found a Solana Pay code. Would you like to perform this Solana transaction?',
          [
            {
              text: 'Cancel',
              onPress: () => {
                setCodeBoxColor('white');
                setIsFocused(true);
              },
            },
            {
              text: 'OK',
              onPress: () => {
                setCodeBoxColor('white');

                navigation.navigate(
                  'Send Tokens' as never,
                  {
                    transactionData,
                  } as never,
                );
              },
            },
          ],
        );
      } else if (code.length === 44) {
        console.log(code);
        setIsFocused(false);

        Alert.alert(
          'QR Code',
          `Found Solana PublicKey. Public key address is: \n\n${code}\n\n Would you like to copy this address to your clipboard? `,
          [
            {
              text: 'Cancel',
              onPress: () => {
                setCodeBoxColor('white');
                setIsFocused(true);
              },
            },
            {
              text: 'Copy',
              onPress: () => {
                setCodeBoxColor('white');
                Clipboard.setString(code);
                navigation.goBack();
              },
            },
          ],
        );
      }
    }
  }, [qrCodes, navigation]);

  React.useEffect(() => {
    getCameraPermissionStatus();
    if (cameraPermission === 'not-determined') {
      // ask for camera permissions
      requestCameraPermission();
    }
    if (cameraPermission === 'denied') {
      // camera permission granted
      Alert.alert(
        'Camera Not Authorized',
        'Please allow camera access in settings to use this feature.',
      );
    }
  }, [cameraPermission]);

  if (!device) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    );
  }

  return (
    <Camera
      device={device}
      isActive={isFocused}
      style={{flex: 1, backgroundColor: colors.basic}}
      frameProcessor={QRFrameProcessor}>
      <CameraOverlay>
        <CodeSquare color={codeBoxColor} />
        <CameraTextContainer>
          <CameraText category="h5">Scan Solana Pay Code or </CameraText>
          <CameraText category="h5">Solana address PublicKey</CameraText>
        </CameraTextContainer>
      </CameraOverlay>
    </Camera>
  );
}

const CameraTextContainer = styled(View)`
  margin: 10px;
  padding: 10px;
  background-color: black;
  border-radius: 10px;
`;

const CameraText = styled(Text)`
  text-align: center;
`;

const CameraOverlay = styled(View)`
  position: absolute;
  top: 10px;
  left: 50px;
`;

const CodeSquare = styled(View)<{color: string}>`
  border: solid 10px ${(props) => props.color};
  border-radius: 50px;
  height: 300px;
  width: 300px;
`;
