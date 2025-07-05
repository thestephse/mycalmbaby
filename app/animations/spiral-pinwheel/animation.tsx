import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import type { AnimationElement } from '../../utils/AnimationManager';

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
  const canvasRef = useRef<Canvas | null>(null);
  
  useEffect(() => {
    // Notify parent when animation is loaded
    if (onAnimationLoaded) onAnimationLoaded();
    
    let animationFrameId = 0;
    let lastTime = Date.now();
    let rotation = 0;
    
    // Configuration for the spiral pinwheel
    const config = {
      breathMs: 9000,
      layers: [
        { hue: 54 },   // yellow
        { hue: 210 },  // blue
        { hue: 0 }     // red
      ],
      turns: 4.5,
      rotateSpeed: 0.00004,
      widthFactor: 2.5
    };
    
    // Easing function for breathing effect
    const ease = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;
    
    const handleCanvas = (canvas: Canvas | null) => {
      if (!canvas) return;
      
      // Get the 2D context
      // @ts-ignore - Canvas type definition is incomplete
      canvas.getContext('2d').then((ctx: any) => {
        if (!ctx) return;
        
        // Set canvas dimensions
        // @ts-ignore - Canvas type definition is incomplete
        canvas.width = width;
        // @ts-ignore - Canvas type definition is incomplete
        canvas.height = height;
        
        // Draw function
        const draw = () => {
          const now = Date.now();
          const dt = now - lastTime;
          lastTime = now;
          rotation += dt * config.rotateSpeed;

          // Breathing factor
          const phase = (now % config.breathMs) / config.breathMs;
          const breath = ease(phase < 0.5 ? phase * 2 : 2 - phase * 2);

          // Clear canvas
          ctx.clearRect(0, 0, width, height);

          const cx = width / 2;
          const cy = height / 2;
          const maxR = Math.min(cx, cy) * 0.9;

          config.layers.forEach((col: {hue: number}, i: number) => {
            const depth = i / (config.layers.length - 1);
            const scale = 1 - depth * 0.2;
            const radius = maxR * scale;
            const spacing = radius / (config.turns * Math.PI * 2);
            const lineW = spacing * config.widthFactor;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation * (1 - depth * 0.3));

            // Create gradient stroke (simplified for React Native Canvas)
            ctx.strokeStyle = `hsla(${col.hue},100%,${70 - depth * 20}%,${1 - depth * 0.2})`;
            ctx.lineWidth = lineW;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2 * config.turns; a += 0.01) {
              const rel = a / (Math.PI * 2 * config.turns);
              const r = (0.2 + 0.8 * breath * rel) * radius;
              const x = r * Math.cos(a);
              const y = r * Math.sin(a);
              
              if (a === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
            ctx.restore();
          });

          animationFrameId = requestAnimationFrame(draw);
        };

        // Start the animation
        draw();
      });
    };
    
    // Set up the canvas when it's available
    setTimeout(() => {
      if (canvasRef.current) {
        handleCanvas(canvasRef.current);
      }
    }, 100); // Small delay to ensure canvas is ready
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, onAnimationLoaded]);


  return (
    <View style={styles.container}>
      <Canvas
        ref={canvasRef}
        style={styles.canvas}
      />
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
