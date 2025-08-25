import axiosConnection from '@/utils/axiosConnection';
import Toast from 'react-native-toast-message';

export const createEvent = async (eventData: any) => {
    try {
        const response = await axiosConnection.post('/events', eventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

export const getEvents = async (query: string, filter: string | null, month: null | number = null) => {
    try {
        const response = await axiosConnection.get('/events', {
            params: {
                query,
                filter,
                month
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const deleteEvent = async (id: string) => {
    try {
        const response = await axiosConnection.delete(`/events/${id}`);
        return response.data;
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: error.response.data.message || 'Something went wrong',
            autoHide: true,
        });
        console.error('Error deleting events:', error);
        throw error;
    }
};

export const updateEvent = async (eventId: string, eventData: any) => {
    try {
        const response = await axiosConnection.put(`/events/${eventId}`, eventData);
        return response.data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

export const getEventById = async (eventId: string) => {
    try {
        const response = await axiosConnection.get(`/events/${eventId}`);
        return response.data;
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: 'Failed to fetch event',
            text2: error.response.data.message || 'Something went wrong',
        });
        console.error('Error fetching event by ID:', error);
        throw error;
    }
};
