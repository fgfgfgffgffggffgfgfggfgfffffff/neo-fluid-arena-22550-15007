export class SoundManager {
  private context: AudioContext;
  private masterVolume = 0.3;
  private soundCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.context = new AudioContext();
  }

  private createOscillator(frequency: number, duration: number, type: OscillatorType = "sine"): void {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(this.masterVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  public playShoot(): void {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.05);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.05);
  }

  public playHit(): void {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.1);
  }

  public playExplosion(): void {
    const noise = this.context.createBufferSource();
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.3, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;

    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, this.context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.context.destination);

    gainNode.gain.setValueAtTime(this.masterVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    noise.start(this.context.currentTime);
    noise.stop(this.context.currentTime + 0.3);
  }

  public playPowerUp(): void {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.2);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.6, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.2);
  }

  public playDamage(): void {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(150, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.15);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.8, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.15);
  }

  public playSkillActivate(): void {
    this.createOscillator(600, 0.15, "triangle");
    setTimeout(() => this.createOscillator(900, 0.1, "sine"), 50);
  }

  public playWaveComplete(): void {
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillator(freq, 0.15, "sine"), i * 100);
    });
  }

  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}
