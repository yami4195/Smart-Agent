import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { tabStyles } from '../../../../assets/styles/tabs.styles';
import { COLORS } from '../../../../constants/colors';

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar, // White background tab bar matching screen
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarLabelStyle: tabStyles.tabBarLabel,
      }}
    >
      {/* 🏠 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 📍 2. Branches Tab */}
      <Tabs.Screen
        name="branches"
        options={{
          title: 'Branches',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'location' : 'location-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 🎟️ 3. My Queue Tab (Changed from Queue to "My Queue" per Requirement IV) */}
      <Tabs.Screen
        name="queue"
        options={{
          title: 'My Queue',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'ticket-confirmation' : 'ticket-confirmation-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 👤 4. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
