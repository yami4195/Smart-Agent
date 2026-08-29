import { Stack } from 'expo-router';
import React from 'react';
import { useSyncUser } from '../../hooks/useSyncUser';
import { NotificationProvider } from '../../contexts/NotificationContext';

export default function AppLayout() {
  // Automatically syncs authenticated user with PostgreSQL backend and store
  useSyncUser();

  return (
    <NotificationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </NotificationProvider>
  );
}
