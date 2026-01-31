import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
    Linking,
    Platform,
    Share,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StorageService from '../services/StorageService';
import PaymentService from '../services/PaymentService';
import { SparklesIcon, ShieldCheckIcon, ExitIcon, CopyIcon, CheckIcon, AlertIcon } from './GameIcons';

const { width, height } = Dimensions.get('window');

const PaymentModal = ({ visible, onClose, theme, upiId, amount, qrImage, onSuccess }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const [verificationStep, setVerificationStep] = useState('initial'); // initial, input, verifying, success, error
    const [utr, setUtr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (visible) {
            setVerificationStep('initial');
            setUtr('');
            setErrorMessage('');
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const handlePayWithUPI = (app) => {
        const upiUrl = `upi://pay?pa=${upiId}&pn=Pulseflow%20Premium&am=${amount}&cu=INR&tn=Premium%20Pass`;

        let targetUrl = upiUrl;
        if (app === 'phonepay') {
            targetUrl = `phonepe://pay?pa=${upiId}&pn=Pulseflow%20Premium&am=${amount}&cu=INR&tn=Premium%20Pass`;
        } else if (app === 'gpay') {
            targetUrl = `tez://upi/pay?pa=${upiId}&pn=Pulseflow%20Premium&am=${amount}&cu=INR&tn=Premium%20Pass`;
        }

        Linking.canOpenURL(targetUrl).then(supported => {
            if (supported) {
                Linking.openURL(targetUrl);
            } else {
                Linking.openURL(upiUrl).catch(() => {
                    alert('Please install a UPI app to pay.');
                });
            }
        });
    };

    const handleShareUPI = async () => {
        try {
            await Share.share({
                message: `Pay ₹${amount} to ${upiId} for Pulseflow Premium Pass!`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleVerify = async () => {
        if (utr.length < 12) {
            Alert.alert("Invalid UTR", "Please enter a valid 12-digit UPI Transaction ID (UTR).");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            // Verify with real database service
            const result = await PaymentService.verifyTransaction(utr);

            if (result.valid) {
                setVerificationStep('success');
                // Activate Premium via Service
                await StorageService.setPremium(true, 1);

                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }, 1500);
            } else {
                setVerificationStep('error');
                setErrorMessage(result.message || 'Transaction not found.');
            }
        } catch (e) {
            setVerificationStep('error');
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContactSupport = () => {
        const subject = `Payment Issue - Pulseflow Premium - UTR: ${utr}`;
        const body = `Hello Support Team,\n\nI have paid for the Premium Pass but my transaction was not found.\n\nUTR: ${utr}\nAmount: ₹${amount}\nDate: ${new Date().toLocaleDateString()}\n\n[PLEASE ATTACH PAYMENT SCREENSHOT HERE]\n\nThank you.`;
        const mailUrl = `mailto:diyorajenil23@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailUrl).catch(() => {
            Alert.alert("Error", "Could not open email client. Please email diyorajenil23@gmail.com manually.");
        });
    };

    const renderVerificationContent = () => {
        if (verificationStep === 'initial') {
            return (
                <View style={{ width: '100%' }}>
                    <Text style={[styles.helperText, { color: theme.subText }]}>
                        After paying, tap below to verify:
                    </Text>
                    <TouchableOpacity
                        style={[styles.verifyBtn, { borderColor: theme.primary }]}
                        onPress={() => setVerificationStep('input')}
                    >
                        <Text style={[styles.verifyBtnText, { color: theme.primary }]}>I HAVE PAID (VERIFY)</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (verificationStep === 'input' || verificationStep === 'error') {
            return (
                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.subText }]}>ENTER UPI REF ID / UTR:</Text>
                    <TextInput
                        style={[styles.utrInput, { borderColor: verificationStep === 'error' ? '#ef4444' : theme.primary, color: theme.text }]}
                        placeholder="12-digit Transaction ID"
                        placeholderTextColor={theme.subText}
                        value={utr}
                        onChangeText={setUtr}
                        keyboardType="numeric"
                        maxLength={12}
                    />

                    {verificationStep === 'error' && (
                        <View style={styles.errorBox}>
                            <AlertIcon size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.submitBtnText}>VERIFY PAYMENT</Text>
                        )}
                    </TouchableOpacity>

                    {verificationStep === 'error' && (
                        <TouchableOpacity onPress={handleContactSupport} style={styles.supportLink}>
                            <Text style={[styles.supportLinkText, { color: theme.subText }]}>Paid but not verified? <Text style={{ color: theme.primary, textDecorationLine: 'underline' }}>Contact Support</Text></Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        if (verificationStep === 'success') {
            return (
                <View style={styles.successContainer}>
                    <View style={styles.successIconBox}>
                        <CheckIcon size={32} color="#fff" />
                    </View>
                    <Text style={[styles.successText, { color: theme.text }]}>PAYMENT VERIFIED</Text>
                </View>
            );
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <Animated.View style={[styles.background, { opacity: opacityAnim }]} />
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim
                        }
                    ]}
                >
                    <LinearGradient
                        colors={[theme?.background?.[0] || '#000000', '#1a1a2e']}
                        style={styles.content}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleRow}>
                                <ShieldCheckIcon size={24} color={theme.primary} />
                                <Text style={[styles.title, { color: theme.text }]}>PREMIUM ACTIVATION</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <ExitIcon size={24} color={theme.subText} />
                            </TouchableOpacity>
                        </View>

                        {/* QR Section */}
                        <View style={styles.qrContainer}>
                            <View style={styles.qrWrapper}>
                                <Image
                                    source={qrImage}
                                    style={styles.qrImage}
                                    resizeMode="contain"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                                    style={styles.qrOverlay}
                                />
                                <View style={styles.qrBadge}>
                                    <Text style={styles.qrBadgeText}>SCAN & PAY</Text>
                                </View>
                            </View>
                            <Text style={[styles.amountText, { color: theme.text }]}>₹{amount}</Text>
                            <TouchableOpacity
                                style={styles.upiIdContainer}
                                onPress={handleShareUPI}
                            >
                                <CopyIcon size={14} color={theme.subText} />
                                <Text style={[styles.upiIdText, { color: theme.subText }]}>{upiId}</Text>
                                <SparklesIcon size={14} color={theme.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Payment Options */}
                        <View style={styles.optionsContainer}>
                            {verificationStep === 'initial' && (
                                <>
                                    <Text style={[styles.optionTitle, { color: theme.subText }]}>QUICK PAY WITH</Text>
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={[styles.payBtn, { backgroundColor: '#5f259f' }]}
                                            onPress={() => handlePayWithUPI('phonepay')}
                                        >
                                            <Text style={styles.payBtnText}>PhonePe</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.payBtn, { backgroundColor: '#1a73e8' }]}
                                            onPress={() => handlePayWithUPI('gpay')}
                                        >
                                            <Text style={styles.payBtnText}>GPay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {renderVerificationContent()}
                        </View>

                        {/* Footer Info */}
                        <View style={styles.footer}>
                            <SparklesIcon size={12} color={theme.primary} />
                            <Text style={[styles.footerText, { color: theme.subText }]}>
                                {verificationStep === 'initial' ? 'Instant activation after verification' : 'Secure Verification Protocol'}
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    modalContainer: {
        width: width * 0.9,
        maxHeight: height * 0.85,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    closeBtn: {
        padding: 4,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    qrWrapper: {
        width: width * 0.55,
        height: width * 0.55,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    qrImage: {
        width: '100%',
        height: '100%',
    },
    qrOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    qrBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#22c55e',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    qrBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '900',
    },
    amountText: {
        fontSize: 36,
        fontWeight: '900',
        marginBottom: 8,
    },
    upiIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    upiIdText: {
        fontSize: 14,
        fontWeight: '600',
    },
    optionsContainer: {
        gap: 16,
    },
    optionTitle: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    payBtn: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    payBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
    },
    verifyBtn: {
        height: 54,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    verifyBtnText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
    inputContainer: {
        gap: 12,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    utrInput: {
        height: 54,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    submitBtn: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    successIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#22c55e',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successText: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
    },
    footerText: {
        fontSize: 11,
        fontWeight: '600',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    },
    supportLink: {
        marginTop: 8,
        alignItems: 'center',
    },
    supportLinkText: {
        fontSize: 11,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        opacity: 0.8,
    }
});

export default PaymentModal;
