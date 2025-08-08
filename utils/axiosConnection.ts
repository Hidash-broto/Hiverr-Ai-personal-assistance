import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosConnection = axios.create({
    baseURL: 'https://63effd770967.ngrok-free.app/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosConnection.interceptors.request.use(
    async (config) => {
        // You can add any request interceptors here
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    }
);

export default axiosConnection;