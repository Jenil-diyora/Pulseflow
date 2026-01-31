import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LAYOUT } from '../utils/constants';
import * as GameIcons from './GameIcons';

/**
 * RankBadge Component
 * Displays a player's rank with icon, name, and themed colors
 * 
 * @param {Object} rank - Rank object from GitHubLeaderboardService
 * @param {string} size - 'small', 'medium', 'large'
 * @param {boolean} showLabel - Whether to show the rank name text
 * @param {boolean} glowEffect - Whether to show glow effect
 */
const RankBadge = ({ rank, size = 'medium', showLabel = true, glowEffect = false }) => {
    if (!rank) return null;

    const sizeConfig = {
        small: {
            container: 32,
            iconSize: 18,
            label: 10,
        },
        medium: {
            container: 50,
            iconSize: 28,
            label: 12,
        },
        large: {
            container: 70,
            iconSize: 40,
            label: 14,
        },
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    // Dynamically get the icon component
    const IconComponent = GameIcons[rank.icon] || GameIcons.StarIcon;

    return (
        <View style={styles.wrapper}>
            <LinearGradient
                colors={rank.gradient}
                style={[
                    styles.badge,
                    {
                        width: config.container,
                        height: config.container,
                    },
                    glowEffect && {
                        shadowColor: rank.color,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 10,
                    },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.iconContainer}>
                    <IconComponent size={config.iconSize} color="#fff" />
                </View>
            </LinearGradient>

            {showLabel && (
                <Text
                    style={[
                        styles.label,
                        { fontSize: config.label, color: rank.color },
                    ]}
                >
                    {rank.name}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    badge: {
        borderRadius: 1000,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default RankBadge;
