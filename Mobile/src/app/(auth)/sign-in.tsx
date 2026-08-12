import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { authStyles } from '../../../assets/styles/auth.styles';
import {COLORS} from '../../../constants/colors';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, SetshowPassword] = useState(false);

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

    // ✅ Check whether the sign-in is actually complete
    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.replace('/(app)');
    } else {
      setErrorMsg('Sign-in could not be completed.');
    }
  } catch (err: any) {
    console.error('Sign-in error:', err);

    setErrorMsg(
      err?.message || 'An error occurred during sign in.'
    );
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
      <Text style={authStyles.title}>Sign In</Text>

      {errorMsg ? <Text style={authStyles.errorText}>{errorMsg}</Text> : null}

      <View style={authStyles.inputContainer}>
        <Text style={authStyles.label}>Email</Text>
        <TextInput
          style={authStyles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter email"
          placeholderTextColor="#999"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />
      </View>

      <View style={authStyles.inputContainer}>
        <Text style={authStyles.label}>Password</Text>
        <TextInput
          style={authStyles.input}
          secureTextEntry={!showPassword}
          placeholder="Enter password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable 
          style={authStyles.eyeButton}
          onPress={()=> SetshowPassword(!showPassword)}
            >
      <Ionicons
        name={showPassword ? "eye-outline" : "eye-off-outline"}
        size={20}
        color={COLORS.primary}
                  />
        </Pressable>
      </View>
          <Link href="/(auth)/forgot-password" asChild>
             <Pressable>
               <Text style={authStyles.linkText}>Forgot your password?</Text>
             </Pressable>
         </Link>

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

      <View style={authStyles.footer}>
        <Text style={authStyles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable>
            <Text style={authStyles.linkText}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

