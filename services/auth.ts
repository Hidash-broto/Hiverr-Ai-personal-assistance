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

export const signup = async ({ name = '', email = '', password = '', mobile = '' }: { name: string, email: string, password: string, mobile: string }) => {
    try {
        const response = await axiosConnection.post('/user/signup', {
            name,
            email,
            password,
            mobile,
        });

        return response.data;
    } catch (error: any) {
        console.error('Signup error:', error);
        Toast.show({
            type: 'error',
            text1: 'Signup Failed',
            text2: error.response?.data?.message || 'Please try again later.',
        });
    }
};