import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import type { AnimationElement } from '../../utils/AnimationManager';

interface AnimationProps {
  width?: number;
  height?: number;
  elements?: AnimationElement[]; // kept for API parity even if unused
  onAnimationLoaded?: () => void;
}

/**
 * Spiral Pinwheel native implementation using react-native-svg + Animated.
 * Avoids the unreliable react-native-canvas WebView on iOS/Expo.
 */
export default function SpiralPinwheelAnimation({
  width = Dimensions.get('window').width,
  height = Dimensions.get('window').height,
  onAnimationLoaded,
}: AnimationProps): React.ReactElement {
  // Animated values
  const rotation = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(0)).current;

  // Helper to build an Archimedean spiral path string
  const buildSpiral = (turns: number, maxR: number): string => {
    const step = 0.02;
    let path = '';
    for (let a = 0; a <= Math.PI * 2 * turns; a += step) {
      const r = (a / (Math.PI * 2 * turns)) * maxR;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      path += a === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path;
  };

  // Pre-compute spiral path once
  const maxR = Math.min(width, height) * 0.4;
  const basePath = buildSpiral(4.5, maxR);

  // Start animations on mount
  useEffect(() => {
    // rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // breathing scale (ease in-out)
    Animated.loop(
      Animated.timing(breath, {
        toValue: 1,
        duration: 9000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ).start();

    onAnimationLoaded?.();
  }, [rotation, breath, onAnimationLoaded]);

  const rotateInterpolate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const breathInterpolate = breath.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [{ rotate: rotateInterpolate }, { scale: breathInterpolate }],
        }}
      >
        <Svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}>
          <G fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d={basePath} stroke="hsl(54,100%,70%)" strokeWidth={4} />
            <Path d={basePath} stroke="hsl(210,100%,70%)" strokeWidth={4} />
            <Path d={basePath} stroke="hsl(0,100%,70%)" strokeWidth={4} />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
