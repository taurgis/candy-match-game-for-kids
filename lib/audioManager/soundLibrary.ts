// Sound effects library - manages individual sound playback

import type { SoundType, SoundConfig } from './types';
import type { AudioEffects } from './effects';

export class SoundLibrary {
  private audioContext: AudioContext;
  private effects: AudioEffects;
  private activeSounds: Set<number> = new Set();
  private soundCounter = 0;
  
  constructor(audioContext: AudioContext, effects: AudioEffects) {
    this.audioContext = audioContext;
    this.effects = effects;
  }
  
  play(soundType: SoundType): void {
    const config = this.getSoundConfig(soundType);
    if (!config) return;
    
    this.playMultiNote(config);
  }
  
  private getSoundConfig(soundType: SoundType): SoundConfig | null {
    switch (soundType) {
      case 'click':
        return {
          frequencies: [800, 1600, 2400],
          durations: [0.08, 0.04, 0.02],
          delays: [0, 0.01, 0.02],
          volumes: [0.12, 0.08, 0.04],
          types: ['triangle', 'sine', 'sine']
        };
        
      case 'swapSuccess':
        return {
          frequencies: [523.25, 659.25, 783.99], // C5, E5, G5
          durations: [0.15, 0.12, 0.1],
          delays: [0, 0.03, 0.06],
          volumes: [0.15, 0.12, 0.1],
          types: ['triangle', 'sine', 'sawtooth']
        };
        
      case 'swapFail':
        return {
          frequencies: [293.66, 246.94], // D4, B3
          durations: [0.2, 0.25],
          delays: [0, 0.1],
          volumes: [0.15, 0.12],
          types: ['triangle', 'sine']
        };
        
      case 'match':
        return {
          frequencies: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
          durations: [0.15, 0.12, 0.1, 0.08],
          delays: [0, 0.02, 0.04, 0.06],
          volumes: [0.18, 0.15, 0.12, 0.1],
          types: ['triangle', 'sine', 'sawtooth', 'sine']
        };
        
      case 'chain':
        return {
          frequencies: [659.25, 783.99, 987.77, 1318.51], // E5, G5, B5, E6
          durations: [0.1, 0.08, 0.06, 0.05],
          delays: [0, 0.02, 0.04, 0.06],
          volumes: [0.16, 0.14, 0.12, 0.1],
          types: ['triangle', 'sine', 'sawtooth', 'sine']
        };
        
      case 'specialActivation':
        return {
          frequencies: [261.63, 523.25, 659.25, 783.99, 1046.50], // C4, C5, E5, G5, C6
          durations: [0.2, 0.18, 0.15, 0.12, 0.1],
          delays: [0, 0.05, 0.1, 0.15, 0.2],
          volumes: [0.2, 0.18, 0.16, 0.14, 0.12],
          types: ['sawtooth', 'triangle', 'sine', 'sawtooth', 'sine']
        };
        
      case 'combo':
        return {
          frequencies: [440, 554.37, 659.25, 880, 1108.73], // A4, C#5, E5, A5, C#6
          durations: [0.15, 0.12, 0.1, 0.08, 0.06],
          delays: [0, 0.02, 0.04, 0.06, 0.08],
          volumes: [0.18, 0.16, 0.14, 0.12, 0.1],
          types: ['sawtooth', 'triangle', 'sine', 'sawtooth', 'sine']
        };
        
      case 'levelUp':
        return {
          frequencies: [261.63, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1975.53], // Fanfare
          durations: [0.3, 0.25, 0.2, 0.18, 0.15, 0.12, 0.1],
          delays: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
          volumes: [0.25, 0.22, 0.2, 0.18, 0.16, 0.14, 0.12],
          types: ['sawtooth', 'triangle', 'sine', 'sawtooth', 'triangle', 'sine', 'sine']
        };
        
      case 'gameOver':
        return {
          frequencies: [523.25, 493.88, 440.00, 392.00, 349.23], // Descending
          durations: [0.4, 0.35, 0.3, 0.25, 0.2],
          delays: [0, 0.1, 0.2, 0.3, 0.4],
          volumes: [0.18, 0.16, 0.14, 0.12, 0.1],
          types: ['triangle', 'sine', 'sawtooth', 'triangle', 'sine']
        };
        
      default:
        return null;
    }
  }
  
  private playMultiNote(config: SoundConfig): void {
    const soundId = ++this.soundCounter;
    this.activeSounds.add(soundId);
    
    const { input: effectsChain, cleanup: effectsCleanup } = this.effects.createSoundChain(
      this.audioContext.destination
    );
    
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    
    // Create all notes
    config.frequencies.forEach((freq, index) => {
      if (index >= config.durations.length) return;
      
      const oscillator = this.createOscillator(
        freq,
        config.types[index] || 'sine',
        config.delays[index] || 0,
        config.durations[index],
        config.volumes[index] || 0.1,
        effectsChain
      );
      
      if (oscillator) {
        oscillators.push(oscillator.osc);
        gains.push(oscillator.gain);
      }
    });
    
    // Schedule cleanup after the longest note finishes
    const maxDuration = Math.max(...config.durations.map((dur, i) => dur + (config.delays[i] || 0)));
    
    setTimeout(() => {
      oscillators.forEach(osc => {
        try {
          if (osc.context.state !== 'closed') {
            osc.stop();
          }
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      
      gains.forEach(gain => {
        try {
          gain.disconnect();
        } catch (e) {
          // Node might already be disconnected
        }
      });
      
      effectsCleanup();
      this.activeSounds.delete(soundId);
    }, (maxDuration + 0.1) * 1000);
  }
  
  private createOscillator(
    frequency: number,
    type: OscillatorType,
    delay: number,
    duration: number,
    volume: number,
    destination: AudioNode
  ): { osc: OscillatorNode; gain: GainNode } | null {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + delay);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + delay);
      this.effects.applyEnvelope(gainNode, duration, delay, 'sound');
      
      oscillator.connect(gainNode);
      gainNode.connect(destination);
      
      const startTime = this.audioContext.currentTime + delay;
      const stopTime = startTime + duration;
      
      oscillator.start(startTime);
      oscillator.stop(stopTime);
      
      return { osc: oscillator, gain: gainNode };
    } catch (error) {
      console.error('Failed to create oscillator:', error);
      return null;
    }
  }
  
  // Get number of currently active sounds (for debugging)
  get activeSoundCount(): number {
    return this.activeSounds.size;
  }
}
