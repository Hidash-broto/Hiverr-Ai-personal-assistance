import { CreateEventProps } from '@/constants/types';
import { Formik } from 'formik';
// import React from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useState } from 'react';


function CreateEvent() {
    const [attendeesList, setAttendeesList] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<CreateEventProps>({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(),
        location: {
            address: '',
            latitude: 0,
            longitude: 0,
        },
        attendees: [],
    });

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        startTime: Yup.date().required('Start time is required'),
        endTime: Yup.date()
            .min(Yup.ref('startTime'), 'End time must be after start time')
            .required('End time is required'),
        location: Yup.object().shape({
            address: Yup.string().required('Location is required'),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
        }),
        attendees: Yup.array().of(Yup.string().email('Invalid email')),
    })

    const handleSubmit = async (values: CreateEventProps, { resetForm, setSubmitting }) => {
        try {
            // Example: await api.createEvent(values);
            alert('Event created!');
            resetForm();
        } catch (e) {
            alert('Failed to create event');
        } finally {
            setSubmitting(false);
        }
    }

    const mapKey = process.env.EXPO_PUBLIC_MAP_API_KEY;
    console.log(mapKey, 'mapKey');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            {/* <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled"> */}
            <Formik
                initialValues={formValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    values,
                    errors,
                    touched,
                    isSubmitting,
                }) => (
                    <View style={{ flex: 1, padding: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Create Event</Text>
                        <Text>Title</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 4, padding: 8 }}
                            placeholder="Event Title"
                            value={values.title}
                            onChangeText={handleChange('title')}
                            onBlur={handleBlur('title')}
                        />
                        {touched.title && errors.title && (
                            <Text style={{ color: 'red', marginBottom: 8 }}>{errors.title}</Text>
                        )}

                        <Text>Description</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 4, padding: 8 }}
                            placeholder="Description"
                            value={values.description}
                            onChangeText={handleChange('description')}
                            onBlur={handleBlur('description')}
                            multiline
                        />
                        {touched.description && errors.description && (
                            <Text style={{ color: 'red', marginBottom: 8 }}>{errors.description}</Text>
                        )}
                        <Text>Start Time</Text>
                        <DateTimePicker
                            value={values.startTime}
                            mode="datetime"
                            display="default"
                            onChange={(_, date) => {
                                if (date) setFieldValue('startTime', date);
                            }}
                            style={{ marginBottom: 4 }}
                        />
                        {touched.startTime && errors.startTime && (
                            <Text style={{ color: 'red', marginBottom: 8 }}>{errors.startTime as string}</Text>
                        )}

                        <Text>End Time</Text>
                        <DateTimePicker
                            value={values.endTime}
                            mode="datetime"
                            display="default"
                            onChange={(_, date) => {
                                if (date) setFieldValue('endTime', date);
                            }}
                            style={{ marginBottom: 4 }}
                        />
                        {touched.endTime && errors.endTime && (
                            <Text style={{ color: 'red', marginBottom: 8 }}>{errors.endTime as string}</Text>
                        )}

                        <Text>Location</Text>
                        <View style={{ marginBottom: 50, marginTop: 10, height: 100 }}>
                            <GooglePlacesAutocomplete
                                placeholder="Search for location"
                                fetchDetails={true}
                                onPress={(data, details = null) => {
                                    console.log(data, details);
                                    // if (details) {
                                    //     setFieldValue('location', {
                                    //         address: details.formatted_address,
                                    //         latitude: details.geometry.location.lat,
                                    //         longitude: details.geometry.location.lng,
                                    //     });
                                    // }
                                }}
                                listEmptyComponent={() => (
                                    <View style={{ flex: 1 }}>
                                        <Text>No results were found</Text>
                                    </View>
                                )}
                                query={{
                                    key: mapKey,
                                    language: 'en',
                                    // types: 'geocode'
                                }}
                                styles={{
                                    textInput: {
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        borderRadius: 4,
                                        padding: 8,
                                    },
                                    // container: {
                                    //     flex: 1,
                                    //     marginBottom: 10,
                                    // },
                                    listView: {
                                        //maxHeight: 200, // Limit list height
                                        borderColor: '#eee',
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        //backgroundColor: 'white',
                                    },
                                }}
                                predefinedPlaces={[]}
                                textInputProps={{}}
                                onFail={error => console.log(error)}
                                // nearbyPlacesAPI="GooglePlacesSearch"
                                debounce={200}
                            />
                            {values.location.address ? (
                                <Text style={{ marginTop: 4, color: 'gray' }}>{values.location.address}</Text>
                            ) : null}
                            {touched.location?.address && errors.location?.address && (
                                <Text style={{ color: 'red', marginBottom: 8 }}>{errors.location.address}</Text>
                            )}
                        </View>

                        <Text>Attendees</Text>
                        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 4 }}>
                            {attendeesList.length === 0 ? (
                                <Text style={{ padding: 8, color: 'gray' }}>No attendees available</Text>
                            ) : (
                                attendeesList.map((email) => (
                                    <TouchableOpacity
                                        key={email}
                                        style={{
                                            padding: 8,
                                            backgroundColor: values.attendees.includes(email) ? '#e6f0ff' : '#fff',
                                        }}
                                    // onPress={() => {
                                    //     if (values.attendees.includes(email)) {
                                    //         setFieldValue(
                                    //             'attendees',
                                    //             values.attendees.filter((a) => a !== email)
                                    //         );
                                    //     } else {
                                    //         setFieldValue(
                                    //             'attendees',
                                    //             [...values.attendees, email]
                                    //         );
                                    //     }
                                    // }}
                                    >
                                        <Text>{email}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                        {touched.attendees && errors.attendees && typeof errors.attendees === 'string' && (
                            <Text style={{ color: 'red', marginBottom: 8 }}>{errors.attendees}</Text>
                        )}

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#007bff',
                                padding: 12,
                                borderRadius: 4,
                                alignItems: 'center',
                                marginTop: 8,
                                opacity: isSubmitting ? 0.6 : 1,
                            }}
                            onPress={handleSubmit as any}
                            disabled={isSubmitting}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Event</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Formik>
            {/* </ScrollView> */}
        </KeyboardAvoidingView>
    )
}

export default CreateEvent;