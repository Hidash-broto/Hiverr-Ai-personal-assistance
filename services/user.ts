import axiosConnection from "@/utils/axiosConnection";

export const getAllContacts = async (contacts: string[]) => {
    try {
        const response = await axiosConnection.post('user/contacts', {contacts});
        return response.data;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw new Error('Failed to fetch contacts');
    }
}
