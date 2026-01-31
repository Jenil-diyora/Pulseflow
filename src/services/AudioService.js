import { Audio } from 'expo-av';
import { generateTone } from '../utils/AudioGenerator';
import ThemeService from './ThemeService';

class AudioService {
    constructor() {
        this.sounds = {};
        this.failSound = null;
        this.isInitialized = false;
        this.currentThemeId = 'ocean';
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Set audio mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Generate and load sounds for each theme
            const themeConfigs = {
                ocean: { freq: 329.63, type: 'sine' },   // E4 - Calm
                sunset: { freq: 440.00, type: 'triangle' }, // A4 - Warm
                forest: { freq: 523.25, type: 'sine' },   // C5 - Woodsy
                galaxy: { freq: 659.25, type: 'sine' },   // E5 - Ethereal
                neon: { freq: 880.00, type: 'square' },   // A5 - Digital
                fire: { freq: 392.00, type: 'triangle' }, // G4 - Energetic
                ice: { freq: 1174.66, type: 'sine' },     // D6 - Glassy
                aurora: { freq: 587.33, type: 'sine' },   // D5 - Mystical
            };

            // Load theme sounds
            for (const [key, config] of Object.entries(themeConfigs)) {
                const uri = generateTone(config.freq, 0.3, config.type, 0.6); // 0.3s duration
                const { sound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: false }
                );
                this.sounds[key] = sound;
            }

            // Load fail sound - "Beautiful" Loss (Deep gentle drop)
            // Sliding from 150Hz down to 50Hz (Deep wobble) with Sine wave
            const failUri = generateTone({ start: 160, end: 55 }, 0.6, 'sine', 0.8);
            const { sound: failSound } = await Audio.Sound.createAsync(
                { uri: failUri },
                { shouldPlay: false }
            );
            this.failSound = failSound;

            // Subscribe to theme changes
            ThemeService.subscribe((theme) => {
                this.currentThemeId = theme.id;
            });

            this.isInitialized = true;
            console.log('AudioService initialized successfully with synthesized sounds');

        } catch (error) {
            console.warn('Failed to initialize AudioService:', error);
        }
    }

    async playHit(score) {
        if (!this.isInitialized) return;

        try {
            // Get current theme's sound or fall back to ocean
            const sound = this.sounds[this.currentThemeId] || this.sounds['ocean'];

            if (sound) {
                // Optional: Simple pitch variation based on streak/progression could go here
                // For now, just consistent soothing sound
                await sound.replayAsync();
            }
        } catch (error) {
            console.warn('Error playing hit sound:', error);
        }
    }

    async playFail() {
        if (!this.isInitialized || !this.failSound) return;

        try {
            await this.failSound.replayAsync();
        } catch (error) {
            console.warn('Error playing fail sound:', error);
        }
    }

    // Cleanup sounds if needed (e.g. app unmount)
    async unloadAll() {
        try {
            for (const sound of Object.values(this.sounds)) {
                await sound.unloadAsync();
            }
            if (this.failSound) {
                await this.failSound.unloadAsync();
            }
        } catch (error) {
            console.warn('Error unloading sounds:', error);
        }
    }
}

export default new AudioService();
