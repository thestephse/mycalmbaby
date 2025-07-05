import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type OnboardingStep = 'welcome' | 'explain-lock' | 'setup-sequence';
type Corner = 'TL' | 'TR' | 'BL' | 'BR';

const CORNER_POSITIONS = {
  TL: { top: 50, left: 50 },
  TR: { top: 50, right: 50 },
  BL: { bottom: 50, left: 50 },
  BR: { bottom: 50, right: 50 },
};

// Helper function to compare two arrays
function compareArrays(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
}

export default function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [unlockSequence, setUnlockSequence] = useState<Corner[]>([]);
  const [tappedCorners, setTappedCorners] = useState<Corner[]>([]);
  const [showError, setShowError] = useState<boolean>(false);

  const handleCornerTap = (corner: Corner) => {
    // If we already have 4 corners and showing error, reset to start new sequence
    if (tappedCorners.length === 4 && showError) {
      setTappedCorners([corner]);
      setShowError(false);
      return;
    }
    
    // Reset error state when starting a new sequence
    if (tappedCorners.length === 0) {
      setShowError(false);
    }
    
    if (tappedCorners.length < 4) {
      const newTapped = [...tappedCorners, corner];
      setTappedCorners(newTapped);
      
      if (newTapped.length === 4) {
        // Show error indicator for 1 second before resetting
        if (unlockSequence.length > 0 && !compareArrays(newTapped, unlockSequence)) {
          setShowError(true);
          setTimeout(() => {
            setTappedCorners([]);
            setShowError(false);
          }, 1000);
        } else {
          setUnlockSequence(newTapped);
        }
      }
    }
  };

  const resetSequence = () => {
    setTappedCorners([]);
    setUnlockSequence([]);
    setShowError(false);
  };

  const confirmSequence = async () => {
    if (unlockSequence.length === 4) {
      try {
        // Save the unlock sequence
        await AsyncStorage.setItem('unlockSequence', JSON.stringify(unlockSequence));
        
        // Mark onboarding as completed - save multiple times to ensure it sticks
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        
        // Verify the data was saved
        const verifyOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        const verifySequence = await AsyncStorage.getItem('unlockSequence');
        
        if (verifyOnboarding !== 'true' || !verifySequence) {
          // Try one more time if verification failed
          await AsyncStorage.setItem('unlockSequence', JSON.stringify(unlockSequence));
          await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        }
        
        // Navigate to main menu
        router.replace('/main-menu');
      } catch (error) {
        console.error('Failed to save onboarding data:', error);
        Alert.alert('Error', 'Failed to save unlock sequence. Please try again.');
      }
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="happy-outline" size={80} color="#1A1A1A" />
      </View>
      <Text style={styles.headline}>CalmBaby</Text>
      <Text style={styles.subText}>
        Calming high-contrast animation + white noise for 0–12 mo
      </Text>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep('explain-lock')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExplainLockStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.phoneOutline}>
        <View style={[styles.cornerDot, { top: 20, left: 20 }]}>
          <Text style={styles.cornerLabel}>TL</Text>
        </View>
        <View style={[styles.cornerDot, { top: 20, right: 20 }]}>
          <Text style={styles.cornerLabel}>TR</Text>
        </View>
        <View style={[styles.cornerDot, { bottom: 20, left: 20 }]}>
          <Text style={styles.cornerLabel}>BL</Text>
        </View>
        <View style={[styles.cornerDot, { bottom: 20, right: 20 }]}>
          <Text style={styles.cornerLabel}>BR</Text>
        </View>
      </View>
      <Text style={styles.headline}>Your secret unlock</Text>
      <Text style={styles.bodyText}>
        To keep your baby safe, you&apos;ll create a 4-corner tap sequence that only you know. 
        This prevents accidental exits during use.
      </Text>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep('setup-sequence')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSetupSequenceStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.headline}>Tap your four corners in order</Text>
      <Text style={styles.bodyText}>
        Choose a sequence you&apos;ll remember. You can change this later in settings.
      </Text>
      
      <View style={styles.sequenceContainer}>
        <View style={styles.phoneOutlineSetup}>
          {Object.entries(CORNER_POSITIONS).map(([corner, position]) => (
            <TouchableOpacity
              key={corner}
              style={[
                styles.cornerButton,
                position,
                tappedCorners.includes(corner as Corner) && styles.cornerButtonTapped
              ]}
              onPress={() => handleCornerTap(corner as Corner)}
            >
              <Text style={styles.cornerButtonText}>{corner}</Text>
              {tappedCorners.includes(corner as Corner) && (
                <Text style={styles.sequenceNumber}>
                  {tappedCorners.indexOf(corner as Corner) + 1}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Visual indicator dots - only show after first corner press */}
        {tappedCorners.length > 0 && (
          <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View 
                key={index} 
                style={[
                  styles.sequenceDot,
                  tappedCorners.length > index && styles.activeDot,
                  showError && tappedCorners.length > index && styles.errorDot
                ]}
              />
            ))}
          </View>
        )}
        
        <View style={styles.sequenceDisplay}>
          <Text style={styles.sequenceText}>
            Sequence: {tappedCorners.join(' → ') || 'Tap corners above'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.resetButton} onPress={resetSequence}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            unlockSequence.length !== 4 && styles.confirmButtonDisabled
          ]}
          onPress={confirmSequence}
          disabled={unlockSequence.length !== 4}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {step === 'welcome' && renderWelcomeStep()}
      {step === 'explain-lock' && renderExplainLockStep()}
      {step === 'setup-sequence' && renderSetupSequenceStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sequenceDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  activeDot: {
    backgroundColor: '#808080',
    borderColor: '#606060',
  },
  errorDot: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF3333',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  headline: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    color: '#606060',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  bodyText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  phoneOutline: {
    width: 200,
    height: 300,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    marginBottom: 32,
    position: 'relative',
  },
  cornerDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  sequenceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  phoneOutlineSetup: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    borderStyle: 'dashed',
    position: 'relative',
    marginBottom: 24,
  },
  cornerButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerButtonTapped: {
    backgroundColor: '#00BFA6',
    borderColor: '#00BFA6',
  },
  cornerButtonText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: '600',
  },
  sequenceNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  sequenceDisplay: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sequenceText: {
    fontSize: 14,
    color: '#606060',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    color: '#606060',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
