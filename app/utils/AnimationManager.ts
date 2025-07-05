import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnimationConfig {
  id: string;
  name: string;
  description: string;
  thumbnail?: any;
  thumbnailPath?: string;
  folder: string;
  elements?: AnimationElement[];
  // Path to the animation code file (will be dynamically imported)
  animationCodePath?: string;
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

// Available animations that will be discovered dynamically
const ANIMATION_FOLDERS = [
  'basic-shapes',
  'nature-patterns',
  'space-journey',
  'space-bubbles',
  // Add more animation folders here as they are created
];

// Fallback animations in case dynamic loading fails
const FALLBACK_ANIMATIONS: AnimationConfig[] = [
  {
    id: 'basic-shapes',
    name: 'Basic Shapes',
    description: 'Simple geometric shapes with soothing animations',
    folder: 'basic-shapes',
    thumbnail: require('../animations/basic-shapes/thumbnail.png'),
  },
  {
    id: 'nature-patterns',
    name: 'Nature Patterns',
    description: 'Organic shapes inspired by nature',
    folder: 'nature-patterns',
    thumbnail: require('../animations/nature-patterns/thumbnail.png'),
  },
  {
    id: 'space-journey',
    name: 'Space Journey',
    description: 'Explore the cosmos with soothing space-themed animations',
    folder: 'space-journey',
    thumbnail: require('../animations/space-journey/thumbnail.png'),
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
      // Scan for animations in the file system
      await this.scanForAnimations();

      // Load selected animation from storage
      const savedAnimationId = await AsyncStorage.getItem('selectedAnimation');
      if (savedAnimationId) {
        this.selectedAnimationId = savedAnimationId;
      }
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

  // Scan the animations folder for animation configurations
  private async scanForAnimations(): Promise<void> {
    try {
      const loadedAnimations: AnimationConfig[] = [];

      // Load animations from each folder in ANIMATION_FOLDERS
      for (const folder of ANIMATION_FOLDERS) {
        try {
          let animationConfig: AnimationConfig | null = null;

          switch (folder) {
            case 'basic-shapes':
              animationConfig = require('../animations/basic-shapes/animation.json');
              if (animationConfig) animationConfig.thumbnail = require('../animations/basic-shapes/thumbnail.png');
              break;
            case 'nature-patterns':
              animationConfig = require('../animations/nature-patterns/animation.json');
              if (animationConfig) animationConfig.thumbnail = require('../animations/nature-patterns/thumbnail.png');
              break;
            case 'space-journey':
              animationConfig = require('../animations/space-journey/animation.json');
              if (animationConfig) animationConfig.thumbnail = require('../animations/space-journey/thumbnail.png');
              break;
            case 'space-bubbles':
              animationConfig = require('../animations/space-bubbles/animation.json');
              if (animationConfig) animationConfig.thumbnail = require('../animations/space-bubbles/thumbnail.png');
              break;
            default:
              console.log(`No animation found for folder: ${folder}`);
              continue;
          }

          if (animationConfig) {
            animationConfig.animationCodePath = `../animations/${folder}/animation`;
            loadedAnimations.push(animationConfig);
          }
        } catch (error) {
          console.error(`Error loading animation from folder ${folder}:`, error);
        }
      }

      if (loadedAnimations.length === 0) {
        console.warn('No animations loaded, using fallbacks');
        this.animations = [...FALLBACK_ANIMATIONS];
      } else {
        this.animations = loadedAnimations;
      }

      console.log(`Loaded ${this.animations.length} animations, selected: ${this.selectedAnimationId}`);
    } catch (error) {
      console.error('Error scanning for animations:', error);
      this.animations = [...FALLBACK_ANIMATIONS];
    }
  }
}

export default AnimationManager;
