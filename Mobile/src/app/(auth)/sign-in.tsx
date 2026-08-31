import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { authStyles } from '../../../assets/styles/auth.styles';
import { COLORS } from '../../../constants/colors';
import { biometricService } from '../../services/biometric.service';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const wegagenLogo = require('../../../assets/images/Wegagen logo.webp');

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Fingerprint');

  // Check biometric support on mount
  useEffect(() => {
    const initBiometrics = async () => {
      const available = await biometricService.isBiometricAvailable();
      setHasBiometrics(available);

      if (available) {
        const label = await biometricService.getBiometricTypeLabel();
        setBiometricLabel(label);

        const enabled = await biometricService.isBiometricsEnabled();
        setBiometricsEnabled(enabled);

        // Pre-fill email if saved
        if (enabled) {
          const creds = await biometricService.getSavedCredentials();
          if (creds?.email) {
            setEmailAddress(creds.email);
          }
        }
      }
    };

    initBiometrics();
  }, []);

  // Ask to enable biometrics after first manual login
  const promptEnableBiometrics = (email: string, pass: string) => {
    Alert.alert(
      `Enable ${biometricLabel} Sign-In 🔐`,
      `Would you like to use your ${biometricLabel.toLowerCase()} for faster and more secure sign-in next time?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => router.replace('/(app)'),
        },
        {
          text: 'Enable',
          onPress: async () => {
            const authed = await biometricService.authenticateWithBiometrics(
              `Confirm your ${biometricLabel.toLowerCase()} to enable quick sign-in`
            );
            if (authed) {
              await biometricService.enableBiometrics(email, pass);
            }
            router.replace('/(app)');
          },
        },
      ]
    );
  };

  // Sign In using Fingerprint / Face ID
  const handleBiometricSignIn = async () => {
    if (!signIn) {
      setErrorMsg('Sign-in service is initializing. Please try again.');
      return;
    }

    const creds = await biometricService.getSavedCredentials();
    if (!creds || !creds.email || !creds.password) {
      setErrorMsg('No saved credentials found. Please sign in with your password.');
      setBiometricsEnabled(false);
      return;
    }

    setBiometricLoading(true);
    setErrorMsg('');

    try {
      const authenticated = await biometricService.authenticateWithBiometrics(
        `Scan ${biometricLabel.toLowerCase()} to log in`
      );

      if (!authenticated) {
        setBiometricLoading(false);
        return;
      }

      // Log in with stored credentials
      const { error } = await signIn.password({
        identifier: creds.email.trim(),
        password: creds.password,
      });

      if (error) {
        setErrorMsg(error.message || 'Biometric login failed. Please sign in with password.');
        return;
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setErrorMsg(finalizeError.message || 'Could not finalize session.');
          return;
        }
        router.replace('/(app)');
      } else {
        setErrorMsg(`Sign-in status: ${signIn.status}. Please check your account.`);
      }
    } catch (err: any) {
      console.error('Biometric sign-in error:', err);
      setErrorMsg('Biometric authentication failed. Please enter your password.');
    } finally {
      setBiometricLoading(false);
    }
  };

  // Standard Email & Password Sign In
  const handleSignIn = async () => {
    if (!emailAddress.trim()) {
      setErrorMsg('Email address required');
      return;
    }

    if (!password) {
      setErrorMsg('Password required');
      return;
    }

    if (!signIn) {
      setErrorMsg('Sign in service is initializing. Please try again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await signIn.password({
        identifier: emailAddress.trim(),
        password,
      });

      // Invalid credentials
      if (error) {
        console.log('Sign-in error:', JSON.stringify(error, null, 2));
        setErrorMsg(error.message || 'Incorrect email or password. Please try again.');
        return;
      }

      // Check whether the sign-in is actually complete
      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          console.error('Finalize error:', finalizeError);
          setErrorMsg(finalizeError.message || 'Could not finalize session.');
          return;
        }

        // If biometrics available on device and not yet enabled, prompt user
        if (hasBiometrics && !biometricsEnabled) {
          promptEnableBiometrics(emailAddress.trim(), password);
        } else {
          // If already enabled, update saved credentials silently
          if (biometricsEnabled) {
            await biometricService.enableBiometrics(emailAddress.trim(), password);
          }
          router.replace('/(app)');
        }
      } else if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_first_factor') {
        // Attempt to send email verification code for new/untrusted client
        try {
          const signInAny = signIn as any;
          if (signInAny.verifications && typeof signInAny.verifications.sendEmailCode === 'function') {
            const { error: sendErr } = await signInAny.verifications.sendEmailCode();
            if (!sendErr) {
              router.push({
                pathname: '/(auth)/verify-email',
                params: { email: emailAddress.trim() },
              });
              return;
            }
          }
        } catch (vErr) {
          console.warn('Verification dispatch error:', vErr);
        }
        setErrorMsg(
          'Security check required for this device. Please check your email or disable "Bot Protection / Attack Protection" in your Clerk Dashboard (under Configure > Security > Attack Protection).'
        );
      } else if (signIn.status === 'needs_second_factor') {
        setErrorMsg('Two-factor authentication required. Please verify your identity.');
      } else {
        setErrorMsg(`Sign-in status: ${signIn.status || 'incomplete'}. Please check your account.`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMsg(err?.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={authStyles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={authStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={authStyles.card}>
          {/* Wegagen Bank Logo */}
          <View style={authStyles.logoContainer}>
            <Image
              source={wegagenLogo}
              style={authStyles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={authStyles.headerContainer}>
            <Text style={authStyles.title}>Welcome Back</Text>
            <Text style={authStyles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={authStyles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Email Field */}
          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Email Address</Text>
            <View style={authStyles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={19}
                color="#94A3B8"
                style={authStyles.inputIcon}
              />
              <TextInput
                style={authStyles.input}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Password</Text>
            <View style={authStyles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#94A3B8"
                style={authStyles.inputIcon}
              />
              <TextInput
                style={authStyles.input}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={19}
                  color={COLORS.navy}
                />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password Link */}
          <View style={authStyles.forgotPasswordContainer}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text style={authStyles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Standard Sign In Button */}
          <Pressable
            style={[authStyles.button, (loading || biometricLoading) && authStyles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading || biometricLoading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authStyles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          {/* Biometric (Fingerprint / Face ID) Touch Icon Option */}
          {biometricsEnabled && (
            <View style={authStyles.biometricSection}>
              <View style={authStyles.dividerRow}>
                <View style={authStyles.dividerLine} />
                <Text style={authStyles.dividerText}>or</Text>
                <View style={authStyles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  authStyles.fingerprintTouchArea,
                  pressed && authStyles.fingerprintTouchAreaPressed,
                  (loading || biometricLoading) && authStyles.touchAreaDisabled,
                ]}
                onPress={handleBiometricSignIn}
                disabled={loading || biometricLoading}
              >
                <View style={authStyles.fingerprintCircle}>
                  {biometricLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialCommunityIcons
                      name={biometricLabel === 'Face ID' ? 'face-recognition' : 'fingerprint'}
                      size={34}
                      color={COLORS.primary}
                    />
                  )}
                </View>
                <Text style={authStyles.fingerprintLabel}>
                  Tap to sign in with {biometricLabel.toLowerCase()}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={8}>
                <Text style={authStyles.linkText}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



