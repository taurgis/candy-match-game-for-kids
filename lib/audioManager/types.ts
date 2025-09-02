// Type definitions for the audio system

export type SoundType = 
  | 'swapSuccess' 
  | 'swapFail' 
  | 'match' 
  | 'specialActivation' 
  | 'levelUp' 
  | 'gameOver' 
  | 'click' 
  | 'combo' 
  | 'chain';

export interface Note {
  freq: number | null; // null for a rest
  duration: number; // in seconds
}

export interface SoundConfig {
  frequencies: number[];
  durations: number[];
  delays: number[];
  volumes: number[];
  types: OscillatorType[];
}

export interface AudioNode {
  connect(destination: AudioNode | AudioDestinationNode): AudioNode;
  disconnect(): void;
}

export interface CleanupFunction {
  (): void;
}
