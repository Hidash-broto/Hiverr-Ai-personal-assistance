import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ImageBackground, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'expo-router';
import backgroundImage from '@/assets/images/portrait-person-ai-robot.jpg'
import { login } from '@/services/auth';
import toast from 'react-native-toast-message';

function Login() {
    const { saveToken } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });

    // creating a useEffect for autoLogin to avoid re type input in develepment stage
    useEffect(() => {
        const autoLogin = async () => {
            const token = await saveToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhiMWZiNGNmODMyNTU5NzdjNTYyOWIiLCJpYXQiOjE3NTYxMTI3MzcsImV4cCI6MTc1NjE5OTEzN30.UNyovzZ1GR7eRPiwwS2YJBmFqznLSS33rcVytMkHfRQ');
            if (token) {
                router.replace('/(app)/(tabs)');
            }
        }
        autoLogin();
    }, []);

    const handleLogin = async () => {
        if (!formData.email.trim() || !formData.password.trim()) {
            toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: 'Please enter both email and password.',
            });
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: 'Please enter a valid email address.',
            });
            return;
        }
        // In a real app, you'd have a login form and an API call
        const response = await login(formData);
        if (response.token) {
            saveToken(response.token);
            toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: 'Welcome back!',
            });
            router.replace('/(app)/(tabs)');
        } else {
            toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: response.message || 'Please check your credentials and try again.',
            });
            console.error('Login failed:', response);
        }
    }

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <ImageBackground style={styles.backgroundImage} source={backgroundImage} resizeMode='cover'>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>login</Text>
                        <TextInput
                            value={formData.email}
                            style={styles.input}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder='Email'
                            placeholderTextColor='grey'
                            textContentType='emailAddress'
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                        <TextInput
                            value={formData.password}
                            style={styles.input}
                            onChangeText={(value) => handleChange('password', value)}
                            textContentType='password'
                            placeholder='Password'
                            placeholderTextColor='grey'
                            secureTextEntry={true}
                        />
                        <TouchableOpacity onPress={handleLogin} style={styles.button}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                        <Text style={styles.newUserText}>
                            New User,{' '}
                            <Pressable onPress={handleSignupClick}>
                                <Text style={styles.pressableSignup}>Signup</Text>
                            </Pressable>
                        </Text>
                    </View>
                </ImageBackground>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#172338',
    },
    formContainer: {
        backgroundColor: 'white',
        width: '80%',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        padding: 25,
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        opacity: 0.9
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
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        opacity: 0.7
    },
    button: {
        width: '100%',
        marginTop: 10,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#841584',
        padding: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default Login;
