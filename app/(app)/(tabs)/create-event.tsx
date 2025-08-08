import { CreateEventProps } from '@/constants/types';
import { Formik } from 'formik';
// import React from 'react'
import { getAllContacts } from '@/services/user';
import MapboxGL from '@rnmapbox/maps';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import * as Yup from 'yup';

// Configure Mapbox access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

const { width, height } = Dimensions.get('window');

function CreateEvent() {
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
    const [contacts, setContacts] = useState<string[]>([]);
    const [contactPermissionGranted, setContactPermissionGranted] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        coordinates: [number, number];
        address: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        (async () => {
            // Check for contact permissions
            const { status } = await Contacts.requestPermissionsAsync();
            setContactPermissionGranted(status === 'granted');

            if (status !== 'granted') {
                Alert.alert('Permission to access contacts was denied. Please enable it in settings.');
            } else {
                const { data } = await Contacts.getContactsAsync({
                    fields: [
                        Contacts.Fields.PhoneNumbers,
                        // You can add more fields if required, e.g., Contacts.Fields.Addresses
                    ],
                });

                try {
                    if (data.length > 0) {
                        // Filter out contacts that might not have a name for cleaner display
                        const validContacts: string[] = data
                            .map(contact => contact?.phoneNumbers?.[0]?.number)
                            .filter(phoneNumber => phoneNumber !== undefined);
                        console.log(validContacts, 'validContacts')
                        const response = await getAllContacts(validContacts);
                        console.log(response, 'response');
                        if (response.status) {
                            setContacts(response?.users || [])
                        }
                    } else {
                        Alert.alert('No contacts found on this device.');
                    }
                } catch (err) {
                    console.error('Error fetching contacts:', err);
                    Alert.alert('Failed to fetch contacts. Please try again.');
                }
            }
        })()
    }, []);


    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        startTime: Yup.date().required('Start time is required'),
        endTime: Yup.date()
            .min(Yup.ref('startTime'), 'End time must be after start time')
            .required('End time is required'),
        location: Yup.object().shape({
            address: Yup.string(),
            latitude: Yup.number(),
            longitude: Yup.number(),
        }),
        attendees: Yup.array().of(Yup.string().email('Invalid email')),
    })

    const handleSubmit = async (values: CreateEventProps, { resetForm, setSubmitting }) => {
        try {
            console.log(values, 'values');
            // Example: await api.createEvent(values);
            alert('Event created!');
            resetForm();
        } catch (e) {
            alert('Failed to create event');
        } finally {
            setSubmitting(false);
        }
    }

    const searchLocation = async (query: string) => {
        if (!query.trim()) return;
        
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=5`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const coordinates: [number, number] = feature.center;
                const address = feature.place_name;
                
                setSelectedLocation({ coordinates, address });
            }
        } catch (error) {
            console.error('Error searching location:', error);
            Alert.alert('Error', 'Failed to search location');
        }
    };

    const handleMapPress = async (feature: any) => {
        const coordinates: [number, number] = feature.geometry.coordinates;
        
        try {
            // Reverse geocoding to get address
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`
            );
            const data = await response.json();
            
            const address = data.features?.[0]?.place_name || `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
            setSelectedLocation({ coordinates, address });
        } catch (error) {
            console.error('Error getting address:', error);
            const address = `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
            setSelectedLocation({ coordinates, address });
        }
    };

    const LocationModal = ({ isVisible, onClose, onConfirm, setFieldValue }: any) => (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Location</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            if (selectedLocation) {
                                setFieldValue('location', {
                                    address: selectedLocation.address,
                                    latitude: selectedLocation.coordinates[1],
                                    longitude: selectedLocation.coordinates[0],
                                });
                                onConfirm();
                            }
                            onClose();
                        }}
                    >
                        <Text style={styles.modalConfirmText}>Done</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a location..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => searchLocation(searchQuery)}
                        returnKeyType="search"
                    />
                    <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={() => searchLocation(searchQuery)}
                    >
                        <Text style={styles.searchButtonText}>🔍</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                    <MapboxGL.MapView
                        style={styles.map}
                        onPress={handleMapPress}
                    >
                        <MapboxGL.Camera
                            zoomLevel={10}
                            centerCoordinate={selectedLocation?.coordinates || [-0.1276, 51.5074]} // Default to London
                        />
                        
                        {selectedLocation && (
                            <MapboxGL.PointAnnotation
                                id="selected-location"
                                coordinate={selectedLocation.coordinates}
                            >
                                <View style={styles.marker}>
                                    <Text style={styles.markerText}>📍</Text>
                                </View>
                            </MapboxGL.PointAnnotation>
                        )}
                    </MapboxGL.MapView>
                </View>

                {selectedLocation && (
                    <View style={styles.selectedLocationInfo}>
                        <Text style={styles.selectedLocationText}>
                            📍 {selectedLocation.address}
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
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
                        <View style={styles.content}>
                            <Text style={styles.header}>Create Event</Text>
                            <Text style={styles.subtitle}>Plan your perfect gathering</Text>

                            <View style={styles.card}>
                                <Text style={styles.label}>Event Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter event title"
                                    placeholderTextColor="#9ca3af"
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                />
                                {touched.title && errors.title && (
                                    <Text style={styles.errorText}>{errors.title}</Text>
                                )}
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                                    placeholder="Describe your event"
                                    placeholderTextColor="#9ca3af"
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    onBlur={handleBlur('description')}
                                    multiline
                                />
                                {touched.description && errors.description && (
                                    <Text style={styles.errorText}>{errors.description}</Text>
                                )}
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.label}>Start Time</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => {
                                        try {
                                            setShowStartPicker(true);
                                        } catch (error) {
                                            console.log('Error opening picker:', error);
                                            Alert.alert('Error', 'Unable to open date picker');
                                        }
                                    }}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {values.startTime ? values.startTime.toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Select start time'}
                                    </Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 16 }}>📅</Text>
                                </TouchableOpacity>
                                {showStartPicker && (
                                    <DatePicker
                                        modal
                                        open={showStartPicker}
                                        date={values.startTime || new Date()}
                                        mode="datetime"
                                        onConfirm={(date) => {
                                            setShowStartPicker(false);
                                            setFieldValue('startTime', date);
                                        }}
                                        onCancel={() => {
                                            setShowStartPicker(false);
                                        }}
                                    />
                                )}
                                {touched.startTime && errors.startTime && (
                                    <Text style={styles.errorText}>{errors.startTime as string}</Text>
                                )}
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.label}>End Time</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowEndPicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {values.endTime ? values.endTime.toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Select end time'}
                                    </Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 16 }}>📅</Text>
                                </TouchableOpacity>
                                {showEndPicker && (
                                    <DatePicker
                                        modal
                                        open={showEndPicker}
                                        date={values.endTime}
                                        mode="datetime"
                                        onConfirm={date => {
                                            setFieldValue('endTime', date);
                                            setShowEndPicker(false);
                                        }}
                                        onCancel={() => setShowEndPicker(false)}
                                    />
                                )}
                                {touched.endTime && errors.endTime && (
                                    <Text style={styles.errorText}>{errors.endTime as string}</Text>
                                )}
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.label}>Attendees</Text>
                                <ScrollView style={styles.attendeesContainer} nestedScrollEnabled>
                                    {contacts.length === 0 ? (
                                        <Text style={styles.emptyText}>No contacts available</Text>
                                    ) : (
                                        contacts.map((email: string) => {
                                            const isSelected = values.attendees.includes(email);
                                            return (
                                                <TouchableOpacity
                                                    key={email}
                                                    style={[
                                                        styles.attendeeItem,
                                                        isSelected && styles.attendeeSelected
                                                    ]}
                                                    onPress={() => {
                                                        if (isSelected) {
                                                            setFieldValue(
                                                                'attendees',
                                                                values.attendees.filter((a: string) => a !== email)
                                                            );
                                                        } else {
                                                            setFieldValue(
                                                                'attendees',
                                                                [...values.attendees, email]
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.attendeeText,
                                                        isSelected && styles.attendeeSelectedText
                                                    ]}>
                                                        {email}
                                                    </Text>
                                                    <View style={[
                                                        styles.checkbox,
                                                        isSelected && styles.checkboxSelected
                                                    ]}>
                                                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })
                                    )}
                                </ScrollView>
                                {touched.attendees && errors.attendees && typeof errors.attendees === 'string' && (
                                    <Text style={styles.errorText}>{errors.attendees}</Text>
                                )}
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.label}>Location (Optional)</Text>
                                <TouchableOpacity
                                    style={styles.locationButton}
                                    onPress={() => setShowLocationModal(true)}
                                >
                                    <View style={styles.locationButtonContent}>
                                        <Text style={styles.locationButtonText}>
                                            {values.location.address || 'Select event location'}
                                        </Text>
                                        <Text style={{ color: '#9ca3af', fontSize: 16 }}>📍</Text>
                                    </View>
                                </TouchableOpacity>
                                
                                {values.location.address && (
                                    <View style={styles.locationPreview}>
                                        <Text style={styles.locationPreviewText}>
                                            📍 {values.location.address}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setFieldValue('location', { address: '', latitude: 0, longitude: 0 })}
                                            style={styles.removeLocationButton}
                                        >
                                            <Text style={styles.removeLocationText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                
                                {touched.location?.address && errors.location?.address && (
                                    <Text style={styles.errorText}>{errors.location.address}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isSubmitting && styles.submitButtonDisabled
                                ]}
                                onPress={handleSubmit as any}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Creating...' : 'Create Event'}
                                </Text>
                            </TouchableOpacity>

                            <LocationModal
                                isVisible={showLocationModal}
                                onClose={() => setShowLocationModal(false)}
                                onConfirm={() => setShowLocationModal(false)}
                                setFieldValue={setFieldValue}
                            />
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center' as const,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center' as const,
        marginBottom: 32,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#ffffff',
        color: '#1e293b',
    },
    inputFocused: {
        borderColor: '#3b82f6',
        backgroundColor: '#ffffff',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#ffffff',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#374151',
    },
    attendeesContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        maxHeight: 200,
    },
    attendeeItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    attendeeSelected: {
        backgroundColor: '#eff6ff',
        borderBottomColor: '#dbeafe',
    },
    attendeeText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    attendeeSelectedText: {
        color: '#1d4ed8',
        fontWeight: '500' as const,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    checkboxSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    checkmark: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold' as const,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center' as const,
        marginTop: 24,
        marginBottom: 20,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600' as const,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
    emptyText: {
        padding: 16,
        color: '#9ca3af',
        fontSize: 16,
        textAlign: 'center' as const,
        fontStyle: 'italic' as const,
    },
    locationButton: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    locationButtonContent: {
        padding: 16,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    locationButtonText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    locationPreview: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    locationPreviewText: {
        fontSize: 14,
        color: '#0369a1',
        flex: 1,
    },
    removeLocationButton: {
        padding: 4,
    },
    removeLocationText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold' as const,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#1e293b',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#6b7280',
    },
    modalConfirmText: {
        fontSize: 16,
        color: '#3b82f6',
        fontWeight: '600' as const,
    },
    searchContainer: {
        flexDirection: 'row' as const,
        padding: 16,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    searchButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        minWidth: 48,
    },
    searchButtonText: {
        fontSize: 16,
    },
    mapContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    map: {
        flex: 1,
    },
    marker: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    markerText: {
        fontSize: 24,
    },
    selectedLocationInfo: {
        padding: 16,
        backgroundColor: '#f0f9ff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    selectedLocationText: {
        fontSize: 14,
        color: '#0369a1',
    },
};

export default CreateEvent;