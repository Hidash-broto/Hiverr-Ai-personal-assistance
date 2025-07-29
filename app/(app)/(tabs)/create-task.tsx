import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { createTask, getTaskById, updateTask } from '@/services/task-services';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import * as yup from 'yup';
import { router, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  // dueDate: yup.date().min(new Date(), 'Due date must be in the future').required('Due date is required'),
});

interface CreateTaskProps {
  title?: string;
  description?: string;
  priority?: string;
  // dueDate?: Date | null;
};
function CreateTask() {
  const [formValues, setFormValues] = useState<CreateTaskProps>({
    title: '',
    description: '',
    priority: 'medium',
  });

  // To get query params in Expo Router, use useLocalSearchParams
  const params = useLocalSearchParams();
  const taskId: string | undefined | any = params.taskId;

  useEffect(() => {
    const fetchEditableTask = async () => {
      if (taskId) {
        const res = await getTaskById(taskId);
        if (res.status) {
          setFormValues({
            title: res.task?.title,
            description: res.task?.description,
            priority: res.task?.priority,
            // dueDate: res.dueDate ? new Date(res.dueDate) : null,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to fetch task details',
            autoHide: true,
          });
        }
      }
    }
    fetchEditableTask();
  }, [taskId]);

  const handleFormSubmit = async (values: CreateTaskProps) => {
    if (taskId) {
      const res = await updateTask({ ...values, _id: taskId });
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Task updated successfully',
          autoHide: true,
        });
        // go back
        setFormValues({
          title: '',
          description: '',
          priority: 'medium',
        });
        // Optionally, you can navigate back or reset the form
        router.back();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update task',
          autoHide: true,
        });
      }
    } else {
      const res = await createTask(values);
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Task created successfully',
          autoHide: true,
        });
        setFormValues({
          title: '',
          description: '',
          priority: 'medium',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong',
          autoHide: true,
        });
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={handleFormSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <View style={{ paddingHorizontal: 10 }}>
              <TextInput
                style={styles.input}
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                placeholder="Enter task title"
              />
              {errors.title && touched.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>
            <Text style={styles.label}>Priority<Text style={{ fontSize: 14, opacity: 0.5, fontWeight: 'normal' }}> (Scroll for changing)</Text></Text>
            <View>
              <Picker
                selectedValue={values.priority}
                onValueChange={handleChange('priority')}
                style={{ width: '100%', marginBottom: 15, backgroundColor: '#fff' }}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="High" value="high" />
              </Picker>
            </View>

            {/* <Text style={styles.label}>Due Date</Text>
            <View style={{ marginBottom: 15, width: '100%' }}>
              <DateTimePicker
                value={values.dueDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate?.toISOString() || values.dueDate;
                  setFieldValue('dueDate', new Date(currentDate));
                }}
                textColor="black"
                minimumDate={new Date()}
                style={{ width: '100%', backgroundColor: '#fff' }}
              />
            </View> */}

            <Text style={styles.label}>Description</Text>
            <View style={{ paddingHorizontal: 10 }}>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                placeholder="Enter task description"
                multiline
              />
              {errors.description && touched.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>
            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Create Task</Text>
            </Pressable>
          </View>
        )}
      </Formik>
    </TouchableWithoutFeedback>
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
  pickerItem: {
    fontSize: 20,
    color: 'black',
    height: 50,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CreateTask;