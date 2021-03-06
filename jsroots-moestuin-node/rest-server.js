const MiFlora = require('./miflora');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const io = require('socket.io')(http);

// Initialize MiFlora library
let flora = new MiFlora();
let floraDevices = [];

// Initialize server
let port = 8888;
const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());
io.listen(server);
server.listen(port);

//Display array of Devices in JSON in localhost
app.get('/devices', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.json(floraDevices);
});

// Listen to Flora events
flora.on('data', (data) => {
    console.log("Received device information from id: %s", data.deviceId);
    console.log("Received data: %s", data);

    updateDeviceData(data);
});

flora.on('firmware', (data) => {
    console.table(data);
});
// Scan for BLE Flora devices
flora.startScanning();


// Update or add device data received
function updateDeviceData(data) {
    let deviceIndex = floraDevices.findIndex(x => x.deviceId === data.deviceId);

    if (deviceIndex === -1) {
        floraDevices.push(data);
    } else {
        floraDevices[deviceIndex] = data;
    }
    io.local.emit('data', floraDevices);
}