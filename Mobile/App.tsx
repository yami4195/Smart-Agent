import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {ClerkProvider} from '@clerk/expo';
import { Slot } from "expo-router";

const publishablekey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App() {

  if(!publishablekey){
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  return (
    
    <ClerkProvider publishableKey='publishableKey'>
      <Slot/>
    </ClerkProvider>
  );
}
