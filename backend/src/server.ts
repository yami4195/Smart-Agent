import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5000;

console.log("Publishable key loaded:", !!process.env.CLERK_PUBLISHABLE_KEY);

console.log("Secret key loaded:", !!process.env.CLERK_SECRET_KEY);

app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (and network http://0.0.0.0:${PORT})`);
});