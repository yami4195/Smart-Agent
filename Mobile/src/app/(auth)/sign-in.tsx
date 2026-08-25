import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
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

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!emailAddress.trim()) {
      setErrorMsg('Email address required');
      return;
    }

    if (!password) {
      setErrorMsg('Password required');
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
        setErrorMsg('Incorrect email or password. Please try again.');
        return;
      }

      //Check whether the sign-in is actually complete
      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.replace('/(app)');
      } else {
        setErrorMsg('Sign-in could not be completed.');
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

          {/* Forgot Password Link - directly below password field */}
          <View style={authStyles.forgotPasswordContainer}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text style={authStyles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Sign In Button */}
          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authStyles.buttonText}>Sign In</Text>
            )}
          </Pressable>

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

