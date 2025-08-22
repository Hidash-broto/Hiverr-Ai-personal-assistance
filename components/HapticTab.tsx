import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      android_ripple={{ 
        color: 'rgba(0, 0, 0, 0.1)', 
        borderless: false,
        foreground: true 
      }}
      onPressIn={(ev) => {
        // Enable haptic feedback on both iOS and Android
        if (Platform.OS === 'ios') {
          // Light impact for iOS (feels more natural)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
          // Selection feedback for Android (feels better on Android)
          Haptics.selectionAsync();
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
