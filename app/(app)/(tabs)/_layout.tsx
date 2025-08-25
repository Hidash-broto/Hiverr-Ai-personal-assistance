import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const redirect = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <MaterialIcons size={17} name="checklist-rtl" color={color} />,
          headerRight: () => (
            <Pressable style={{ marginRight: 15 }} onPress={() => redirect.push('/create-task')}>
              {({ pressed }) => (
              <View style={{ backgroundColor: 'black', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons size={17} name="add" color='white' />
              </View>
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="create-task"
        options={{
          title: 'Create Task',
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: 'Create Event',
          href: null,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <MaterialIcons size={17} name="event" color={color} />,
          headerRight: () => (
            <Pressable style={{ marginRight: 15 }} onPress={() => redirect.push('/create-event')}>
              {({ pressed }) => (
                <View style={{ backgroundColor: 'black', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons size={17} name="add" color='white' />
                </View>
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="calender"
        options={{
          title: 'Calender',
          tabBarIcon: ({ color }) => <MaterialIcons size={17} name="calendar-month" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="hiverrBot"
        options={{
          title: 'Hiverr Bot',
          tabBarIcon: ({ color }) => <MaterialIcons size={17} name="computer" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>

  );
}
