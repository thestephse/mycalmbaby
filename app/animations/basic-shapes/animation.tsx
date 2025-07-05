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
 * Basic Shapes Animation
 * 
 * This animation renders geometric shapes with rotation, scale, and opacity animations.
 */
export default function BasicShapesAnimation({
  animationValue,
  rotationValue,
  scaleValue,
  elements,
  styles,
}: AnimationProps) {
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.animationContainer}>
      {elements.map((element, index) => {
        const { type, properties } = element;
        const { size, color, animations = {} } = properties;

        const transforms = [];
        if (animations.rotate) {
          transforms.push({ rotate: rotation });
        }
        if (animations.scale) {
          transforms.push({ scale: scaleValue });
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
