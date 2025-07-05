import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

import type { AnimationElement } from '../../utils/AnimationManager';

import { Animated, Easing } from 'react-native';

interface AnimationProps {
  width?: number;
  height?: number;
  elements?: AnimationElement[];
  onAnimationLoaded?: () => void;
}

/**
 * Spiral Pinwheel Animation - Primary Colors Edition
 * Converted from HTML/JS to React Native
 */
function SpiralPinwheelAnimation({ 
  width = Dimensions.get('window').width, 
  height = Dimensions.get('window').height,
  elements = [],
  onAnimationLoaded
}: AnimationProps): React.ReactElement {

  const handleCanvas = (canvas: Canvas) => {
    if (!canvas) return;

    // Notify parent once
    onAnimationLoaded?.();

    let animationFrameId = 0;
    let lastTime = Date.now();
    let rotation = 0;

    const initialize = (ctx: any) => {
      if (!ctx) return;
      // @ts-ignore dimension setters
      canvas.width = width;
      // @ts-ignore
      canvas.height = height;
      console.log('SpiralPinwheel: canvas context ready');
      if (!ctx) return;
      // @ts-ignore
      canvas.width = width;
      // @ts-ignore
      canvas.height = height;

      const config = {
        breathMs: 9000,
        layers: [
          { hue: 54 },
          { hue: 210 },
          { hue: 0 },
        ],
        turns: 4.5,
        rotateSpeed: 0.00004,
        widthFactor: 2.5,
      } as const;

      const ease = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

      const draw = () => {
        // debug frame log
        // console.log('SpiralPinwheel: draw frame');
        const now = Date.now();
        const dt = now - lastTime;
        lastTime = now;
        rotation += dt * config.rotateSpeed;

        const phase = (now % config.breathMs) / config.breathMs;
        const breath = ease(phase < 0.5 ? phase * 2 : 2 - phase * 2);

        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const maxR = Math.min(cx, cy) * 0.9;

        config.layers.forEach((col, i) => {
          const depth = i / (config.layers.length - 1);
          const scale = 1 - depth * 0.2;
          const radius = maxR * scale;
          const spacing = radius / (config.turns * Math.PI * 2);
          const lineW = spacing * config.widthFactor;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rotation * (1 - depth * 0.3));
          ctx.strokeStyle = `hsla(${col.hue},100%,${70 - depth * 20}%,${1 - depth * 0.2})`;
          ctx.lineWidth = Math.max(lineW, 2);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 * config.turns; a += 0.01) {
            const rel = a / (Math.PI * 2 * config.turns);
            const r = (0.2 + 0.8 * breath * rel) * radius;
            const x = r * Math.cos(a);
            const y = r * Math.sin(a);
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        });
        animationFrameId = requestAnimationFrame(draw);
      };
      draw();
      (canvas as any).__cleanup = () => cancelAnimationFrame(animationFrameId);
    };
    const maybeCtx: any = (canvas as any).getContext('2d');
    if (maybeCtx && typeof maybeCtx.then === 'function') {
      maybeCtx.then(initialize);
    } else if (maybeCtx) {
      initialize(maybeCtx);
    } else {
      // iOS sometimes needs context2d event
      // @ts-ignore
      canvas.addEventListener('context2d', initialize);
    }
  };

  return (
    <View style={styles.container}>
      <Canvas ref={handleCanvas} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  canvas: {
    flex: 1,
  },
});

export default SpiralPinwheelAnimation;
