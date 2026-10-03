// Haptic Vibration Feedback Helper for Mobile Gaming

class HapticFeedback {
  public enabled: boolean = true;

  private vibrate(pattern: number | number[]) {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }

  // Light feedback on D-Pad tap or direction change
  tap() {
    this.vibrate(12);
  }

  // Soft pop when eating normal food
  eat() {
    this.vibrate(20);
  }

  // Double chime vibration when collecting gold coins
  coin() {
    this.vibrate([25, 30, 35]);
  }

  // Strong powerup activation pulse
  powerup() {
    this.vibrate([40, 40, 60]);
  }

  // Shield break or hit
  shieldBreak() {
    this.vibrate([50, 40, 80]);
  }

  // Heavy game over impact vibration
  gameOver() {
    this.vibrate([70, 50, 120]);
  }

  // Joyful level clear fanfare vibration
  levelUp() {
    this.vibrate([40, 30, 40, 30, 80]);
  }

  // Combo frenzy trigger
  combo() {
    this.vibrate([30, 20, 50]);
  }
}

export const haptics = new HapticFeedback();
