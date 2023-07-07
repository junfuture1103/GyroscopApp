import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import * as FileSystem from 'expo-file-system';

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
        setData(gyroscopeData);
        setDataSeries(prevDataSeries => [...prevDataSeries, gyroscopeData.x]);

        const formattedData = {
          x: gyroscopeData.x.toFixed(16),
          y: gyroscopeData.y.toFixed(16),
          z: gyroscopeData.z.toFixed(16),
        };

        uploadData(formattedData); // 바로 데이터 전송

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

  const axios = require('axios');

  useEffect(() => {
    const makeCSVfileinServer = async () => {
      try {
        const response = await fetch('http://192.168.9.173:3000/csv_init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'APP1' // 사용자 마다 바꾸기
          }
        });

        console.log('csv file init 요청이 서버에 전송되었습니다');
      } catch (error) {
        console.error('csv file init 요청 중 오류 발생:', error);
      }
    };

    makeCSVfileinServer();
  }, []);

  

  const uploadData = async (data) => {
    try {
      const csvData = JSON.stringify(data);
      const response = await fetch('http://192.168.9.173:3000/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'APP1' // 사용자 마다 바꾸기
        },
        body: csvData,
      });

      console.log('데이터가 서버에 전송되었습니다:', csvData);
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
