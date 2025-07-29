import React from 'react'
import { Text, View } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

function HiverrBot() {
    const mapKey = process.env.EXPO_PUBLIC_MAP_API_KEY;
    console.log(mapKey, 'mapKey');
    return (
            <GooglePlacesAutocomplete
                placeholder="Type a place"
                query={{ key: 'AIzaSyDp4W64ZK8zeZkiAeEApf79jKkXzmQ1XPo', language: 'en' }}
                fetchDetails={true}
                predefinedPlaces={[
                    // Example predefined places
                    { description: 'New York, NY', place_id: 'ChIJNYcQX5FZwokR3c1d9g2k8', structured_formatting: { main_text: 'New York, NY', secondary_text: '' } },
                ]}
                textInputProps={{}}
                listEmptyComponent={() => (
                    <View style={{ flex: 1 }}>
                        <Text>No results were found</Text>
                    </View>
                )}
                onPress={(data, details = null) => {
                    console.log(data, details, 'data and details');
                }}
                styles={{
                    textInput: {
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 4,
                        padding: 8,
                    },
                    container: {
                        flex: 1,
                        marginBottom: 10,
                        // height: 500
                    },
                    listView: {
                        //maxHeight: 200, // Limit list height
                        borderColor: '#eee',
                        borderWidth: 1,
                        borderRadius: 8,
                        backgroundColor: 'white',
                        zIndex: 1,
                    },
                }}
            />
    )
}

export default HiverrBot