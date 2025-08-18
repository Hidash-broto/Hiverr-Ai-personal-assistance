import React from 'react'
import { Alert, Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router'
import { CreateEventProps } from '@/constants/types';
import { deleteEvent } from '@/services/event';

const { width: screenWidth } = Dimensions.get('window');

function MoreOptionModal(
    { moreOptionsModal, setMoreOptionsModal, selectedEvent, fetchEvents, buttonPosition }
        : { moreOptionsModal: boolean, setMoreOptionsModal: React.Dispatch<React.SetStateAction<boolean>>, selectedEvent: CreateEventProps | null, fetchEvents: () => void, buttonPosition: { x: number, y: number, width: number, height: number } }
) {
    const router = useRouter();

    const handleOptionClick = async (item: { label: string, value: string }, event) => {
        if (item.value === 'edit') {
            setMoreOptionsModal(false);
            if (selectedEvent && selectedEvent._id) {
                router.push(`/create-event?eventId=${selectedEvent._id}`);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Something went wrong',
                    autoHide: true,
                });
            }
        } else if (item.value === 'delete') {
            Alert.alert(
                'Delete Event',
                'Are you sure you want to delete this event?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: handleDelete,
                        style: 'destructive',
                    },
                ]
            )
        }
    }

    const handleDelete = async () => {
        if (selectedEvent && selectedEvent._id) {
            const res = await deleteEvent(selectedEvent._id);
            if (res) {
                Toast.show({
                    type: 'success',
                    text1: 'Event deleted successfully',
                    autoHide: true,
                });
                setMoreOptionsModal(false);
                fetchEvents();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Something went wrong',
                    autoHide: true,
                });
            }
        } else {
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                autoHide: true,
            });
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

export default MoreOptionModal