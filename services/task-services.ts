import axiosConnection from "@/utils/axiosConnection"
import Toast from "react-native-toast-message";

export const getTasks = async () => {
    try {
        const response = await axiosConnection.get('/tasks');
        return response.data;
    } catch (error) {
        console.log(error);
        Toast.show({
            type: 'error',
            text1: 'Something went wrong, please try again later',
            autoHide: true,
        })
    }
}