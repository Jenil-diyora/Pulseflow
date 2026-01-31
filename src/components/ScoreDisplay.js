import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScoreDisplay = ({ score, bestScore, currentTheme }) => {
    return (
        <View style={styles.container}>
            <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                    <Text style={styles.label}>SCORE</Text>
                    <Text style={[styles.value, { color: currentTheme?.ringColor || '#fff' }]}>{score}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scoreItem}>
                    <Text style={styles.label}>BEST</Text>
                    <Text style={styles.bestValue}>{bestScore}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
        paddingTop: 20,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    scoreItem: {
        alignItems: 'center',
        minWidth: 80,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 15,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: '#64748b',
        letterSpacing: 2,
        marginBottom: 4,
    },
    value: {
        fontSize: 32,
        fontWeight: '900',
    },
    bestValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#94a3b8',
    },
});

export default ScoreDisplay;
