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

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: send reset code to email
  const handleSendCode = async () => {
    if (!emailAddress) {
      setErrorMsg('Email address required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress.trim(),
      });

      if (createError) {
        if (createError.code === 'form_identifier_not_found') {
          setErrorMsg('No account found with that email address.');
        } else {
          setErrorMsg(createError.message || 'Could not find the account.');
        }
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setErrorMsg(
          sendError.message || 'Could not send reset code. Try Again!'
        );
        return;
      }

      setStep('code');
    } catch (err: any) {
      console.error('Send code error:', err);
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the code
  const handleVerifyCode = async () => {
    if (!code) {
      setErrorMsg('Verification code required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } =
        await signIn.resetPasswordEmailCode.verifyCode({ code });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired code.');
        return;
      }

      setStep('password');
    } catch (err: any) {
      console.error('Verify code error:', err);
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: submit new password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setErrorMsg('New password required');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
        });

      if (error) {
        setErrorMsg(error.message || 'Could not reset password.');
        return;
      }

      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setErrorMsg(finalizeError.message || 'Could not complete sign in.');
        return;
      }

      router.replace('/(app)');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  //Since this is a banking app We need to mask the EmailAddress
  const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 3))}@${domain}`;
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
            <Text style={authStyles.title}>Reset Password</Text>
            <Text style={authStyles.subtitle}>
              {step === 'email' && "Enter the Email associated with your account, and we'll send you a  code!"}
              {step === 'code' && `Check your inbox! We've sent a 6-digit code to ${maskEmail(emailAddress)} Enter it below to continue resetting your password.`}
              {step === 'password' && "Create a new password for your account. Make sure it's at least 8 characters and includes a number and character."}
            </Text>
          </View>

          {errorMsg ? (
            <View style={authStyles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {step === 'email' && (
            <>
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
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                  />
                </View>
              </View>

              <Pressable
                style={[
                  authStyles.button,
                  loading && authStyles.buttonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={authStyles.buttonText}>Send Reset Code</Text>
                )}
              </Pressable>
            </>
          )}

          {step === 'code' && (
            <>
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
                    placeholder="Enter code"
                    placeholderTextColor="#94A3B8"
                    value={code}
                    onChangeText={setCode}
                  />
                </View>
              </View>

              <Pressable
                style={authStyles.resendButton}
                onPress={handleSendCode}
                disabled={loading}
              >
                <Text style={authStyles.resendButtonText}>Resend code</Text>
              </Pressable>

              <Pressable
                style={[
                  authStyles.button,
                  loading && authStyles.buttonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={authStyles.buttonText}>Verify Code</Text>
                )}
              </Pressable>
            </>
          )}

          {step === 'password' && (
            <>
              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>New Password</Text>
                <View style={authStyles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color="#94A3B8"
                    style={authStyles.inputIcon}
                  />
                  <TextInput
                    style={authStyles.input}
                    secureTextEntry
                    placeholder="Enter new password"
                    placeholderTextColor="#94A3B8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>
              </View>

              <Pressable
                style={[
                  authStyles.button,
                  loading && authStyles.buttonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={authStyles.buttonText}>Reset Password</Text>
                )}
              </Pressable>
            </>
          )}

          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>
              Remembered your password?{' '}
            </Text>
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