import axios from 'axios';
const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,

    headers: {
    "Content-Type": "application/json",
},
});
let getTokenFn: (() =>Promise<string | null>) | null = null;

export function registerTokenGetter(fn: ()=> Promise<string |null>){
    getTokenFn = fn;
}

api.interceptors.request.use(async(config)=>{
    if(getTokenFn) {
    const token = await getTokenFn();
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
}
    return config;
});

    api.interceptors.response.use(
        (response) =>response,
        (error) =>{
            if (error.response.status === 401){
                console.log('Session expired or invalid - redirect to login');
            //navigation.navigate('Login)
            }
        return Promise.reject(error);
        }
    );
export default api;