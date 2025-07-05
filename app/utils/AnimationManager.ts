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

/**
 * List of all available animation folders in the project
 * This serves both as the source of truth for animation discovery and as fallback
 */
const ANIMATION_FOLDERS = [
  'basic-shapes',
  'spiral-pinwheel',
  'space-journey',
  'bursting-bubbles',
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
    id: 'spiral-pinwheel',
    name: 'Spiral Pinwheel',
    description: 'Mesmerizing spiral patterns with primary colors',
    folder: 'spiral-pinwheel',
    thumbnail: require('../animations/spiral-pinwheel/thumbnail.png'),
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

  /**
   * Load animation configuration from a specific folder
   * @param folder The animation folder name
   * @returns The animation configuration object or null if not found
   */
  private loadAnimationConfig(folder: string): AnimationConfig | null {
    try {
      switch (folder) {
        case 'basic-shapes':
          return require('../animations/basic-shapes/animation.json');
        case 'spiral-pinwheel':
          return require('../animations/spiral-pinwheel/animation.json');
        case 'space-journey':
          return require('../animations/space-journey/animation.json');
        case 'bursting-bubbles':
          return require('../animations/bursting-bubbles/animation.json');
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error loading animation config for ${folder}:`, error);
      return null;
    }
  }

  /**
   * Load animation thumbnail from a specific folder
   * @param folder The animation folder name
   * @returns The thumbnail image or undefined if not found
   */
  private loadAnimationThumbnail(folder: string): any {
    try {
      switch (folder) {
        case 'basic-shapes':
          return require('../animations/basic-shapes/thumbnail.png');
        case 'spiral-pinwheel':
          return require('../animations/spiral-pinwheel/thumbnail.png');
        case 'space-journey':
          return require('../animations/space-journey/thumbnail.png');
        case 'bursting-bubbles':
          return require('../animations/bursting-bubbles/thumbnail.png');
        default:
          return undefined;
      }
    } catch (error) {
      console.error(`Error loading thumbnail for ${folder}:`, error);
      return undefined;
    }
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
    return this.animations.find((anim) => anim.id === this.selectedAnimationId);
  }

  public async selectAnimation(animationId: string): Promise<void> {
    try {
      const animation = this.animations.find((anim) => anim.id === animationId);
      if (animation) {
        this.selectedAnimationId = animationId;
        await AsyncStorage.setItem('selectedAnimation', animationId);
      }
    } catch (error) {
      console.error('Failed to select animation:', error);
    }
  }

  /**
   * Validate animation folders by checking for valid animation.json files
   * @returns Array of valid animation folder names
   */
  private async validateAnimationFolders(): Promise<string[]> {
    try {
      const validFolders: string[] = [];

      // Validate each folder by checking if it has a valid animation.json
      for (const folder of ANIMATION_FOLDERS) {
        try {
          // We need to use require here because dynamic imports aren't supported in this context
          // We can't use import() because it's asynchronous and would complicate the code
          const animationConfig = this.loadAnimationConfig(folder);
          if (animationConfig && animationConfig.id) {
            validFolders.push(folder);
          }
        } catch {
          // Intentionally empty catch block - we just want to skip invalid folders
          console.log(
            `Folder ${folder} does not contain a valid animation.json file`
          );
        }
      }

      console.log(
        `Found ${validFolders.length} valid animation folders:`,
        validFolders
      );
      return validFolders;
    } catch (error) {
      console.error('Error validating animation folders:', error);
      return [];
    }
  }

  /**
   * Scan for available animations and load their configurations
   */
  private async scanForAnimations(): Promise<void> {
    try {
      // Clear existing animations
      this.animations = [];

      // Get valid animation folders
      const validFolders = await this.validateAnimationFolders();

      if (validFolders.length === 0) {
        console.warn(
          'No valid animation folders found, using fallback animations'
        );
        this.animations = [...FALLBACK_ANIMATIONS];
        return;
      }

      // Load animation configurations from valid folders
      for (const folder of validFolders) {
        try {
          const config = this.loadAnimationConfig(folder);
          if (config) {
            // Load thumbnail
            const thumbnail = this.loadAnimationThumbnail(folder);

            // Create animation config object
            const animationConfig: AnimationConfig = {
              ...config,
              thumbnail,
            };

            this.animations.push(animationConfig);
            console.log(
              `Loaded animation: ${animationConfig.name} (${animationConfig.id})`
            );
          }
        } catch (error) {
          console.error(
            `Error loading animation from folder ${folder}:`,
            error
          );
        }
      }

      // If no animations were loaded, use fallback animations
      if (this.animations.length === 0) {
        console.warn(
          'Failed to load any animations, using fallback animations'
        );
        this.animations = [...FALLBACK_ANIMATIONS];
      }

      console.log(`Total animations loaded: ${this.animations.length}`);
    } catch (error) {
      console.error('Error scanning for animations:', error);
      // Use fallback animations in case of error
      this.animations = [...FALLBACK_ANIMATIONS];
    }
  }
}

export default AnimationManager;
