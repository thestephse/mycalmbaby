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
        }
        if (savedTimer) {
          const timer = parseInt(savedTimer);
          setSleepTimer(timer);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    const setupAnimations = async () => {
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
        
        // Clean up audio with fade-out
        
        
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

    const init = async () => {
      await initializeScreen();
      await loadSettings();
      setupAnimations();
      loadAndPlayWhiteNoise();
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
  }, [animationValue, isPlaying, rotationValue, scaleValue]);  // Adding required dependencies

  // initializeScreen moved inside useEffect

  // cleanup moved inside useEffect

  // loadSettings moved inside useEffect

  

  // Used when sleep timer is activated via UI
  const startSleepTimer = (minutes: number) => {
    if (sleepTimer > 0) {
      setTimeout(() => {
        fadeOutAndExit();
      }, minutes * 60 * 1000);
    }
  };

  const fadeOutAndExit = async () => {
    try {
      
      
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
      
      router.replace('/main-menu');
    }
  };

  // startAnimations moved inside useEffect

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

      {/* Sequence entry indicator dots - only show after first corner press */}
      {currentSequence.length > 0 && (
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View 
              key={index} 
              style={[
                styles.sequenceDot,
                currentSequence.length > index && styles.activeDot,
                wrongSequenceIndicator && styles.errorDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 10,
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
