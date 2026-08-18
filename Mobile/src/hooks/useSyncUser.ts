import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/expo';
import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export function useSyncUser() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    async function sync() {
      if (!isSignedIn || !user) return;

      // Prevent syncing multiple times in the same session for the same user ID
      if (syncedRef.current === user.id) return;

      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            phone: user.primaryPhoneNumber?.phoneNumber || '',
          }),
        });

        if (response.ok) {
          syncedRef.current = user.id;
          const data = await response.json();
          console.log(' User successfully synced to PostgreSQL:', data.user?.email || data.user?.id);
        } else {
          console.warn(' User sync response status:', response.status);
        }
      } catch (error) {
        console.error(' Failed to sync user to database:', error);
      }
    }

    sync();
  }, [isSignedIn, user?.id]);
}
