global.Buffer = global.Buffer || require('buffer').Buffer;

import {useState} from 'react';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export function useGetDeviceList() {
  //TODO: Figure out why this just re renders all the time...
  const [refreshing, setRefreshing] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [error, setError] = useState(null);

  // scan for devices
  TransportBLE.listen({
    complete: e => {
      console.log('complete', e);
      setError(null);
      setRefreshing(false);
    },
    next: e => {
      if (e.type === 'add') {
        const device = e.descriptor;
        let newItems = deviceList.filter(item => item.id !== device.id);
        if (deviceList.length === 0) {
          setDeviceList([device]);
        }
        if (newItems) {
          setDeviceList(prevState => [...prevState, ...newItems]);
        }
      }
    },
    error: e => {
      console.log('Error scanning for devices.', e);
      setRefreshing(false);
      setError({name: 'Scanning Devices Error', error: e});
    },
  });

  return {refreshing, deviceList, error};
}

export function useGetBTState() {
  const [isBTAvail, setIsBtAvail] = useState(false);
  const [error, setError] = useState(null);

  TransportBLE.observeState({
    next: e => {
      if (e.type === 'PoweredOn') {
        setIsBtAvail(true);
      }
      if (e.type === 'PoweredOff') {
        setIsBtAvail(false);
      }
    },
    complete: e => {
      console.log('Complete?: ', e);
      setIsBtAvail(false);
      setError({name: 'BT Error - Complete?', error: e});
    },
    error: e => {
      console.log('error', e);
      setError({name: 'BT Error', error: e});
    },
  });

  return {isBTAvail, error};
}
