import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, GestureResponderEvent } from 'react-native';
import Canvas, { CanvasRenderingContext2D } from 'react-native-canvas';
import { Accelerometer } from 'expo-sensors';
import type { AnimationElement } from '../../utils/AnimationManager';

interface AnimationProps {
  width?: number;
  height?: number;
  elements?: AnimationElement[];
  onAnimationLoaded?: () => void;
}

// Animation constants
const INITIAL_BUBBLE_COUNT = 8;
const BUBBLE_MIN_RAD = 16;
const BUBBLE_MAX_RAD = 40;
const CHILD_COUNT_MIN = 2;
const CHILD_COUNT_MAX = 5;
const BURST_SPEED = 100;
const BUBBLE_SPEED = 12;
const MAX_HOR_SPEED = 8;
const DOT_COUNT = 12;
const DOT_RAD = 8;
const DOT_BURST_DIST = 40;
const DOT_LIFETIME = 1.0;

/**
 * Bubble state and logic
 */
class Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;

  constructor(x: number | null, y: number | null, r: number | null, vx: number = 0, vy: number = 0, W: number, H: number) {
    this.x = x != null ? x : Math.random() * W;
    this.y = y != null ? y : Math.random() * H;
    this.r =
      r != null
        ? r
        : Math.random() * (BUBBLE_MAX_RAD - BUBBLE_MIN_RAD) + BUBBLE_MIN_RAD;
    this.vx = vx;
    this.vy = vy;
  }

  update(dt: number, tilt: { x: number; y: number }, W: number, H: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x += tilt.x * BUBBLE_SPEED * dt;
    this.y += tilt.y * BUBBLE_SPEED * dt;
    this.vx *= 0.95;
    this.vy *= 0.95;
    if (this.y < -this.r) {
      this.y = H + this.r;
      this.x = Math.random() * W;
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }

  contains(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.r * this.r;
  }
}

/**
 * Dot for tap bursts
 */
class Dot {
  cx: number;
  cy: number;
  angle: number;
  vx: number;
  vy: number;
  elapsed: number;

  constructor(cx: number, cy: number) {
    this.cx = cx;
    this.cy = cy;
    this.angle = Math.random() * Math.PI * 2;
    const speed = DOT_BURST_DIST / DOT_LIFETIME;
    this.vx = Math.cos(this.angle) * speed;
    this.vy = Math.sin(this.angle) * speed;
    this.elapsed = 0;
  }

  update(dt: number): void {
    this.elapsed += dt;
  }

  draw(ctx: CanvasRenderingContext2D): boolean {
    const t = this.elapsed / DOT_LIFETIME;
    if (t > 1) return false;
    const x = this.cx + this.vx * this.elapsed;
    const y = this.cy + this.vy * this.elapsed;
    const rad = DOT_RAD * (1 - 0.4 * t);
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return true;
  }
}

const SpaceBubblesAnimation: React.FC<AnimationProps> = ({ 
  width = Dimensions.get('window').width, 
  height = Dimensions.get('window').height,
  elements = [],
  onAnimationLoaded
}) => {
  const canvasRef = useRef<Canvas | null>(null);
  const tilt = useRef<{ x: number; y: number }>({ x: 0, y: -1 });
  const bubbles = useRef<Bubble[]>([]);
  const dots = useRef<Dot[]>([]);
  const W = width;
  const H = height;

  /**
   * Initialize bubbles
   */
  const init = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < INITIAL_BUBBLE_COUNT; i++) {
      bubbles.current.push(new Bubble(null, null, null, 0, 0, W, H));
    }
    loop(ctx);
  };

  /**
   * Main animation loop
   */
  const loop = (ctx: CanvasRenderingContext2D): void => {
    let last = Date.now();
    const frame = (): void => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      bubbles.current.forEach((b) => {
        b.update(dt, tilt.current, W, H);
        b.draw(ctx);
      });
      for (let i = dots.current.length - 1; i >= 0; i--) {
        if (!dots.current[i].draw(ctx)) dots.current.splice(i, 1);
        else dots.current[i].update(dt);
      }
      ctx.commit && ctx.commit(); // for react-native-canvas
      requestAnimationFrame(frame);
    };
    frame();
  };

  /**
   * Handle touch: split or dot burst
   */
  const handleTouch = (e: GestureResponderEvent): void => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    // check bubble hit
    for (let i = bubbles.current.length - 1; i >= 0; i--) {
      if (bubbles.current[i].contains(x, y)) {
        const parent = bubbles.current.splice(i, 1)[0];
        const count =
          Math.floor(Math.random() * (CHILD_COUNT_MAX - CHILD_COUNT_MIN + 1)) +
          CHILD_COUNT_MIN;
        const parentArea = Math.PI * parent.r * parent.r;
        const weights = Array.from({ length: count }, () => Math.random());
        const sumW = weights.reduce((a, b) => a + b, 0);
        for (let j = 0; j < count; j++) {
          const area = (weights[j] / sumW) * parentArea;
          const r = Math.sqrt(area / Math.PI);
          const angle = Math.random() * Math.PI * 2;
          const vx = Math.cos(angle) * BURST_SPEED;
          const vy = Math.sin(angle) * BURST_SPEED;
          bubbles.current.push(new Bubble(x, y, r, vx, vy, W, H));
        }
        return;
      }
    }
    // otherwise dot burst
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.current.push(new Dot(x, y));
    }
  };

  /**
   * Get device orientation for tilt
   */
  useEffect(() => {
    let subscription: { remove: () => void } | undefined;
    if (Platform.OS === 'web') return;
    
    // Use the imported Accelerometer
    Accelerometer.setUpdateInterval(16);
    subscription = Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
      const pitch = Math.atan2(x, Math.hypot(y, z));
      const roll = Math.atan2(y, Math.hypot(x, z));
      const pd = (pitch * 180) / Math.PI;
      const rd = (roll * 180) / Math.PI;
      if (Math.abs(pd) < 10 && Math.abs(rd) < 10) {
        tilt.current = { x: 0, y: -1 };
      } else {
        const dx = Math.sin(roll);
        const maxH = MAX_HOR_SPEED / BUBBLE_SPEED;
        tilt.current = {
          x: Math.max(Math.min(dx, maxH), -maxH),
          y: -Math.sin(pitch),
        };
      }
    });
    
    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    // Notify parent when animation is loaded
    onAnimationLoaded && onAnimationLoaded();
  }, [onAnimationLoaded]);

  return (
    <View style={styles.container}>
      <Canvas
        ref={canvasRef}
        style={styles.canvas}
        onTouchStart={handleTouch}
        onContext2D={(ctx: CanvasRenderingContext2D) => init(ctx)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  canvas: { flex: 1 },
});

export default SpaceBubblesAnimation;
