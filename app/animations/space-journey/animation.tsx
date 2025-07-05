import React from 'react';
import { View, Animated } from 'react-native';
import { AnimationElement } from '../../utils/AnimationManager';

interface AnimationProps {
  animationValue: Animated.Value;
  rotationValue: Animated.Value;
  scaleValue: Animated.Value;
  elements: AnimationElement[];
  styles: Record<string, any>;
}

const SpaceJourneyAnimation: React.FC<AnimationProps> = ({
  animationValue,
  rotationValue,
  scaleValue,
  styles,
}) => {
  // Create animation interpolations
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 1, 0.2],
  });

  // Space journey animation elements
  const stars = Array.from({ length: 20 }, (_, i) => {
    const size = Math.random() * 8 + 2; // Random size between 2-10
    const x = Math.random() * 300; // Random x position
    const y = Math.random() * 500; // Random y position
    
    return {
      id: `star-${i}`,
      size,
      x,
      y,
      delay: i * 100, // Stagger the animation
    };
  });

  const planets = [
    { size: 80, color: '#3B82F6', x: 50, y: 150 }, // Blue planet
    { size: 40, color: '#10B981', x: 250, y: 300 }, // Green planet
    { size: 60, color: '#F59E0B', x: 150, y: 400 }, // Orange planet
  ];

  return (
    <View style={styles.animationContainer}>
      {/* Stars */}
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.circle,
            {
              width: star.size,
              height: star.size,
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: star.y,
              left: star.x,
              opacity: starOpacity,
            },
          ]}
        />
      ))}

      {/* Planets */}
      {planets.map((planet, index) => (
        <Animated.View
          key={`planet-${index}`}
          style={[
            styles.circle,
            {
              width: planet.size,
              height: planet.size,
              backgroundColor: planet.color,
              position: 'absolute',
              top: planet.y,
              left: planet.x,
              transform: [
                { rotate: rotation },
                { scale: scaleValue },
              ],
              opacity: animationValue,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default SpaceJourneyAnimation;
