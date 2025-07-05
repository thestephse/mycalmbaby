import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface AnimationProps {
  width: number;
  height: number;
  onAnimationLoaded?: () => void;
}

// Nature-inspired animation component
const NaturePatternsAnimation: React.FC<AnimationProps> = ({ width, height, onAnimationLoaded }) => {
  // Animation values
  const leaf1Animation = useRef(new Animated.Value(0)).current;
  const leaf2Animation = useRef(new Animated.Value(0)).current;
  const flower1Animation = useRef(new Animated.Value(0)).current;
  const flower2Animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Notify parent that animation is loaded
    if (onAnimationLoaded) {
      onAnimationLoaded();
    }

    // Create animation sequence
    const animateLeaf1 = Animated.loop(
      Animated.sequence([
        Animated.timing(leaf1Animation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leaf1Animation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const animateLeaf2 = Animated.loop(
      Animated.sequence([
        Animated.timing(leaf2Animation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leaf2Animation, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const animateFlower1 = Animated.loop(
      Animated.sequence([
        Animated.timing(flower1Animation, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flower1Animation, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const animateFlower2 = Animated.loop(
      Animated.sequence([
        Animated.timing(flower2Animation, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flower2Animation, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    animateLeaf1.start();
    animateLeaf2.start();
    animateFlower1.start();
    animateFlower2.start();

    return () => {
      // Stop animations on unmount
      animateLeaf1.stop();
      animateLeaf2.stop();
      animateFlower1.stop();
      animateFlower2.stop();
    };
  }, [leaf1Animation, leaf2Animation, flower1Animation, flower2Animation, onAnimationLoaded]);

  // Leaf 1 animations
  const leaf1Rotate = leaf1Animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const leaf1Scale = leaf1Animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  // Leaf 2 animations
  const leaf2Rotate = leaf2Animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-30deg'],
  });

  const leaf2Scale = leaf2Animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1],
  });

  // Flower 1 animations
  const flower1Rotate = flower1Animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const flower1Scale = flower1Animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  // Flower 2 animations
  const flower2Opacity = flower2Animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  const flower2Scale = flower2Animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Leaf 1 */}
      <Animated.View
        style={[
          styles.leaf,
          {
            backgroundColor: '#4ADE80',
            transform: [
              { rotate: leaf1Rotate },
              { scale: leaf1Scale },
            ],
            top: height * 0.3,
            left: width * 0.2,
          },
        ]}
      />

      {/* Leaf 2 */}
      <Animated.View
        style={[
          styles.leaf,
          {
            backgroundColor: '#22C55E',
            transform: [
              { rotate: leaf2Rotate },
              { scale: leaf2Scale },
            ],
            top: height * 0.6,
            left: width * 0.7,
          },
        ]}
      />

      {/* Flower 1 */}
      <Animated.View
        style={[
          styles.flower,
          {
            backgroundColor: '#EC4899',
            transform: [
              { rotate: flower1Rotate },
              { scale: flower1Scale },
            ],
            top: height * 0.2,
            left: width * 0.7,
          },
        ]}
      />

      {/* Flower 2 */}
      <Animated.View
        style={[
          styles.flower,
          {
            backgroundColor: '#F472B6',
            opacity: flower2Opacity,
            transform: [
              { scale: flower2Scale },
            ],
            top: height * 0.7,
            left: width * 0.3,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  leaf: {
    position: 'absolute',
    width: 80,
    height: 120,
    borderRadius: 40,
  },
  flower: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default NaturePatternsAnimation;
