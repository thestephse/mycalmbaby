import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  BackHandler,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';

const { width, height } = Dimensions.get('window');

type Corner = 'TL' | 'TR' | 'BL' | 'BR';

interface TouchZone {
  corner: Corner;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Dynamic corner size based on screen dimensions (25% of smaller dimension, min 120px)
const CORNER_SIZE = Math.max(120, Math.min(width, height) * 0.25);
const SEQUENCE_TIMEOUT = 3000; // 3 seconds to complete sequence

export default function AnimationScreen() {
  const [unlockSequence, setUnlockSequence] = useState<Corner[]>([]);
  const [currentSequence, setCurrentSequence] = useState<Corner[]>([]);
  const [wrongSequenceIndicator, setWrongSequenceIndicator] = useState(false);
  const [whiteNoiseEnabled, setWhiteNoiseEnabled] = useState(true);
  const [sleepTimer, setSleepTimer] = useState<number>(30);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [sound2, setSound2] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const sequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationValue = useRef(new Animated.Value(0)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Define touch zones for corners - much larger for better mobile experience
  const touchZones: TouchZone[] = [
    { corner: 'TL', x: 0, y: 0, width: CORNER_SIZE, height: CORNER_SIZE },
    { corner: 'TR', x: width - CORNER_SIZE, y: 0, width: CORNER_SIZE, height: CORNER_SIZE },
    { corner: 'BL', x: 0, y: height - CORNER_SIZE, width: CORNER_SIZE, height: CORNER_SIZE },
    { corner: 'BR', x: width - CORNER_SIZE, y: height - CORNER_SIZE, width: CORNER_SIZE, height: CORNER_SIZE },
  ];

  // Store animation references so we can stop them when needed
  const animationRefs = useRef<{
    rotation: Animated.CompositeAnimation | null;
    scale: Animated.CompositeAnimation | null;
    opacity: Animated.CompositeAnimation | null;
  }>({ rotation: null, scale: null, opacity: null });

  useEffect(() => {
    const init = async () => {
      await initializeScreen();
      await loadSettings();
      startAnimations();
    };
    
    init();
    
    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Ignore back button in animation screen
      return true;
    });

    return () => {
      cleanup();
      backHandler.remove();
    };
  }, []);

  const initializeScreen = async () => {
    try {
      // Keep screen awake
      activateKeepAwake();
      
      // Enable audio for mobile devices
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (audioError: any) {
        console.log('Audio mode setup failed:', audioError?.message || 'Unknown error');
      }
      
      // Try to hide system UI (immersive mode) - only on mobile
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      } catch (orientationError: any) {
        console.log('Orientation lock not supported (likely web environment):', orientationError?.message || 'Unknown error');
      }
      
      // Hide navigation bar on Android
      try {
        if (NavigationBar.setVisibilityAsync) {
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } catch (navError: any) {
        console.log('Navigation bar control not supported:', navError?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to initialize screen:', error);
    }
  };

  const cleanup = async () => {
    try {
      deactivateKeepAwake();
      
      // Stop all animations
      if (animationRefs.current.rotation) {
        animationRefs.current.rotation.stop();
      }
      if (animationRefs.current.scale) {
        animationRefs.current.scale.stop();
      }
      if (animationRefs.current.opacity) {
        animationRefs.current.opacity.stop();
      }
      
      // Clean up audio
      try {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        if (sound2) {
          await sound2.stopAsync();
          await sound2.unloadAsync();
        }
        setIsPlaying(false);
      } catch (audioError) {
        console.error('Error cleaning up audio:', audioError);
      }
      
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      
      // Restore navigation bar
      if (NavigationBar.setVisibilityAsync) {
        await NavigationBar.setVisibilityAsync('visible');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSequence = await AsyncStorage.getItem('unlockSequence');
      const savedWhiteNoise = await AsyncStorage.getItem('whiteNoiseEnabled');
      const savedTimer = await AsyncStorage.getItem('sleepTimer');

      if (savedSequence) {
        setUnlockSequence(JSON.parse(savedSequence));
      }
      if (savedWhiteNoise !== null) {
        const enabled = savedWhiteNoise === 'true';
        setWhiteNoiseEnabled(enabled);
        if (enabled) {
          await loadAndPlayWhiteNoise();
        }
      }
      if (savedTimer) {
        const timer = parseInt(savedTimer);
        setSleepTimer(timer);
        startSleepTimer(timer);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadAndPlayWhiteNoise = async () => {
    try {
      if (whiteNoiseEnabled) {
        // Load two instances of the same audio for seamless cross-fade
        const { sound: newSound1 } = await Audio.Sound.createAsync(
          require('../assets/audio/white-noise.mp3'),
          { shouldPlay: false, isLooping: false, volume: 0.7 }
        );
        const { sound: newSound2 } = await Audio.Sound.createAsync(
          require('../assets/audio/white-noise.mp3'),
          { shouldPlay: false, isLooping: false, volume: 0.0 }
        );
        
        setSound(newSound1);
        setSound2(newSound2);
        
        // Start playing the first sound
        await newSound1.playAsync();
        setIsPlaying(true);
        
        // Set up seamless looping with cross-fade
        setupSeamlessLooping(newSound1, newSound2);
      }
    } catch (error) {
      console.error('Failed to load white noise:', error);
      // Continue without audio if loading fails
    }
  };

  const setupSeamlessLooping = async (sound1: Audio.Sound, sound2: Audio.Sound) => {
    try {
      // Get the duration of the audio file
      const status = await sound1.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        const duration = status.durationMillis;
        const crossFadeDuration = 1000; // 1 second cross-fade
        const loopInterval = duration - crossFadeDuration;
        
        let currentSound = 0; // 0 for sound1, 1 for sound2
        
        const scheduleNextLoop = () => {
          setTimeout(async () => {
            try {
              if (currentSound === 0) {
                // Start fading in sound2 and fading out sound1
                await sound2.setPositionAsync(0);
                await sound2.playAsync();
                
                // Cross-fade: fade out sound1, fade in sound2
                for (let i = 0; i <= 10; i++) {
                  const progress = i / 10;
                  await sound1.setVolumeAsync(0.7 * (1 - progress));
                  await sound2.setVolumeAsync(0.7 * progress);
                  await new Promise(resolve => setTimeout(resolve, crossFadeDuration / 10));
                }
                
                await sound1.stopAsync();
                currentSound = 1;
              } else {
                // Start fading in sound1 and fading out sound2
                await sound1.setPositionAsync(0);
                await sound1.playAsync();
                
                // Cross-fade: fade out sound2, fade in sound1
                for (let i = 0; i <= 10; i++) {
                  const progress = i / 10;
                  await sound2.setVolumeAsync(0.7 * (1 - progress));
                  await sound1.setVolumeAsync(0.7 * progress);
                  await new Promise(resolve => setTimeout(resolve, crossFadeDuration / 10));
                }
                
                await sound2.stopAsync();
                currentSound = 0;
              }
              
              // Schedule the next loop
              scheduleNextLoop();
            } catch (error) {
              console.error('Error in seamless looping:', error);
            }
          }, loopInterval);
        };
        
        // Start the looping cycle
        scheduleNextLoop();
      }
    } catch (error) {
      console.error('Failed to setup seamless looping:', error);
    }
  };

  const startSleepTimer = (minutes: number) => {
    if (sleepTimer > 0) {
      setTimeout(() => {
        fadeOutAndExit();
      }, minutes * 60 * 1000);
    }
  };

  const fadeOutAndExit = async () => {
    try {
      // Stop all audio with fade out
      if (isPlaying) {
        if (sound) {
          // Fade out audio gradually
          for (let i = 10; i >= 0; i--) {
            await sound.setVolumeAsync(0.7 * (i / 10));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        
        if (sound2) {
          await sound2.stopAsync();
          await sound2.unloadAsync();
        }
        
        setIsPlaying(false);
        setSound(null);
        setSound2(null);
      }
      
      // Fade out animation
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/main-menu');
      });
    } catch (error) {
      console.error('Fade out error:', error);
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {}
      }
      if (sound2) {
        try {
          await sound2.stopAsync();
          await sound2.unloadAsync();
        } catch (e) {}
      }
      router.replace('/main-menu');
    }
  };

  const startAnimations = () => {
    // Opacity animation
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    opacityAnimation.start();
    animationRefs.current.opacity = opacityAnimation;

    // Rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();
    animationRefs.current.rotation = rotationAnimation;

    // Scale animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    scaleAnimation.start();
    animationRefs.current.scale = scaleAnimation;
  };

  const getCornerFromTouch = (x: number, y: number): Corner | null => {
    console.log(`Checking touch at (${x}, ${y}) against zones:`);
    for (const zone of touchZones) {
      console.log(`  ${zone.corner}: x(${zone.x}-${zone.x + zone.width}) y(${zone.y}-${zone.y + zone.height})`);
      if (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      ) {
        console.log(`  ✓ Touch matched ${zone.corner}!`);
        return zone.corner;
      }
    }
    console.log('  ✗ No corner matched');
    return null;
  };

  const handleTouch = (x: number, y: number) => {
    const corner = getCornerFromTouch(x, y);
    
    if (!corner) return;

    const newSequence = [...currentSequence, corner];
    setCurrentSequence(newSequence);

    // Clear existing timeout
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }

    // Check if sequence is complete
    if (newSequence.length === unlockSequence.length) {
      const isCorrect = newSequence.every((corner, index) => corner === unlockSequence[index]);
      
      if (isCorrect) {
        // Correct sequence - unlock and stop everything
        fadeOutAndExit();
        return;
      } else {
        // Wrong sequence - show indicator and reset
        setWrongSequenceIndicator(true);
        setCurrentSequence([]);
        // Hide indicator after 1 second
        setTimeout(() => setWrongSequenceIndicator(false), 1000);
        return;
      }
    }

    // Set timeout to reset sequence if not completed in time
    sequenceTimeoutRef.current = setTimeout(() => {
      setCurrentSequence([]);
      // Show timeout indicator
      setWrongSequenceIndicator(true);
      setTimeout(() => setWrongSequenceIndicator(false), 1000);
    }, SEQUENCE_TIMEOUT);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: (evt) => {
      // Use pageX/pageY for absolute screen coordinates
      const { pageX, pageY, locationX, locationY } = evt.nativeEvent;
      // Try both coordinate systems for better compatibility
      const x = pageX || locationX || 0;
      const y = pageY || locationY || 0;
      console.log(`Touch detected at: (${x}, ${y}) - Screen: ${width}x${height} - Corner size: ${CORNER_SIZE}`);
      handleTouch(x, y);
    },
    onPanResponderMove: () => {},
    onPanResponderRelease: () => {},
  });

  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Main Animation Elements */}
      <View style={styles.animationContainer}>
        {/* Circle 1 */}
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            {
              opacity,
              transform: [{ rotate: rotation }, { scale: scaleValue }],
            },
          ]}
        />
        
        {/* Circle 2 */}
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            {
              opacity: animationValue,
              transform: [{ rotate: rotation }, { scale: scaleValue }],
            },
          ]}
        />
        
        {/* Square 1 */}
        <Animated.View
          style={[
            styles.square,
            styles.square1,
            {
              opacity,
              transform: [
                { rotate: rotation },
                { scale: scaleValue },
                { rotateY: rotation },
              ],
            },
          ]}
        />
        
        {/* Square 2 */}
        <Animated.View
          style={[
            styles.square,
            styles.square2,
            {
              opacity: animationValue,
              transform: [
                { rotate: rotation },
                { scale: scaleValue },
                { rotateX: rotation },
              ],
            },
          ]}
        />
      </View>

      {/* Wrong sequence indicator - subtle dot in top center */}
      {wrongSequenceIndicator && (
        <View style={styles.wrongSequenceIndicator} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 1000,
  },
  circle1: {
    width: 120,
    height: 120,
  },
  circle2: {
    width: 80,
    height: 80,
  },
  square: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  square1: {
    width: 60,
    height: 60,
    top: -150,
  },
  square2: {
    width: 40,
    height: 40,
    top: 150,
  },
  wrongSequenceIndicator: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    opacity: 0.8,
  },

});
