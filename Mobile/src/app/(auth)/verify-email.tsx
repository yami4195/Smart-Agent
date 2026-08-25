import { useSignUp } from '@clerk/expo';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { authStyles } from '../../../assets/styles/auth.styles';
import { COLORS } from '../../../constants/colors';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const wegagenLogo = require('../../../assets/images/Wegagen logo.webp');

export default function VerifyEmailScreen() {
  const { signUp } = useSignUp();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const emailDisplay = params.email || signUp?.emailAddress || 'your email';

  const onVerifyPress = async () => {
    if (!code) {
      setErrorMsg('Please enter the verification code.');
      return;
    }

    if (!signUp) {
      setErrorMsg('Sign up process is not active. Please sign up again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid verification code.');
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setErrorMsg(finalizeError.message || 'Could not finalize sign up.');
        return;
      }

      router.replace('/(app)');
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResendPress = async () => {
    if (!signUp) {
      setErrorMsg('Sign up process is not active. Please sign up again.');
      return;
    }

    setResending(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setErrorMsg(error.message || 'Could not resend verification code.');
      } else {
        setInfoMsg('A new verification code has been sent to your email.');
      }
    } catch (err: any) {
      console.error('Resend code error:', err);
      setErrorMsg('Failed to resend verification code.');
    } finally {
      setResending(false);
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
          <View style={authStyles.logoContainer}>
            <Image
              source={wegagenLogo}
              style={authStyles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={authStyles.headerContainer}>
            <Text style={authStyles.title}>Verify Email</Text>
            <Text style={authStyles.subtitle}>
              We sent a verification code to {emailDisplay}. Enter it below to activate your account.
            </Text>
          </View>

          {errorMsg ? (
            <View style={authStyles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {infoMsg ? <Text style={authStyles.infoText}>{infoMsg}</Text> : null}

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Verification Code</Text>
            <View style={authStyles.inputWrapper}>
              <Ionicons
                name="key-outline"
                size={19}
                color="#94A3B8"
                style={authStyles.inputIcon}
              />
              <TextInput
                style={authStyles.input}
                keyboardType="number-pad"
                placeholder="Enter verification code"
                placeholderTextColor="#94A3B8"
                value={code}
                onChangeText={setCode}
              />
            </View>
          </View>

          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={onVerifyPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authStyles.buttonText}>Verify Email</Text>
            )}
          </Pressable>

          <Pressable
            style={[
              authStyles.resendButton,
              resending && authStyles.buttonDisabled,
            ]}
            onPress={onResendPress}
            disabled={resending || loading}
          >
            {resending ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={authStyles.resendButtonText}>Resend Code</Text>
            )}
          </Pressable>

          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Back to </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={8}>
                <Text style={authStyles.linkText}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

