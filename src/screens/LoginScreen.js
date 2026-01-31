import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../services/AuthService';
import ThemeBackground from '../components/ThemeBackground';
import StorageService from '../services/StorageService';
import { useAppTheme } from '../utils/themeHook';
import { GamepadIcon, SparklesIcon, TargetIcon, TrophyIcon } from '../components/GameIcons';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const { promptAsync, loading, loginAsGuestMode } = useAuth();
    const { theme } = useAppTheme();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const floatingAnims = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        // Floating background elements
        floatingAnims.forEach((anim, index) => {
            const duration = 3000 + index * 1000;
            Animated.loop(
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
            ).start();
        });
    }, []);

    const renderFloatingShape = (index, style, delay) => {
        const translateY = floatingAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30],
        });

        const rotate = floatingAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', index % 2 === 0 ? '15deg' : '-15deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.floatingShape,
                    style,
                    {
                        transform: [{ translateY }, { rotate }],
                        opacity: 0.1,
                    },
                ]}
            />
        );
    };

    return (
        <ThemeBackground theme={theme}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Abstract Background Decorations */}
                {renderFloatingShape(0, { top: height * 0.1, left: -width * 0.2, width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4, backgroundColor: theme.primary })}
                {renderFloatingShape(1, { bottom: height * 0.05, right: -width * 0.3, width: width, height: width, borderRadius: width * 0.5, backgroundColor: theme.pulseColor })}
                {renderFloatingShape(2, { top: height * 0.4, right: width * 0.1, width: 100, height: 100, borderRadius: 50, backgroundColor: theme.ringColor })}

                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Animated.View style={[styles.logoStage, { transform: [{ scale: logoScale }] }]}>
                            <LinearGradient
                                colors={theme.background}
                                style={[styles.logoRing, { shadowColor: theme.primary }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={[styles.logoInner, { backgroundColor: theme.background[0] }]}>
                                    <GamepadIcon size={72} color={theme.text} />
                                </View>
                            </LinearGradient>
                            <Animated.View
                                style={[
                                    styles.logoAura,
                                    {
                                        borderColor: theme.primary,
                                        transform: [{ scale: floatingAnims[0].interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
                                        opacity: floatingAnims[0].interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] })
                                    }
                                ]}
                            />
                        </Animated.View>

                        <View style={styles.titleContainer}>
                            <Text style={[styles.titleShadow, { color: theme.primary }]}>PULSE</Text>
                            <Text style={[styles.titleMain, { color: theme.text }]}>PULSE</Text>
                        </View>
                        <Text style={[styles.titleSub, { color: theme.primary }]}>TAPFLOW</Text>

                        <View style={styles.badgeRow}>
                            <View style={[styles.miniBadge, { backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30` }]}>
                                <SparklesIcon size={12} color={theme.primary} />
                                <Text style={[styles.miniBadgeText, { color: theme.primary }]}>ULTIMATE EDITION</Text>
                            </View>
                        </View>
                    </View>

                    {/* Login Card */}
                    <View style={[styles.glassCard, { borderColor: `${theme.text}20` }]}>
                        <LinearGradient
                            colors={[`${theme.text}10`, `${theme.text}03`]}
                            style={styles.cardInner}
                        >
                            <Text style={[styles.welcomeText, { color: theme.text }]}>MASTER YOUR REFLEXES</Text>
                            <Text style={[styles.descriptionText, { color: theme.subText }]}>
                                Join over 50,000 players globally in the ultimate test of rhythm and precision.
                            </Text>

                            {/* Login Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    onPress={() => promptAsync()}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                    style={[styles.mainAuthBtn, { shadowColor: theme.text }]}
                                >
                                    <LinearGradient
                                        colors={[theme.text, `${theme.text}dd`]}
                                        style={styles.btnGradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color={theme.background[0]} />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <View style={[styles.googleIconCircle, { backgroundColor: theme.background[0] }]}>
                                                    <Text style={[styles.googleLetter, { color: theme.text }]}>G</Text>
                                                </View>
                                                <Text style={[styles.btnText, { color: theme.background[0] }]}>SIGN IN WITH GOOGLE</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => loginAsGuestMode()}
                                    style={[styles.guestBtn, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}40` }]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.guestBtnText, { color: theme.primary }]}>CONTINUE AS GUEST</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Ticker/Stats Row */}
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <TrophyIcon size={16} color={theme.primary} />
                                    <Text style={[styles.statText, { color: theme.subText }]}>GLOBAL RANKS</Text>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: `${theme.text}20` }]} />
                                <View style={styles.statItem}>
                                    <TargetIcon size={16} color={theme.primary} />
                                    <Text style={[styles.statText, { color: theme.subText }]}>DAILY QUESTS</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    <Text style={styles.footerText}>
                        BY CONTINUING, YOU AGREE TO OUR TERMS & PRIVACY
                    </Text>
                </Animated.View>
            </View>
        </ThemeBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    floatingShape: {
        position: 'absolute',
        zIndex: -1,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoStage: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoRing: {
        width: 110,
        height: 110,
        borderRadius: 55,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    logoInner: {
        width: '100%',
        height: '100%',
        borderRadius: 52,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoAura: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: '#22d3ee',
        zIndex: -1,
    },
    titleContainer: {
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleMain: {
        fontSize: 72,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -2,
        position: 'absolute',
    },
    titleShadow: {
        fontSize: 72,
        fontWeight: '900',
        color: '#22d3ee',
        letterSpacing: -2,
        opacity: 0.3,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    titleSub: {
        fontSize: 24,
        fontWeight: '200',
        color: '#22d3ee',
        letterSpacing: 16,
        marginTop: 10,
        marginLeft: 16,
    },
    badgeRow: {
        marginTop: 20,
    },
    miniBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        gap: 8,
    },
    miniBadgeText: {
        fontSize: 10,
        color: '#22d3ee',
        fontWeight: '900',
        letterSpacing: 2,
    },
    glassCard: {
        width: '100%',
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 30 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 20,
    },
    cardInner: {
        padding: 40,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 3,
        marginBottom: 16,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 32,
    },
    mainAuthBtn: {
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    googleIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleLetter: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    btnText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: 1,
    },
    guestBtn: {
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
    },
    guestBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#22d3ee',
        letterSpacing: 1.5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '800',
        letterSpacing: 1,
    },
    statDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerText: {
        marginTop: 40,
        fontSize: 10,
        color: 'rgba(148, 163, 184, 0.5)',
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default LoginScreen;

