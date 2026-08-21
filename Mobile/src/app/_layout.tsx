import { ClerkProvider, useAuth } from '@clerk/expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { tokenCache } from '../cache';
import { SafeAreaView } from 'react-native-safe-area-context';
import {COLORS} from '../../constants/colors';
import { authStyles } from '../../assets/styles/auth.styles';
import { registerTokenGetter } from '../api/axiosInstance';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || '';

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables.');
}

function InitialLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    registerTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/(app)');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <View style={authStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaView style={{flex : 1, backgroundColor:COLORS.background}}>
      <InitialLayout />
      </SafeAreaView>
    </ClerkProvider>
    
  );
}

