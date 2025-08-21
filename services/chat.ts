import Toast from 'react-native-toast-message';
import axiosConnection from '../utils/axiosConnection'

export const chatService = async (input: string, mode: string) => {
    try {
        const response = await axiosConnection.post('/chat', { message: input, mode });
        return response.data;
    } catch (error) {
        console.error("Error initializing chat service:", error);
        Toast.show({
            text1: 'Chat Service Error',
            text2: 'Failed to initialize chat service.',
            type: 'error',
        })
    }
}

export const firstMessage = async () => {
    try {
        const response = await axiosConnection.get('/chat/initial-message');
        return response.data;
    } catch (error) {
        console.error("Error fetching first message:", error);
        Toast.show({
            text1: 'Chat Service Error',
            text2: 'Failed to fetch first message.',
            type: 'error',
        })
    }
}