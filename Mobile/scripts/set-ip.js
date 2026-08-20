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

const clerkKey = 'pk_test_dG9wLXJhcHRvci0zMC5jbGVyay5hY2NvdW50cy5kZXYk';

const envContent = `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerkKey}
EXPO_PUBLIC_API_URL=http://${localIp}:5000/api
`;

fs.writeFileSync('.env', envContent);
console.log(`✅ Updated .env -> API: http://${localIp}:5000/api & Clerk Key preserved.`);