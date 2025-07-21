import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native';
import { createTask } from '@/services/task-services';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title is required',
        autoHide: true,
      });
      return;
    }
    const res = await createTask({ title, description });
    if (res.status) {
      Toast.show({
        type: 'success',
        text1: 'Task created successfully',
        autoHide: true,
      });
      router.back();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        autoHide: true,
      });
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          multiline
        />
        <Pressable style={styles.button} onPress={handleCreateTask}>
          <Text style={styles.buttonText}>Create Task</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateTask;
''