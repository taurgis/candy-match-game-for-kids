// Main audio manager - orchestrates all audio functionality
import { AudioEffects } from './effects';
import { MusicPlayer } from './musicPlayer';
import { SoundLibrary } from './soundLibrary';
import type { SoundType } from './types';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;
  
  private effects: AudioEffects | null = null;
  private musicPlayer: MusicPlayer | null = null;
  private soundLibrary: SoundLibrary | null = null;
  
  // Singleton pattern for audio manager
  private static instance: AudioManager | null = null;
  
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  private constructor() {
    // Private constructor for singleton
  }
  
  // Initialize audio context - must be called from user gesture
  init(): boolean {
    if (this.isInitialized || typeof window === 'undefined') return this.isInitialized;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Initialize all audio modules
      this.effects = new AudioEffects(this.audioContext);
      this.musicPlayer = new MusicPlayer(this.audioContext, this.effects);
      this.soundLibrary = new SoundLibrary(this.audioContext, this.effects);
      
      this.isInitialized = true;
      console.log('Audio Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Audio Manager:', error);
      return false;
    }
  }
  
  // Play a sound effect
  playSound(sound: SoundType): void {
    if (!this.isInitialized || this.isMuted || !this.soundLibrary) return;
    
    this.soundLibrary.play(sound);
  }
  
  // Start background music
  startMusic(): void {
    if (!this.isInitialized || this.isMuted || !this.musicPlayer) return;
    
    this.musicPlayer.start();
  }
  
  // Stop background music
  stopMusic(): void {
    if (!this.musicPlayer) return;
    
    this.musicPlayer.stop();
  }
  
  // Set mute state
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.stopMusic();
    }
    
    // Update music player mute state
    if (this.musicPlayer) {
      this.musicPlayer.setMuted(muted);
    }
  }
  
  // Check if audio is available and initialized
  get isReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }
  
  // Check if music is currently playing
  get isMusicPlaying(): boolean {
    return this.musicPlayer?.isPlaying ?? false;
  }
  
  // Cleanup resources (useful for testing or app teardown)
  cleanup(): void {
    this.stopMusic();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.effects = null;
    this.musicPlayer = null;
    this.soundLibrary = null;
    this.isInitialized = false;
  }
}

// Export singleton instance methods
const audioManager = AudioManager.getInstance();

export const initAudio = () => audioManager.init();
export const playSound = (sound: SoundType) => audioManager.playSound(sound);
export const startMusic = () => audioManager.startMusic();
export const stopMusic = () => audioManager.stopMusic();
export const setMusicMuted = (muted: boolean) => audioManager.setMuted(muted);

// Export for testing
export { AudioManager };
