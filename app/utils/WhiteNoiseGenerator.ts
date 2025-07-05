import { Audio } from 'expo-av';

// Add type definitions for Web Audio API that might be missing in React Native environment
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

/**
 * A utility class for generating and playing white noise programmatically
 * instead of using pre-recorded audio files.
 */
class WhiteNoiseGenerator {
  private audioContext: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5; // Reduced default volume

  /**
   * Initialize the Web Audio API context
   */
  public async initialize(): Promise<boolean> {
    try {
      // Request audio focus using Expo Audio API
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Safely check if Web Audio API is available
      try {
        if (typeof window !== 'undefined') {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
          } else {
            console.warn('AudioContext not available in this environment');
            return true; // Return true but without audio context - we'll handle this gracefully
          }
        } else {
          console.warn('Window object not available in this environment');
          return true; // Return true but without audio context - we'll handle this gracefully
        }
      } catch (audioError) {
        console.warn('Error initializing AudioContext:', audioError);
        return true; // Return true but without audio context - we'll handle this gracefully
      }
      
      // Only create audio nodes if audioContext is available
      if (this.audioContext) {
        // Create filter node for smoother sound
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 2000; // Cut off higher frequencies
        this.filterNode.Q.value = 0.5; // Gentle slope
        
        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0; // Start with volume at 0
        
        // Connect filter to gain node
        this.filterNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize WhiteNoiseGenerator:', error);
      return false;
    }
  }

  /**
   * Generate and start playing white noise with fade-in
   */
  public async play(): Promise<void> {
    if (!this.audioContext) {
      const initialized = await this.initialize();
      if (!initialized || !this.audioContext) {
        console.warn('Could not initialize audio context, skipping audio playback');
        return;
      }
    }

    try {
      if (this.isPlaying) {
        return; // Already playing
      }

      // Safety check again
      if (!this.audioContext || !this.filterNode || !this.gainNode) {
        console.warn('Audio context or nodes not available, skipping audio playback');
        return;
      }

      // Create buffer for white noise
      const bufferSize = this.audioContext.sampleRate * 5; // 5 seconds of noise
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate smoother pink-ish noise (less harsh than pure white noise)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < data.length; i++) {
        // Generate white noise
        const white = Math.random() * 0.5 - 0.25; // Reduced amplitude
        
        // Apply pink noise filtering (smoother, less harsh)
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        
        // Mix the filtered noise
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        
        // Ensure we stay in the -1 to 1 range
        if (data[i] > 0.8) data[i] = 0.8;
        if (data[i] < -0.8) data[i] = -0.8;
      }

      // Create source node
      this.noiseNode = this.audioContext.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;
      
      // Connect to filter for smoother sound
      if (this.filterNode) {
        this.noiseNode.connect(this.filterNode);
      } else {
        // Fallback if filter node isn't available
        this.noiseNode.connect(this.gainNode!);
      }
      
      // Start playing
      this.noiseNode.start();
      this.isPlaying = true;

      // Fade in
      await this.fadeIn();
    } catch (error) {
      console.error('Error playing white noise:', error);
    }
  }

  /**
   * Stop playing white noise with fade-out
   */
  public async stop(): Promise<void> {
    if (!this.isPlaying || !this.noiseNode || !this.gainNode) {
      return;
    }

    try {
      // Fade out
      await this.fadeOut();
      
      // Stop and disconnect
      this.noiseNode.stop();
      this.noiseNode.disconnect();
      this.noiseNode = null;
      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping white noise:', error);
    }
  }

  /**
   * Fade in the volume gradually to avoid clicks
   */
  private async fadeIn(): Promise<void> {
    if (!this.gainNode || !this.audioContext) return;
    
    const steps = 20;
    const fadeTime = 1000; // 1 second fade
    const stepTime = fadeTime / steps;
    
    for (let i = 0; i <= steps; i++) {
      const gain = (i / steps) * this.volume;
      this.gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
  }

  /**
   * Fade out the volume gradually to avoid clicks
   */
  private async fadeOut(): Promise<void> {
    if (!this.gainNode || !this.audioContext) return;
    
    const steps = 20;
    const fadeTime = 1000; // 1 second fade
    const stepTime = fadeTime / steps;
    
    for (let i = steps; i >= 0; i--) {
      const gain = (i / steps) * this.volume;
      this.gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
  }

  /**
   * Set the volume level (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.isPlaying) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    await this.stop();
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    
    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
      this.audioContext = null;
    }
  }
}

export default new WhiteNoiseGenerator();
