class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private isBgmPlaying: boolean = false;
  private contextInitialized: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private customAudioSrc: string | null = null;
  private synthInterval: any = null;
  private synthNoteIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const initAudioOnInteraction = () => {
        if (!this.contextInitialized) {
          this.initCtx();
        }
        if (this.bgmAudio && this.bgmAudio.paused && this.isBgmPlaying && this.enabled) {
          this.bgmAudio.play().catch(() => {});
        }
      };

      window.addEventListener('touchstart', initAudioOnInteraction, { capture: true, passive: true });
      window.addEventListener('mousedown', initAudioOnInteraction, { capture: true, passive: true });
      window.addEventListener('keydown', initAudioOnInteraction, { capture: true, passive: true });

      // Initialize HTML5 Audio for Haye Mera Dil BGM
      this.initBgmAudio();
    }
  }

  private initBgmAudio() {
    if (typeof window === 'undefined') return;
    try {
      const src = this.customAudioSrc || '/haye-mera-dil.mp3';
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio(src);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.65;
        this.bgmAudio.preload = 'auto';
      } else {
        const wasPlaying = !this.bgmAudio.paused;
        this.bgmAudio.src = src;
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.65;
        if (wasPlaying && this.enabled && this.isBgmPlaying) {
          this.bgmAudio.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Failed to initialize BGM audio', e);
    }
  }

  setCustomAudio(src: string | null) {
    this.customAudioSrc = src;
    if (typeof window === 'undefined') return;

    const targetSrc = src || '/haye-mera-dil.mp3';
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(targetSrc);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.65;
    } else {
      const wasPlaying = !this.bgmAudio.paused;
      this.bgmAudio.pause();
      this.bgmAudio.src = targetSrc;
      this.bgmAudio.currentTime = 0;
      if (wasPlaying && this.enabled && this.isBgmPlaying) {
        this.bgmAudio.play().catch(() => {});
      }
    }
  }

  playBGM() {
    if (!this.enabled) return;
    this.isBgmPlaying = true;
    this.initCtx();

    if (this.bgmAudio) {
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts HTML5 audio, play synthesized version
          this.startSynthBGM();
        });
      }
    } else {
      this.startSynthBGM();
    }
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
    this.stopSynthBGM();
  }

  pauseBGM() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.stopSynthBGM();
  }

  updateBgmState(isPlaying: boolean) {
    if (this.enabled && isPlaying) {
      this.playBGM();
    } else {
      this.pauseBGM();
    }
  }

  // Synthesized Haye Mera Dil melody fallback
  private startSynthBGM() {
    this.stopSynthBGM();
    this.initCtx();

    // "Haye Mera Dil" signature notes:
    // Ro ro ke arajja gujarda ae dil -> E5, D5, C5, C5, D5, E5, F5, E5, D5, C5
    // Haye mera dil, haye mera dil -> G5, F5, E5, D5, C5 | G5, F5, E5, D5, C5
    // Honey Singh groove -> A4, C5, D5, E5, D5, C5, A4
    const melody = [
      659.25, 587.33, 523.25, 523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25,
      783.99, 698.46, 659.25, 587.33, 523.25, 523.25,
      783.99, 698.46, 659.25, 587.33, 523.25, 523.25,
      440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00, 523.25
    ];

    const bass = [110.00, 110.00, 87.31, 87.31, 130.81, 130.81, 98.00, 98.00]; // Am -> F -> C -> G

    this.synthNoteIndex = 0;
    const tempoMs = 180;

    this.synthInterval = setInterval(() => {
      if (!this.isBgmPlaying || !this.enabled) {
        this.stopSynthBGM();
        return;
      }
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freq = melody[this.synthNoteIndex % melody.length];

      // Lead melody
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);

      // Bass note every 4 beats
      if (this.synthNoteIndex % 4 === 0) {
        const bassFreq = bass[Math.floor(this.synthNoteIndex / 4) % bass.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.008, now + 0.32);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.33);
      }

      this.synthNoteIndex++;
    }, tempoMs);
  }

  private stopSynthBGM() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.contextInitialized = true;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playEat() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSpecialFood() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(600, now + 0.08);
    osc.frequency.setValueAtTime(900, now + 0.16);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playPowerup() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playCoin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now);
    osc1.frequency.setValueAtTime(1318.51, now + 0.08);

    osc2.frequency.setValueAtTime(1975.53, now);
    osc2.frequency.setValueAtTime(2637.02, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }

  playGameOver() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sound = new SoundEffects();
