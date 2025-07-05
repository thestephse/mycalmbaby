import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * WhiteNoiseGenerator: A utility class for programmatically generating and playing white noise
 * using pink noise filtering for a more pleasant sound.
 */
class WhiteNoiseGenerator {
  private static instance: WhiteNoiseGenerator;
  private sound: Audio.Sound | null = null;
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private currentVolume: number = 0.5;
  private targetVolume: number = 0.5;
  private fadeSteps: number = 20;
  private fadeStepDuration: number = 50; // milliseconds

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Initialize the audio system
   */
  public async initialize(): Promise<boolean> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): WhiteNoiseGenerator {
    if (!WhiteNoiseGenerator.instance) {
      WhiteNoiseGenerator.instance = new WhiteNoiseGenerator();
    }
    return WhiteNoiseGenerator.instance;
  }

  /**
   * Generate white noise buffer with pink noise filtering
   */
  private generateWhiteNoiseBuffer(sampleRate: number = 44100, duration: number = 2): ArrayBuffer {
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2); // WAV header + 16-bit samples
    const view = new DataView(buffer);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Pink noise generation using Paul Kellet's algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < numSamples; i++) {
      const white = Math.random() * 2 - 1;
      
      // Pink noise filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      
      // Convert to 16-bit integer and write to buffer
      const sample = Math.max(-1, Math.min(1, pink * 0.11)) * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }
    
    return buffer;
  }

  /**
   * Helper function to write strings to DataView
   */
  private writeString = (view: DataView, offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /**
   * Create white noise buffer and return as data URI
   */


  /**
   * Load and prepare the white noise sound
   */
  public async loadSound(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const buffer = this.generateWhiteNoiseBuffer();
      const uri = FileSystem.cacheDirectory + 'whitenoise.wav';

      // Use a library to convert ArrayBuffer to Base64
      const base64 = require('base64-js').fromByteArray(new Uint8Array(buffer));

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        // @ts-ignore
        { uri: uri },
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0,
        }
      );

      this.sound = sound;
      return true;
    } catch (error) {
      console.error('Failed to load white noise sound:', error);
      return false;
    }
  }

  /**
   * Start playing white noise with fade-in
   */
  public async play(volume: number = 0.5): Promise<boolean> {
    if (!this.sound) {
      const loaded = await this.loadSound();
      if (!loaded) return false;
    }

    try {
      this.targetVolume = Math.max(0, Math.min(1, volume));
      
      if (!this.isPlaying) {
        await this.sound!.playAsync();
        this.isPlaying = true;
      }
      
      this.fadeIn();
      return true;
    } catch (error) {
      console.error('Failed to play white noise:', error);
      return false;
    }
  }

  /**
   * Stop playing white noise with fade-out
   */
  public async stop(): Promise<boolean> {
    if (!this.sound || !this.isPlaying) {
      return true;
    }

    try {
      await this.fadeOut();
      await this.sound.pauseAsync();
      this.isPlaying = false;
      return true;
    } catch (error) {
      console.error('Failed to stop white noise:', error);
      return false;
    }
  }

  /**
   * Set volume with smooth transition
   */
  public async setVolume(volume: number): Promise<void> {
    if (!this.sound) return;

    this.targetVolume = Math.max(0, Math.min(1, volume));

    if (this.isPlaying) {
      this.fadeToVolume(this.targetVolume);
    }
  }

  /**
   * Fade in effect
   */
  private fadeIn(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    this.currentVolume = 0;
    const volumeStep = this.targetVolume / this.fadeSteps;

    this.fadeInterval = setInterval(async () => {
      this.currentVolume = Math.min(this.currentVolume + volumeStep, this.targetVolume);

      if (this.sound) {
        await this.sound.setVolumeAsync(this.currentVolume);
      }

      if (this.currentVolume >= this.targetVolume) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }
    }, this.fadeStepDuration);
  }

  /**
   * Fade out effect
   */
  private async fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      const volumeStep = this.currentVolume / this.fadeSteps;

      this.fadeInterval = setInterval(async () => {
        this.currentVolume = Math.max(this.currentVolume - volumeStep, 0);

        if (this.sound) {
          await this.sound.setVolumeAsync(this.currentVolume);
        }

        if (this.currentVolume <= 0) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          resolve();
        }
      }, this.fadeStepDuration);
    });
  }

  /**
   * Fade to specific volume
   */
  private fadeToVolume(targetVolume: number): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const volumeDiff = targetVolume - this.currentVolume;
    const volumeStep = volumeDiff / this.fadeSteps;

    this.fadeInterval = setInterval(async () => {
      this.currentVolume += volumeStep;

      if (this.sound) {
        await this.sound.setVolumeAsync(this.currentVolume);
      }

      if (Math.abs(this.currentVolume - targetVolume) < Math.abs(volumeStep)) {
        this.currentVolume = targetVolume;
        if (this.sound) {
          await this.sound.setVolumeAsync(this.currentVolume);
        }
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }
    }, this.fadeStepDuration);
  }

  /**
   * Check if currently playing
   */
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current volume
   */
  public getCurrentVolume(): number {
    return this.currentVolume;
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }

      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const uri = FileSystem.cacheDirectory + 'whitenoise.wav';
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }

      this.isPlaying = false;
      this.currentVolume = 0;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default WhiteNoiseGenerator.getInstance();
