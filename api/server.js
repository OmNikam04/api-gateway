const express = require("express");
const app = express();
const axios = require("axios");
const PORT = 3002;
const HOST = 'localhost';

app.use(express.json());

app.get('/fakeapi', (req, res, next) => {
    res.send('Hello From fake api');
});

app.post('/bogusapi', (req, res, next) => {
    res.send('hello from bogus api');
});

app.listen(PORT, () => {
    const authString = 'johndoe:password';
    const encodedAuthString = Buffer.from(authString, 'utf-8').toString('base64');
    console.log(`Encoding authstring ${encodedAuthString}`);
    console.log('Fake api server started on port ' + PORT);

    // Registering this API to our gateway dynamically
    registerService(encodedAuthString);
});

function registerService(encodedAuthString) {
    axios({
        method: 'POST',
        url: 'http://localhost:3000/register',
        headers: {
            'authorization': `Basic ${encodedAuthString}`,
            'Content-Type': 'application/json'
        },
        data: {
            apiName: "testapi",
            protocol: "http",
            host: HOST,
            port: PORT,
            connections: 0,  // Initializing connections for load balancing
            weight: 1        // Setting default weight for weighted round robin
        }
    }).then((response) => {
        console.log(response.data);
    }).catch((err) => {
        console.error("Error in api/server.js", err.message);
        console.error(err.response?.data || err.message);
    });
}

// Graceful shutdown to unregister the service
process.on('SIGINT', () => {
    unregisterService();
    process.exit();
});

function unregisterService() {
    const authString = 'johndoe:password';
    const encodedAuthString = Buffer.from(authString, 'utf-8').toString('base64');
    
    axios({
        method: 'POST',
        url: 'http://localhost:3000/unregister',
        headers: {
            'authorization': `Basic ${encodedAuthString}`,
            'Content-Type': 'application/json'
        },
        data: {
            apiName: "testapi",
            protocol: "http",
            host: HOST,
            port: PORT,
        }
    }).then((response) => {
        console.log(response.data);
    }).catch((err) => {
        console.error("Error in api/server.js during unregistration", err.message);
        console.error(err.response?.data || err.message);
    });
}
