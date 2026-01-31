import { NativeModules } from 'react-native';
import StorageService from '../services/StorageService';

// Safely access Ads package only if native module exists
let InterstitialAd = null;
let AdEventType = {};

try {
    // Check for a known property of the ads module to see if it's available
    // react-native-google-mobile-ads usually registers RNGoogleMobileAdsModule
    if (NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAdsInterstitialModule) {
        const AdsPkg = require('react-native-google-mobile-ads');
        InterstitialAd = AdsPkg.InterstitialAd;
        AdEventType = AdsPkg.AdEventType;
    }
} catch (e) {
    console.log('Ads package or native module not found');
}

// Production Ad Unit ID from AdMob
const AD_UNIT_ID = 'ca-app-pub-1000922196781752/8993145888';

class AdManager {
    constructor() {
        this.interstitial = null;
        this.loaded = false;
    }

    init() {
        if (!InterstitialAd) return;

        if (!this.interstitial) {
            try {
                this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
                    requestNonPersonalizedAdsOnly: true,
                });

                this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
                    this.loaded = true;
                });

                this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    this.loaded = false;
                    this.interstitial.load();
                });

                this.interstitial.load();
            } catch (e) {
                console.log('Fixed Ad initialization error:', e.message);
            }
        }
    }

    async showAd() {
        const isPremium = await StorageService.isPremium();
        if (isPremium) {
            console.log('User is Premium. Skipping ad.');
            return;
        }

        if (this.loaded && this.interstitial) {
            try {
                this.interstitial.show();
            } catch (e) {
                console.log('Error showing ad:', e.message);
            }
        } else {
            console.log('Ad not loaded yet or not available in this environment');
            if (this.interstitial) {
                this.interstitial.load();
            }
        }
    }
}

const adManager = new AdManager();
export default adManager;
