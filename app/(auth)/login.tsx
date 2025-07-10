import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Pressable } from 'react-native';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'expo-router';

function Login() {
    const { saveToken } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = () => {
        // In a real app, you'd have a login form and an API call
        const fakeToken = 'fake-auth-token';
        saveToken(fakeToken);
        router.replace('/(app)');
    };

    const handleChange = (name, value) => {
        setFormData(prev => {
            return {
                ...prev,
                [name]: value,
            }
        })
    }

    const handleSignupClick = () => {
        router.replace('/(auth)/signup')
    }

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>login</Text>
                <TextInput
                    value={formData.email}
                    style={styles.input}
                    onChange={(value) => handleChange('email', value)}
                    placeholder='Email'
                    placeholderTextColor='grey'
                />
                <TextInput
                    value={formData.password}
                    style={styles.input}
                    onChangeText={(value) => handleChange('password', value)}
                    textContentType='password'
                    placeholder='Password'
                    placeholderTextColor='grey'

                />
                <Text style={styles.newUserText}>
                    New User,{' '}
                    <Pressable onPress={handleSignupClick}>
                        <Text style={styles.pressableSignup}>Signup</Text>
                    </Pressable>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffe2b3',
    },
    formContainer: {
        backgroundColor: 'white',
        width: '80%',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        padding: 25,
        borderRadius: 8
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        marginTop: 10,
        fontWeight: '800'
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderColor: '#c9c9c9',
        borderRadius: 3,
        width: '100%'
    },
    pressableSignup: {
        color: 'blue',
        textDecorationLine: 'underline'
    },
    newUserText: {
        padding: 3
    }
});

export default Login;
