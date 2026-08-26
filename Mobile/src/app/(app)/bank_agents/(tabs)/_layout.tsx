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
      {/* 1. Counter Desk (Main Workstation) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Counter Desk',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Branch Queue */}
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Live Queue',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'ticket-confirmation' : 'ticket-confirmation-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Walk-in Ticket Issuer */}
      <Tabs.Screen
        name="walkin"
        options={{
          title: 'Issue Token',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? 'ticket-percent' : 'ticket-percent-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Employee Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Teller Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
