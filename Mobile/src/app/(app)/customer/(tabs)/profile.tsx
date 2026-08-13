import React from 'react';
import { useAuth } from '@clerk/expo';
import { View, Text, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Header } from '../../../../components/common/Header';
import { placeholderStyles } from '../../../../../assets/styles/placeholder.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../../components/common/Button';

export default function ProfileScreen() {
  const {signOut} = useAuth();
    const handleSignOut = () =>{
      Alert.alert(
        'Sign Out',
          'Are you sure you want to sign out?',[
            {text: 'Cancel' ,style:'cancel'},
              {text: 'Sign Out', style:'destructive', onPress: async ()=>{
            try{
          await signOut();
        }catch(err){
      console.error('Sign Out error:', err);
    Alert.alert('Error', 'Could not sign out. Try again.')
  }
    }   
      }
        ]
          );
            }
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Header title="Tera Mobile Banking" />
        <View style={placeholderStyles.container}>
          <View style={placeholderStyles.iconCircle}>
            <Ionicons name="person-outline" size={36} color={COLORS.primary} />
              </View>
                <Text style={placeholderStyles.title}>Profile</Text>
                  <Text style={placeholderStyles.subtitle}>
                        Account details, language preferences 🇪🇹, and settings will be implemented here.
                    </Text>
                  <Button 
                title='Sign Out'
              onPress={handleSignOut}
            variant='outline'
          icon={<Feather name="log-out" size={18} color={COLORS.danger} />}
        style={{ borderColor: COLORS.danger }}
      textStyle={{ color: COLORS.danger }}
    ></Button>
  </View>
</SafeAreaView>
  );
}
