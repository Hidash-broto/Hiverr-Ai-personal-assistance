import { TaskTypes } from '@/constants/types';
import { deleteTask, updateTask } from '@/services/task-services';
import React from 'react'
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CollapsibleListItem from '../CollapsibleListItem';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

function MoreOptionsModal(
    { moreOptionsModal, setMoreOptionsModal, selectedTask, setReRender, buttonPosition }
        : { moreOptionsModal: boolean, setMoreOptionsModal: React.Dispatch<React.SetStateAction<boolean>>, selectedTask: TaskTypes | null, setReRender: React.Dispatch<React.SetStateAction<boolean>>, buttonPosition: { x: number, y: number, width: number, height: number } }
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
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'low': return 'keyboard-arrow-down'
            case 'medium': return 'horizontal-rule'
            case 'high': return 'keyboard-arrow-up'
            default: return 'low-priority'
        }
    }

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
                            left: buttonPosition.x - 180 + buttonPosition.width / 2, // Adjust to roughly center/align with button
                            right: buttonPosition.x + buttonPosition.width < screenWidth / 2 ? 'auto' : 20, // Example: Adjust based on screen edge
                        }}
                    >
                        <FlatList
                            data={[
                                { label: 'Edit', value: 'edit', icon: 'edit' },
                                { label: 'Delete', value: 'delete', icon: 'delete' },
                                { label: 'Change Priority', value: 'change_priority', icon: getPriorityIcon(selectedTask?.priority) },
                            ]}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={(event) => handleOptionClick(item, event)}
                                >
                                    {
                                        item.value === 'change_priority' ? (
                                            <CollapsibleListItem title={item.label}>
                                                <FlatList
                                                    data={[
                                                        { label: 'High', value: 'high' },
                                                        { label: 'Medium', value: 'medium' },
                                                        { label: 'Low', value: 'low' },
                                                    ].filter(item => item?.value !== selectedTask?.priority)}
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
                                                            }}
                                                        >
                                                            <Text style={styles.dropdownItemText}>{item.label}  {handlePriorityIconRender(item.value)}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </CollapsibleListItem>
                                        ) : (
                                            <Text style={styles.dropdownItemText}>{item.label}</Text>
                                        )
                                    }
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
        width: 200,
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