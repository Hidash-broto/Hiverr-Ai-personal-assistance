import React from 'react'
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

function FilterModal(
    { setValue, values, visible, setVisible }
    : { setValue: (value: { label: string, value: string }) => void, values: { label: string, value: string }[], visible: boolean, setVisible: React.Dispatch<React.SetStateAction<boolean>>}
) {

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={() => {
                    setVisible(!visible);
                }}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    {/* Overlay to dismiss modal by tapping outside */}
                    <View style={styles.modalOverlay}>
                        <View style={styles.dropdownModalContent}>
                            <FlatList
                                data={values}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setValue(item);
                                            setVisible(false);
                                        }}
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

export default FilterModal