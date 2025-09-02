// Audio effects processing - reverb, filters, envelopes

export class AudioEffects {
  private audioContext: AudioContext;
  private reverbNode: ConvolverNode;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.reverbNode = this.createReverbNode();
  }
  
  private createReverbNode(): ConvolverNode {
    const convolver = this.audioContext.createConvolver();
    convolver.buffer = this.createReverbImpulse(1.5);
    return convolver;
  }
  
  private createReverbImpulse(decay: number = 2, reverse: boolean = false): AudioBuffer {
    const length = this.audioContext.sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = reverse ? length - i : i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, 2);
      }
    }
    return impulse;
  }
  
  // Create a processed audio chain for sounds
  createSoundChain(destination: AudioNode | AudioDestinationNode): {
    input: GainNode;
    cleanup: () => void;
  } {
    const inputGain = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();
    const dryGain = this.audioContext.createGain();
    const reverbGain = this.audioContext.createGain();
    
    // Configure filter
    filterNode.type = 'lowpass';
    filterNode.Q.value = 1.5;
    
    // Set up routing
    inputGain.connect(filterNode);
    filterNode.connect(dryGain);
    filterNode.connect(reverbGain);
    
    // Connect outputs
    dryGain.connect(destination);
    reverbGain.connect(this.reverbNode);
    this.reverbNode.connect(destination);
    
    // Set levels
    dryGain.gain.value = 0.8;
    reverbGain.gain.value = 0.3;
    
    return {
      input: inputGain,
      cleanup: () => {
        inputGain.disconnect();
        filterNode.disconnect();
        dryGain.disconnect();
        reverbGain.disconnect();
      }
    };
  }
  
  // Create a processed audio chain for music
  createMusicChain(destination: AudioNode | AudioDestinationNode): {
    input: GainNode;
    cleanup: () => void;
  } {
    const inputGain = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();
    const dryGain = this.audioContext.createGain();
    const reverbGain = this.audioContext.createGain();
    
    // Configure filter for music (warmer)
    filterNode.type = 'lowpass';
    filterNode.Q.value = 0.8;
    
    // Set up routing
    inputGain.connect(filterNode);
    filterNode.connect(dryGain);
    filterNode.connect(reverbGain);
    
    // Connect outputs
    dryGain.connect(destination);
    reverbGain.connect(this.reverbNode);
    this.reverbNode.connect(destination);
    
    // More reverb for music
    dryGain.gain.value = 0.6;
    reverbGain.gain.value = 0.5;
    
    return {
      input: inputGain,
      cleanup: () => {
        inputGain.disconnect();
        filterNode.disconnect();
        dryGain.disconnect();
        reverbGain.disconnect();
      }
    };
  }
  
  // Apply envelope to a gain node
  applyEnvelope(
    gainNode: GainNode, 
    duration: number, 
    delay: number = 0,
    type: 'sound' | 'music' = 'sound'
  ): void {
    const now = this.audioContext.currentTime + delay;
    
    gainNode.gain.setValueAtTime(0, now);
    
    if (type === 'sound') {
      // Quick attack, exponential decay
      gainNode.gain.exponentialRampToValueAtTime(1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.4, now + duration * 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else {
      // Musical envelope with sustain
      gainNode.gain.exponentialRampToValueAtTime(1, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.8, now + duration * 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }
  }
}
