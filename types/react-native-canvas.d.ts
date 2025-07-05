declare module 'react-native-canvas' {
  import { Component } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  export interface CanvasProps {
    ref?: any;
    style?: StyleProp<ViewStyle>;
    onTouchStart?: (event: any) => void;
    onTouchMove?: (event: any) => void;
    onTouchEnd?: (event: any) => void;
    onContext2D?: (context: CanvasRenderingContext2D) => void;
  }

  export interface CanvasRenderingContext2D {
    fillStyle: string;
    font: string;
    globalAlpha: number;
    lineCap: string;
    lineJoin: string;
    lineWidth: number;
    strokeStyle: string;
    textAlign: string;
    textBaseline: string;
    
    arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) => void;
    beginPath: () => void;
    clearRect: (x: number, y: number, width: number, height: number) => void;
    closePath: () => void;
    fill: () => void;
    fillRect: (x: number, y: number, width: number, height: number) => void;
    fillText: (text: string, x: number, y: number, maxWidth?: number) => void;
    lineTo: (x: number, y: number) => void;
    measureText: (text: string) => { width: number };
    moveTo: (x: number, y: number) => void;
    rect: (x: number, y: number, width: number, height: number) => void;
    restore: () => void;
    rotate: (angle: number) => void;
    save: () => void;
    scale: (x: number, y: number) => void;
    setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    stroke: () => void;
    strokeRect: (x: number, y: number, width: number, height: number) => void;
    strokeText: (text: string, x: number, y: number, maxWidth?: number) => void;
    translate: (x: number, y: number) => void;
    
    // Additional methods for react-native-canvas
    commit?: () => void;
  }

  export default class Canvas extends Component<CanvasProps> {}
}
