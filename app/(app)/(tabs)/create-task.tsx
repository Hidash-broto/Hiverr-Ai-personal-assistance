import { createTask, getTaskById, updateTask } from '@/services/task-services';
import { Picker } from '@react-native-picker/picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  status: yup.string().oneOf(['open', 'in_progress', 'closed']).required('Status is required'),
  dueDate: yup
    .string()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .notRequired()
    .test('is-date', 'Use DD-MM-YYYY format', (v) => v == null || /^\d{2}-\d{2}-\d{4}$/.test(v)),
});

interface CreateTaskProps {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'closed';
  dueDate?: string | null; // YYYY-MM-DD or null
};

function CreateTask() {
  const [formValues, setFormValues] = useState<CreateTaskProps>({
    title: '',
    description: '',
    status: 'open',
    dueDate: '',
  });

  // To get query params in Expo Router, use useLocalSearchParams
  const params = useLocalSearchParams();
  const taskId: string | undefined | any = params.taskId;

  const formatDateForInput = (d?: string | Date | null) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const dd = `${date.getDate()}`.padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
  };

  const fetchEditableTask = async () => {
    if (taskId) {
      const res = await getTaskById(taskId);
      if (res?.status) {
        setFormValues({
          title: res.task?.title,
          description: res.task?.description,
          status: res.task?.status,
          dueDate: formatDateForInput(res.task?.dueDate),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to fetch task details',
          autoHide: true,
        });
      }
    } else {
      console.log('else case')
      setFormValues({
        title: '',
        description: '',
        status: 'open',
        dueDate: '',
      });
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchEditableTask();
    }, [taskId])
  );

  const handleFormSubmit = async (values: CreateTaskProps) => {
    const payload = {
      ...values,
      dueDate: values.dueDate && values.dueDate.trim() ? values.dueDate.trim() : undefined,
    };
    if (taskId) {
      const res = await updateTask({ ...payload, _id: taskId });
      if (res) {
        Toast.show({
          type: 'success',
          text1: 'Task updated successfully',
          autoHide: true,
        });
        setFormValues({
          title: '',
          description: '',
          status: 'open',
          dueDate: '',
        });
        router.replace('/(app)/(tabs)/tasks');
      }
    } else {
      const res = await createTask(payload);
      if (res?.status) {
        Toast.show({
          type: 'success',
          text1: 'Task created successfully',
          autoHide: true,
        });
        setFormValues({
          title: '',
          description: '',
          status: 'open',
          dueDate: '',
        });
        router.replace('/(app)/(tabs)/tasks');
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
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.screenTitle}>{taskId ? 'Edit Task' : 'Create Task'}</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                placeholder="Enter task title"
                placeholderTextColor="#9ca3af"
              />
              {errors.title && touched.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}

              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={values.status}
                  onValueChange={handleChange('status')}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Open" value="open" />
                  <Picker.Item label="In Progress" value="in_progress" />
                  <Picker.Item label="Closed" value="closed" />
                </Picker>
              </View>
              {errors.status && touched.status && (
                <Text style={styles.errorText}>{errors.status}</Text>
              )}

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                placeholder="Enter task description"
                placeholderTextColor="#9ca3af"
                multiline
              />
              {errors.description && touched.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              <Text style={styles.label}>Due Date (optional)</Text>
              <TextInput
                style={styles.input}
                value={values.dueDate || ''}
                onChangeText={handleChange('dueDate')}
                onBlur={handleBlur('dueDate')}
                placeholder="DD-MM-YYYY (e.g., 31-12-2025)"
                placeholderTextColor="#9ca3af"
              />
              {errors.dueDate && touched.dueDate && (
                <Text style={styles.errorText}>{errors.dueDate}</Text>
              )}

              <Pressable style={styles.button} onPress={handleSubmit as any}>
                <Text style={styles.buttonText}>{taskId ? 'Update Task' : 'Create Task'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </Formik>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f8fa',
    flexGrow: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    color: '#111827',
  },
  textarea: {
    height: 110,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: 'black',
    height: 44,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
});

export default CreateTask;