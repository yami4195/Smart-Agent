import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { tabStyles } from '../../../../../assets/styles/tabs.styles';
import { COLORS } from '../../../../../constants/colors';

export default function BankAgentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarLabelStyle: tabStyles.tabBarLabel,
      }}
    >
      {/* 1. Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Live Queue */}
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Live Queue',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'format-list-bulleted' : 'format-list-bulleted'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Appointment */}
      <Tabs.Screen
        name="appointment"
        options={{
          title: 'Appointment',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'calendar-month' : 'calendar-month-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hide old walkin tab if accessed directly */}
      <Tabs.Screen
        name="walkin"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
