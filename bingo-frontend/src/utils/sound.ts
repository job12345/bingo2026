import { Howl } from 'howler';

/**
 * Sound Manager
 */
class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private isMuted = false;
  private volume = 0.7;

  /**
   * โหลดเสียง
   */
  load(soundName: string, url: string) {
    const sound = new Howl({
      src: [url],
      volume: this.volume,
    });
    this.sounds.set(soundName, sound);
  }

  /**
   * เล่นเสียง
   */
  play(soundName: string) {
    if (this.isMuted) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound "${soundName}" not found`);
    }
  }

  /**
   * หยุดเสียง
   */
  stop(soundName: string) {
    const sound = this.sounds.get(soundName);
    sound?.stop();
  }

  /**
   * หยุดเสียงทั้งหมด
   */
  stopAll() {
    this.sounds.forEach((sound) => sound.stop());
  }

  /**
   * ตั้งค่าระดับเสียง (0-1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => sound.volume(this.volume));
  }

  /**
   * เปิด/ปิดเสียง
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * ตรวจสอบว่าปิดเสียงอยู่หรือไม่
   */
  getMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();

/**
 * Sound Events (ตาม Spec)
 */
export const SOUND_EVENTS = {
  NUMBER_DRAW: 'number_draw',
  BUY_CARD: 'buy_card',
  NEAR_BINGO: 'near_bingo',
  BINGO: 'bingo',
  WIN: 'win',
  LOSE: 'lose',
  NOTIFICATION: 'notification',
} as const;
