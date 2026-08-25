import { useSignUp } from '@clerk/expo';
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

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!firstName.trim()) {
      setErrorMsg('First Name is required');
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Last Name is required');
      return;
    }
    if (!emailAddress.trim()) {
      setErrorMsg('Email address is required');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formattedPhone = phone.trim().startsWith('+251')
        ? phone.trim()
        : `+251${phone.trim().replace(/^0+/, '')}`;

      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          phone: formattedPhone,
        },
      });

      if (error) {
        setErrorMsg(error.message || 'An error occurred during sign up.');
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrorMsg(sendError.message || 'Could not send verification email.');
        return;
      }

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: emailAddress.trim() },
      });
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMsg('An error occurred during sign up.');
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
            <Text style={authStyles.title}>Create Account</Text>
            <Text style={authStyles.subtitle}>
              Welcome to Wegagen bank!{'\n'}reserve your spot in the branch queue
              right from your phone.
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={authStyles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Name Row (First Name & Last Name) */}
          <View style={authStyles.row}>
            <View style={[authStyles.col, authStyles.inputContainer]}>
              <Text style={authStyles.label}>First Name</Text>
              <TextInput
                style={authStyles.inputPlain}
                autoCapitalize="words"
                keyboardType="default"
                returnKeyType="next"
                textContentType="givenName"
                autoComplete="name-given"
                placeholder="Your First Name"
                placeholderTextColor="#94A3B8"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={[authStyles.col, authStyles.inputContainer]}>
              <Text style={authStyles.label}>Last Name</Text>
              <TextInput
                style={authStyles.inputPlain}
                autoCapitalize="words"
                keyboardType="default"
                returnKeyType="next"
                textContentType="familyName"
                autoComplete="name-family"
                placeholder="Your Last Name"
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

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
                keyboardType="email-address"
                autoComplete="email"
                placeholder="You@example.com"
                placeholderTextColor="#94A3B8"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
            </View>
          </View>

          {/* Phone Field */}
          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Phone Number</Text>
            <View style={authStyles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={19}
                color="#94A3B8"
                style={authStyles.inputIcon}
              />
              <TextInput
                style={authStyles.input}
                autoCapitalize="none"
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
                maxLength={15}
                textContentType="telephoneNumber"
                placeholder="+2519xxxxx"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
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
                placeholder="••••••••"
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
                  color={COLORS.primary}
                />
              </Pressable>
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={authStyles.buttonText}>Sign Up</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                  style={authStyles.buttonIcon}
                />
              </>
            )}
          </Pressable>

          <View nativeID="clerk-captcha" />

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Already have an account? </Text>
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