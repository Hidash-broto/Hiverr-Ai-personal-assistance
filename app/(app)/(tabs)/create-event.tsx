import { CreateEventProps } from '@/constants/types';
import { createEvent, getEventById, updateEvent } from '@/services/event';
import { getAllContacts } from '@/services/user';
import { useFocusEffect } from '@react-navigation/native';
import MapboxGL from '@rnmapbox/maps';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, /* PermissionsAndroid, */ Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import Contacts from 'react-native-contacts';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

// Configure Mapbox access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAP_API_KEY || '');


const LocationModal = ({
    isVisible,
    onClose,
    onConfirm,
    setFieldValue,
    setSearchQuery,
    searchQuery,
    locationPermissionGranted,
    userLocation,
    selectedLocation,
    searchLocation,
    handleMapPress,
    setUserLocation,
    setSelectedLocation
}: any) => {
    const [renderMap, setRenderMap] = useState(false);
    const [renderKey, setRenderKey] = useState<number | null>(null);

    const handleOpen = () => {
        setRenderKey(Date.now()); // force fresh mount
        // render after modal fully shown to avoid ViewTagResolver crash
        requestAnimationFrame(() => setRenderMap(true));
    };

    const handleClose = () => {
        setRenderMap(false);
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onShow={handleOpen}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={handleClose}>
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
                            handleClose();
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
                        onChangeText={(text: string) => setSearchQuery(text)}
                        onSubmitEditing={() => searchLocation(searchQuery)}
                        returnKeyType="search"
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => searchLocation(searchQuery)}
                    >
                        <Text style={styles.searchButtonText}>🔍</Text>
                    </TouchableOpacity>
                    {locationPermissionGranted && userLocation && (
                        <TouchableOpacity
                            style={styles.myLocationButton}
                            onPress={async () => {
                                try {
                                    const location = await Location.getCurrentPositionAsync({
                                        accuracy: Location.Accuracy.Balanced,
                                    });
                                    const coords: [number, number] = [
                                        location.coords.longitude,
                                        location.coords.latitude
                                    ];
                                    setUserLocation(coords);

                                    // Reverse geocoding to get current address
                                    const response = await fetch(
                                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${process.env.EXPO_PUBLIC_MAP_API_KEY}`
                                    );
                                    const data = await response.json();
                                    const address = data.features?.[0]?.place_name || `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
                                    setSelectedLocation({ coordinates: coords, address });
                                } catch (error) {
                                    console.error('Error getting current location:', error);
                                    Alert.alert('Error', 'Failed to get current location');
                                }
                            }}
                        >
                            <Text style={styles.myLocationButtonText}>📍</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.mapContainer}>
                    {renderMap && userLocation && (
                        <MapboxGL.MapView
                            key={renderKey || 'map-modal'}
                            style={styles.map}
                            styleURL={MapboxGL.StyleURL.Street}
                            surfaceView={true}
                            onPress={handleMapPress}
                        >
                            <MapboxGL.Camera
                                zoomLevel={14}
                                centerCoordinate={selectedLocation?.coordinates || userLocation}
                                animationDuration={300}
                            />

                            {locationPermissionGranted && (
                                <MapboxGL.UserLocation visible={true} androidRenderMode="compass" />
                            )}

                            {locationPermissionGranted && (
                                <MapboxGL.PointAnnotation id="user-location" coordinate={userLocation}>
                                    <View style={styles.userLocationMarker}>
                                        <View style={styles.userLocationDot} />
                                    </View>
                                </MapboxGL.PointAnnotation>
                            )}

                            {selectedLocation && (
                                <MapboxGL.PointAnnotation id="selected-location" coordinate={selectedLocation.coordinates}>
                                    <View style={styles.marker}>
                                        <Text style={styles.markerText}>📍</Text>
                                    </View>
                                </MapboxGL.PointAnnotation>
                            )}
                        </MapboxGL.MapView>
                    )}
                </View>

                {selectedLocation && (
                    <View style={styles.selectedLocationInfo}>
                        <Text style={styles.selectedLocationText}>📍 {selectedLocation.address}</Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

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
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        coordinates: [number, number];
        address: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [contactPermissionGranted, setContactPermissionGranted] = useState(false);

    useEffect(() => {
        (async () => {
            // Get location permission and user's current location (expo-location)
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setLocationPermissionGranted(true);
                try {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    const userCoords: [number, number] = [
                        location.coords.longitude,
                        location.coords.latitude
                    ];
                    setUserLocation(userCoords);
                } catch (error) {
                    console.error('Error getting current location:', error);
                    setUserLocation([-0.1276, 51.5074]);
                }
            } else {
                console.log('Location permission denied');
                setUserLocation([-0.1276, 51.5074]);
            }

            // Request contacts permission (expo-contacts)
            await requestContactPermissions();
        })()
    }, []);

    const requestContactPermissions = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                setContactPermissionGranted(true);
                await loadContacts();
            } else {
                setContactPermissionGranted(false);
                console.log('Contacts permission denied');
                Alert.alert(
                    'Permission Required',
                    'Contacts permission is needed to invite people to events. You can enable it in Settings.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error requesting contacts permission:', error);
            Alert.alert('Error', 'Failed to request contacts permission');
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.Emails,
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.Name,
                ],
                sort: Contacts.SortTypes.FirstName,
            });

            console.log(`Found ${data.length} contacts`);

            if (data.length > 0) {
                const phoneNumbers: string[] = [];

                data.forEach(contact => {
                    const numbers = contact.phoneNumbers ?? [];
                    numbers.forEach((phone) => {
                        if (phone.number) {
                            const cleanNumber = phone.number.replace(/[\s\-\(\)]/g, '');
                            if (cleanNumber.length >= 8) {
                                phoneNumbers.push(cleanNumber);
                            }
                        }
                    });
                });

                console.log(`Extracted ${phoneNumbers.length} phone numbers`);

                const uniqueNumbers = [...new Set(phoneNumbers)];
                console.log(`${uniqueNumbers.length} unique phone numbers`);

                if (uniqueNumbers.length > 0) {
                    const response = await getAllContacts(uniqueNumbers);
                    if (response?.status) {
                        setContacts(response?.users || []);
                        console.log(`Set ${response?.users?.length || 0} registered contacts`);
                    } else {
                        console.log('No registered users found');
                        setContacts([]);
                    }
                } else {
                    Alert.alert('No phone numbers found in your contacts.');
                    setContacts([]);
                }
            } else {
                Alert.alert('No contacts found on this device.');
                setContacts([]);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            Alert.alert('Error', 'Failed to load contacts. Please try again.');
            setContacts([]);
        }
    };

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

    // event Id from query
    const { eventId }: { eventId: string | undefined | any } = useLocalSearchParams();

    const fetchEvent = async () => {
        if (eventId) {
            const eventData = await getEventById(eventId);
            if (eventData) {
                setFormValues({
                    ...eventData,
                    startTime: new Date(eventData.startTime),
                    endTime: new Date(eventData.endTime),
                });
            }
        }
    }

    useFocusEffect(useCallback(() => {
        fetchEvent();
        return () => { };
    }, [eventId]));

    const handleSubmit = async (values: CreateEventProps, { resetForm, setSubmitting }) => {
        try {
            if (eventId) {
                const response = await updateEvent(eventId, {
                    ...values,
                    startTime: values.startTime.toISOString(),
                    endTime: values.endTime.toISOString(),
                });
                if (response.status) {
                    Toast.show({
                        type: 'success',
                        text1: 'Event updated successfully',
                        autoHide: true,
                    });
                    router.replace('/(app)/(tabs)/events');
                }
            } else {
                const response = await createEvent(values);
                if (response.status) {
                    Toast.show({
                        type: 'success',
                        text1: 'Event created successfully',
                        autoHide: true,
                    });
                    router.replace('/(app)/(tabs)/events');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Failed to create event. Please try again.',
                        autoHide: true,
                    });
                }
            }
        } catch (e: any) {
            alert(e.response.data.message);
        } finally {
            setSubmitting(false);
        }
    }

    const searchLocation = async (query: string) => {
        if (!query.trim()) return;

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.EXPO_PUBLIC_MAP_API_KEY}&limit=5`
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
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${process.env.EXPO_PUBLIC_MAP_API_KEY}`
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
                    enableReinitialize={true}
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
                                            minute: '2-digit',
                                            hour12: true
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
                                            minute: '2-digit',
                                            hour12: true
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
                                {!contactPermissionGranted ? (
                                    <View style={styles.permissionPrompt}>
                                        <Text style={styles.permissionText}>
                                            Grant contacts permission to invite people
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.permissionButton}
                                            onPress={requestContactPermissions}
                                        >
                                            <Text style={styles.permissionButtonText}>
                                                Allow Contacts
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <ScrollView style={styles.attendeesContainer} nestedScrollEnabled>
                                        {contacts.length === 0 ? (
                                            <Text style={styles.emptyText}>No registered contacts found</Text>
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
                                )}
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
                                    {
                                        eventId ? (
                                            isSubmitting ? 'Updating...' : 'Update Event'
                                        ) : (
                                            isSubmitting ? 'Creating...' : 'Create Event'
                                        )
                                    }
                                </Text>
                            </TouchableOpacity>

                            <LocationModal
                                isVisible={showLocationModal}
                                onClose={() => setShowLocationModal(false)}
                                onConfirm={() => setShowLocationModal(false)}
                                setFieldValue={setFieldValue}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                locationPermissionGranted={locationPermissionGranted}
                                userLocation={userLocation}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                handleMapPress={handleMapPress}
                                searchLocation={searchLocation}
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
    myLocationButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        minWidth: 48,
    },
    myLocationButtonText: {
        fontSize: 16,
    },
    userLocationMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        borderWidth: 3,
        borderColor: '#3b82f6',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    userLocationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
    },
    permissionPrompt: {
        padding: 20,
        alignItems: 'center' as const,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    permissionText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center' as const,
        marginBottom: 12,
    },
    permissionButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600' as const,
    },
};

export default CreateEvent;