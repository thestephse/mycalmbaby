import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AudioManager from './utils/AudioManager';
import { designTokens } from './styles/designTokens';
import {
  PillButton,
  Card,
  Toggle,
  SectionHeader,
} from './components/UIComponents';

type SleepTimer = 15 | 30 | 60;



export default function MainMenuScreen() {
  const [sleepTimer, setSleepTimer] = useState<SleepTimer>(30);
  const [whiteNoiseEnabled, setWhiteNoiseEnabled] = useState(true);


  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedWhiteNoise = await AsyncStorage.getItem('whiteNoiseEnabled');
        const savedTimer = await AsyncStorage.getItem('sleepTimer');
        // Ensure white noise playback matches saved state
        const shouldPlayWhiteNoise = savedWhiteNoise === 'true';
        setWhiteNoiseEnabled(shouldPlayWhiteNoise);
        
        // Explicitly set audio state to match the toggle
        if (shouldPlayWhiteNoise) {
          AudioManager.play();
        } else {
          AudioManager.stop();
        }
        if (savedTimer) {
          setSleepTimer(parseInt(savedTimer) as SleepTimer);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handlePlay = () => {
    router.push('/animation');
  };

  const handleSleepTimerChange = (timer: SleepTimer) => {
    setSleepTimer(timer);
    AsyncStorage.setItem('sleepTimer', timer.toString());
  };

  const handleWhiteNoiseToggle = async (value: boolean) => {
    setWhiteNoiseEnabled(value);
    await AsyncStorage.getItem('sleepTimer').then((value) => {
      if (value) {
        setSleepTimer(parseInt(value) as SleepTimer);
      }
    }).catch((error) => {
      console.error('Failed to get sleep timer:', error);
    });
    await AsyncStorage.setItem('whiteNoiseEnabled', value.toString());
    if (value) {
      AudioManager.play();
    } else {
      AudioManager.stop();
    }
  };



  const handleChangeUnlock = () => {
    router.push('/onboarding?step=setup-sequence');
  };

  const renderSleepTimerSelector = () => (
    <Card style={styles.section}>
      <SectionHeader title="Sleep Timer" />
      <View style={styles.segmentedControl}>
        {[15, 30, 60].map((timer) => (
          <PillButton
            key={timer}
            title={`${timer}m`}
            onPress={() => handleSleepTimerChange(timer as SleepTimer)}
            active={sleepTimer === timer}
            style={styles.timerButton}
          />
        ))}
      </View>
    </Card>
  );

  const renderWhiteNoiseToggle = () => (
    <Card style={styles.section}>
      <Toggle
        value={whiteNoiseEnabled}
        onValueChange={handleWhiteNoiseToggle}
        label="White Noise"
      />
    </Card>
  );



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/icons/splash-icon-light.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>My Calm Baby</Text>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Ionicons name="play" size={32} color="#FFFFFF" />
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>

        {renderSleepTimerSelector()}
        {renderWhiteNoiseToggle()}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.textButton} onPress={handleChangeUnlock}>
            <Text style={styles.textButtonText}>Change Unlock Sequence</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.aliceBlue,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  logoBackground: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#A8D5BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  smallCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A8D5BA',
    position: 'absolute',
  },
  smallCircleTop: {
    top: 0,
    left: '50%',
    marginLeft: -4,
  },
  smallCircleRight: {
    right: 0,
    top: '50%',
    marginTop: -4,
  },
  smallCircleBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -4,
  },
  smallCircleLeft: {
    left: 0,
    top: '50%',
    marginTop: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  playButton: {
    backgroundColor: designTokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.xl,
    gap: designTokens.spacing.sm,
    ...designTokens.shadows.md,
  },
  playButtonText: {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: designTokens.colors.lightGray,
    borderRadius: designTokens.borderRadius.sm,
    padding: designTokens.spacing.xs,
    gap: designTokens.spacing.xs,
  },
  timerButton: {
    flex: 1,
  },
  downloadButton: {
    minWidth: 100,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    height: 36,
  },
  segmentButtonActive: {
    backgroundColor: '#00BFA6',
  },
  segmentButtonText: {
    fontSize: 16,
    color: '#606060',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    opacity: 0.6,
  },
  bottomActions: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  textButton: {
    paddingVertical: 12,
  },
  textButtonText: {
    fontSize: 16,
    color: '#00BFA6',
    fontWeight: '500'
  }
});
