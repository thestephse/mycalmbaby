# My Calm Baby - App Store Publishing Checklist

## App Store Submission Checklist

### Apple Developer Account

- [x] Active Apple Developer Program Membership ($99/year)
- [x] App Store Connect account setup
- [x] Team members added with appropriate roles (if applicable)

### App Configuration

- [x] App Icon Set (1024x1024 for App Store, plus all required sizes)
- [x] Launch Screen customized
- [x] App Display Name set to "My Calm Baby" in app.json
- [x] Bundle Identifier set (e.g., com.yourdomain.mycalmbaby)
- [x] Version Number set (e.g., 1.0.0)
- [x] Build Number set (e.g., 1)

### App Store Listing Materials

- [ ] Screenshots for all required device sizes (iPhone, iPad if supported)
  - iPhone 6.5" Display (1242 x 2688 px)
  - iPhone 5.5" Display (1242 x 2208 px)
  - iPad Pro 12.9" Display (2048 x 2732 px) - if iPad supported
- [ ] App Preview Videos (optional but recommended)
- [ ] App Description (see below)
- [ ] Keywords (see below)
- [ ] Support URL (see below)
- [ ] Privacy Policy URL (see below)
- [ ] Marketing Opt-In URL (optional)
- [ ] Promotional Text (see below)

### Technical Requirements

- [ ] Privacy Policy document created
- [ ] App Tracking Transparency implementation (if tracking users)
- [ ] Data Collection Practices declared in App Store Connect
- [ ] Export Compliance documentation (for encryption)
- [ ] Content Rights documentation (if using licensed content)

### Build Process

- [ ] app.json updated with iOS-specific configurations
- [ ] All app assets optimized and included
- [ ] Test build created and tested on actual devices
- [ ] Production build created using EAS Build
- [ ] TestFlight testing completed (recommended)

### App Store Review Guidelines Compliance

- [ ] Content Rating appropriately set
- [ ] App performance verified (no crashes, acceptable load times)
- [ ] All functionality works as described
- [ ] Design meets Apple's Human Interface Guidelines
- [ ] Legal compliance verified

### App-Specific Requirements

- [ ] Audio Background Mode properly configured
- [ ] In-App Purchases set up (if applicable)
- [ ] Sleep Timer functionality tested in background mode
- [ ] Accessibility features implemented

## App Store Copy

### App Information

**App Name:**
My Calm Baby

**Subtitle (30 characters max):**
Soothe your baby with gentle noise

**Category:**
Primary: Lifestyle
Secondary: Health & Fitness

**Age Rating:**
4+ (No objectionable content)

### App Description

**Full Description:**

```
My Calm Baby helps parents and caregivers soothe their little ones with gentle white noise and calming visual patterns. Perfect for naptime, bedtime, or anytime your baby needs comfort.

FEATURES:
• Smooth, gentle white noise generation without harsh sounds or clicks
• Beautiful, hypnotic visual animations to captivate and calm your baby
• Customizable sleep timer (15, 30, or 60 minutes)
• Simple, intuitive interface designed for one-handed use during late nights
• Background audio playback so you can use other apps while the sound continues
• No ads or interruptions to disturb your baby's peaceful state

BENEFITS:
• Helps babies fall asleep faster and stay asleep longer
• Creates a consistent sleep environment at home or on the go
• Masks household noises that might wake your baby
• Establishes healthy sleep associations and routines
• Provides comfort during fussy periods or colic episodes

My Calm Baby was designed by parents who understand the challenges of soothing a restless infant. Our scientifically-tuned white noise is specially crafted to be gentle on developing ears while effectively calming your baby.

Download My Calm Baby today and discover the peaceful moments that await both you and your little one.
```

### Keywords (100 characters max):

```
baby,sleep,white noise,calm,soothe,infant,lullaby,bedtime,nap,relax,sound machine,newborn
```

### URLs

**Support URL:**

```
https://mycalmbaby.app/support
```

**Privacy Policy URL:**

```
https://mycalmbaby.app/privacy
```

### Promotional Text (170 characters max):

```
Soothe your baby to sleep with gentle white noise and calming visuals. Customizable sleep timer, background audio, and no ads or interruptions.
```

### Screenshot Captions:

1. "Gentle white noise soothes your baby to sleep"
2. "Calming visual patterns captivate and relax"
3. "Customizable sleep timer for perfect naps"
4. "Simple, intuitive controls for tired parents"
5. "Works in background while you use other apps"

### App Preview Video Script (30 seconds):

```
[Opening shot: Parent holding baby in darkened nursery]
Introducing My Calm Baby - the gentle way to soothe your little one to sleep.

[Show app interface with animations]
Beautiful visual patterns and smooth white noise work together to calm even the fussiest baby.

[Show timer selection]
Set the perfect sleep duration with our customizable timer.

[Show parent putting phone down while audio continues]
Audio continues in the background, so you can use other apps.

[Final shot: Sleeping baby]
My Calm Baby - peaceful sleep for your little one, and peace of mind for you.
```

## App Store Connect Configuration

### App Information

- App Name: My Calm Baby
- Primary Language: English
- Bundle ID: com.yourdomain.mycalmbaby
- SKU: MYCALMBABY2025
- User Access: Full Access (no restrictions)

### Pricing and Availability

- Price: Free
- Availability: All territories
- Volume Purchase Program: Enabled (optional)

### App Review Information

- Contact Information:
  - First Name: [YOUR FIRST NAME]
  - Last Name: [YOUR LAST NAME]
  - Phone Number: [YOUR PHONE NUMBER]
  - Email Address: [YOUR EMAIL ADDRESS]
- Review Notes:

```
My Calm Baby is a white noise and visual animation app designed to help soothe babies to sleep. The app uses programmatically generated white noise and simple animations. No login is required, and all features are available immediately upon opening the app.
```

- Attachment (optional): Demo video showing app functionality

### Version Release

- Automatic release after approval
- Phased release (recommended): Yes

## Privacy Policy Template

```
# Privacy Policy for My Calm Baby

Last Updated: [CURRENT DATE]

## Introduction

Welcome to My Calm Baby. We respect your privacy and are committed to protecting any personal information that you may provide while using our application. This Privacy Policy explains our practices regarding data collection and usage.

## Information We Don't Collect

My Calm Baby is designed with privacy in mind. We do not collect, store, or transmit any personal information, including but not limited to:

- Names, email addresses, or contact information
- Location data
- Device identifiers
- Usage statistics
- Cookies or tracking information

## Technical Operation

My Calm Baby operates entirely on your device. The app:
- Generates white noise and animations locally on your device
- Stores your preferences (such as timer settings) only on your device using local storage
- Does not connect to any servers or external services
- Does not require internet access to function

## Third-Party Services

My Calm Baby does not integrate with any third-party analytics, advertising, or tracking services.

## Children's Privacy

My Calm Baby is designed for use by parents and caregivers to help soothe babies and young children. The app does not collect any information from any users, regardless of age.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:
[YOUR CONTACT EMAIL]

```

## App.json Configuration Template

```json
{
  "expo": {
    "name": "My Calm Baby",
    "slug": "my-calm-baby",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.mycalmbaby",
      "buildNumber": "1",
      "infoPlist": {
        "UIBackgroundModes": ["audio"],
        "NSMicrophoneUsageDescription": "This app does not use the microphone"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourdomain.mycalmbaby",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Build Commands

### Create Development Build

```bash
eas build --profile development --platform ios
```

### Create Production Build

```bash
eas build --profile production --platform ios
```

### Submit to App Store

```bash
eas submit --platform ios
```
