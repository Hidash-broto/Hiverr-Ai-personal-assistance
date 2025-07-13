import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/app/context/AuthContext';

export default function HomeScreen() {
    const { deleteToken } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>
            <Button title="Log Out" onPress={deleteToken} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});