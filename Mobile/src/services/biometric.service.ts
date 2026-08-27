import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'wegagen_biometrics_enabled';
const SAVED_EMAIL_KEY = 'wegagen_biometrics_email';
const SAVED_PASSWORD_KEY = 'wegagen_biometrics_password';

export const biometricService = {
  /**
   * Check if device has biometric hardware and enrolled fingerprints/face
   */
  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return isEnrolled;
    } catch {
      return false;
    }
  },

  /**
   * Determine the biometric type (Fingerprint, Face ID, etc.)
   */
  getBiometricTypeLabel: async (): Promise<string> => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      // Prioritize Fingerprint on devices with fingerprint sensors
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      return 'Fingerprint';
    } catch {
      return 'Fingerprint';
    }
  },

  /**
   * Check if the user has opted in to biometric login
   */
  isBiometricsEnabled: async (): Promise<boolean> => {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      const email = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(SAVED_PASSWORD_KEY);
      return enabled === 'true' && Boolean(email) && Boolean(password);
    } catch {
      return false;
    }
  },

  /**
   * Retrieve saved user credentials for biometric login
   */
  getSavedCredentials: async (): Promise<{ email: string; password: string } | null> => {
    try {
      const email = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(SAVED_PASSWORD_KEY);
      if (email && password) {
        return { email, password };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Enable biometric sign in and save credentials securely in Keychain/Keystore
   */
  enableBiometrics: async (email: string, password: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email.trim());
      await SecureStore.setItemAsync(SAVED_PASSWORD_KEY, password);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Prompt the native Fingerprint / Face ID scanner
   */
  authenticateWithBiometrics: async (promptMsg = 'Sign in with Fingerprint'): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMsg,
        fallbackLabel: 'Enter Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  },

  /**
   * Disable biometric login and remove credentials
   */
  disableBiometrics: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(SAVED_EMAIL_KEY);
      await SecureStore.deleteItemAsync(SAVED_PASSWORD_KEY);
    } catch {
      // ignore
    }
  },
};

export default biometricService;
