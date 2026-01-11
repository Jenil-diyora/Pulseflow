import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScoreDisplay = ({ score, bestScore }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>{score}</Text>
      <Text style={styles.labelText}>CURRENT SCORE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    zIndex: 5,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#ffffff',
  },
  labelText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 4,
  },
});

export default ScoreDisplay;
