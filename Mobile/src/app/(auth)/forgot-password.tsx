import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { authStyles } from '../../../assets/styles/auth.styles';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

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
        }else{
        setErrorMsg(createError.message || 'Could not find the account.');
      }
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setErrorMsg(sendError.message || 'Could not send reset code. Try Again!');
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
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });

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
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
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

  return (
     <KeyboardAvoidingView
              behavior={Platform.OS ==="ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS ==="ios" ? 64:0}
              style={authStyles.keyboardView}
              >
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Reset Password</Text>

      {errorMsg ? <Text style={authStyles.errorText}>{errorMsg}</Text> : null}

      {step === 'email' && (
        <>
          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              style={authStyles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
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
            <TextInput
              style={authStyles.input}
              keyboardType="number-pad"
              placeholder="Enter the code we emailed you"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
            />
          </View>

          <Pressable onPress={handleSendCode} disabled={loading}>
              <Text style={authStyles.linkText}>Resend code</Text>
          </Pressable>

          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
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
            <TextInput
              style={authStyles.input}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
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
        <Text style={authStyles.footerText}>Remembered your password? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text style={authStyles.linkText}>Sign In</Text>
          </Pressable>
        </Link>
      </View>
      
    </View>
    </KeyboardAvoidingView>
  );
}