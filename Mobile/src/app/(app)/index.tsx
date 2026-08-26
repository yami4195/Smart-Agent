import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { userApi } from '../../api/user.api';
import { COLORS } from '../../../constants/colors';

export default function AppEntryScreen() {
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    async function determineRoute() {
      try {
        const user = await userApi.getMe();
        if (user?.role === 'employee') {
          setTargetRoute('/(app)/bank_agents');
        } else {
          setTargetRoute('/(app)/customer');
        }
      } catch {
        setTargetRoute('/(app)/customer');
      }
    }

    determineRoute();
  }, []);

  if (!targetRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Redirect href={targetRoute as any} />;
}

