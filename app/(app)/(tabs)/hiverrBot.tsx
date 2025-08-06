// import React, { useState, useRef, useEffect } from 'react';
// import { View, StyleSheet, Text, Button, Dimensions, Platform, PermissionsAndroid } from 'react-native';
// import Mapbox, { MapView, Camera, PointAnnotation } from '@rnmapbox/maps';

// // IMPORTANT: Use your actual Mapbox access token from app.json/app.config.js `extra`
// // It's generally better to read this from `Constants.manifest?.extra?.MAPBOX_ACCESS_TOKEN`
// // but for simplicity here, we'll assume it's directly accessible if you set it in `app.config.js`
// // or use a direct import if you've set up a dedicated constants file.
// // For development, you can hardcode it here during initial setup, but REMOVE it for production.
// const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN_HERE";

// // Set the access token for Mapbox SDK
// Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// const { width, height } = Dimensions.get('window');

// interface MapPickerProps {
//   onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
//   initialLatitude?: number;
//   initialLongitude?: number;
// }

// const HiverrBot: React.FC<MapPickerProps> = ({
//   onLocationSelect,
//   initialLatitude = 10.8505, // Default to a central point in Kerala (Kochi)
//   initialLongitude = 76.2711,
// }) => {
//   const [selectedCoordinate, setSelectedCoordinate] = useState<[number, number]>([initialLongitude, initialLatitude]);
//   const cameraRef = useRef<Camera>(null);

//   useEffect(() => {
//     requestLocationPermission();
//   }, []);

//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: "Location Permission",
//             message: "This app needs access to your location to show it on the map.",
//             buttonNeutral: "Ask Me Later",
//             buttonNegative: "Cancel",
//             buttonPositive: "OK"
//           }
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           console.log("Location permission granted");
//         } else {
//           console.log("Location permission denied");
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     }
//   };

//   const onMapPress = async (feature: any) => {
//     if (feature.geometry && feature.geometry.coordinates) {
//       const [longitude, latitude] = feature.geometry.coordinates;
//       setSelectedCoordinate([longitude, latitude]);
//       // You could integrate reverse geocoding here if you need the address
//       // For example, using Mapbox Geocoding API or a separate library.
//       // For now, we'll just pass coordinates.
//     }
//   };

//   const onConfirm = () => {
//     onLocationSelect({
//       latitude: selectedCoordinate[1],
//       longitude: selectedCoordinate[0],
//       // address: 'Optional: Add address from reverse geocoding if implemented'
//     });
//   };

//   return (
//     <View style={styles.page}>
//       <View style={styles.container}>
//         <MapView
//           style={styles.map}
//           styleURL={Mapbox.StyleURL.Street} // You can use other styles like Light, Dark, Satellite
//           onPress={onMapPress} // Tap to select location
//         >
//           <Camera
//             ref={cameraRef}
//             zoomLevel={14}
//             centerCoordinate={[initialLongitude, initialLatitude]}
//             animationMode="flyTo"
//             animationDuration={0}
//           />
//           {selectedCoordinate && (
//             <PointAnnotation
//               id="selectedLocation"
//               coordinate={selectedCoordinate}
//             >
//               <View style={styles.marker}>
//                 <Text style={styles.markerText}>📍</Text>
//               </View>
//               <Mapbox.Callout title="Selected Location" />
//             </PointAnnotation>
//           )}
//           <Mapbox.UserLocation visible={true} /> {/* Shows user's current location */}
//         </MapView>
//       </View>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>
//           Selected: {selectedCoordinate[1].toFixed(4)}, {selectedCoordinate[0].toFixed(4)}
//         </Text>
//         <Button title="Confirm Location" onPress={onConfirm} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   container: {
//     height: height * 0.7, // 70% of screen height
//     width: width * 0.9, // 90% of screen width
//     backgroundColor: 'white',
//     borderRadius: 10,
//     overflow: 'hidden',
//     borderColor: '#ddd',
//     borderWidth: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   marker: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backgroundColor: 'red', // Example styling for custom marker
//     // borderRadius: 15,
//   },
//   markerText: {
//     fontSize: 24,
//   },
//   infoBox: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#eee',
//     width: width * 0.9,
//     alignItems: 'center',
//   },
//   infoText: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
// });

// export default HiverrBot;

import React from 'react'

function HiverrBot() {
  return (
    <></>
  )
}

export default HiverrBot