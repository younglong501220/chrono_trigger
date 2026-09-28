/**
 * Synthesizes retro 16-bit SNES style sound effects and ambient chiptunes
 * using the Web Audio API without external file dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentBgmInterval: number | null = null;
  private currentEraTheme: string | null = null;

  constructor() {
    // Initialized on first user interaction to satisfy browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (this.bgmGain) this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.2, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects (SFX) ---

  public playCursor() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playSelect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.06); // A5

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playSlash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // White noise burst with lowpass sweep for sword blade whoosh
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playFire() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playLightning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(150, now + 0.05);
    osc.frequency.setValueAtTime(800, now + 0.1);
    osc.frequency.setValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playHeal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  public playAtbReady() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, now); // E6
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playTimeGateWarp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.8);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // Iconic JRPG fanfare melody
    // C5, C5, C5, C5, G#4, A#4, C5 -> G#4, C5
    const melody = [
      { note: 523.25, dur: 0.12, time: 0 },
      { note: 523.25, dur: 0.12, time: 0.12 },
      { note: 523.25, dur: 0.12, time: 0.24 },
      { note: 523.25, dur: 0.28, time: 0.36 },
      { note: 415.30, dur: 0.28, time: 0.65 },
      { note: 466.16, dur: 0.28, time: 0.95 },
      { note: 523.25, dur: 0.16, time: 1.25 },
      { note: 466.16, dur: 0.16, time: 1.45 },
      { note: 523.25, dur: 0.6, time: 1.65 },
    ];

    melody.forEach(({ note, dur, time }) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + dur);
    });
  }

  // --- Ambient Retro Chiptune Loop (Era BGM) ---

  public playEraBgm(theme: 'prehistoric' | 'medieval' | 'present' | 'future' | 'end_of_time' | 'battle') {
    if (this.currentEraTheme === theme) return;
    this.stopBgm();
    this.currentEraTheme = theme;
    if (this.isMuted) return;

    this.initCtx();
    if (!this.ctx) return;

    // Define melody patterns (freq in Hz)
    let notes: number[] = [];
    let beatSpeed = 400; // ms per note

    if (theme === 'present') {
      // Millennium Fair carnival bounce (C major pentatonic cheerful)
      notes = [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25];
      beatSpeed = 240;
    } else if (theme === 'medieval') {
      // Wind Scene / Kingdom homage (D minor heroic & gentle)
      notes = [293.66, 349.23, 440, 523.25, 440, 392, 349.23, 293.66];
      beatSpeed = 360;
    } else if (theme === 'prehistoric') {
      // Primal pentatonic pulse
      notes = [220, 261.63, 293.66, 329.63, 293.66, 261.63, 220, 196];
      beatSpeed = 260;
    } else if (theme === 'future') {
      // Melancholic ruined cyber wasteland (A minor low-pass echoes)
      notes = [220, 246.94, 261.63, 329.63, 261.63, 220, 196, 174.61];
      beatSpeed = 480;
    } else if (theme === 'end_of_time') {
      // Ethereal starry clock chime
      notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880, 659.25];
      beatSpeed = 500;
    } else if (theme === 'battle') {
      // High-tempo battle theme
      notes = [146.83, 146.83, 293.66, 261.63, 293.66, 329.63, 293.66, 261.63];
      beatSpeed = 190;
    }

    let step = 0;
    this.currentBgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.bgmGain) return;
      const freq = notes[step % notes.length];
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = theme === 'battle' ? 'sawtooth' : theme === 'future' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (beatSpeed / 1000) * 0.9);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + (beatSpeed / 1000) * 0.9);

      step++;
    }, beatSpeed);
  }

  public stopBgm() {
    if (this.currentBgmInterval !== null) {
      clearInterval(this.currentBgmInterval);
      this.currentBgmInterval = null;
    }
    this.currentEraTheme = null;
  }
}

export const soundManager = new SoundManager();
