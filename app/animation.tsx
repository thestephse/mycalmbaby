import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  BackHandler,
  ActivityIndicator,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { designTokens } from './styles/designTokens';
import AnimationManager, { AnimationConfig, AnimationElement } from './utils/AnimationManager';

// Default animation components (fallbacks)
import BasicShapesAnimation from './animations/basic-shapes/animation';
import NaturePatternsAnimation from './animations/nature-patterns/animation';
import SpaceJourneyAnimation from './animations/space-journey/animation';
import SpaceBubblesAnimation from './animations/space-bubbles/animation';


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
// Default sequence timeout (overridden by AnimationManager)

export default function AnimationScreen() {
  const [unlockSequence, setUnlockSequence] = useState<Corner[]>([]);
  const [currentSequence, setCurrentSequence] = useState<Corner[]>([]);
  const [wrongSequenceIndicator, setWrongSequenceIndicator] = useState(false);
  const [whiteNoiseEnabled, setWhiteNoiseEnabled] = useState(true);
  const [sleepTimer, setSleepTimer] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationConfig | undefined>();
  const [animationElements, setAnimationElements] = useState<AnimationElement[]>([]);
  
  // Reference to the sound object for white noise
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Reference to the fadeOutAndExit function to use it outside useEffect
  const fadeOutAndExitRef = useRef<() => void>(() => {});
  
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
        
        // Load the selected animation
        const animationManager = AnimationManager.getInstance();
        await animationManager.initialize();
        const selectedAnimation = animationManager.getSelectedAnimation();
        if (selectedAnimation) {
          console.log('Loaded animation:', selectedAnimation.name);
          setCurrentAnimation(selectedAnimation);
          setAnimationElements(selectedAnimation.elements || []);
        } else {
          console.log('No animation selected, using default');
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

    // Fade out animation and exit to main menu
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
    
    // Store the function in ref so it can be accessed outside useEffect
    fadeOutAndExitRef.current = fadeOutAndExit;
    
    // Start sleep timer to automatically return to main menu after specified minutes
    const startSleepTimer = (minutes: number) => {
      if (minutes > 0) {
        console.log(`Sleep timer started: ${minutes} minutes`);
        setTimeout(() => {
          console.log('Sleep timer expired, returning to main menu');
          fadeOutAndExit();
        }, minutes * 60 * 1000);
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
        
        // Clean up audio with fade-out
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            // Only stop and unload if the sound is loaded
            if (status.isLoaded) {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
            }
          } catch (audioError) {
            console.log('Audio cleanup error:', audioError);
          }
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

    const init = async () => {
      await initializeScreen();
      await loadSettings();
      setupAnimations();
      
      // Load and play white noise if enabled
      if (whiteNoiseEnabled) {
        loadAndPlayWhiteNoise();
      }
      
      // Start sleep timer if enabled
      if (sleepTimer > 0) {
        startSleepTimer(sleepTimer);
      }
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
  }, [animationValue, isPlaying, rotationValue, scaleValue, sleepTimer, whiteNoiseEnabled]);  // Adding required dependencies

  // initializeScreen moved inside useEffect

  // cleanup moved inside useEffect

  // loadSettings moved inside useEffect

  // Load and play white noise
  const loadAndPlayWhiteNoise = async () => {
    try {
      // Unload any existing sound first
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      
      // Load the white noise sound
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/white-noise.mp3'),
        { isLooping: true, volume: 0.7 },
        status => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
          }
        }
      );
      
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to load and play white noise:', error);
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
        fadeOutAndExitRef.current();
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
    }, 3000); // Default timeout
  };
  
  // Create pan responder for touch handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: (evt) => {
      const { pageX, pageY, locationX, locationY } = evt.nativeEvent;
      const x = pageX || locationX || 0;
      const y = pageY || locationY || 0;
      console.log(`Touch detected at: (${x}, ${y}) - Screen: ${width}x${height} - Corner size: ${CORNER_SIZE}`);
      handleTouch(x, y);
    },
    onPanResponderMove: () => {},
    onPanResponderRelease: () => {},
  });

  const renderAnimationElements = () => {
    // If no animation is selected or loaded, show a loading indicator
    if (!currentAnimation) {
      return (
        <View style={styles.animationContainer}>
          <ActivityIndicator size="large" color={designTokens.colors.primary} />
        </View>
      );
    }

    // Determine which animation component to use based on the selected animation
    let AnimationComponent;
    
    // Use the animation ID to select the appropriate component
    console.log('Current animation ID:', currentAnimation.id);
    switch (currentAnimation.id) {
      case 'basic-shapes':
        console.log('Loading BasicShapesAnimation component');
        AnimationComponent = BasicShapesAnimation;
        break;
      case 'nature-patterns':
        console.log('Loading NaturePatternsAnimation component');
        AnimationComponent = NaturePatternsAnimation;
        break;
      case 'space-journey':
        console.log('Loading SpaceJourneyAnimation component');
        AnimationComponent = SpaceJourneyAnimation;
        break;
      case 'space-bubbles':
        console.log('Loading SpaceBubblesAnimation component');
        AnimationComponent = SpaceBubblesAnimation;
        break;
      default:
        // If no matching animation is found, use BasicShapesAnimation as fallback
        console.log('No matching animation found for ID:', currentAnimation.id);
        AnimationComponent = BasicShapesAnimation;
    }
    
    // Debug the component
    console.log('AnimationComponent type:', typeof AnimationComponent);
    console.log('AnimationComponent is undefined:', AnimationComponent === undefined);

    // Check if AnimationComponent is valid before rendering
    if (!AnimationComponent) {
      console.error('AnimationComponent is undefined or null');
      return (
        <View style={styles.animationContainer}>
          <ActivityIndicator size="large" color={designTokens.colors.primary} />
          <View style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: 'red' }}>
              Error loading animation
            </Text>
          </View>
        </View>
      );
    }

    try {
      // Render the selected animation component with all necessary props
      return (
        <AnimationComponent
          // Props for basic-shapes and nature-patterns
          animationValue={animationValue}
          rotationValue={rotationValue}
          scaleValue={scaleValue}
          elements={animationElements}
          styles={styles}
          // Props for space-bubbles and space-journey
          width={width}
          height={height}
          onAnimationLoaded={() => console.log(`${currentAnimation.id} animation loaded`)}
        />
      );
    } catch (error) {
      console.error('Error rendering animation component:', error);
      return (
        <View style={styles.animationContainer}>
          <ActivityIndicator size="large" color={designTokens.colors.primary} />
          <View style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: 'red' }}>
              Error rendering animation
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Main Animation Elements */}
      {renderAnimationElements()}

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.aliceBlue,
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: designTokens.spacing.xxl,
    alignSelf: 'center',
    zIndex: 10,
  },
  sequenceDot: {
    width: 16,
    height: 16,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: designTokens.colors.mediumGray,
    marginHorizontal: designTokens.spacing.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.lightGray,
  },
  activeDot: {
    backgroundColor: designTokens.colors.primary,
    borderColor: designTokens.colors.primaryDark,
  },
  errorDot: {
    backgroundColor: designTokens.colors.error,
    borderColor: designTokens.colors.anxietyRed,
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    borderRadius: designTokens.borderRadius.full,
  },
  square: {
    backgroundColor: designTokens.colors.darkGray,
  },
  triangle: {
    // Triangle styles are applied inline since they're more complex
  },
  wrongSequenceIndicator: {
    position: 'absolute',
    top: designTokens.spacing.xxl,
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: designTokens.borderRadius.sm / 2,
    backgroundColor: designTokens.colors.error,
    opacity: 0.8,
  },

});
