import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * ThemeBackground component.
 * Enhanced with subtle floating elements for a premium feel.
 */
const ThemeBackground = ({ children, theme }) => {
    // Default to 'Cyber Blue' theme for consistency
    const colors = theme?.background || ['#020617', '#172554', '#1e1b4b'];

    // Floating animations
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createFloatAnim = (anim, duration) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const anim1 = createFloatAnim(float1, 8000);
        const anim2 = createFloatAnim(float2, 12000);

        Animated.parallel([anim1, anim2]).start();

        return () => {
            anim1.stop();
            anim2.stop();
        };
    }, [float1, float2]);

    const transform1 = React.useMemo(() => ({
        translateY: float1.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30],
        }),
    }), [float1]);

    const transform2 = React.useMemo(() => ({
        translateY: float2.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -40],
        }),
    }), [float2]);

    const backgroundElements = React.useMemo(() => (
        <>
            <LinearGradient
                colors={colors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Background Decorations to fill empty space */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[styles.blobOne, transform1]} />
                <Animated.View style={[styles.blobTwo, transform2]} />
                <View style={styles.gridOverlay} />
            </View>
        </>
    ), [colors, transform1, transform2]);

    return (
        <View style={styles.container}>
            {backgroundElements}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    blobOne: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        transform: [{ scale: 1.2 }],
    },
    blobTwo: {
        position: 'absolute',
        bottom: -100,
        right: -50,
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: width * 0.45,
        backgroundColor: 'rgba(34, 211, 238, 0.02)',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.03,
    }
});

export default ThemeBackground;
