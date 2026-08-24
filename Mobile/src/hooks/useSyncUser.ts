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

      // Extract phone from unsafeMetadata or primaryPhoneNumber
      const rawPhone =
        user.primaryPhoneNumber?.phoneNumber ||
        (user.unsafeMetadata?.phone as string) ||
        '';
      const rawFirstName =
        user.firstName ||
        (user.unsafeMetadata?.firstName as string) ||
        '';
      const rawLastName =
        user.lastName ||
        (user.unsafeMetadata?.lastName as string) ||
        '';
      const rawEmail =
        user.primaryEmailAddress?.emailAddress ||
        '';

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
            firstName: rawFirstName,
            lastName: rawLastName,
            email: rawEmail,
            phone: rawPhone,
          }),
        });

        if (response.ok) {
          syncedRef.current = user.id;
          const data = await response.json();
          console.log('User successfully synced to PostgreSQL:', data.user?.email || data.user?.id);
        } else {
          console.warn('User sync response status:', response.status);
        }
      } catch (error) {
        console.error('Failed to sync user to database:', error);
      }
    }

    sync();
  }, [isSignedIn, user?.id, user?.firstName, user?.lastName, user?.unsafeMetadata]);
}
