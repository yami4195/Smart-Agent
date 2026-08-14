import { Redirect } from 'expo-router';
import React from 'react';

export default function AppEntryScreen() {
  // Automatically redirect authenticated customers to the customer tab navigation
  return <Redirect href="/(app)/customer"/>;
}
