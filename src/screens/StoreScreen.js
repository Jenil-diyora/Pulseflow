import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    Alert,
    Platform,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemeBackground from '../components/ThemeBackground';
import { getThemeByScore } from '../data/themes';
import StorageService from '../services/StorageService';
import { useAppTheme } from '../utils/themeHook';
import { SparklesIcon, ShieldCheckIcon, TimerIcon, PlayIcon, ExitIcon } from '../components/GameIcons';
import PaymentModal from '../components/PaymentModal';

const { width, height } = Dimensions.get('window');

const StoreScreen = ({ navigation }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [premiumExpiry, setPremiumExpiry] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { theme } = useAppTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const UPI_ID = 'diyorajenil23@oksbi';
    const PREMIUM_PRICE = 30;
    const QR_IMAGE = require('../../assets/payment_qr.png');

    useEffect(() => {
        loadData();
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
        ]).start();
    }, []);

    const loadData = async () => {
        const [premium, expiry] = await Promise.all([
            StorageService.isPremium(),
            StorageService.getPremiumExpiry()
        ]);
        setIsPremium(premium);
        setPremiumExpiry(expiry);
    };

    const handlePurchase = () => {
        setShowPaymentModal(true);
    };



    const handlePaymentSuccess = () => {
        loadData();
        Alert.alert("Premium Activated", "Thank you for your support! Enjoy your ad-free experience.");
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <ThemeBackground theme={theme}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ExitIcon size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>STORE</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={[theme.primary, theme.ringColor]}
                            style={styles.premiumCard}
                        >
                            <View style={styles.sparkleContainer}>
                                <SparklesIcon size={80} color="rgba(255,255,255,0.3)" />
                            </View>

                            <Text style={styles.premiumTitle}>PREMIUM PASS</Text>
                            <Text style={styles.premiumPrice}>₹{PREMIUM_PRICE} <Text style={styles.pricePeriod}>/ MONTH</Text></Text>

                            <View style={styles.benefitList}>
                                <View style={styles.benefitItem}>
                                    <ShieldCheckIcon size={18} color="#fff" />
                                    <Text style={styles.benefitText}>100% Ad-Free Experience</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <SparklesIcon size={18} color="#fff" />
                                    <Text style={styles.benefitText}>Exclusive Premium Badge</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <TimerIcon size={18} color="#fff" />
                                    <Text style={styles.benefitText}>Support the Developer</Text>
                                </View>
                            </View>

                            {isPremium ? (
                                <View style={styles.activeStatusBox}>
                                    <Text style={styles.activeStatusBtnText}>PREMIUM ACTIVE</Text>
                                    <Text style={styles.expiryText}>Expires: {formatDate(premiumExpiry)}</Text>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handlePurchase} style={styles.purchaseBtn}>
                                    <Text style={styles.purchaseBtnText}>UPGRADE NOW</Text>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={[styles.infoTitle, { color: theme.text }]}>Why Go Premium?</Text>
                        <Text style={[styles.infoText, { color: theme.subText }]}>
                            Pulseflow is supported by ads to keep it free for everyone. By upgrading to Premium, you get a clean, uninterrupted experience while helping us build more features!
                        </Text>
                    </View>

                    <View style={styles.stepsSection}>
                        <Text style={[styles.stepsTitle, { color: theme.text }]}>HOW TO GET PREMIUM</Text>
                        <View style={styles.stepsList}>
                            {[
                                "Tap 'UPGRADE NOW' above",
                                "Scan QR Code or connect via UPI",
                                "Complete payment of ₹30",
                                "Enter Transaction ID (UTR) to Verify",
                                "Instant Premium Activation!"
                            ].map((step, index) => (
                                <View key={index} style={styles.stepItem}>
                                    <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={[styles.stepText, { color: theme.subText }]}>{step}</Text>
                                </View>
                            ))}
                        </View>
                    </View>



                </Animated.View>
            </ScrollView>

            <PaymentModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                theme={theme}
                upiId={UPI_ID}
                amount={PREMIUM_PRICE}
                qrImage={QR_IMAGE}
                onSuccess={handlePaymentSuccess}
            />
        </ThemeBackground>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: height * 0.08,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    heroSection: {
        marginBottom: 40,
    },
    premiumCard: {
        borderRadius: 32,
        padding: 32,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    sparkleContainer: {
        position: 'absolute',
        top: -20,
        right: -20,
    },
    premiumTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 2,
        marginBottom: 8,
    },
    premiumPrice: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 24,
    },
    pricePeriod: {
        fontSize: 16,
        opacity: 0.8,
    },
    benefitList: {
        gap: 16,
        marginBottom: 32,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    benefitText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    purchaseBtn: {
        backgroundColor: '#fff',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    purchaseBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    activeStatusBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    activeStatusBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    expiryText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    infoSection: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 32,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 16,
        opacity: 0.6,
    },
    resetButtonText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    stepsSection: {
        marginBottom: 32,
    },
    stepsTitle: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: 'center',
    },
    stepsList: {
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900',
    },
    stepText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    }
});

export default StoreScreen;
