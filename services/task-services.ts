import { TaskTypes } from "@/constants/types";
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
export const updateTask = async (task: TaskTypes) => {
    try {
        const response = await axiosConnection.put(`tasks/${task?._id}`, task)
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

export const deleteTask = async (id) => {
    try {
        const response = await axiosConnection.delete(`/tasks/${id}`)
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

export const createTask = async (task) => {
    try {
        const response = await axiosConnection.post('/tasks', task);
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