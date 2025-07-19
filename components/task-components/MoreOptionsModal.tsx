import { TaskTypes } from '@/constants/types';
import { deleteTask } from '@/services/task-services';
import React from 'react'
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

function MoreOptionsModal(
    { moreOptionsModal, setMoreOptionsModal, selectedTask, setReRender, buttonPosition, setPriorityModal, setNestedPopupPosition }
        : { moreOptionsModal: boolean, setMoreOptionsModal: React.Dispatch<React.SetStateAction<boolean>>, selectedTask: TaskTypes | null, setReRender: React.Dispatch<React.SetStateAction<boolean>>, buttonPosition: { x: number, y: number, width: number, height: number }, setPriorityModal: React.Dispatch<React.SetStateAction<boolean>>, setNestedPopupPosition: React.Dispatch<React.SetStateAction<any>> }
) {

    const handleOptionClick = async (item: { label: string, value: string }, event) => {
        if (item.value === 'edit') {
            Toast.show({
                type: 'info',
                text1: 'This feature is coming soon!',
                autoHide: true,
            });
        } else if (item.value === 'delete') {
            if (selectedTask && selectedTask._id) {
                const res = await deleteTask(selectedTask._id);
                if (res.status) {
                    Toast.show({
                        type: 'success',
                        text1: 'Task deleted successfully',
                        autoHide: true,
                    });
                    setMoreOptionsModal(false);
                    setReRender((prev) => !prev);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Something went wrong',
                        autoHide: true,
                    });
                }
            }
        } else if (item.value === 'change_priority') {
            event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                setNestedPopupPosition({ x: pageX, y: pageY, width, height })
            });
            setPriorityModal(true);
            setMoreOptionsModal(false);
        }
    }

    const handleLayout = (event: any) => {
        // Capture the layout of THIS menu item
        event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            setLayout({ x: pageX, y: pageY, width, height });
        });
    };

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={moreOptionsModal}
                onRequestClose={() => {
                    setMoreOptionsModal(!moreOptionsModal);
                }}
            >
                <Pressable style={styles.modalOverlayMoreOptions} onPress={() => setMoreOptionsModal(false)}>
                    {/* Overlay to dismiss modal by tapping outside */}
                    <View
                        style={{
                            ...styles.popoverMenuMoreOptions,
                            top: buttonPosition.y + buttonPosition.height + 5, // 5px below the button
                            left: buttonPosition.x - 150 + buttonPosition.width / 2, // Adjust to roughly center/align with button
                            right: buttonPosition.x + buttonPosition.width < screenWidth / 2 ? 'auto' : 20, // Example: Adjust based on screen edge
                        }}
                    >
                        <FlatList
                            data={[
                                { label: 'Edit', value: 'edit' },
                                { label: 'Delete', value: 'delete' },
                                { label: 'Change Priority', value: 'change_priority' },
                            ]}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={(event) => handleOptionClick(item, event)}
                                >
                                    <Text style={styles.dropdownItemText}>{item.label}</Text>
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
    modalOverlayMoreOptions: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    popoverMenuMoreOptions: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        width: 180,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownItemText: {
        fontSize: 16,
    },
});

export default MoreOptionsModal