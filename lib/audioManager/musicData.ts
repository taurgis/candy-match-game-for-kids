// Music data - contains all the melodies separated from the player logic

import type { Note } from './types';

// Note durations
const E = 0.2; // eighth note
const Q = 0.4; // quarter note  
const H = 0.8; // half note
const W = 1.6; // whole note

// Note frequencies
const G3 = 196.00, A3 = 220.00, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

// Happy Birthday variation - Super cheerful
const happyBirthdayMelody: Note[] = [
  { freq: C4, duration: Q }, { freq: C4, duration: E }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: H },
  { freq: C4, duration: Q }, { freq: C4, duration: E }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
  { freq: C4, duration: Q }, { freq: C4, duration: E }, { freq: C5, duration: Q }, { freq: A4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: D4, duration: H },
  { freq: A4, duration: Q }, { freq: A4, duration: E }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
];

// Bouncy Pop Melody - Kids TV show style
const bouncyPopMelody: Note[] = [
  { freq: E4, duration: E }, { freq: G4, duration: E }, { freq: C5, duration: Q }, { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: Q },
  { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: B4, duration: Q }, { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: Q },
  { freq: F4, duration: E }, { freq: A4, duration: E }, { freq: C5, duration: Q }, { freq: F5, duration: E }, { freq: E5, duration: E }, { freq: D5, duration: Q },
  { freq: C5, duration: E }, { freq: G4, duration: E }, { freq: E4, duration: Q }, { freq: C4, duration: H },
];

// Sunshine Waltz - 3/4 time, very uplifting
const sunshineWaltzMelody: Note[] = [
  { freq: C4, duration: Q }, { freq: E4, duration: Q }, { freq: G4, duration: Q }, { freq: C5, duration: Q }, { freq: G4, duration: Q }, { freq: E4, duration: Q },
  { freq: F4, duration: Q }, { freq: A4, duration: Q }, { freq: C5, duration: Q }, { freq: F5, duration: Q }, { freq: C5, duration: Q }, { freq: A4, duration: Q },
  { freq: G4, duration: Q }, { freq: B4, duration: Q }, { freq: D5, duration: Q }, { freq: G5, duration: Q }, { freq: D5, duration: Q }, { freq: B4, duration: Q },
  { freq: C5, duration: H }, { freq: E5, duration: Q }, { freq: C5, duration: H }, { freq: C4, duration: Q },
];

// Carnival Ride - Fast and exciting  
const carnivalRideMelody: Note[] = [
  { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: E }, { freq: E5, duration: E }, { freq: F5, duration: E }, { freq: G5, duration: E },
  { freq: G5, duration: Q }, { freq: E5, duration: Q }, { freq: C5, duration: Q }, { freq: G4, duration: Q },
  { freq: A4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: E }, { freq: E5, duration: E }, { freq: F5, duration: E }, { freq: G5, duration: E }, { freq: A5, duration: E },
  { freq: A5, duration: Q }, { freq: F5, duration: Q }, { freq: D5, duration: Q }, { freq: A4, duration: Q },
];

// Ice Cream Truck Melody - Classic happy tune
const iceCreamTruckMelody: Note[] = [
  { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q },
  { freq: E4, duration: Q }, { freq: C4, duration: Q }, { freq: E4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: H },
  { freq: C4, duration: Q }, { freq: null, duration: Q }, { freq: G3, duration: Q }, { freq: null, duration: Q }, { freq: E4, duration: Q },
  { freq: null, duration: Q }, { freq: A4, duration: Q }, { freq: null, duration: Q }, { freq: B4, duration: Q }, { freq: null, duration: E }, { freq: A4, duration: E }, { freq: A4, duration: Q },
];

export const melodies: Note[][] = [
  happyBirthdayMelody,
  bouncyPopMelody, 
  sunshineWaltzMelody,
  carnivalRideMelody,
  iceCreamTruckMelody
];

export const getMelodyCount = () => melodies.length;
