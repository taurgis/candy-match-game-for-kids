let audioContext: AudioContext | null = null;
let isAudioInitialized = false;
let reverbNode: ConvolverNode | null = null;

// --- Music State ---
let musicGainNode: GainNode | null = null;
let isMusicPlaying = false;
let musicSequenceTimeout: number | null = null;
let currentMelodyIndex = -1;
let currentNoteIndex = 0;

// Create artificial reverb impulse response
const createReverbImpulse = (audioContext: AudioContext, decay: number = 2, reverse: boolean = false) => {
    const length = audioContext.sampleRate * decay;
    const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const n = reverse ? length - i : i;
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, 2);
        }
    }
    return impulse;
};

interface Note {
  freq: number | null; // null for a rest
  duration: number; // in seconds
}

// Note Frequencies - Extended range for richer harmonies
const G3 = 196.00, A3 = 220.00, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

const E = 0.2; // eighth note duration
const Q = 0.4; // quarter note duration
const H = 0.8; // half note duration
const W = 1.6; // whole note duration

// Enhanced collection with happier, longer melodies (4-6x repetitions)
const melodies: Note[][] = [
    // Happy Birthday variation - Super cheerful (Extended)
    [
        // First verse
        { freq: C4, duration: Q }, { freq: C4, duration: E }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: H },
        { freq: C4, duration: Q }, { freq: C4, duration: E }, { freq: D4, duration: Q }, { freq: C4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
        { freq: C4, duration: Q }, { freq: C4, duration: E }, { freq: C5, duration: Q }, { freq: A4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: D4, duration: H },
        { freq: A4, duration: Q }, { freq: A4, duration: E }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
        // Repeat with variations
        { freq: C4, duration: E }, { freq: D4, duration: E }, { freq: E4, duration: Q }, { freq: C4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: H },
        { freq: C4, duration: E }, { freq: D4, duration: E }, { freq: E4, duration: Q }, { freq: C4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
        { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: Q }, { freq: F4, duration: Q }, { freq: E4, duration: Q }, { freq: D4, duration: H },
        { freq: A4, duration: E }, { freq: G4, duration: E }, { freq: F4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: C4, duration: H },
        // Third variation
        { freq: E4, duration: Q }, { freq: F4, duration: E }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: H },
        { freq: E4, duration: Q }, { freq: F4, duration: E }, { freq: G4, duration: Q }, { freq: F4, duration: Q }, { freq: B4, duration: Q }, { freq: A4, duration: H },
        { freq: C5, duration: Q }, { freq: D5, duration: E }, { freq: C5, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
        { freq: G4, duration: Q }, { freq: A4, duration: E }, { freq: B4, duration: Q }, { freq: A4, duration: Q }, { freq: G4, duration: Q }, { freq: F4, duration: H },
    ],
    // Bouncy Pop Melody - Kids TV show style (Extended)
    [
        // Main theme
        { freq: E4, duration: E }, { freq: G4, duration: E }, { freq: C5, duration: Q }, { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: Q },
        { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: B4, duration: Q }, { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: Q },
        { freq: F4, duration: E }, { freq: A4, duration: E }, { freq: C5, duration: Q }, { freq: F5, duration: E }, { freq: E5, duration: E }, { freq: D5, duration: Q },
        { freq: C5, duration: E }, { freq: G4, duration: E }, { freq: E4, duration: Q }, { freq: C4, duration: H },
        // Repeat higher
        { freq: G4, duration: E }, { freq: B4, duration: E }, { freq: E5, duration: Q }, { freq: G5, duration: E }, { freq: F5, duration: E }, { freq: E5, duration: Q },
        { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: Q }, { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: Q },
        { freq: A4, duration: E }, { freq: C5, duration: E }, { freq: E5, duration: Q }, { freq: A5, duration: E }, { freq: G5, duration: E }, { freq: F5, duration: Q },
        { freq: E5, duration: E }, { freq: B4, duration: E }, { freq: G4, duration: Q }, { freq: E4, duration: H },
        // Bridge section
        { freq: C5, duration: Q }, { freq: D5, duration: Q }, { freq: E5, duration: Q }, { freq: F5, duration: Q },
        { freq: G5, duration: E }, { freq: F5, duration: E }, { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: H },
        { freq: A4, duration: Q }, { freq: B4, duration: Q }, { freq: C5, duration: Q }, { freq: D5, duration: Q },
        { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: H },
        // Final repeat
        { freq: E4, duration: E }, { freq: G4, duration: E }, { freq: C5, duration: Q }, { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: Q },
        { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: B4, duration: Q }, { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: Q },
        { freq: C5, duration: H }, { freq: E5, duration: H }, { freq: C5, duration: W },
    ],
    // Sunshine Waltz - 3/4 time, very uplifting (Extended)
    [
        // Main waltz theme
        { freq: C4, duration: Q }, { freq: E4, duration: Q }, { freq: G4, duration: Q }, { freq: C5, duration: Q }, { freq: G4, duration: Q }, { freq: E4, duration: Q },
        { freq: F4, duration: Q }, { freq: A4, duration: Q }, { freq: C5, duration: Q }, { freq: F5, duration: Q }, { freq: C5, duration: Q }, { freq: A4, duration: Q },
        { freq: G4, duration: Q }, { freq: B4, duration: Q }, { freq: D5, duration: Q }, { freq: G5, duration: Q }, { freq: D5, duration: Q }, { freq: B4, duration: Q },
        { freq: C5, duration: H }, { freq: E5, duration: Q }, { freq: C5, duration: H }, { freq: C4, duration: Q },
        // Repeat with embellishments
        { freq: E4, duration: E }, { freq: F4, duration: E }, { freq: G4, duration: Q }, { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: Q },
        { freq: A4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: Q }, { freq: F5, duration: E }, { freq: E5, duration: E }, { freq: D5, duration: Q },
        { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: Q }, { freq: G5, duration: E }, { freq: F5, duration: E }, { freq: E5, duration: Q },
        { freq: C5, duration: Q }, { freq: G4, duration: Q }, { freq: E4, duration: Q }, { freq: C4, duration: H }, { freq: null, duration: Q },
        // Higher octave section
        { freq: C5, duration: Q }, { freq: E5, duration: Q }, { freq: G5, duration: Q }, { freq: C5, duration: Q }, { freq: G5, duration: Q }, { freq: E5, duration: Q },
        { freq: F5, duration: Q }, { freq: A5, duration: Q }, { freq: C5, duration: Q }, { freq: F5, duration: Q }, { freq: C5, duration: Q }, { freq: A5, duration: Q },
        { freq: G5, duration: Q }, { freq: B4, duration: Q }, { freq: D5, duration: Q }, { freq: G5, duration: Q }, { freq: D5, duration: Q }, { freq: B4, duration: Q },
        { freq: C5, duration: H }, { freq: E5, duration: Q }, { freq: C5, duration: H }, { freq: G4, duration: Q },
    ],
    // Carnival Ride - Fast and exciting (Extended)
    [
        // Main carnival theme
        { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: E }, { freq: E5, duration: E }, { freq: F5, duration: E }, { freq: G5, duration: E },
        { freq: G5, duration: Q }, { freq: E5, duration: Q }, { freq: C5, duration: Q }, { freq: G4, duration: Q },
        { freq: A4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: E }, { freq: E5, duration: E }, { freq: F5, duration: E }, { freq: G5, duration: E }, { freq: A5, duration: E },
        { freq: A5, duration: Q }, { freq: F5, duration: Q }, { freq: D5, duration: Q }, { freq: A4, duration: Q },
        // Circus variation
        { freq: C5, duration: E }, { freq: D5, duration: E }, { freq: E5, duration: E }, { freq: F5, duration: E }, { freq: G5, duration: E }, { freq: A5, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: E },
        { freq: C5, duration: Q }, { freq: A4, duration: Q }, { freq: F4, duration: Q }, { freq: C4, duration: Q },
        { freq: E4, duration: E }, { freq: F4, duration: E }, { freq: G4, duration: E }, { freq: A4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: E }, { freq: D5, duration: E }, { freq: E5, duration: E },
        { freq: E5, duration: Q }, { freq: C5, duration: Q }, { freq: A4, duration: Q }, { freq: E4, duration: Q },
        // Final carnival climax
        { freq: G5, duration: E }, { freq: F5, duration: E }, { freq: E5, duration: E }, { freq: D5, duration: E }, { freq: C5, duration: E }, { freq: B4, duration: E }, { freq: A4, duration: E }, { freq: G4, duration: E },
        { freq: C5, duration: H }, { freq: E5, duration: H }, { freq: G5, duration: H }, { freq: C5, duration: H },
    ],
    // Ice Cream Truck Melody - Classic happy tune (Extended)
    [
        // Main ice cream truck theme
        { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q }, { freq: E4, duration: Q },
        { freq: E4, duration: Q }, { freq: C4, duration: Q }, { freq: E4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: H },
        { freq: C4, duration: Q }, { freq: null, duration: Q }, { freq: G3, duration: Q }, { freq: null, duration: Q }, { freq: E4, duration: Q },
        { freq: null, duration: Q }, { freq: A4, duration: Q }, { freq: null, duration: Q }, { freq: B4, duration: Q }, { freq: null, duration: E }, { freq: A4, duration: E }, { freq: A4, duration: Q },
        // Second verse
        { freq: G4, duration: E }, { freq: E4, duration: E }, { freq: G4, duration: E }, { freq: A4, duration: Q }, { freq: F4, duration: Q }, { freq: G4, duration: Q },
        { freq: null, duration: Q }, { freq: E4, duration: Q }, { freq: null, duration: Q }, { freq: C4, duration: Q }, { freq: D4, duration: Q }, { freq: B3, duration: Q },
        // Repeat with harmony
        { freq: G4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: Q }, { freq: G4, duration: Q },
        { freq: G4, duration: Q }, { freq: E4, duration: Q }, { freq: G4, duration: Q }, { freq: C5, duration: Q }, { freq: C5, duration: H },
        { freq: E4, duration: Q }, { freq: null, duration: Q }, { freq: C4, duration: Q }, { freq: null, duration: Q }, { freq: G4, duration: Q },
        { freq: null, duration: Q }, { freq: C5, duration: Q }, { freq: null, duration: Q }, { freq: D5, duration: Q }, { freq: null, duration: E }, { freq: C5, duration: E }, { freq: C5, duration: Q },
        // Final verse with flourishes
        { freq: B4, duration: E }, { freq: G4, duration: E }, { freq: B4, duration: E }, { freq: C5, duration: Q }, { freq: A4, duration: Q }, { freq: B4, duration: Q },
        { freq: null, duration: Q }, { freq: G4, duration: Q }, { freq: null, duration: Q }, { freq: E4, duration: Q }, { freq: F4, duration: Q }, { freq: D4, duration: Q },
        { freq: C4, duration: H }, { freq: E4, duration: H }, { freq: G4, duration: H }, { freq: C4, duration: H },
    ]
];


// Function to initialize the AudioContext, must be called from a user gesture
export const initAudio = () => {
  if (isAudioInitialized || typeof window === 'undefined') return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create reverb node for modern spatial sound
    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = createReverbImpulse(audioContext, 1.5);
    
    // Create a dedicated gain node for music to control its volume separately
    musicGainNode = audioContext.createGain();
    musicGainNode.gain.setValueAtTime(0.15, audioContext.currentTime); // Updated volume
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

    // Create multiple oscillators for richer sound
    const mainOsc = audioContext.createOscillator();
    const subOsc = audioContext.createOscillator();
    const noiseOsc = audioContext.createOscillator();
    
    const mainGain = audioContext.createGain();
    const subGain = audioContext.createGain();
    const noiseGain = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    const filterNode = audioContext.createBiquadFilter();
    const reverbGain = audioContext.createGain();
    const dryGain = audioContext.createGain();

    // Create rich harmonic content
    mainOsc.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
    subOsc.frequency.setValueAtTime(frequency * 0.5, audioContext.currentTime + delay); // Sub octave
    noiseOsc.frequency.setValueAtTime(frequency * 2.1, audioContext.currentTime + delay); // Slight detuning
    
    mainOsc.type = type;
    subOsc.type = 'triangle';
    noiseOsc.type = 'sawtooth';

    // Connect oscillators to gains
    mainOsc.connect(mainGain);
    subOsc.connect(subGain);
    noiseOsc.connect(noiseGain);
    
    // Mix oscillators
    mainGain.connect(masterGain);
    subGain.connect(masterGain);
    noiseGain.connect(masterGain);
    
    // Add filtering for warmth
    masterGain.connect(filterNode);
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(frequency * 4, audioContext.currentTime + delay);
    filterNode.Q.setValueAtTime(1.5, audioContext.currentTime + delay);
    
    // Split to dry and reverb paths
    filterNode.connect(dryGain);
    filterNode.connect(reverbGain);
    
    // Connect to reverb if available
    if (reverbNode) {
        reverbGain.connect(reverbNode);
        reverbNode.connect(destination || audioContext.destination);
    }
    dryGain.connect(destination || audioContext.destination);

    // Set oscillator volumes
    mainGain.gain.setValueAtTime(volume * 0.6, audioContext.currentTime + delay);
    subGain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime + delay);
    noiseGain.gain.setValueAtTime(volume * 0.05, audioContext.currentTime + delay);
    
    // Reverb mix
    dryGain.gain.setValueAtTime(0.8, audioContext.currentTime + delay);
    reverbGain.gain.setValueAtTime(0.3, audioContext.currentTime + delay);

    // Modern envelope: quick attack, exponential decay with sustain
    masterGain.gain.setValueAtTime(0, audioContext.currentTime + delay);
    masterGain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + delay + 0.01);
    masterGain.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime + delay + duration * 0.2);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);

    // Start and stop oscillators
    const startTime = audioContext.currentTime + delay;
    const stopTime = startTime + duration;
    
    mainOsc.start(startTime);
    subOsc.start(startTime);
    noiseOsc.start(startTime);
    
    mainOsc.stop(stopTime);
    subOsc.stop(stopTime);
    noiseOsc.stop(stopTime);
};

export const playSound = (sound: SoundType) => {
    if (!audioContext || !isAudioInitialized) return;
    
    switch (sound) {
        case 'click':
            // Modern UI click with metallic ping
            playNote(800, 0.08, 0, 0.12, 'triangle');
            playNote(1600, 0.04, 0.01, 0.08, 'sine');
            playNote(2400, 0.02, 0.02, 0.04, 'sine');
            break;
        case 'swapSuccess':
            // Bright, optimistic chord progression
            playNote(523.25, 0.15, 0, 0.15, 'triangle'); // C5
            playNote(659.25, 0.12, 0.03, 0.12, 'sine'); // E5
            playNote(783.99, 0.1, 0.06, 0.1, 'sawtooth'); // G5
            break;
        case 'swapFail':
            // Soft, gentle negative feedback
            playNote(293.66, 0.2, 0, 0.15, 'triangle'); // D4
            playNote(246.94, 0.25, 0.1, 0.12, 'sine'); // B3
            break;
        case 'match':
            // Magical sparkle with ascending harmonics
            playNote(523.25, 0.15, 0, 0.18, 'triangle'); // C5
            playNote(659.25, 0.12, 0.02, 0.15, 'sine'); // E5
            playNote(783.99, 0.1, 0.04, 0.12, 'sawtooth'); // G5
            playNote(1046.50, 0.08, 0.06, 0.1, 'sine'); // C6
            break;
        case 'chain':
            // Dynamic rising cascade
            playNote(659.25, 0.1, 0, 0.16, 'triangle'); // E5
            playNote(783.99, 0.08, 0.02, 0.14, 'sine'); // G5
            playNote(987.77, 0.06, 0.04, 0.12, 'sawtooth'); // B5
            playNote(1318.51, 0.05, 0.06, 0.1, 'sine'); // E6
            break;
        case 'specialActivation':
            // Epic power-up sound with sweep
            playNote(261.63, 0.2, 0, 0.2, 'sawtooth'); // C4
            playNote(523.25, 0.18, 0.05, 0.18, 'triangle'); // C5
            playNote(659.25, 0.15, 0.1, 0.16, 'sine'); // E5
            playNote(783.99, 0.12, 0.15, 0.14, 'sawtooth'); // G5
            playNote(1046.50, 0.1, 0.2, 0.12, 'sine'); // C6
            break;
        case 'combo':
            // Electrifying combo burst
            playNote(440, 0.15, 0, 0.18, 'sawtooth'); // A4
            playNote(554.37, 0.12, 0.02, 0.16, 'triangle'); // C#5
            playNote(659.25, 0.1, 0.04, 0.14, 'sine'); // E5
            playNote(880, 0.08, 0.06, 0.12, 'sawtooth'); // A5
            playNote(1108.73, 0.06, 0.08, 0.1, 'sine'); // C#6
            break;
        case 'levelUp':
            // Grand fanfare with rich harmonics
            playNote(261.63, 0.3, 0, 0.25, 'sawtooth'); // C4
            playNote(523.25, 0.25, 0.05, 0.22, 'triangle'); // C5
            playNote(659.25, 0.2, 0.1, 0.2, 'sine'); // E5
            playNote(783.99, 0.18, 0.15, 0.18, 'sawtooth'); // G5
            playNote(1046.50, 0.15, 0.2, 0.16, 'triangle'); // C6
            playNote(1318.51, 0.12, 0.25, 0.14, 'sine'); // E6
            playNote(1975.53, 0.1, 0.3, 0.12, 'sine'); // B6
            break;
        case 'gameOver':
            // Bittersweet, cinematic ending
            playNote(523.25, 0.4, 0, 0.18, 'triangle');   // C5
            playNote(493.88, 0.35, 0.1, 0.16, 'sine'); // B4
            playNote(440.00, 0.3, 0.2, 0.14, 'sawtooth'); // A4
            playNote(392.00, 0.25, 0.3, 0.12, 'triangle'); // G4
            playNote(349.23, 0.2, 0.4, 0.1, 'sine'); // F4
            break;
    }
};

const playMusicNote = (
    frequency: number, 
    duration: number, 
    delay: number = 0, 
    volume: number = 0.15,
    type: OscillatorType = 'sine',
    destination: AudioNode | null = null
) => {
    if (!audioContext) return;

    // Create a more sophisticated music synthesis
    const mainOsc = audioContext.createOscillator();
    const harmonic1 = audioContext.createOscillator();
    const harmonic2 = audioContext.createOscillator();
    
    const mainGain = audioContext.createGain();
    const harmonic1Gain = audioContext.createGain();
    const harmonic2Gain = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    const filterNode = audioContext.createBiquadFilter();
    const reverbGain = audioContext.createGain();
    const dryGain = audioContext.createGain();

    // Create rich musical harmonies
    mainOsc.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
    harmonic1.frequency.setValueAtTime(frequency * 1.5, audioContext.currentTime + delay); // Perfect fifth
    harmonic2.frequency.setValueAtTime(frequency * 2, audioContext.currentTime + delay); // Octave
    
    mainOsc.type = type;
    harmonic1.type = 'triangle';
    harmonic2.type = 'sine';

    // Connect oscillators
    mainOsc.connect(mainGain);
    harmonic1.connect(harmonic1Gain);
    harmonic2.connect(harmonic2Gain);
    
    mainGain.connect(masterGain);
    harmonic1Gain.connect(masterGain);
    harmonic2Gain.connect(masterGain);
    
    // Musical filtering
    masterGain.connect(filterNode);
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(frequency * 6, audioContext.currentTime + delay);
    filterNode.Q.setValueAtTime(0.8, audioContext.currentTime + delay);
    
    // Reverb routing
    filterNode.connect(dryGain);
    filterNode.connect(reverbGain);
    
    if (reverbNode) {
        reverbGain.connect(reverbNode);
        reverbNode.connect(destination || audioContext.destination);
    }
    dryGain.connect(destination || audioContext.destination);

    // Set harmonic balance
    mainGain.gain.setValueAtTime(volume * 0.7, audioContext.currentTime + delay);
    harmonic1Gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime + delay);
    harmonic2Gain.gain.setValueAtTime(volume * 0.1, audioContext.currentTime + delay);
    
    // More reverb for music
    dryGain.gain.setValueAtTime(0.6, audioContext.currentTime + delay);
    reverbGain.gain.setValueAtTime(0.5, audioContext.currentTime + delay);

    // Musical envelope with sustain
    masterGain.gain.setValueAtTime(0, audioContext.currentTime + delay);
    masterGain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + delay + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(0.8, audioContext.currentTime + delay + duration * 0.8);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);

    // Start and stop
    const startTime = audioContext.currentTime + delay;
    const stopTime = startTime + duration;
    
    mainOsc.start(startTime);
    harmonic1.start(startTime);
    harmonic2.start(startTime);
    
    mainOsc.stop(stopTime);
    harmonic1.stop(stopTime);
    harmonic2.stop(stopTime);
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
        // Rich layered instrumentation with happy timbres
        // Bouncy bass line (root)
        playMusicNote(note.freq / 4, note.duration * 0.9, 0, 0.1, 'triangle', musicGainNode);
        
        // Cheerful sub bass (perfect fifth)
        playMusicNote(note.freq / 2.67, note.duration * 0.8, 0, 0.08, 'sawtooth', musicGainNode);
        
        // Bright main melody
        playMusicNote(note.freq, note.duration, 0, 0.15, 'triangle', musicGainNode);
        
        // Happy harmony (major third)
        if (currentNoteIndex % 2 === 0) { // Add harmony on even beats
            playMusicNote(note.freq * 1.25, note.duration * 0.7, 0.05, 0.06, 'sine', musicGainNode);
        }
        
        // Joyful sparkle layer (octave + major seventh for brightness)
        if (currentNoteIndex % 3 === 0) { // Add sparkle every 3rd note for more energy
            playMusicNote(note.freq * 2.8, note.duration * 0.4, 0.1, 0.04, 'sine', musicGainNode);
        }
        
        // Extra bounce - staccato high notes
        if (currentNoteIndex % 4 === 1) { // Offset rhythm for bounce
            playMusicNote(note.freq * 2, note.duration * 0.3, 0.15, 0.03, 'triangle', musicGainNode);
        }
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
    if (!audioContext) return;
    
    if (muted) {
        // Stop the music completely when muted
        stopMusic();
        if (musicGainNode) {
            musicGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
        }
    } else {
        // Only set volume when unmuted, don't automatically start music
        // Music starting should be controlled by the caller
        if (musicGainNode) {
            musicGainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.2);
        }
    }
};