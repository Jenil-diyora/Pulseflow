import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Play hit sound with increasing pitch based on score
  async playHit(score = 0) {
    if (!this.enabled) return;
    
    try {
      const frequency = 440 + (score * 20);
      // Since we can't generate tones directly, we'll use a simple sound
      // In a real app, you'd preload sound files
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.generateTone(frequency, 0.2) },
        { shouldPlay: true, volume: 0.3 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Silently fail - audio is not critical
    }
  }

  async playPerfect() {
    if (!this.enabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.generateTone(660, 0.15) },
        { shouldPlay: true, volume: 0.4 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Silently fail
    }
  }

  async playFail() {
    if (!this.enabled) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.generateTone(150, 0.5) },
        { shouldPlay: true, volume: 0.3 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Silently fail
    }
  }

  // Helper to generate simple tone data URI (simplified)
  generateTone(frequency, duration) {
    // This is a placeholder - in a real app, you'd use actual audio files
    // or a more sophisticated tone generation library
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  }

  async cleanup() {
    // Unload all sounds
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        try {
          await this.sounds[key].unloadAsync();
        } catch (error) {
          // Ignore
        }
      }
    }
    this.sounds = {};
  }
}

export default new AudioService();
