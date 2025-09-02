// Music player - handles background music playback with memory management

import type { Note } from './types';
import type { AudioEffects } from './effects';
import { melodies, getMelodyCount } from './musicData';

export class MusicPlayer {
  private audioContext: AudioContext;
  private effects: AudioEffects;
  private musicGainNode: GainNode | null = null;
  
  // Playback state
  private playing = false;
  private isMuted = false;
  private sequenceTimeout: number | null = null;
  
  // Current position in music
  private currentMelodyIndex = -1;
  private currentNoteIndex = 0;
  
  // Active audio nodes for cleanup
  private activeOscillators: Set<OscillatorNode> = new Set();
  private activeGains: Set<GainNode> = new Set();
  private effectsCleanup: (() => void) | null = null;
  
  constructor(audioContext: AudioContext, effects: AudioEffects) {
    this.audioContext = audioContext;
    this.effects = effects;
    this.initializeMusicGain();
  }
  
  private initializeMusicGain(): void {
    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    
    // Create effects chain for music
    const { input: effectsInput, cleanup } = this.effects.createMusicChain(this.audioContext.destination);
    this.musicGainNode.connect(effectsInput);
    this.effectsCleanup = cleanup;
  }
  
  start(): void {
    if (this.playing || this.isMuted) return;
    
    this.playing = true;
    this.currentNoteIndex = 0;
    this.currentMelodyIndex = Math.floor(Math.random() * getMelodyCount());
    
    this.playSequence();
  }
  
  stop(): void {
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
    
    this.playing = false;
    this.cleanupActiveNodes();
  }
  
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.stop();
      if (this.musicGainNode) {
        this.musicGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
      }
    } else {
      if (this.musicGainNode) {
        this.musicGainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.2);
      }
    }
  }
  
  get isPlaying(): boolean {
    return this.playing;
  }
  
  private playSequence(): void {
    if (!this.playing || this.isMuted || !this.musicGainNode) return;
    
    const currentMelody = melodies[this.currentMelodyIndex];
    const note = currentMelody[this.currentNoteIndex];
    
    if (note.freq) {
      this.playMusicNote(note);
    }
    
    this.currentNoteIndex++;
    let nextNoteDelay = note.duration * 1000;
    
    // Check if melody has ended
    if (this.currentNoteIndex >= currentMelody.length) {
      this.currentNoteIndex = 0;
      this.selectNextMelody();
      nextNoteDelay += 2000; // Pause between melodies
    }
    
    this.sequenceTimeout = window.setTimeout(() => this.playSequence(), nextNoteDelay);
  }
  
  private selectNextMelody(): void {
    let nextMelodyIndex;
    do {
      nextMelodyIndex = Math.floor(Math.random() * getMelodyCount());
    } while (getMelodyCount() > 1 && nextMelodyIndex === this.currentMelodyIndex);
    
    this.currentMelodyIndex = nextMelodyIndex;
  }
  
  private playMusicNote(note: Note): void {
    if (!note.freq || !this.musicGainNode) return;
    
    // Create rich layered instrumentation
    const layers = [
      { freq: note.freq / 4, duration: note.duration * 0.9, volume: 0.1, type: 'triangle' as OscillatorType }, // Bass
      { freq: note.freq / 2.67, duration: note.duration * 0.8, volume: 0.08, type: 'sawtooth' as OscillatorType }, // Sub bass
      { freq: note.freq, duration: note.duration, volume: 0.15, type: 'triangle' as OscillatorType }, // Main melody
    ];
    
    // Add conditional harmony layers
    if (this.currentNoteIndex % 2 === 0) {
      layers.push({ freq: note.freq * 1.25, duration: note.duration * 0.7, volume: 0.06, type: 'sine' as OscillatorType });
    }
    
    if (this.currentNoteIndex % 3 === 0) {
      layers.push({ freq: note.freq * 2.8, duration: note.duration * 0.4, volume: 0.04, type: 'sine' as OscillatorType });
    }
    
    if (this.currentNoteIndex % 4 === 1) {
      layers.push({ freq: note.freq * 2, duration: note.duration * 0.3, volume: 0.03, type: 'triangle' as OscillatorType });
    }
    
    // Play all layers
    layers.forEach(layer => {
      this.createMusicOscillator(layer.freq, layer.duration, layer.volume, layer.type);
    });
  }
  
  private createMusicOscillator(
    frequency: number, 
    duration: number, 
    volume: number, 
    type: OscillatorType
  ): void {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      this.effects.applyEnvelope(gainNode, duration, 0, 'music');
      
      oscillator.connect(gainNode);
      gainNode.connect(this.musicGainNode!);
      
      // Track for cleanup
      this.activeOscillators.add(oscillator);
      this.activeGains.add(gainNode);
      
      const startTime = this.audioContext.currentTime;
      const stopTime = startTime + duration;
      
      oscillator.start(startTime);
      oscillator.stop(stopTime);
      
      // Schedule cleanup
      setTimeout(() => {
        this.activeOscillators.delete(oscillator);
        this.activeGains.delete(gainNode);
        
        try {
          gainNode.disconnect();
        } catch (e) {
          // Node might already be disconnected
        }
      }, (duration + 0.1) * 1000);
      
    } catch (error) {
      console.error('Failed to create music oscillator:', error);
    }
  }
  
  private cleanupActiveNodes(): void {
    // Stop all active oscillators
    this.activeOscillators.forEach(osc => {
      try {
        if (osc.context.state !== 'closed') {
          osc.stop();
        }
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    
    // Disconnect all active gains
    this.activeGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Node might already be disconnected
      }
    });
    
    this.activeOscillators.clear();
    this.activeGains.clear();
  }
  
  // Get debug info
  get debugInfo() {
    return {
      isPlaying: this.playing,
      isMuted: this.isMuted,
      currentMelody: this.currentMelodyIndex,
      currentNote: this.currentNoteIndex,
      activeOscillators: this.activeOscillators.size,
      activeGains: this.activeGains.size
    };
  }
}
