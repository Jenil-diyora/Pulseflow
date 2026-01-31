import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import LoginScreen from './src/screens/LoginScreen';
import ThemesScreen from './src/screens/ThemesScreen';
import StoreScreen from './src/screens/StoreScreen';
import { useAuth, AuthProvider } from './src/services/AuthService';
import { ThemeProvider } from './src/context/ThemeContext';
import { View, ActivityIndicator, Text, NativeModules } from 'react-native';
import AdManager from './src/utils/AdManager';

// Initialize Mobile Ads SDK safely
try {
  // Check if native module exists before trying to require or initialize
  if (NativeModules.RNGoogleMobileAdsModule) {
    const mobileAds = require('react-native-google-mobile-ads').default;
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialized');
        AdManager.init();
      })
      .catch(err => console.log('AdMob initialization skipped:', err.message));
  } else {
    console.log('Mobile Ads native module not found - skipping initialization');
  }
} catch (e) {
  console.log('Mobile Ads SDK logic failed - running without ads');
}

import UsernameScreen from './src/screens/UsernameScreen';
import StorageService from './src/services/StorageService';

const Stack = createStackNavigator();

function NavigationStack() {
  const { user, loading } = useAuth();
  const [hasUsername, setHasUsername] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (user && !user.isGuest) {
        const username = await StorageService.getUserName();
        setHasUsername(!!username);
      } else {
        setHasUsername(true); // Don't require username for guests or unlogged users
      }
      setCheckingUsername(false);
    };
    checkUser();
  }, [user]);

  if (loading || checkingUsername) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22d3ee" />
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: 3 }}>INITIALIZING PULSE</Text>
        </View>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !hasUsername && !user.isGuest ? (
        <Stack.Screen name="Username">
          {props => <UsernameScreen {...props} onComplete={() => setHasUsername(true)} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="Quests"
            component={QuestsScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="Themes"
            component={ThemesScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="Store"
            component={StoreScreen}
            options={{
              animationEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <NavigationStack />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
