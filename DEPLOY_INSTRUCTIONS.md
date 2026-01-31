# Deploying Pulse Tap to Google Play Store

## 1. App Configuration (Completed)
I have already configured your app with the following settings:
- **Package Name**: `com.pulsetap.game`
- **Version Code**: 1 (Play Store requirement)
- **Ads**: Set to **Test Mode** (Safe for deployment/testing without account bans).
- **Privacy Policy**: Updated to your email.

### 1.5. ⚠️ ACTION REQUIRED: AdMob Setup
I have removed all Test IDs as requested. To serve real ads, **you must**:
1. Go to [Apps.AdMob.com](https://apps.admob.com).
2. Create an App and an Interstitial Ad Unit.
3. Open `app.json` and replace `ca-app-pub-0000000000000000~0000000000` with your **App ID**.
4. Open `src/utils/AdManager.js` and replace `ca-app-pub-0000000000000000/0000000000` with your **Ad Unit ID**.
> If you skip this, ads will **not load**.

## 2. Generate the Android App Bundle (AAB)
To upload to the Play Store, you need an `.aab` file.
Run this command in your terminal:

```bash
eas build --platform android
```

If asked, choose **"production"** or **"release"** build.
Log in to your Expo account if prompted.

### ⚠️ CRITICAL: Fix Google Sign-In
When you create a production build, your app gets a **new digital signature (SHA-1)**. You must update Firebase for Google Sign-In to work.

1.  After the build finishes, EAS will show a "**SHA-1 Fingerprint**" for the build. Copy it.
2.  Go to [Firebase Console](https://console.firebase.google.com/).
3.  Open Project Settings -> Your Android App.
4.  **Add** the new SHA-1 fingerprint there.
5.  *Optional but recommended*: Download the new `google-services.json` and replace the one in your project folder, though usually just adding the fingerprint on the website is enough.

## 3. Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Create a new app ("Pulse Tap").
3. Go to **Production** (or **Internal Testing** for a test run).
4. Create a new release and upload the `.aab` file generated in step 2.
5. Fill out the store listing (screenshots, description).

## 4. Important Notes
- **Ads**: Currently, the app shows **Test Ads**. This is required until your store listing is live. Once live, replace the IDs in `AdManager.js` and `app.json` with your real IDs from AdMob to earn revenue.
- **Signing**: EAS will handle the digital signature (Keystore) for you automatically.
