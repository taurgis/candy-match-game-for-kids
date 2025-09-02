// Main audio manager - orchestrates all audio functionality
import { AudioEffects } from './audioManager/effects';
import { MusicPlayer } from './audioManager/musicPlayer';
import { SoundLibrary } from './audioManager/soundLibrary';
import type { SoundType } from './audioManager/types';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private musicMuted = false;
  private soundsMuted = false;
  private musicShouldBePlaying = false; // Track if music should be playing when unmuted
  
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
    if (!this.isInitialized || this.soundsMuted || !this.soundLibrary) return;
    
    this.soundLibrary.play(sound);
  }
  
  // Start background music
  startMusic(): void {
    console.log('🎵 AudioManager.startMusic() called');
    if (!this.isInitialized || !this.musicPlayer) return;
    
    this.musicShouldBePlaying = true;
    console.log('   - Set musicShouldBePlaying = true');
    
    if (!this.musicMuted) {
      console.log('   - Music not muted, starting player...');
      this.musicPlayer.start();
    } else {
      console.log('   - Music is muted, not starting player');
    }
  }
  
  // Stop background music
  stopMusic(): void {
    if (!this.musicPlayer) return;
    
    this.musicShouldBePlaying = false;
    this.musicPlayer.stop();
  }
  
  // Set mute state
  setMuted(muted: boolean): void {
    // Legacy method - mutes both music and sounds for backward compatibility
    this.setMusicMuted(muted);
    this.setSoundsMuted(muted);
  }
  
  // Set music mute state
  setMusicMuted(muted: boolean): void {
    console.log('🎵 AudioManager.setMusicMuted() called with:', muted);
    console.log('   - Current musicMuted state:', this.musicMuted);
    console.log('   - Current musicShouldBePlaying:', this.musicShouldBePlaying);
    console.log('   - Current isMusicPlaying:', this.isMusicPlaying);
    
    // Don't do anything if the mute state isn't actually changing
    if (this.musicMuted === muted) {
      console.log('   - Mute state unchanged, returning early');
      return;
    }
    
    this.musicMuted = muted;
    
    // Update music player mute state FIRST
    if (this.musicPlayer) {
      console.log('   - Setting music player muted state to:', muted);
      this.musicPlayer.setMuted(muted);
    }
    
    if (muted) {
      console.log('   - Muting: stopping music player...');
      // Stop music but don't change musicShouldBePlaying state
      if (this.musicPlayer) {
        this.musicPlayer.stop();
      }
    } else {
      console.log('   - Unmuting: checking if should start...');
      // When unmuting, start music if it should be playing AND is not already playing
      if (this.musicShouldBePlaying && this.musicPlayer && !this.isMusicPlaying) {
        console.log('   - Starting music player...');
        this.musicPlayer.start();
      } else if (this.isMusicPlaying) {
        console.log('   - Music already playing, not starting again');
      }
    }
  }
  
  // Set sound effects mute state
  setSoundsMuted(muted: boolean): void {
    console.log('🔊 AudioManager.setSoundsMuted() called with:', muted);
    this.soundsMuted = muted;
  }
  
  // Check if audio is available and initialized
  get isReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }
  
  // Check if music is currently playing
  get isMusicPlaying(): boolean {
    return this.musicPlayer?.isPlaying ?? false;
  }
  
  // Check if music should be playing (even if muted)
  get shouldMusicBePlaying(): boolean {
    return this.musicShouldBePlaying;
  }
  
  // Check mute states
  get isMusicMuted(): boolean {
    return this.musicMuted;
  }
  
  get isSoundsMuted(): boolean {
    return this.soundsMuted;
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
export const setMusicMuted = (muted: boolean) => audioManager.setMusicMuted(muted);
export const setSoundsMuted = (muted: boolean) => audioManager.setSoundsMuted(muted);
export const setMuted = (muted: boolean) => audioManager.setMuted(muted); // Legacy support
export const isMusicMuted = () => audioManager.isMusicMuted;
export const isSoundsMuted = () => audioManager.isSoundsMuted;

// Export for testing
export { AudioManager };
