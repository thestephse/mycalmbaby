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
      // Add a small delay to ensure AsyncStorage is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      const unlockSequence = await AsyncStorage.getItem('unlockSequence');
      
      if (hasCompletedOnboarding === 'true') {
        // Check if unlock sequence exists
        if (!unlockSequence) {
          // Onboarding is complete but unlock sequence is missing
          // Redirect to setup sequence step
          router.replace('/onboarding?step=setup-sequence');
        } else {
          router.replace('/main-menu');
        }
      } else {
        // Only go to onboarding if explicitly not completed
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // Try one more time after a delay before defaulting to onboarding
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryCheck = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (retryCheck === 'true') {
          router.replace('/main-menu');
          return;
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
      
      // Default to onboarding if all attempts fail
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
