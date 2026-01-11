# Pulse Tap - React Native Game

A precision timing mobile game built with React Native and Expo.

## Features

- 🎮 **Pulse Tap Gameplay**: Tap when the expanding circle hits the target ring
- 🎨 **8 Dynamic Themes**: Unlockable themes that change based on your score
- ✨ **Particle Effects**: Beautiful explosion effects on successful hits
- 🏆 **Leaderboard**: Track your top 10 scores and game statistics
- 🎯 **Quests & Challenges**: Complete achievements to unlock rewards
- 📊 **Statistics**: Track accuracy, streaks, and performance metrics
- 🔊 **Audio Feedback**: Dynamic sound effects that change with your score
- 📱 **Haptic Feedback**: Vibration feedback for hits and game over

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
- **iOS**: Press `i` or scan QR code with Camera app
- **Android**: Press `a` or scan QR code with Expo Go app
- **Web**: Press `w` to open in browser

## How to Play

1. Tap "PLAY NOW" from the home screen
2. A circle will start expanding from the center
3. Tap when the pulse circle aligns with the target ring
4. Each successful hit increases your score and speed
5. Missing the target or letting the circle grow too large ends the game

## Themes

Unlock new themes by reaching score milestones:
- Ocean (Default) - 0 points
- Sunset - 10 points
- Forest - 25 points
- Galaxy - 50 points
- Neon - 75 points
- Fire - 100 points
- Ice - 150 points
- Aurora - 200 points

## Quests

Complete various challenges to earn rewards:
- **Score Challenges**: Reach specific score milestones
- **Accuracy Challenges**: Achieve perfect hit streaks
- **Survival Challenges**: Survive for extended periods
- **Dedication Challenges**: Play multiple games

## Project Structure

```
One Tap App/
├── App.js                      # Main app with navigation
├── src/
│   ├── screens/               # All screen components
│   │   ├── HomeScreen.js
│   │   ├── GameScreen.js
│   │   ├── LeaderboardScreen.js
│   │   └── QuestsScreen.js
│   ├── components/            # Reusable components
│   │   ├── PulseCircle.js
│   │   ├── ParticleSystem.js
│   │   ├── ScoreDisplay.js
│   │   └── ThemeBackground.js
│   ├── services/              # Business logic
│   │   ├── StorageService.js
│   │   ├── AudioService.js
│   │   └── ThemeService.js
│   ├── data/                  # Static data
│   │   ├── themes.js
│   │   └── quests.js
│   └── utils/                 # Utilities
│       └── constants.js
└── assets/                    # Images and sounds

```

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **react-native-svg** - SVG rendering for graphics
- **@react-native-async-storage/async-storage** - Data persistence
- **@react-navigation** - Navigation
- **expo-av** - Audio playback
- **expo-haptics** - Vibration feedback
- **expo-linear-gradient** - Gradient backgrounds

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## License

MIT License - Feel free to use this project for learning and personal projects!

## Credits
