# Android TWA Deployment Guide

## Overview
This guide covers deploying AniGuide to the Google Play Store using Trusted Web Activity (TWA) technology. All compatibility issues have been resolved.

## Prerequisites
- Node.js and npm installed
- Android Studio (optional, for testing)
- Google Play Console account
- Production deployment at https://aniguide.onrender.com/

## Step 1: Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

## Step 2: Initialize TWA Project
```bash
bubblewrap init --manifest https://aniguide.onrender.com/manifest.json
```

This command should now complete successfully without the previous "Only HTTP(S) protocols supported" error.

**Important**: Ensure the generated TWA uses the package name `com.onrender.aniguide.twa` to match the digital asset links configuration.

## Step 3: Build Android APK
```bash
cd aniguide-twa
bubblewrap build
```

## Step 4: Generate Signed APK
```bash
bubblewrap build --release
```

## Resolved Issues

### ✅ Data URL Compatibility
- **Problem**: Android TWA cannot fetch resources from data: URLs
- **Solution**: Replaced all data: URLs in manifest.json with real file paths
- **Files Created**: 
  - `/icons/trending.svg`
  - `/icons/search.svg` 
  - `/icons/popular.svg`
  - `/screenshots/mobile-discover.png`
  - `/screenshots/desktop-browse.png`

### ✅ Service Worker Interference
- **Problem**: Service worker blocking external anime images
- **Solution**: Updated service worker to only handle internal app resources
- **Result**: Anime images load directly from AniList without interference

### ✅ PWA Manifest Validation
- **Problem**: Invalid protocol handlers causing HTTPS errors
- **Solution**: Removed problematic protocol handlers from manifest
- **Result**: Clean PWA Builder validation for Google Play

## App Configuration

### Digital Asset Links
The digital asset links are already configured in `/public/.well-known/assetlinks.json`:
- **Package Name**: `com.onrender.aniguide.twa`
- **SHA256 Fingerprint**: `BF:F9:53:59:F7:A1:31:9C:8E:F0:54:11:E0:59:74:FB:44:8E:05:49:8B:01:E6:B7:7E:45:76:37:53:34:E4:AF`
- **Relation**: `delegate_permission/common.handle_all_urls`

This file verifies the relationship between your domain and Android app, enabling deep linking and app verification.

### App Details
- **Name**: AniGuide
- **Package**: Will be generated based on domain
- **Theme Color**: #9C0D38 (Claret)
- **Background Color**: #06070E (Black)
- **Display Mode**: Standalone with window controls overlay

## Testing
1. Install the generated APK on an Android device
2. Verify all anime images load properly
3. Test offline functionality
4. Confirm PWA features work correctly

## Google Play Store Submission
1. Create app listing in Google Play Console
2. Upload the signed APK or AAB
3. Complete store listing with screenshots and descriptions
4. Submit for review

## Troubleshooting

### If bubblewrap init fails:
- Verify the manifest URL is accessible
- Check that all icon and screenshot files exist
- Ensure HTTPS is properly configured

### If images don't load in TWA:
- Verify service worker isn't interfering
- Check network requests in Android DevTools
- Confirm AniList API is accessible

## Success Criteria
- ✅ bubblewrap init completes without errors
- ✅ Android APK builds successfully
- ✅ All anime images display properly in TWA
- ✅ Offline functionality works as expected
- ✅ PWA features maintain full functionality