import axiosConnection from "@/utils/axiosConnection";
import Toast from "react-native-toast-message";

export const login = async (formData: { email: string, password: string }) => {
    try {
        const response = await axiosConnection.post('/user/login', formData);
        console.log(response, 'response from login');
        return response.data;
    } catch (error: Error | any) {
        console.error('Login error:', error.response?.data || error.message);
        Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: error.response?.data?.message || 'Please check your credentials and try again.',
        });
    }
};

export const signup = async ({ name = '', email = '', password = '' }: { name: string, email: string, password: string }) => {
    try {
        const response = await axiosConnection.post('/user/signup', {
            name,
            email,
            password,
        });

        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};