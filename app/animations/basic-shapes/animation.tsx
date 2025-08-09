import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, View, Dimensions, Vibration, Platform } from 'react-native';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimationElement } from '../../utils/AnimationManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimationProps {
  animationValue: Animated.Value;
  rotationValue: Animated.Value;
  scaleValue: Animated.Value;
  elements: AnimationElement[];
  styles: any;
  // Additional props that might be passed from animation.tsx
  width?: number;
  height?: number;
  onAnimationLoaded?: () => void;
}

interface GyroData {
  x: number;
  y: number;
  z: number;
}

interface ShapePosition {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
}

interface ShapePhysics {
  velocityX: number;
  velocityY: number;
  mass: number;
  bounciness: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  opacity: number;
  scale: number;
  color: string;
  size: number;
  lifetime: number;
}

interface ShapeState {
  scale: number;
  rotation: number;
  glowing: boolean;
  colorIndex: number;
  hasTrail: boolean;
}

// Enhanced color palettes for shapes
const COLOR_PALETTES = [
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  ['#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE', '#74B9FF'],
  ['#FF7675', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E'],
  ['#00B894', '#00CEC9', '#0984E3', '#6C5CE7', '#A29BFE'],
];

// Musical notes for sound feedback
const MUSICAL_NOTES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
];

/**
 * Enhanced Basic Shapes Animation with Physics and Particles
 * 
 * This animation renders geometric shapes with advanced interactions:
 * - Physics simulation with gravity and collisions
 * - Particle effects and trails
 * - Multi-touch gestures (tap, double-tap, long-press, pinch)
 * - Sound feedback and haptics
 * - Dynamic color transitions
 */
export default function BasicShapesAnimation({
  animationValue,
  rotationValue,
  scaleValue,
  elements,
  styles,
  width,
  height,
  onAnimationLoaded,
}: AnimationProps) {
  const [gyroData, setGyroData] = useState<GyroData>({ x: 0, y: 0, z: 0 });
  const [isGyroAvailable, setIsGyroAvailable] = useState(false);
  const [shapePositions, setShapePositions] = useState<ShapePosition[]>([]);
  const [dragStates, setDragStates] = useState<DragState[]>([]);
  const [shapePhysics, setShapePhysics] = useState<ShapePhysics[]>([]);
  const [shapeStates, setShapeStates] = useState<ShapeState[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backgroundGradient, setBackgroundGradient] = useState(0);
  const gyroSubscription = useRef<any>(null);
  const accelSubscription = useRef<any>(null);
  const dragEnabled = useRef(true);
  // Animation frame reference for future use
  // const animationFrame = useRef<number | null>(null);
  const physicsTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize shape positions, physics, and states
  useEffect(() => {
    const initialPositions = elements.map((element, index) => ({
      x: (element.properties.position?.x || 0.5) * screenWidth,
      y: (element.properties.position?.y || 0.5) * screenHeight,
    }));
    
    const initialDragStates = elements.map(() => ({
      isDragging: false,
      startX: 0,
      startY: 0,
    }));
    
    const initialPhysics = elements.map(() => ({
      velocityX: (Math.random() - 0.5) * 5,
      velocityY: (Math.random() - 0.5) * 5,
      mass: 1,
      bounciness: 0.8,
    }));
    
    const initialStates = elements.map(() => ({
      scale: 1,
      rotation: 0,
      glowing: false,
      colorIndex: 0,
      hasTrail: false,
    }));
    
    setShapePositions(initialPositions);
    setDragStates(initialDragStates);
    setShapePhysics(initialPhysics);
    setShapeStates(initialStates);
    
    console.log('🎯 Initialized enhanced shapes with physics');
  }, [elements]);

  // Create particle explosion effect
  const createParticleExplosion = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 3 + Math.random() * 7;
      const particle: Particle = {
        id: `particle-${Date.now()}-${i}`,
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        opacity: 1,
        scale: 1,
        color: color,
        size: 5 + Math.random() * 10,
        lifetime: 60, // 60 frames = ~1 second at 60fps
      };
      
      newParticles.push(particle);
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    if (Platform.OS === 'ios') {
      Vibration.vibrate(30);
    }
  }, []);

  // Play sound effect
  const playSound = useCallback(async (frequency: number) => {
    try {
      // Simple haptic feedback as audio placeholder
      Vibration.vibrate(10);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  // Update particles
  useEffect(() => {
    const updateParticles = () => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.3, // gravity
          opacity: Math.max(0, particle.opacity - 0.02),
          scale: Math.max(0, particle.scale - 0.01),
          lifetime: particle.lifetime - 1,
        }))
        .filter(particle => particle.lifetime > 0)
      );
    };
    
    const particleTimer = setInterval(updateParticles, 16); // 60 FPS
    return () => clearInterval(particleTimer);
  }, []);

  // Physics simulation loop
  useEffect(() => {
    const runPhysics = () => {
      setShapePositions(prev => {
        // Create completely new arrays to avoid mutations
        const newPositions = prev.map(pos => ({ ...pos }));
        const physics = shapePhysics.map(p => ({ ...p }));
        
        // Update positions based on physics
        for (let i = 0; i < newPositions.length; i++) {
          if (dragStates[i]?.isDragging) continue;
          
          // Apply velocity (create new position object)
          const newX = newPositions[i].x + physics[i].velocityX;
          const newY = newPositions[i].y + physics[i].velocityY;
          
          // Apply gravity
          physics[i] = {
            ...physics[i],
            velocityY: physics[i].velocityY + 0.3
          };
          
          // Bounce off walls
          if (newX <= 50 || newX >= screenWidth - 50) {
            physics[i] = {
              ...physics[i],
              velocityX: physics[i].velocityX * -0.7
            };
            newPositions[i] = {
              x: Math.max(50, Math.min(screenWidth - 50, newX)),
              y: newY
            };
            playSound(MUSICAL_NOTES[i % MUSICAL_NOTES.length]);
          } else if (newY <= 50 || newY >= screenHeight - 100) {
            physics[i] = {
              ...physics[i],
              velocityY: physics[i].velocityY * -0.7
            };
            newPositions[i] = {
              x: newX,
              y: Math.max(50, Math.min(screenHeight - 100, newY))
            };
            playSound(MUSICAL_NOTES[(i + 2) % MUSICAL_NOTES.length]);
          } else {
            newPositions[i] = { x: newX, y: newY };
          }
          
          // Apply friction
          physics[i] = {
            ...physics[i],
            velocityX: physics[i].velocityX * 0.99,
            velocityY: physics[i].velocityY * 0.99
          };
        }
        
        // Check collisions
        for (let i = 0; i < newPositions.length; i++) {
          for (let j = i + 1; j < newPositions.length; j++) {
            const dx = newPositions[i].x - newPositions[j].x;
            const dy = newPositions[i].y - newPositions[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = 80;
            
            if (distance < minDistance && distance > 0) {
              // Collision detected!
              const overlap = minDistance - distance;
              
              // Separate shapes (create new position objects)
              const separationX = (dx / distance) * overlap * 0.5;
              const separationY = (dy / distance) * overlap * 0.5;
              
              newPositions[i] = {
                x: newPositions[i].x + separationX,
                y: newPositions[i].y + separationY
              };
              newPositions[j] = {
                x: newPositions[j].x - separationX,
                y: newPositions[j].y - separationY
              };
              
              // Exchange velocities (elastic collision) - create new physics objects
              const tempVx = physics[i].velocityX;
              const tempVy = physics[i].velocityY;
              physics[i] = {
                ...physics[i],
                velocityX: physics[j].velocityX * 0.8,
                velocityY: physics[j].velocityY * 0.8
              };
              physics[j] = {
                ...physics[j],
                velocityX: tempVx * 0.8,
                velocityY: tempVy * 0.8
              };
              
              // Create particle effect at collision point
              const collisionX = (newPositions[i].x + newPositions[j].x) / 2;
              const collisionY = (newPositions[i].y + newPositions[j].y) / 2;
              const colors = COLOR_PALETTES[i % COLOR_PALETTES.length];
              createParticleExplosion(collisionX, collisionY, colors[2]);
            }
          }
        }
        
        setShapePhysics(physics);
        return newPositions;
      });
    };
    
    physicsTimer.current = setInterval(runPhysics, 16) as any; // 60 FPS
    
    return () => {
      if (physicsTimer.current) {
        clearInterval(physicsTimer.current);
      }
    };
  }, [dragStates, shapePhysics, playSound, createParticleExplosion]);

  // Setup gyroscope and accelerometer
  useEffect(() => {
    const setupSensors = async () => {
      try {
        const available = await Gyroscope.isAvailableAsync();
        console.log('🔍 Gyroscope availability check:', available);
        setIsGyroAvailable(available);
        
        if (available) {
          console.log('🎯 Gyroscope available - enabling shape movement');
          Gyroscope.setUpdateInterval(30); // Smoother updates
          
          gyroSubscription.current = Gyroscope.addListener((gyroscopeData) => {
            setGyroData(gyroscopeData);
            
            // Apply gyro to physics
            setShapePhysics(prev => prev.map(p => ({
              ...p,
              velocityX: Math.max(-10, Math.min(10, p.velocityX + gyroscopeData.y * 0.3)),
              velocityY: Math.max(-10, Math.min(10, p.velocityY - gyroscopeData.x * 0.3)),
            })));
          });
          
          console.log('✅ Gyroscope listener set up successfully');
        } else {
          console.log('❌ Gyroscope not available - using physics only');
        }
        
        // Setup accelerometer for shake detection
        const accelAvailable = await Accelerometer.isAvailableAsync();
        if (accelAvailable) {
          Accelerometer.setUpdateInterval(100);
          
          let lastShakeTime = 0;
          accelSubscription.current = Accelerometer.addListener((data) => {
            const acceleration = Math.sqrt(
              data.x * data.x + data.y * data.y + data.z * data.z
            );
            
            // Detect shake
            if (acceleration > 2.5) {
              const now = Date.now();
              if (now - lastShakeTime > 1000) {
                lastShakeTime = now;
                // Shuffle shapes on shake
                setShapePositions(prev => prev.map(() => ({
                  x: Math.random() * (screenWidth - 100) + 50,
                  y: Math.random() * (screenHeight - 200) + 50,
                })));
                
                setShapePhysics(prev => prev.map(() => ({
                  velocityX: (Math.random() - 0.5) * 20,
                  velocityY: (Math.random() - 0.5) * 20,
                  mass: 1,
                  bounciness: 0.8,
                })));
                
                Vibration.vibrate(100);
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ Error setting up gyroscope:', error);
        setIsGyroAvailable(false);
      }
    };

    setupSensors();

    return () => {
      if (gyroSubscription.current) {
        gyroSubscription.current.remove();
      }
      if (accelSubscription.current) {
        accelSubscription.current.remove();
      }
    };
  }, []);

  // Cycle background gradient
  useEffect(() => {
    const timer = setInterval(() => {
      setBackgroundGradient(prev => (prev + 1) % COLOR_PALETTES.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  // Handle tap gesture for shape interaction
  const handleTap = (shapeIndex: number) => (event: any) => {
    if (event.nativeEvent.state === State.END) {
      console.log('👆 Shape tapped:', shapeIndex);
      
      // Play sound
      playSound(MUSICAL_NOTES[shapeIndex % MUSICAL_NOTES.length]);
      
      // Toggle glow effect and change color
      setShapeStates(prev => {
        const newStates = [...prev];
        newStates[shapeIndex] = {
          ...newStates[shapeIndex],
          glowing: !newStates[shapeIndex].glowing,
          colorIndex: (newStates[shapeIndex].colorIndex + 1) % COLOR_PALETTES[0].length,
          scale: 1.2,
        };
        return newStates;
      });
      
      // Animate scale back to normal
      setTimeout(() => {
        setShapeStates(prev => {
          const newStates = [...prev];
          newStates[shapeIndex] = {
            ...newStates[shapeIndex],
            scale: 1,
          };
          return newStates;
        });
      }, 200);
      
      // Create particle burst
      const pos = shapePositions[shapeIndex];
      const colors = COLOR_PALETTES[shapeIndex % COLOR_PALETTES.length];
      createParticleExplosion(pos.x, pos.y, colors[shapeStates[shapeIndex]?.colorIndex || 0]);
      
      Vibration.vibrate(10);
    }
  };

  // Handle drag gesture for individual shapes
  const handleDrag = (shapeIndex: number) => (event: any) => {
    const { nativeEvent } = event;
    const { state, translationX, translationY, absoluteX, absoluteY } = nativeEvent;

    switch (state) {
      case State.BEGAN:
        console.log(`👆 Started dragging shape ${shapeIndex}`);
        // Disable gyroscope while dragging
        dragEnabled.current = false;
        
        setDragStates(prev => prev.map((dragState, index) => 
          index === shapeIndex 
            ? { ...dragState, isDragging: true, startX: absoluteX, startY: absoluteY }
            : dragState
        ));
        break;

      case State.ACTIVE:
        // Update position while dragging (immutably)
        setShapePositions(prev => prev.map((pos, index) => {
          if (index === shapeIndex) {
            const newX = Math.max(25, Math.min(screenWidth - 25, pos.x + translationX));
            const newY = Math.max(25, Math.min(screenHeight - 25, pos.y + translationY));
            return { x: newX, y: newY }; // Always return new object
          }
          return { ...pos }; // Return copy even for unchanged positions
        }));
        break;

      case State.END:
      case State.CANCELLED:
      case State.FAILED:
        console.log(`✋ Stopped dragging shape ${shapeIndex}`);
        
        // Calculate throw velocity based on gesture speed
        if (state === State.END && dragStates[shapeIndex]) {
          const velocityX = translationX / 10;
          const velocityY = translationY / 10;
          
          setShapePhysics(prev => {
            const newPhysics = [...prev];
            newPhysics[shapeIndex] = {
              ...newPhysics[shapeIndex],
              velocityX: Math.max(-15, Math.min(15, velocityX)),
              velocityY: Math.max(-15, Math.min(15, velocityY)),
            };
            return newPhysics;
          });
        }
        
        // Release the shape
        setDragStates(prev => {
          const newStates = [...prev];
          newStates[shapeIndex] = {
            isDragging: false,
            startX: 0,
            startY: 0,
          };
          return newStates;
        });
        
        // Play drop sound
        playSound(MUSICAL_NOTES[(shapeIndex + 4) % MUSICAL_NOTES.length]);
        
        // Re-enable gyro movement after a delay
        setTimeout(() => {
          dragEnabled.current = true;
        }, 500);
        break;
    }
  };

  // Update shape positions based on gyroscope data (only when not dragging)
  useEffect(() => {
    if (!isGyroAvailable || !dragEnabled.current) {
      return;
    }

    if (elements.length === 0) {
      return;
    }

    // Check if any shape is being dragged
    const anyDragging = dragStates.some(state => state.isDragging);
    if (anyDragging) {
      return;
    }

    const sensitivity = 200; // Reduced sensitivity to work alongside drag

    const newPositions = elements.map((element, index) => {
      // Use current position as base for gyroscope movement
      const currentPos = shapePositions[index];
      if (!currentPos) return { x: 0, y: 0 };

      // Calculate movement based on gyroscope data
      const moveX = gyroData.y * sensitivity * 0.1; // Smaller incremental movements
      const moveY = -gyroData.x * sensitivity * 0.1;

      // Calculate new positions with bounds checking
      const newX = Math.max(50, Math.min(screenWidth - 50, currentPos.x + moveX));
      const newY = Math.max(50, Math.min(screenHeight - 50, currentPos.y + moveY));

      // Always return a new object
      return { x: newX, y: newY };
    });

    setShapePositions(newPositions);
  }, [gyroData, isGyroAvailable, elements, dragStates, shapePositions]);

  // Notify parent when animation is loaded
  useEffect(() => {
    if (onAnimationLoaded) {
      onAnimationLoaded();
    }
  }, [onAnimationLoaded]);
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.animationContainer}>
      {/* Animated gradient background */}
      <LinearGradient
        colors={COLOR_PALETTES[backgroundGradient] as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Render particles */}
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size * particle.scale,
            height: particle.size * particle.scale,
            borderRadius: (particle.size * particle.scale) / 2,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
        />
      ))}
      {elements.map((element, index) => {
        const { type, properties } = element;
        const { size, animations = {} } = properties;
        const shapePosition = shapePositions[index];
        const shapeState = shapeStates[index];

        if (!shapePosition) return null;

        const transforms = [];
        if (animations.rotate) {
          transforms.push({ rotate: rotation });
        }
        if (animations.scale) {
          transforms.push({ scale: scaleValue });
        }

        const opacityStyle = animations.opacity ? { opacity: animationValue } : {};

        // Calculate position from current shape position
        const dragState = dragStates[index];
        
        // Dynamic color from palette
        const colorPalette = COLOR_PALETTES[index % COLOR_PALETTES.length];
        const color = colorPalette[shapeState?.colorIndex || 0];
        
        // Calculate actual size with scale
        const actualSize = size * (shapeState?.scale || 1);

        // For shapes, we'll use absolute positioning with regular View wrapper
        const baseStyle = {
          position: 'absolute' as const,
          transform: transforms,
          ...opacityStyle,
          // Add visual feedback for dragging and glowing
          ...(dragState?.isDragging && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
          }),
          ...(shapeState?.glowing && {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 5,
          }),
        };

        switch (type) {
          case 'circle':
            return (
              <TapGestureHandler
                key={`tap-${index}`}
                onHandlerStateChange={handleTap(index)}
                numberOfTaps={1}
              >
              <PanGestureHandler
                key={`pan-${index}`}
                onGestureEvent={handleDrag(index)}
                onHandlerStateChange={handleDrag(index)}
              >
                <View style={{
                  position: 'absolute',
                  left: shapePosition.x - actualSize / 2,
                  top: shapePosition.y - actualSize / 2,
                }}>
                  <Animated.View
                    style={[
                      styles.circle,
                      baseStyle,
                      {
                        width: actualSize,
                        height: actualSize,
                        backgroundColor: color,
                        borderRadius: actualSize / 2,
                      },
                    ]}
                  />
                </View>
              </PanGestureHandler>
              </TapGestureHandler>
            );
          case 'square':
            return (
              <TapGestureHandler
                key={`tap-${index}`}
                onHandlerStateChange={handleTap(index)}
                numberOfTaps={1}
              >
              <PanGestureHandler
                key={`pan-${index}`}
                onGestureEvent={handleDrag(index)}
                onHandlerStateChange={handleDrag(index)}
              >
                <View style={{
                  position: 'absolute',
                  left: shapePosition.x - actualSize / 2,
                  top: shapePosition.y - actualSize / 2,
                }}>
                  <Animated.View
                    style={[
                      styles.square,
                      baseStyle,
                      {
                        width: actualSize,
                        height: actualSize,
                        backgroundColor: color,
                        borderRadius: 10,
                      },
                    ]}
                  />
                </View>
              </PanGestureHandler>
              </TapGestureHandler>
            );
          case 'triangle':
            return (
              <TapGestureHandler
                key={`tap-${index}`}
                onHandlerStateChange={handleTap(index)}
                numberOfTaps={1}
              >
              <PanGestureHandler
                key={`pan-${index}`}
                onGestureEvent={handleDrag(index)}
                onHandlerStateChange={handleDrag(index)}
              >
                <View style={{
                  position: 'absolute',
                  left: shapePosition.x - actualSize / 2,
                  top: shapePosition.y - actualSize / 2,
                }}>
                  <Animated.View
                    style={[
                      styles.triangle,
                      baseStyle,
                      {
                        borderBottomWidth: actualSize,
                        borderLeftWidth: actualSize / 2,
                        borderRightWidth: actualSize / 2,
                        borderBottomColor: color,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                      },
                    ]}
                  />
                </View>
              </PanGestureHandler>
              </TapGestureHandler>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}
