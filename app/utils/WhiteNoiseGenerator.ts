import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

const FADE_DURATION = 2000; // 2 seconds for crossfade

class WhiteNoiseGenerator {
  private static instance: WhiteNoiseGenerator;
  private sound1: Audio.Sound | null = null;
  private sound2: Audio.Sound | null = null;
  private activeSound: 'sound1' | 'sound2' = 'sound1';
  private isPlaying: boolean = false;
  private isInitialized: boolean = false;
  private volume: number = 1.0;
  private playbackInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): WhiteNoiseGenerator {
    if (!WhiteNoiseGenerator.instance) {
      WhiteNoiseGenerator.instance = new WhiteNoiseGenerator();
    }
    return WhiteNoiseGenerator.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
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

  private async createSoundInstance(): Promise<Audio.Sound | null> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/white-noise.mp3'),
        { shouldPlay: false, isLooping: false } // Looping is handled manually
      );
      return sound;
    } catch (error) {
      console.error('Failed to create sound instance:', error);
      return null;
    }
  }

  public async loadSound(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.sound1) {
      this.sound1 = await this.createSoundInstance();
    }
    if (!this.sound2) {
      this.sound2 = await this.createSoundInstance();
    }
    return !!(this.sound1 && this.sound2);
  }

  public async play(): Promise<boolean> {
    if (!(await this.loadSound())) return false;

    if (!this.isPlaying) {
      this.isPlaying = true;
      const sound = this.activeSound === 'sound1' ? this.sound1 : this.sound2;
      await sound!.setVolumeAsync(this.volume);
      await sound!.playAsync();
      this.monitorPlayback();
    }
    return true;
  }

  public async stop(): Promise<boolean> {
    if (!this.isPlaying) return true;
    this.isPlaying = false;
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    await this.sound1?.stopAsync();
    await this.sound2?.stopAsync();
    return true;
  }

  private monitorPlayback() {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
    }

    this.playbackInterval = setInterval(async () => {
      if (!this.isPlaying) return;

      const currentSound = this.activeSound === 'sound1' ? this.sound1 : this.sound2;
      const status = await currentSound?.getStatusAsync();

      if (status?.isLoaded && status.isPlaying) {
        const duration = status.durationMillis ?? 0;
        const position = status.positionMillis;

        if (duration - position < FADE_DURATION) {
          this.crossfade();
        }
      }
    }, 1000);
  }

  private async crossfade() {
    const inactiveSound = this.activeSound === 'sound1' ? this.sound2 : this.sound1;
    const activeSound = this.activeSound === 'sound1' ? this.sound1 : this.sound2;

    // Switch active sound
    this.activeSound = this.activeSound === 'sound1' ? 'sound2' : 'sound1';

    await inactiveSound!.setPositionAsync(0);
    await inactiveSound!.setVolumeAsync(0);
    await inactiveSound!.playAsync();

    // Fade in the new sound
    this.fade(inactiveSound!, this.volume);
    // Fade out the old sound
    this.fade(activeSound!, 0, async () => {
      await activeSound!.stopAsync();
    });
  }

  private async fade(sound: Audio.Sound, toVolume: number, onComplete?: () => void) {
    const fromVolume = (await sound.getStatusAsync() as any)?.volume ?? 0;
    const steps = 20;
    const stepDuration = FADE_DURATION / steps;

    for (let i = 0; i < steps; i++) {
      const newVolume = fromVolume + (toVolume - fromVolume) * (i / steps);
      await sound.setVolumeAsync(newVolume);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
    await sound.setVolumeAsync(toVolume);
    onComplete?.();
  }

  public async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.isPlaying) {
      const sound = this.activeSound === 'sound1' ? this.sound1 : this.sound2;
      await sound!.setVolumeAsync(this.volume);
    }
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public async cleanup(): Promise<void> {
    this.stop();
    await this.sound1?.unloadAsync();
    await this.sound2?.unloadAsync();
    this.sound1 = null;
    this.sound2 = null;
    this.isInitialized = false;
  }
}

export default WhiteNoiseGenerator.getInstance();
