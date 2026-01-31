import React, { createContext, useContext, useEffect, useState } from 'react';
import { NativeModules } from 'react-native';
import { GoogleAuthProvider, signInWithCredential, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import StorageService from './StorageService';

// Safely access GoogleSignin only if the native module exists
let GoogleSignin = null;
let statusCodes = {};
try {
    if (NativeModules.RNGoogleSignin) {
        const GoogleSigninPkg = require('@react-native-google-signin/google-signin');
        GoogleSignin = GoogleSigninPkg.GoogleSignin;
        statusCodes = GoogleSigninPkg.statusCodes;
    }
} catch (e) {
    console.log('GoogleSignin package not found or native module missing');
}

// Create Auth Context
const AuthContext = createContext({
    user: null,
    loading: true,
    signIn: async () => { },
    loginAsGuestMode: () => { },
    logout: () => { },
});

/**
 * Provider Component to wrap the app and share auth state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (GoogleSignin) {
            try {
                GoogleSignin.configure({
                    webClientId: '371341856606-h74v8nulj0g3tblf0nm1h50lhljkhgc9.apps.googleusercontent.com',
                    offlineAccess: true,
                });
            } catch (e) {
                console.log('Google Sign-In configuration failed:', e);
            }
        }
    }, []);

    // Listen for Firebase auth state changes and Guest persistence
    useEffect(() => {
        const checkAuth = async () => {
            // Check if there's a stored guest session
            const isGuestPersisted = await AsyncStorage.getItem('@persist_guest');

            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    // Sync from cloud when logging in/opening app
                    await StorageService.restoreFromCloud(firebaseUser);
                    // Also check if we have any pending offline data to push
                    await StorageService.syncPendingData(firebaseUser);
                } else if (isGuestPersisted === 'true') {
                    loginAsGuestMode(false); // Don't re-save if already loading from storage
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            return unsubscribe;
        };

        let unsub;
        checkAuth().then(u => unsub = u);
        return () => unsub && unsub();
    }, []);

    const signIn = async () => {
        if (!GoogleSignin) {
            console.warn('Google Sign-In is not available in this environment');
            return;
        }

        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken || userInfo.idToken;

            if (!idToken) {
                throw new Error('No ID token found');
            }

            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            // Immediately attempt to restore profile after login
            if (userCredential.user) {
                await StorageService.restoreFromCloud(userCredential.user);
            }
            // Clear guest persistence if they logged in
            await AsyncStorage.removeItem('@persist_guest');

        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Operation (e.g. sign in) is in progress already');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.error('Google Sign-In Error:', error);
            }
        }
    };

    /**
     * Guest Login
     */
    const loginAsGuestMode = async (persist = true) => {
        const guestUser = {
            uid: 'guest-' + 'persisted',
            displayName: 'Guest Player',
            email: null,
            photoURL: null,
            isGuest: true,
        };
        setUser(guestUser);
        if (persist) {
            await AsyncStorage.setItem('@persist_guest', 'true');
        }
        setLoading(false);
    };

    /**
     * Logout
     */
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('@persist_guest');
            if (user?.isGuest) {
                setUser(null);
            } else {
                if (GoogleSignin) {
                    await GoogleSignin.signOut();
                }
                await signOut(auth);
            }
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn, // Exposed function for UI to call
            promptAsync: signIn, // Mapping for backward compatibility if UI uses promptAsync name
            request: null, // Legacy props
            loginAsGuestMode,
            logout: handleLogout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use Auth Context
 */
export const useAuth = () => useContext(AuthContext);

// Export standalone logout for legacy compatibility if needed
export const logout = async () => {
    try {
        if (GoogleSignin) {
            await GoogleSignin.signOut();
        }
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
};
