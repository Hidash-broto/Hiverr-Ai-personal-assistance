import { updateTask } from '@/services/task-services';
import React from 'react'
import { Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { TaskTypes } from '@/constants/types';

const dropdownOptions = [
    { label: 'OPEN', value: 'open' },
    { label: 'IN PROGRESS', value: 'in_progress' },
    { label: 'CLOSED', value: 'closed' },
];

const { height: screenHeight } = Dimensions.get('window');

function StatusModal(
    { animationType = 'fade', transparent = true, statusModal, setStatusModal, selectedTask, reRender, setReRender }
    : { animationType: 'fade' | 'none' | 'slide', transparent: boolean, statusModal: boolean, setStatusModal: React.Dispatch<React.SetStateAction<boolean>>, selectedTask: TaskTypes | null, reRender: boolean, setReRender: React.Dispatch<React.SetStateAction<boolean>> }
) {
    const handleEditStatus = async (status : string) => {
        const updatedStatusValue : TaskTypes | null = { ...selectedTask, status }
        console.log(updatedStatusValue, 'Hello');
        const res = await updateTask(updatedStatusValue);
        if (res.status) {
            Toast.show({
                type: 'success',
                text1: 'Updated status successfully',
                autoHide: true,
            })
            setStatusModal(false);
            setReRender(!reRender)
        } else {
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                autoHide: true
            })
        }
    }

    return (
        <>
            <Modal
                animationType={animationType}
                transparent={transparent}
                visible={statusModal}
                onRequestClose={() => setStatusModal(!statusModal)}
            >
                <TouchableWithoutFeedback onPress={() => setStatusModal(false)}>
                    {/* Overlay to dismiss modal by tapping outside */}
                    <View style={styles.modalOverlay}>
                        <View style={styles.dropdownModalContent}>
                            <FlatList
                                data={dropdownOptions}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleEditStatus(item?.value)}
                                    >
                                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: screenHeight * 0.4, // Limit height to prevent taking whole screen
        width: '80%', // Adjust width as needed
        // Add shadow to the modal content for depth
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0', // Light separator
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
})

export default StatusModal