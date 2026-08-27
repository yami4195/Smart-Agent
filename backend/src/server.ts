import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./socket";

const PORT = process.env.PORT || 5000;

console.log("Publishable key loaded:", !!process.env.CLERK_PUBLISHABLE_KEY);
console.log("Secret key loaded:", !!process.env.CLERK_SECRET_KEY);

const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
initSocket(server);

server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT} (and network http://0.0.0.0:${PORT})`);
  console.log(`⚡ Socket.IO initialized and listening for real-time queue events`);
});