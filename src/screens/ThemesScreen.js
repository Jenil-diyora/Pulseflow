import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    FlatList,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemeBackground from '../components/ThemeBackground';
import StorageService from '../services/StorageService';
import { THEMES, getThemeById } from '../data/themes';
import { ChevronLeftIcon, GamepadIcon, SparklesIcon, CheckIcon } from '../components/GameIcons';
import { useAppTheme } from '../utils/themeHook';

const { width, height } = Dimensions.get('window');

const ThemeCard = ({ theme, isUnlocked, isSelected, onSelect }) => {
    return (
        <TouchableOpacity
            disabled={!isUnlocked}
            onPress={() => onSelect(theme.id)}
            style={[
                styles.themeCard,
                isSelected && { borderColor: `${theme.primary}60`, backgroundColor: `${theme.primary}10` },
                !isUnlocked && styles.themeCardLocked
            ]}
        >
            <LinearGradient
                colors={theme.background}
                style={styles.themePreview}
            >
                {!isUnlocked && (
                    <View style={styles.lockOverlay}>
                        <GamepadIcon size={24} color={`${theme.text}40`} />
                        <Text style={[styles.unlockScoreText, { color: `${theme.text}60` }]}>{theme.unlockScore} PTS</Text>
                    </View>
                )}
                {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                        <CheckIcon size={16} color={theme.background[0]} />
                    </View>
                )}
            </LinearGradient>
            <View style={styles.themeInfo}>
                <Text style={[styles.themeName, { color: isUnlocked ? theme.text : `${theme.text}40` }]}>
                    {theme.name}
                </Text>
                {isUnlocked && <Text style={[styles.themeStatus, { color: theme.subText }]}>{isSelected ? 'ACTIVE' : 'READY'}</Text>}
            </View>
        </TouchableOpacity>
    );
};

const ThemesScreen = ({ navigation }) => {
    const {
        theme: currentTheme,
        isAutoTheme: autoTheme,
        selectedThemeId,
        refreshTheme
    } = useAppTheme();
    const [unlockedThemes, setUnlockedThemes] = useState(['ocean']);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        loadThemes();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadThemes = async () => {
        const [unlocked, bestScore] = await Promise.all([
            StorageService.getUnlockedThemes(),
            StorageService.getBestScore()
        ]);

        // Combine storage unlocked with score-based unlocked
        const scoreUnlocked = THEMES.filter(t => bestScore >= t.unlockScore && t.unlockScore > 0).map(t => t.id);
        const allUnlocked = Array.from(new Set([...unlocked, ...scoreUnlocked, 'ocean']));

        setUnlockedThemes(allUnlocked);
    };

    const handleSelect = async (id) => {
        await StorageService.saveSelectedTheme(id);

        // If auto mode is on, we disable it when user manually picks a theme
        if (autoTheme) {
            await StorageService.saveAutoTheme(false);
        }

        // This will update the context state and trigger re-render on all screens
        refreshTheme();
    };

    const toggleAutoTheme = async () => {
        const newValue = !autoTheme;
        await StorageService.saveAutoTheme(newValue);
        refreshTheme();
    };

    const handleRandomSelect = async () => {
        if (unlockedThemes.length > 0) {
            const randomIndex = Math.floor(Math.random() * unlockedThemes.length);
            const randomId = unlockedThemes[randomIndex];
            handleSelect(randomId);
        }
    };

    const renderItem = ({ item }) => (
        <ThemeCard
            theme={item}
            isUnlocked={unlockedThemes.includes(item.id)}
            isSelected={currentTheme.id === item.id}
            onSelect={handleSelect}
        />
    );
    return (
        <ThemeBackground theme={currentTheme}>
            <StatusBar barStyle="light-content" />
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: `${currentTheme.text}05`, borderColor: `${currentTheme.text}10` }]}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeftIcon size={24} color={currentTheme.text} />
                    </TouchableOpacity>
                    <View style={styles.titleWrapper}>
                        <Text style={[styles.subtitleText, { color: currentTheme.primary }]}>COLLECTION</Text>
                        <Text style={[styles.titleText, { color: currentTheme.text }]}>THEME GALAXY</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.randomBtn, { backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30` }]}
                        onPress={handleRandomSelect}
                    >
                        <SparklesIcon size={16} color={currentTheme.primary} />
                        <Text style={[styles.randomBtnText, { color: currentTheme.primary }]}>RANDOM</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={THEMES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.headerComponent}>
                            <View style={[styles.infoBox, { backgroundColor: `${currentTheme.primary}10`, borderColor: `${currentTheme.primary}20` }]}>
                                <View style={styles.infoContent}>
                                    <View style={styles.infoTitleRow}>
                                        <SparklesIcon size={20} color={currentTheme.primary} />
                                        <Text style={[styles.infoTitle, { color: currentTheme.text }]}>DYNAMIC THEME</Text>
                                    </View>
                                    <Text style={[styles.infoText, { color: currentTheme.subText }]}>
                                        {autoTheme
                                            ? "SYSTEM ACTIVE: App visual realm syncs with your all-time best score automatically."
                                            : "MANUAL MODE: Choose your visual realm. Best themes still unlock as you progress."}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.autoToggle, { backgroundColor: autoTheme ? currentTheme.primary : `${currentTheme.text}10` }]}
                                    onPress={toggleAutoTheme}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.toggleCircle, {
                                        backgroundColor: autoTheme ? currentTheme.background[0] : currentTheme.subText,
                                        transform: [{ translateX: autoTheme ? 20 : 0 }]
                                    }]} />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.secondaryInfo, { borderColor: `${currentTheme.text}05` }]}>
                                <Text style={[styles.sectionLabel, { color: currentTheme.subText }]}>UNLOCKED REALMS</Text>
                                <TouchableOpacity onPress={handleRandomSelect} style={styles.inlineRandomLink}>
                                    <SparklesIcon size={14} color={currentTheme.primary} />
                                    <Text style={[styles.randomLinkText, { color: currentTheme.primary }]}>SHUFFLE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </Animated.View>
        </ThemeBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height * 0.07,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    randomBtn: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        gap: 8,
    },
    randomBtnText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    titleWrapper: {
        alignItems: 'center',
    },
    subtitleText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#22d3ee',
        letterSpacing: 4,
        marginBottom: 4,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        padding: 20,
        borderRadius: 24,
        marginBottom: 30,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.1)',
    },
    infoContent: {
        flex: 1,
        gap: 6,
    },
    infoTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    infoText: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
    inlineRandomBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    inlineRandomBtnText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    headerComponent: {
        marginBottom: 10,
    },
    autoToggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        padding: 4,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    secondaryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    inlineRandomLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    randomLinkText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    themeCard: {
        flex: 1,
        margin: 8,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    themeCardActive: {
        borderColor: 'rgba(34, 211, 238, 0.4)',
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
    },
    themeCardLocked: {
        opacity: 0.7,
    },
    themePreview: {
        height: 120,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockOverlay: {
        alignItems: 'center',
        gap: 8,
    },
    unlockScoreText: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
    },
    selectedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    themeInfo: {
        padding: 16,
        alignItems: 'center',
    },
    themeName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    themeStatus: {
        fontSize: 9,
        fontWeight: '900',
        color: '#64748b',
        letterSpacing: 1,
    },
});

export default ThemesScreen;
