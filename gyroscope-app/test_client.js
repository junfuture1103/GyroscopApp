const http = require('http');

const data = JSON.stringify({
    // 요청에 포함할 데이터
});

const options = {
    hostname: '101.79.9.58',
    port: 3000,
    path: '/csv_init',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`응답 코드: ${res.statusCode}`);

    res.on('data', (chunk) => {
        console.log(`응답 데이터: ${chunk}`);
    });
});

req.on('error', (error) => {
    console.error(`요청 중 오류 발생: ${error}`);
});

req.write(data);
req.end();
