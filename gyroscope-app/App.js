import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import * as Location from 'expo-location';

export default function App() {
  const [{ x, y, z, longitude, altitude }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
    longitude: 0,
    altitude: 0,
  });

  const [subscription, setSubscription] = useState(null);
  const [dataSeries, setDataSeries] = useState([]);

  const _slow = () => Gyroscope.setUpdateInterval(1000);
  const _fast = () => Gyroscope.setUpdateInterval(16);
  const _subscribe = () => {
    const getRealTimeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return null;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        console.log('Location:', location.coords);
        return location.coords;

      } catch (error) {
        console.error('Error fetching location:', error);
        return null;
      }
    };

    setSubscription(
      Gyroscope.addListener(async (gyroscopeData) => {
        const { x, y, z } = gyroscopeData;
        const location = await getRealTimeLocation();

        console.log(location?.longitude, location?.latitude);

        if (location) {
          const formattedData = {
            x: x.toFixed(16),
            y: y.toFixed(16),
            z: z.toFixed(16),
            longitude: location.longitude,
            altitude: location.latitude,
          };

          setData(formattedData);
          setDataSeries(prevDataSeries => [...prevDataSeries, gyroscopeData.x]);
          uploadData(formattedData); // 데이터 전송
        }
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

  // data sending
  useEffect(() => {
    const makeCSVfileinServer = async () => {
      try {
        const response = await fetch('http://192.168.0.135:3000/csv_init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'APP1' // 사용자 마다 바꾸기
          }
        });

        console.log('csv file init 요청이 서버에 전송되었습니다');

        if (!response.ok) {
          throw new Error('Failed to initialize CSV file');
        }

      } catch (error) {
        console.error('csv file init 요청 중 오류 발생:', error);
        // 오류를 띄우고 앱 종료
        Alert.alert('Error', 'Failed to initialize CSV file');
        // 앱 종료
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        } else {
          // iOS에서는 앱을 종료할 수 있는 다른 방법을 사용해야 합니다.
          // 앱 종료 로직을 추가하세요.
        }
      }
    };

    makeCSVfileinServer();
  }, []);


  const uploadData = async (data) => {
    try {
      const bodyData = {
        ...data
      };

      const response = await fetch('http://192.168.0.135:3000/csv', {
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
      <Text style={styles.text}>Longitude: {longitude}</Text>
      <Text style={styles.text}>Altitude: {altitude}</Text>
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
