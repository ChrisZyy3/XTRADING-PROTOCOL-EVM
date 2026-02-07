
const https = require('https');

const options = {
    hostname: 'xtrading.xin',
    port: 443,
    path: '/api/v1/node/available',
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY START');
        console.log(data);
        console.log('BODY END');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
