import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../services/AuthService';
import StorageService from '../services/StorageService';
import LeaderboardService from '../services/LeaderboardService';
import ThemeBackground from '../components/ThemeBackground';
import { getThemeById } from '../data/themes';
import { useAppTheme } from '../utils/themeHook';
import { UserIcon, CheckIcon } from '../components/GameIcons';

const { width, height } = Dimensions.get('window');

const UsernameScreen = ({ onComplete }) => {
    const { user } = useAuth();
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);

    const { theme } = useAppTheme();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleUsernameChange = (text) => {
        // Remove spaces and special characters, limit length
        const cleaned = text.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
        setUsername(cleaned);
        setError('');
        setIsValid(false);
    };

    const checkUniqueness = async () => {
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setIsChecking(true);
        setError('');

        try {
            const isUnique = await LeaderboardService.isUsernameUnique(username);
            if (isUnique) {
                setIsValid(true);
            } else {
                setError('Username is already taken');
            }
        } catch (err) {
            console.error(err);
            setError('Error checking username. Try again.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleConfirm = async () => {
        if (!isValid) return;

        setIsChecking(true);
        try {
            // Save to local storage
            await StorageService.saveUserName(username);
            // Save to Firestore
            await LeaderboardService.updateUsername(user.uid, username);

            if (onComplete) {
                onComplete(username);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to save username. Try again.');
            setIsChecking(false);
        }
    };

    return (
        <ThemeBackground theme={theme}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30` }]}>
                            <UserIcon size={40} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>CHOOSE IDENTITY</Text>
                        <Text style={[styles.subtitle, { color: theme.subText }]}>Your username will be visible on the global leaderboard.</Text>
                    </View>

                    <View style={[styles.glassCard, { borderColor: `${theme.text}10` }]}>
                        <LinearGradient
                            colors={[`${theme.text}10`, `${theme.text}05`]}
                            style={styles.cardInner}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { color: theme.text, backgroundColor: `${theme.background[0]}80`, borderColor: `${theme.text}10` },
                                        error ? styles.inputError : (isValid ? styles.inputValid : null)
                                    ]}
                                    placeholder="Enter username..."
                                    placeholderTextColor={`${theme.subText}50`}
                                    value={username}
                                    onChangeText={handleUsernameChange}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {isValid && (
                                    <View style={styles.checkIcon}>
                                        <CheckIcon size={20} color="#10b981" />
                                    </View>
                                )}
                            </View>

                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            {!isValid ? (
                                <TouchableOpacity
                                    onPress={checkUniqueness}
                                    disabled={username.length < 3 || isChecking}
                                    activeOpacity={0.8}
                                    style={[styles.actionBtn, (username.length < 3 || isChecking) && styles.btnDisabled]}
                                >
                                    <LinearGradient
                                        colors={[theme.primary, theme.ringColor]}
                                        style={styles.btnGradient}
                                    >
                                        {isChecking ? (
                                            <ActivityIndicator color={theme.background[0]} />
                                        ) : (
                                            <Text style={[styles.btnText, { color: theme.background[0] }]}>CHECK AVAILABILITY</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={isChecking}
                                    activeOpacity={0.8}
                                    style={styles.actionBtn}
                                >
                                    <LinearGradient
                                        colors={['#10b981', '#059669']}
                                        style={styles.btnGradient}
                                    >
                                        {isChecking ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.btnText}>CONFIRM USERNAME</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </View>

                    <View style={styles.tipContainer}>
                        <Text style={[styles.tipText, { color: theme.subText }]}>Tip: Use underscores or numbers to make it unique.</Text>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </ThemeBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    glassCard: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardInner: {
        padding: 30,
    },
    inputContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 12,
    },
    input: {
        height: 60,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 15,
        paddingHorizontal: 20,
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    inputValid: {
        borderColor: '#10b981',
    },
    checkIcon: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    actionBtn: {
        height: 60,
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 10,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    tipContainer: {
        marginTop: 32,
    },
    tipText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
});

export default UsernameScreen;
