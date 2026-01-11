import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import QuestsScreen from './src/screens/QuestsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    userSelect: 'none', // Prevent text selection globally (web)
  },
});
