import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnimationConfig {
  id: string;
  name: string;
  description: string;
  thumbnail?: any;
  folder: string;
  elements?: AnimationElement[];
}

export interface AnimationElement {
  type: 'circle' | 'square' | 'triangle' | 'custom';
  properties: {
    size: number;
    color: string;
    position?: { x: number; y: number };
    animations?: {
      rotate?: boolean;
      scale?: boolean;
      opacity?: boolean;
      translateX?: boolean;
      translateY?: boolean;
    };
    [key: string]: any;
  };
}

// Default animations that are bundled with the app
const DEFAULT_ANIMATIONS: AnimationConfig[] = [
  {
    id: 'basic-shapes',
    name: 'Basic Shapes',
    description: 'Simple geometric shapes with soothing animations',
    folder: 'basic-shapes',
    // Use an existing image from the project instead of empty thumbnail
    thumbnail: require('../../assets/images/icons/splash-icon-dark.png'),
    elements: [
      {
        type: 'circle',
        properties: {
          size: 120,
          color: '#3B82F6',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'circle',
        properties: {
          size: 80,
          color: '#10B981',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'square',
        properties: {
          size: 60,
          color: '#F59E0B',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'square',
        properties: {
          size: 40,
          color: '#EF4444',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
    ],
  },
  {
    id: 'nature-patterns',
    name: 'Nature Patterns',
    description: 'Organic shapes inspired by nature',
    folder: 'nature-patterns',
    // Use an existing image from the project instead of empty thumbnail
    thumbnail: require('../../assets/images/icons/splash-icon-light.png'),
    elements: [
      {
        type: 'circle',
        properties: {
          size: 100,
          color: '#047857',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'circle',
        properties: {
          size: 70,
          color: '#065F46',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'circle',
        properties: {
          size: 50,
          color: '#059669',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'square',
        properties: {
          size: 40,
          color: '#34D399',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
    ],
  },
  {
    id: 'space-journey',
    name: 'Space Journey',
    description: 'Cosmic-inspired animation patterns',
    folder: 'space-journey',
    // Use an existing image from the project instead of empty thumbnail
    thumbnail: require('../../assets/images/icons/ios-tinted.png'),
    elements: [
      {
        type: 'circle',
        properties: {
          size: 120,
          color: '#312E81',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'circle',
        properties: {
          size: 90,
          color: '#4F46E5',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'square',
        properties: {
          size: 60,
          color: '#6366F1',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
      {
        type: 'square',
        properties: {
          size: 30,
          color: '#A5B4FC',
          animations: {
            rotate: true,
            scale: true,
            opacity: true,
          },
        },
      },
    ],
  },
];

class AnimationManager {
  private animations: AnimationConfig[] = [];
  private selectedAnimationId: string = 'basic-shapes';
  private static instance: AnimationManager;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Load default animations
      this.animations = [...DEFAULT_ANIMATIONS];

      // Load selected animation from storage
      const savedAnimationId = await AsyncStorage.getItem('selectedAnimation');
      if (savedAnimationId) {
        this.selectedAnimationId = savedAnimationId;
      }

      // TODO: In a future version, scan for custom animations in the file system
      // await this.scanForCustomAnimations();
    } catch (error) {
      console.error('Failed to initialize AnimationManager:', error);
    }
  }

  public getAnimations(): AnimationConfig[] {
    return this.animations;
  }

  public getSelectedAnimation(): AnimationConfig | undefined {
    return this.animations.find(anim => anim.id === this.selectedAnimationId);
  }

  public async selectAnimation(animationId: string): Promise<void> {
    try {
      const animation = this.animations.find(anim => anim.id === animationId);
      if (animation) {
        this.selectedAnimationId = animationId;
        await AsyncStorage.setItem('selectedAnimation', animationId);
      }
    } catch (error) {
      console.error('Failed to select animation:', error);
    }
  }

  // This method would scan for custom animations in a future version
  private async scanForCustomAnimations(): Promise<void> {
    // This is a placeholder for future functionality
    // In a real implementation, this would scan a specific directory
    // for animation configuration files and load them dynamically
  }
}

export default AnimationManager;
