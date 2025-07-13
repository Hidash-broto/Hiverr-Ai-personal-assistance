import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ImageBackground, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'expo-router';
import backgroundImage from '@/assets/images/portrait-person-ai-robot.jpg'
import { signup } from '@/services/auth';
import toast from 'react-native-toast-message';

function Signup() {
  const { saveToken } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSignup = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: 'Please enter all fields.',
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: 'Please enter a valid email address.',
      });
      return;
    }
    // In a real app, you'd have a login form and an API call
    const response = await signup(formData);
    if (response.token) {
      saveToken(response.token);
      toast.show({
        type: 'success',
        text1: 'Signup Successful',
        text2: 'Welcome back!',
      });
      router.replace('/(app)/(tabs)/index');
    } else {
      toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: response.message || 'Please try again later.',
      });
      console.error('Signup failed:', response);
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData(prev => {
      return {
        ...prev,
        [name]: value,
      }
    })
  }

  const handleLoginClick = () => {
    router.replace('/(auth)/login')
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground style={styles.backgroundImage} source={backgroundImage} resizeMode='cover'>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Signup</Text>
            <TextInput
              value={formData.name}
              style={styles.input}
              onChangeText={(value) => handleChange('name', value)}
              placeholder='Name'
              placeholderTextColor='grey'
              textContentType='name'
            />
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
            <TouchableOpacity onPress={handleSignup} style={styles.button}>
              <Text style={styles.buttonText}>Signup</Text>
            </TouchableOpacity>
            <Text style={styles.ExistingUserText}>
              Existing User,{' '}
              <Pressable onPress={handleLoginClick}>
                <Text style={styles.pressableLogin}>Login</Text>
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
  pressableLogin: {
    color: 'blue',
    textDecorationLine: 'underline'
  },
  ExistingUserText: {
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

export default Signup