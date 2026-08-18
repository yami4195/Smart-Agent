import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import  { useState } from 'react';
import {Ionicons} from "@expo/vector-icons";

import { authStyles } from '../../../assets/styles/auth.styles';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/colors';

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
  const [showPassword, SetshowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!emailAddress) {
      setErrorMsg('Email address is required');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required');
      return;
    }
    if (!firstName) {
      setErrorMsg('First Name is required');
      return;
    }
    if (!lastName) {
      setErrorMsg('Last Name is required');
      return;
    }
    if (!phone) {
      setErrorMsg('phone number is required');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          phone: `+251${phone}`,
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
      behavior={Platform.OS ==="ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS ==="ios" ? 64 :0}
      style={authStyles.keyboardView}
      >
        <ScrollView
        contentContainerStyle={[
      authStyles.container,
      { flexGrow: 1, paddingBottom: 40 },
    ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
        >
    
      <Text style={authStyles.title}>Sign Up</Text>

      {errorMsg ? <Text style={authStyles.errorText}>{errorMsg}</Text> : null}

      <View style={authStyles.inputContainer}>
        <Text style={authStyles.label}>FirstName</Text>
        <TextInput
          style={authStyles.input}
          autoCapitalize="words"
          keyboardType='default'
          returnKeyType="next"
          textContentType="givenName"
          autoComplete="name-given"
          placeholder="Enter first name"
          placeholderTextColor="#999"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={authStyles.inputContainer}>
        <Text style={authStyles.label}>LastName</Text>
        <TextInput
          style={authStyles.input}
          autoCapitalize="words"
          keyboardType='default'
          returnKeyType="next"
          textContentType="familyName"
          autoComplete="name-family"
          placeholder="Enter last name"
          placeholderTextColor="#999"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={authStyles.inputContainer}>
        <Text style={authStyles.label}>Email</Text>
        <TextInput
          style={authStyles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
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

      <View style={authStyles.inputContainer}>
        <Text style={authStyles.label}>Phone</Text>
        <TextInput
          style={authStyles.input}
          autoCapitalize="none"
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="next"
          maxLength={13}
          textContentType="telephoneNumber"
          placeholder="+251xxxxx"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <Pressable
        style={[authStyles.button, loading && authStyles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={authStyles.buttonText}>Sign Up</Text>
        )}
      </Pressable>

      <View nativeID="clerk-captcha" />

      <View style={authStyles.footer}>
        <Text style={authStyles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text style={authStyles.linkText}>Sign In</Text>
          </Pressable>
        </Link>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
  );
}