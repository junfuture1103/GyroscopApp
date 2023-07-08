import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import * as Location from 'expo-location';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);
  const [dataSeries, setDataSeries] = useState([]);
  const [bufferedData, setBufferedData] = useState([]);

  const _slow = () => Gyroscope.setUpdateInterval(1000);
  const _fast = () => Gyroscope.setUpdateInterval(16);

  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener(gyroscopeData => {
        const { x, y, z } = gyroscopeData;
        const formattedData = {
          x: x.toFixed(16),
          y: y.toFixed(16),
          z: z.toFixed(16),
          longitude: 0, // 초기값 설정
          latitude: 0, // 초기값 설정
        };

        setData(gyroscopeData);
        setDataSeries(prevDataSeries => [...prevDataSeries, gyroscopeData.x]);
        uploadData(formattedData); // 데이터 전송
        setBufferedData(prevBufferedData => [...prevBufferedData, formattedData]);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    const getLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      // Permission granted, proceed with getting the location
      getRealTimeLocation();
    };

    const getRealTimeLocation = async () => {
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // Set the desired accuracy
          timeInterval: 1000, // Update location every second (adjust as needed)
          distanceInterval: 0, // Update location regardless of distance moved
        },
        (location) => {
          console.log('Location:', location.coords);
          // Process the received location data here
        }
      );
    };

    getLocationPermission();
  }, []);

  const uploadData = async (data) => {
    try {
      const { longitude, latitude, ...gyroData } = data;
      const csvData = JSON.stringify(gyroData);
      const bodyData = {
        longitude,
        latitude,
        csvData
      };

      const response = await fetch('http://localhost:3000/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'APP1' // 사용자 마다 바꾸기
        },
        body: JSON.stringify(bodyData),
      });

      console.log('데이터가 서버에 전송되었습니다:', bodyData);
    } catch (error) {
      console.error('데이터 전송 중 오류 발생:', error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Gyroscope:</Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
      <Text style={styles.text}>Longitude: {bufferedData[bufferedData.length - 1]?.longitude}</Text>
      <Text style={styles.text}>Latitude: {bufferedData[bufferedData.length - 1]?.latitude}</Text>
      <View style={styles.chartContainer}>
        <LineChart
          style={styles.chart}
          data={dataSeries}
          contentInset={{ top: 20, bottom: 20 }}
          curve={shape.curveNatural}
          svg={{ stroke: 'blue' }}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
  chartContainer: {
    height: 200,
    width: '100%',
  },
  chart: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginHorizontal: 5,
  },
  middleButton: {
    backgroundColor: '#BBBBBB',
  },
});
