import React from 'react';
import { Animated, View } from 'react-native';
import { AnimationElement } from '../../utils/AnimationManager';

interface AnimationProps {
  animationValue: Animated.Value;
  rotationValue: Animated.Value;
  scaleValue: Animated.Value;
  elements: AnimationElement[];
  styles: any;
}

/**
 * Nature Patterns Animation
 * 
 * This animation renders organic shapes inspired by nature with
 * smooth translation, scale, and opacity animations.
 */
export default function NaturePatternsAnimation({
  animationValue,
  rotationValue,
  scaleValue,
  elements,
  styles,
}: AnimationProps) {
  // Create additional animation values for translation
  const translateXValue = React.useRef(new Animated.Value(0)).current;
  const translateYValue = React.useRef(new Animated.Value(0)).current;
  
  // Start the translation animations
  React.useEffect(() => {
    // X translation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateXValue, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(translateXValue, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Y translation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateYValue, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYValue, {
          toValue: 0,
          duration: 7000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => {
      // Clean up animations
      translateXValue.stopAnimation();
      translateYValue.stopAnimation();
    };
  }, [translateXValue, translateYValue]);

  return (
    <View style={styles.animationContainer}>
      {elements.map((element, index) => {
        const { type, properties } = element;
        const { size, color, animations = {} } = properties;

        const transforms = [];
        
        // Apply animations based on element properties
        if (animations.rotate) {
          transforms.push({ 
            rotate: rotationValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }) 
          });
        }
        
        if (animations.scale) {
          transforms.push({ scale: scaleValue });
        }
        
        if (animations.translateX) {
          transforms.push({ 
            translateX: translateXValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 50 * (index % 2 === 0 ? 1 : -1)], // Alternate direction
            }) 
          });
        }
        
        if (animations.translateY) {
          transforms.push({ 
            translateY: translateYValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 30 * (index % 3 === 0 ? 1 : -1)], // Varied direction
            }) 
          });
        }

        const opacityStyle = animations.opacity ? { opacity: animationValue } : {};

        switch (type) {
          case 'circle':
            return (
              <Animated.View
                key={`element-${index}`}
                style={[
                  styles.circle,
                  {
                    width: size,
                    height: size,
                    backgroundColor: color,
                    transform: transforms,
                    ...opacityStyle,
                  },
                ]}
              />
            );
          case 'square':
            return (
              <Animated.View
                key={`element-${index}`}
                style={[
                  styles.square,
                  {
                    width: size,
                    height: size,
                    backgroundColor: color,
                    transform: transforms,
                    ...opacityStyle,
                  },
                ]}
              />
            );
          case 'triangle':
            return (
              <Animated.View
                key={`element-${index}`}
                style={[
                  styles.triangle,
                  {
                    borderBottomWidth: size,
                    borderLeftWidth: size / 2,
                    borderRightWidth: size / 2,
                    borderBottomColor: color,
                    transform: transforms,
                    ...opacityStyle,
                  },
                ]}
              />
            );
          default:
            return null;
        }
      })}
    </View>
  );
}
