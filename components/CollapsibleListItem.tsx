// components/CollapsibleListItem.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Or AntDesign, etc.

interface CollapsibleListItemProps {
    title: string;
    children: React.ReactNode; // Content to be collapsed/expanded
    initialOpen?: boolean; // Optional prop to set initial state
}

const CollapsibleListItem: React.FC<CollapsibleListItemProps> = ({
    title,
    children,
    initialOpen = false,
}) => {
    const [open, setOpen] = useState(initialOpen);
    const animationHeight = useRef(new Animated.Value(0)).current; // For height animation
    const rotationAngle = useRef(new Animated.Value(initialOpen ? 1 : 0)).current; // For arrow rotation

    useEffect(() => {
        // Animate height on open/close
        Animated.timing(animationHeight, {
            toValue: open ? 1 : 0, // 1 for expanded, 0 for collapsed
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1), // Standard Material Design easing
            useNativeDriver: false, // Height animation requires useNativeDriver: false
        }).start();

        // Animate arrow rotation on open/close
        Animated.timing(rotationAngle, {
            toValue: open ? 1 : 0, // 1 for points up, 0 for points down
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true, // Transform animations can use native driver
        }).start();
    }, [open]);

    const rotate = rotationAngle.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'], // Rotate from 0 to 180 degrees
    });

    // Calculate the maxHeight for the content. This is crucial for height animations.
    // A common technique is to set a large enough `maxHeight` or measure content.
    // For simpler cases, a fixed large number works. For dynamic content, you'd
    // measure the content's height when it's rendered and then update this value.
    const contentMaxHeight = animationHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100], // Adjust 500 based on your content's max possible height
    });

    return (
        <View>
            <TouchableOpacity onPress={() => setOpen(!open)} style={styles.listItemButton}>
                {/* <MaterialIcons name={icon} size={15} color="orange" style={styles.icon} /> */}
                <Text style={styles.listItemText}>{title}</Text>
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <MaterialIcons name="expand-more" size={15} color="black" />
                </Animated.View>
            </TouchableOpacity>
            <Animated.View style={[styles.collapseContent, { height: contentMaxHeight }]}>
                <View style={styles.innerCollapseContent}>
                    {open && children}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    listItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        // paddingVertical: 12,
        // paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 16,
    },
    listItemText: {
        flex: 1, // Take up available space
        fontSize: 16,
        color: '#333',
    },
    collapseContent: {
        overflow: 'hidden', // Crucial for hiding content outside animated height
        // This paddingLeft makes it look like pl={4} in MUI
    },
    innerCollapseContent: {
        // Add padding-left here if you want it to apply to the content itself
        // and not affect the height animation calculation directly.
    }
});

export default CollapsibleListItem;