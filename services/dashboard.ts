import axiosConnection from '../utils/axiosConnection';

export const getDashboardData = async (currentDate: Date = new Date()) => {
    try {
        const response = await axiosConnection.get('/dashboard', {
            params: {
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};
