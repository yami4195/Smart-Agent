import { Stack } from 'expo-router';
import React from 'react';
import { useSyncUser } from '../../hooks/useSyncUser';

export default function AppLayout() {
  // Automatically syncs authenticated user with PostgreSQL backend and store
  useSyncUser();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
