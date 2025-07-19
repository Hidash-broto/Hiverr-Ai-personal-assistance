import { TaskTypes } from '@/constants/types';
import { updateTask } from '@/services/task-services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react'
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';

const { width: screenWidth, } = Dimensions.get('window');

function PrioritySelectModal(
    { priorityModal, setPriorityModal, selectedTask, setReRender, buttonPosition }
        : { priorityModal: boolean, setPriorityModal: React.Dispatch<React.SetStateAction<boolean>>, selectedTask: TaskTypes | null, setReRender: React.Dispatch<React.SetStateAction<boolean>>, buttonPosition: { x: number, y: number, width: number, height: number } }
) {

    const handlePriorityIconRender = (priority: string) => {
        switch (priority) {
            case 'high':
                return (<MaterialIcons name="keyboard-arrow-up" size={24} color="orange" />);
            case 'medium':
                return (<MaterialIcons name="horizontal-rule" size={24} color="blue" />);
            case 'low':
                return (<MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />);
            default:
                return (<MaterialIcons name="help-outline" size={24} color="gray" />);
        }
    }

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={priorityModal}
                onRequestClose={() => {
                    setPriorityModal(!priorityModal);
                }}
            >
                <Pressable style={styles.modalOverlayPriority} onPress={() => setPriorityModal(false)}>
                    {/* Overlay to dismiss modal by tapping outside */}
                    <View
                        style={{
                            ...styles.popoverMenuPriority,
                            top: buttonPosition.y - 20, // 5px below the button
                            left: buttonPosition.x - 180 + buttonPosition.width / 2, // Adjust to roughly center/align with button
                            right: buttonPosition.x + buttonPosition.width < screenWidth / 2 ? 'auto' : 20, // Example: Adjust based on screen edge
                        }}
                    >
                        <FlatList
                            data={[
                                { label: 'High', value: 'high' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'Low', value: 'low' },
                            ]}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={async () => {
                                        if (selectedTask && selectedTask.title) {
                                            const updatedTask = { ...selectedTask, priority: item.value };
                                            const res = await updateTask(updatedTask);
                                            if (res.status) {
                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Updated priority successfully',
                                                    autoHide: true,
                                                });
                                                setPriorityModal(false);
                                                setReRender((prev) => !prev);
                                            } else {
                                                Toast.show({
                                                    type: 'error',
                                                    text1: 'Something went wrong',
                                                    autoHide: true,
                                                });
                                            }
                                        }
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>{item.label}  {handlePriorityIconRender(item.value)}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modalOverlayPriority: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
    },
    popoverMenuPriority: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        width: 200,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
});

export default PrioritySelectModal