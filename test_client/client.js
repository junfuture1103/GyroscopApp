const axios = require('axios');

async function uploadCSVData() {
  try {
    const csvData = {
      x: 23.123,
      y: 11.123,
      z: 63.123,
    };
    
    const response = await axios.post('http://localhost:3000/csv', csvData, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('데이터가 서버에 전송되었습니다:', response.data);
  } catch (error) {
    console.error('데이터 전송 중 오류 발생:', error);
  }
}

uploadCSVData();
