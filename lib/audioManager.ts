let audioContext: AudioContext | null = null;
let isAudioInitialized = false;

// --- Music State ---
let musicGainNode: GainNode | null = null;
let isMusicPlaying = false;
let musicSequenceTimeout: number | null = null;
let currentMelodyIndex = -1;
let currentNoteIndex = 0;

interface Note {
  freq: number | null; // null for a rest
  duration: number; // in seconds
}

// Note Frequencies
const G3 = 196.00;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00;
const C5 = 523.25;

const E = 0.2; // eighth note duration
const Q = 0.4; // quarter note duration
const H = 0.8; // half note duration

// A collection of simple, recognizable nursery rhymes
const melodies: Note[][] = [
    // Twinkle, Twinkle, Little Star
    [
        { freq: C4, duration: Q }, { freq: C4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: Q },
        { freq: A4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: H },
        { freq: F4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q },
        { freq: D4, duration: Q }, { freq: D4, duration: Q }, { freq: C4, duration: H },
        { freq: C4, duration: Q }, { freq: C4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: Q },
        { freq: A4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: H },
        { freq: F4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q },
        { freq: D4, duration: Q }, { freq: D4, duration: Q }, { freq: C4, duration: H },
    ],
    // Row, Row, Row Your Boat
    [
        { freq: C4, duration: Q }, { freq: C4, duration: Q }, { freq: C4, duration: Q * 0.75 }, { freq: D4, duration: Q * 0.25 }, { freq: E4, duration: Q },
        { freq: E4, duration: Q * 0.75 }, { freq: D4, duration: Q * 0.25 }, { freq: E4, duration: Q * 0.75 }, { freq: F4, duration: Q * 0.25 }, { freq: G4, duration: H },
        { freq: C5, duration: Q/2 }, { freq: C5, duration: Q/2 }, { freq: C5, duration: Q/2 }, { freq: G4, duration: Q/2 }, { freq: G4, duration: Q/2 }, { freq: G4, duration: Q/2 },
        { freq: E4, duration: Q/2 }, { freq: E4, duration: Q/2 }, { freq: E4, duration: Q/2 }, { freq: C4, duration: Q/2 }, { freq: C4, duration: Q/2 }, { freq: C4, duration: Q/2 },
        { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: D4, duration: Q }, { freq: C4, duration: H },
    ],
    // Mary Had a Little Lamb
    [
        { freq: E4, duration: Q }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: D4, duration: Q },
        { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: H },
        { freq: D4, duration: Q }, { freq: D4, duration: Q }, { freq: D4, duration: H },
        { freq: E4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: H },
        { freq: E4, duration: Q }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: D4, duration: Q },
        { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q },
        { freq: D4, duration: Q }, { freq: D4, duration: Q }, { freq: E4, duration: Q }, { freq: D4, duration: Q },
        { freq: C4, duration: H * 1.5 },
    ],
    // Itsy Bitsy Spider
    [
        { freq: G4, duration: E }, { freq: G4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: H },
        { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: H },
        { freq: null, duration: Q },
        { freq: G4, duration: E }, { freq: G4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: H },
        { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: H },
        { freq: null, duration: Q },
        { freq: C4, duration: Q }, { freq: C4, duration: Q }, { freq: D4, duration: Q }, { freq: E4, duration: Q },
        { freq: E4, duration: Q }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: D4, duration: Q }, { freq: E4, duration: Q }, { freq: C4, duration: H },
        { freq: null, duration: Q },
        { freq: G4, duration: E }, { freq: G4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: H },
        { freq: F4, duration: Q }, { freq: E4, duration:Q }, { freq: F4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: H },
    ],
    // Frère Jacques (Brother John)
    [
        { freq: C4, duration: Q }, { freq: D4, duration: Q }, { freq: E4, duration: Q }, { freq: C4, duration: Q },
        { freq: C4, duration: Q }, { freq: D4, duration: Q }, { freq: E4, duration: Q }, { freq: C4, duration: Q },
        { freq: E4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: H },
        { freq: E4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: H },
        { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: G4, duration: E }, { freq: F4, duration: E }, { freq: E4, duration: Q }, { freq: C4, duration: Q },
        { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: G4, duration: E }, { freq: F4, duration: E }, { freq: E4, duration: Q }, { freq: C4, duration: Q },
        { freq: C4, duration: Q }, { freq: G3, duration: Q }, { freq: C4, duration: H },
        { freq: C4, duration: Q }, { freq: G3, duration: Q }, { freq: C4, duration: H },
    ]
];


// Function to initialize the AudioContext, must be called from a user gesture
export const initAudio = () => {
  if (isAudioInitialized || typeof window === 'undefined') return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Create a dedicated gain node for music to control its volume separately
    musicGainNode = audioContext.createGain();
    musicGainNode.gain.setValueAtTime(0.08, audioContext.currentTime); // Low volume
    musicGainNode.connect(audioContext.destination);
    isAudioInitialized = true;
  } catch (e) {
    console.error("Web Audio API is not supported in this browser");
  }
};

type SoundType = 'swapSuccess' | 'swapFail' | 'match' | 'specialActivation' | 'levelUp' | 'gameOver' | 'click' | 'combo' | 'chain';

const playNote = (
    frequency: number, 
    duration: number, 
    delay: number = 0, 
    volume: number = 0.3,
    type: OscillatorType = 'sine',
    destination: AudioNode | null = null
) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    // Connect to the specified destination (e.g., music gain) or the main output
    gainNode.connect(destination || audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
    oscillator.type = type;

    oscillator.start(audioContext.currentTime + delay);
    
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);
    oscillator.stop(audioContext.currentTime + delay + duration);
};

export const playSound = (sound: SoundType) => {
    if (!audioContext || !isAudioInitialized) return;
    
    switch (sound) {
        case 'click':
            playNote(800, 0.05, 0, 0.2);
            playNote(1200, 0.05, 0, 0.2);
            break;
        case 'swapSuccess':
            playNote(600, 0.1);
            break;
        case 'swapFail':
            playNote(150, 0.2);
            break;
        case 'match':
            playNote(900, 0.1);
            playNote(1200, 0.1, 0.05);
            break;
        case 'chain':
            playNote(1000, 0.08);
            playNote(1300, 0.08, 0.06);
            playNote(1600, 0.08, 0.12);
            break;
        case 'specialActivation':
            playNote(440, 0.1);
            playNote(880, 0.2, 0.1);
            playNote(1320, 0.3, 0.2);
            break;
        case 'combo':
            playNote(220, 0.15); // A3
            playNote(440, 0.15, 0.05); // A4
            playNote(880, 0.25, 0.1); // A5
            playNote(1320, 0.35, 0.15); // E6
            break;
        case 'levelUp':
            playNote(523.25, 0.1, 0); // C5
            playNote(659.25, 0.1, 0.1); // E5
            playNote(783.99, 0.1, 0.2); // G5
            playNote(1046.50, 0.2, 0.3); // C6
            break;
        case 'gameOver':
            playNote(523.25, 0.2, 0);   // C5
            playNote(440.00, 0.2, 0.2); // A4
            playNote(349.23, 0.3, 0.4); // F4
            break;
    }
};

// --- Music Control Functions ---

const playMusicSequence = () => {
    if (!audioContext || !isMusicPlaying) return;
    
    if (currentMelodyIndex === -1) {
        currentMelodyIndex = Math.floor(Math.random() * melodies.length);
    }
    
    const currentMelody = melodies[currentMelodyIndex];
    const note = currentMelody[currentNoteIndex];
    
    if (note.freq) {
        // Play a bass note one octave lower for harmony
        playNote(note.freq / 2, note.duration, 0, 0.06, 'triangle', musicGainNode);
        // Play the melody note
        playNote(note.freq, note.duration, 0, 0.1, 'sine', musicGainNode);
    }

    currentNoteIndex++;

    let nextNoteDelay = note.duration * 1000;
    
    // Check if melody has ended
    if (currentNoteIndex >= currentMelody.length) {
        currentNoteIndex = 0;
        let nextMelodyIndex;
        // Pick a new melody, different from the current one
        do {
            nextMelodyIndex = Math.floor(Math.random() * melodies.length);
        } while (melodies.length > 1 && nextMelodyIndex === currentMelodyIndex);
        currentMelodyIndex = nextMelodyIndex;
        
        // Add a longer pause between melodies
        nextNoteDelay += 2000;
    }
    
    musicSequenceTimeout = window.setTimeout(playMusicSequence, nextNoteDelay);
};

export const startMusic = () => {
    if (!audioContext || isMusicPlaying) return;
    isMusicPlaying = true;
    currentNoteIndex = 0;
    // Start with a random melody
    currentMelodyIndex = Math.floor(Math.random() * melodies.length);
    playMusicSequence();
};

export const stopMusic = () => {
    if (musicSequenceTimeout) {
        clearTimeout(musicSequenceTimeout);
        musicSequenceTimeout = null;
    }
    isMusicPlaying = false;
};

export const setMusicMuted = (muted: boolean) => {
    if (!audioContext || !musicGainNode) return;
    const targetVolume = muted ? 0 : 0.08;
    // Smoothly fade the music volume
    musicGainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 0.2);
};