import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      
      if (hasCompletedOnboarding === 'true') {
        router.replace('/main-menu');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // Default to onboarding if there's an error
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
