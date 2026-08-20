import axios from 'axios';
import { tokenCache } from '@clerk/expo';
const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,

    headers: {
    "Content-Type": "application/json",
},
});
export default api;