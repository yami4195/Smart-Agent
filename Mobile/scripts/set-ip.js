// scripts/set-ip.js
const os = require('os');
const fs = require('fs');

const interfaces = os.networkInterfaces();
let localIp = '';

for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        }
    }
}

const envContent = `EXPO_PUBLIC_API_URL=http://${localIp}:5000/api\n`;
fs.writeFileSync('.env', envContent);
console.log(`Set API URL to: http://${localIp}:5000/api`);

//this is temporary file , created for setting the ip during run time instead of manually inserting pc's ip!!