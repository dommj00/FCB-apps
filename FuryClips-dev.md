# FuryClips Android Mobile App
## Complete Development Specification & Implementation Guide

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Stack](#technical-stack)
3. [Project Architecture](#project-architecture)
4. [Development Environment Setup](#development-environment-setup)
5. [Project Structure](#project-structure)
6. [Feature Specifications](#feature-specifications)
7. [API Specifications](#api-specifications)
8. [Database Schema](#database-schema)
9. [UI/UX Specifications](#ui-ux-specifications)
10. [Development Phases](#development-phases)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Strategy](#deployment-strategy)
13. [Maintenance & Updates](#maintenance-and-updates)

---

## 1. Executive Summary

### 1.1 Project Overview
FuryClips Mobile is an Android application for editing and combining Twitch stream clips with professional features including multi-clip montages, text overlays, meme integration, and direct social media sharing.

### 1.2 Core Objectives
- Provide seamless clip browsing and selection from FuryClips backend
- Enable intuitive video editing with continuous timeline interface
- Support multi-clip montages with professional transitions
- Integrate Giphy meme library for dynamic content
- Export to multiple social platforms (TikTok, Instagram Reels, YouTube Shorts, Facebook)
- Maintain Night Fury brand theme (Black, White, Purple, Green)

### 1.3 Target Platform
- **Primary**: Android 8.0 (API 26) and above
- **Optimal**: Android 11+ (API 30+)
- **Architecture**: ARM64-v8a, armeabi-v7a
- **Future**: iOS version (React Native allows easy port)

### 1.4 Key Differentiators
- Server-side video processing (no device performance constraints)
- Continuous timeline for multi-clip editing (CapCut-inspired)
- Gaming-focused meme library
- Direct Twitch integration
- Professional export presets

---

## 2. Technical Stack

### 2.1 Mobile Framework
**React Native 0.72+**
- Cross-platform capability (future iOS)
- JavaScript/TypeScript development
- Large ecosystem and community
- Native module support
- Hot reloading for faster development

### 2.2 Core Dependencies

#### Video & Media
```json
{
  "react-native-video": "^5.2.1",
  "react-native-fs": "^2.20.0",
  "react-native-share": "^9.4.1",
  "react-native-image-picker": "^5.6.0"
}
```

#### UI & Interaction
```json
{
  "react-native-gesture-handler": "^2.12.0",
  "react-native-reanimated": "^3.3.0",
  "@react-native-community/slider": "^4.4.3",
  "react-native-linear-gradient": "^2.8.1",
  "react-native-svg": "^13.10.0"
}
```

#### Navigation
```json
{
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/stack": "^6.3.17",
  "@react-navigation/bottom-tabs": "^6.5.8",
  "react-native-screens": "^3.22.0",
  "react-native-safe-area-context": "^4.7.1"
}
```

#### State Management
```json
{
  "@reduxjs/toolkit": "^1.9.5",
  "react-redux": "^8.1.1",
  "redux-persist": "^6.0.0"
}
```

#### API & Data
```json
{
  "axios": "^1.4.0",
  "@react-native-firebase/app": "^18.3.0",
  "@react-native-firebase/firestore": "^18.3.0",
  "@react-native-firebase/auth": "^18.3.0",
  "@react-native-firebase/storage": "^18.3.0"
}
```

#### External APIs
```json
{
  "giphy-api": "^2.0.1",
  "@react-native-async-storage/async-storage": "^1.19.1"
}
```

### 2.3 Backend Stack (Existing)
- **Server**: Python FastAPI
- **Video Processing**: FFmpeg with hardware acceleration
- **Database**: Google Firestore
- **Storage**: Google Cloud Storage
- **Authentication**: Firebase Auth
- **Real-time**: WebSockets

### 2.4 Development Tools
```json
{
  "typescript": "^5.1.6",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0",
  "@types/react": "^18.2.14",
  "@types/react-native": "^0.72.2",
  "jest": "^29.6.1",
  "@testing-library/react-native": "^12.2.0"
}
```

---

## 3. Project Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                 FuryClips Mobile App                 │
│                  (React Native)                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │ UI Layer     │  │ State Mgmt   │  │ Services  ││
│  │ (Screens &   │←→│ (Redux)      │←→│ (API,     ││
│  │  Components) │  │              │  │  Storage) ││
│  └──────────────┘  └──────────────┘  └───────────┘│
│         ↕                  ↕                ↕        │
│  ┌──────────────────────────────────────────────┐  │
│  │         Native Modules & Bridges             │  │
│  │  (Video Player, File System, Share, etc.)    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↕
              ┌──────────────────────┐
              │   Internet / APIs    │
              └──────────────────────┘
                         ↕
        ┌────────────────┴────────────────┐
        ↓                                  ↓
┌────────────────┐              ┌──────────────────┐
│  FuryClips     │              │  External APIs   │
│  Backend       │              │  - Giphy         │
│  - FastAPI     │              │  - Firebase      │
│  - FFmpeg      │              │  - Social Media  │
│  - Firestore   │              │                  │
│  - GCS         │              │                  │
└────────────────┘              └──────────────────┘
```

### 3.2 Data Flow Architecture

#### Clip Editing Flow
```
User Action → UI Component → Redux Action → API Service
                                              ↓
                                         Backend Processing
                                         (FFmpeg encoding)
                                              ↓
                                         GCS Upload
                                              ↓
                                    Firestore Update
                                              ↓
Redux State Update ← WebSocket Notification ←┘
         ↓
   UI Re-render
```

#### Multi-Clip Montage Flow
```
1. User selects multiple clips in library
2. App navigates to Montage Editor
3. User arranges clips, adds transitions
4. User adds text/memes per clip
5. User taps Export
6. App sends montage request to backend:
   {
     clip_ids: [...],
     edits: {...},
     transitions: [...],
     platform: "tiktok"
   }
7. Backend processes:
   - Downloads clips from GCS
   - Applies individual edits
   - Combines with transitions
   - Adds overlays
   - Exports for platform
8. Backend uploads to GCS
9. Backend sends WebSocket update
10. App displays download/share options
```

### 3.3 State Management Architecture

```javascript
// Redux Store Structure
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean
  },
  clips: {
    items: Clip[],
    selectedClips: string[],
    loading: boolean,
    filters: {
      status: string,
      resolution: string,
      dateRange: DateRange
    }
  },
  editor: {
    mode: 'single' | 'montage',
    currentClip: Clip | null,
    montageClips: MontageClip[],
    timeline: {
      duration: number,
      currentTime: number,
      isPlaying: boolean
    },
    textOverlays: TextOverlay[],
    memeOverlays: MemeOverlay[],
    transitions: Transition[]
  },
  export: {
    isExporting: boolean,
    progress: number,
    platform: Platform | null,
    result: ExportResult | null
  },
  memes: {
    trending: GIF[],
    searchResults: GIF[],
    categories: MemeCategory[],
    loading: boolean
  }
}
```

---

## 4. Development Environment Setup

### 4.1 Prerequisites

#### Required Software
1. **Node.js**: v18+ LTS
2. **Java Development Kit**: JDK 11 or 17
3. **Android Studio**: Latest stable version
4. **Android SDK**: API Level 26-33
5. **Git**: Latest version
6. **VS Code** or Android Studio for IDE

#### Android Studio Setup
```bash
# Install Android SDK components
- Android SDK Platform 33
- Android SDK Build-Tools 33.0.0
- Android Emulator
- Android SDK Platform-Tools
- Intel x86 Emulator Accelerator (HAXM) or Hypervisor
```

#### Environment Variables
```bash
# ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 4.2 Project Initialization

```bash
# Create new React Native project
npx react-native init FuryClips --template react-native-template-typescript

# Navigate to project
cd FuryClips

# Install dependencies
npm install

# Install pods for iOS (if needed later)
cd ios && pod install && cd ..

# Install core dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install @reduxjs/toolkit react-redux redux-persist
npm install axios
npm install react-native-video
npm install react-native-fs
npm install react-native-share
npm install @react-native-firebase/app @react-native-firebase/firestore
npm install @react-native-firebase/auth @react-native-firebase/storage
npm install @react-native-async-storage/async-storage
npm install react-native-linear-gradient
npm install react-native-svg
npm install @react-native-community/slider

# Development dependencies
npm install --save-dev @types/react-native
npm install --save-dev eslint prettier
npm install --save-dev jest @testing-library/react-native
```

### 4.3 Android Configuration

#### android/build.gradle
```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 26
        compileSdkVersion = 33
        targetSdkVersion = 33
        ndkVersion = "23.1.7779620"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.4.2")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("com.google.gms:google-services:4.3.15")
    }
}
```

#### android/app/build.gradle
```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: "com.google.gms.google-services"

android {
    namespace "com.furyclips"
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.furyclips"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        multiDexEnabled true
    }

    signingConfigs {
        release {
            // Add release signing config
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
    }

    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.facebook.react:react-android"
    implementation "com.facebook.react:react-native:+"
    
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.2.2')
    implementation 'com.google.firebase:firebase-analytics'
    
    // Add other dependencies
}
```

#### android/app/src/main/AndroidManifest.xml
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 4.4 Firebase Setup

#### Download Configuration Files
1. Create Firebase project at console.firebase.google.com
2. Add Android app with package name: `com.furyclips`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

#### Enable Firebase Services
- Authentication (Email/Password, Google Sign-In)
- Firestore Database
- Cloud Storage
- Analytics

---

## 5. Project Structure

```
FuryClips/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/
│   │   ├── build.gradle
│   │   └── google-services.json
│   └── build.gradle
│
├── ios/                        # iOS native code (future)
│
├── src/                        # Source code
│   ├── assets/                 # Static assets
│   │   ├── fonts/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── nightfury-icon.png
│   │   │   └── memes/         # Curated meme assets
│   │   └── animations/
│   │
│   ├── components/            # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── clips/
│   │   │   ├── ClipCard.tsx
│   │   │   ├── ClipGrid.tsx
│   │   │   ├── ClipFilters.tsx
│   │   │   └── ClipCheckbox.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── VideoPreview.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── TimelineClip.tsx
│   │   │   ├── TimelineSeparator.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   ├── TrimHandles.tsx
│   │   │   └── TimelinePlayhead.tsx
│   │   │
│   │   ├── text/
│   │   │   ├── TextEditorPanel.tsx
│   │   │   ├── FontPicker.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── TextOverlay.tsx
│   │   │   └── TextTimeline.tsx
│   │   │
│   │   ├── memes/
│   │   │   ├── MemeLibrary.tsx
│   │   │   ├── GiphySearch.tsx
│   │   │   ├── MemeCategoryGrid.tsx
│   │   │   ├── MemeOverlay.tsx
│   │   │   └── MemeTimeline.tsx
│   │   │
│   │   ├── transitions/
│   │   │   ├── TransitionPicker.tsx
│   │   │   ├── TransitionPreview.tsx
│   │   │   └── TransitionDurationSlider.tsx
│   │   │
│   │   └── export/
│   │       ├── PlatformSelector.tsx
│   │       ├── ExportSettings.tsx
│   │       ├── ExportProgress.tsx
│   │       └── ShareSheet.tsx
│   │
│   ├── screens/               # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── clips/
│   │   │   ├── ClipsLibraryScreen.tsx
│   │   │   └── ClipDetailScreen.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── SingleClipEditorScreen.tsx
│   │   │   ├── MontageEditorScreen.tsx
│   │   │   └── ClipEditModal.tsx
│   │   │
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── navigation/            # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   │
│   ├── store/                 # Redux store
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── clipsSlice.ts
│   │   │   ├── editorSlice.ts
│   │   │   ├── exportSlice.ts
│   │   │   └── memesSlice.ts
│   │   └── middleware/
│   │       └── websocketMiddleware.ts
│   │
│   ├── services/              # API and external services
│   │   ├── api/
│   │   │   ├── client.ts     # Axios configuration
│   │   │   ├── clips.ts      # Clips API calls
│   │   │   ├── montage.ts    # Montage API calls
│   │   │   ├── export.ts     # Export API calls
│   │   │   └── auth.ts       # Auth API calls
│   │   │
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── firestore.ts
│   │   │   └── storage.ts
│   │   │
│   │   ├── giphy/
│   │   │   └── giphyService.ts
│   │   │
│   │   └── storage/
│   │       └── asyncStorage.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── time.ts           # Time formatting
│   │   ├── video.ts          # Video utilities
│   │   ├── validation.ts     # Input validation
│   │   └── constants.ts      # App constants
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useClips.ts
│   │   ├── useEditor.ts
│   │   ├── useVideoPlayer.ts
│   │   └── useWebSocket.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── clip.ts
│   │   ├── montage.ts
│   │   ├── overlay.ts
│   │   ├── transition.ts
│   │   └── export.ts
│   │
│   ├── theme/                 # Styling and theming
│   │   ├── colors.ts         # Night Fury colors
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── styles.ts
│   │
│   └── App.tsx               # Root component
│
├── __tests__/                 # Test files
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── utils/
│
├── .env                       # Environment variables
├── .env.example              # Example env file
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
├── package.json
├── README.md
└── app.json
```

---

## 6. Feature Specifications

### 6.1 Authentication

#### Features
- Email/Password authentication
- Google Sign-In
- Password reset
- Session persistence
- Auto-login

#### User Flow
```
1. App Launch
   ↓
2. Check stored credentials
   ↓
   ├─ Authenticated → Navigate to Clips Library
   └─ Not Authenticated → Show Login Screen
      ↓
      User enters credentials or signs up
      ↓
      Firebase Auth validates
      ↓
      Store token in AsyncStorage
      ↓
      Navigate to Clips Library
```

#### Implementation Details
```typescript
// Auth Service
class AuthService {
  async login(email: string, password: string): Promise<User>
  async signup(email: string, password: string): Promise<User>
  async loginWithGoogle(): Promise<User>
  async logout(): Promise<void>
  async resetPassword(email: string): Promise<void>
  async getCurrentUser(): Promise<User | null>
}

// Redux Actions
- login(credentials)
- signup(credentials)
- logout()
- checkAuthStatus()
- updateProfile(data)
```

### 6.2 Clips Library

#### Features
- Grid view of all user clips
- Thumbnail previews
- Clip metadata display (duration, resolution, date)
- Search functionality
- Filter by status, resolution, date
- Single/Multi-select mode
- Pull-to-refresh
- Infinite scroll pagination

#### UI Components
```typescript
<ClipsLibraryScreen>
  <Header>
    <SearchBar />
    <FilterButton />
  </Header>
  
  <ModeToggle>
    <SingleSelectButton />
    <MultiSelectButton />
  </ModeToggle>
  
  <ClipGrid>
    {clips.map(clip => (
      <ClipCard
        key={clip.id}
        clip={clip}
        selectable={multiSelectMode}
        onPress={handleClipPress}
        onLongPress={handleClipLongPress}
      />
    ))}
  </ClipGrid>
  
  <FloatingActionButton
    visible={selectedClips.length >= 2}
    onPress={createMontage}
  >
    Create Montage ({selectedClips.length})
  </FloatingActionButton>
</ClipsLibraryScreen>
```

#### Data Structure
```typescript
interface Clip {
  id: string;
  channel: string;
  title: string;
  duration: number;
  resolution: '480p' | '720p' | '1080p';
  status: 'ready' | 'processing' | 'failed';
  thumbnailUrl: string;
  downloadUrl: string;
  createdAt: Date;
  streamTitle?: string;
  streamGame?: string;
}
```

### 6.3 Single Clip Editor

#### Features
- Video preview with playback controls
- Timeline with thumbnail filmstrip
- Trim functionality (drag handles)
- Text overlay editor
- Meme overlay editor
- Basic filters (optional Phase 2)
- Speed control (optional Phase 2)
- Export settings

#### UI Layout
```
┌─────────────────────────────────┐
│ [←] Edit: Epic Play        [✓]  │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │   Video Preview         │   │
│   │   (16:9 or 9:16)        │   │
│   └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ [▶] 0:00 ━━●━━━━━━━━━ 2:34    │
├─────────────────────────────────┤
│                                 │
│ ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌  │
│ |◄═══ Selected ═══►|           │
│                                 │
├─────────────────────────────────┤
│ ✂️ 📝 🎨 😎 🎵 📤              │
│ Trim Text Filters Memes Music Export
└─────────────────────────────────┘
```

#### Key Interactions
```typescript
// Trim
- Drag left handle → Update trimStart
- Drag right handle → Update trimEnd
- Playhead stays within trim range
- Preview shows trimmed region

// Text
- Tap Text button → Open text editor panel
- Add text with properties (font, color, size, position)
- Drag on preview to position
- Set start/end time on timeline

// Memes
- Tap Memes button → Open meme library
- Select meme/GIF
- Drag on preview to position
- Pinch to resize
- Rotate gesture to rotate
- Set start/end time on timeline

// Export
- Tap Export → Open platform selector
- Choose platform (TikTok, Instagram, YouTube, Facebook)
- Platform auto-sets aspect ratio and settings
- Tap Export button
- Show progress
- On complete, show share sheet
```

### 6.4 Montage Editor

#### Features
- Continuous timeline showing all selected clips
- Visual separators between clips
- Per-clip editing (trim, text, memes)
- Transition selector at each junction
- Unified playback across all clips
- Global text/memes (span multiple clips)
- Clip reordering (drag to rearrange)
- Add/remove clips mid-montage
- Export presets

#### Timeline Structure
```typescript
interface MontageTimeline {
  clips: MontageClip[];
  totalDuration: number;
  currentTime: number;
  isPlaying: boolean;
}

interface MontageClip {
  id: string;
  originalClipId: string;
  orderIndex: number;
  startTime: number; // Position in montage timeline
  duration: number;
  trimStart: number;
  trimEnd: number;
  textOverlays: TextOverlay[];
  memeOverlays: MemeOverlay[];
  filters?: FilterSettings;
  speedMultiplier?: number;
}

interface Transition {
  fromClipId: string;
  toClipId: string;
  type: 'cut' | 'fade' | 'slide_left' | 'slide_right' | 'zoom' | 'dissolve';
  duration: number; // 0 for cut, 0.5-2.0 for others
}
```

#### Timeline UI Components
```typescript
<MontageTimeline>
  <PlaybackBar
    currentTime={currentTime}
    totalDuration={totalDuration}
    onSeek={handleSeek}
  />
  
  <ClipsTrack>
    {montageClips.map((clip, index) => (
      <>
        <TimelineClip
          key={clip.id}
          clip={clip}
          onSelect={selectClip}
          onTrimStart={updateTrimStart}
          onTrimEnd={updateTrimEnd}
        />
        
        {index < montageClips.length - 1 && (
          <TimelineSeparator
            transition={transitions[index]}
            onChangeTransition={updateTransition}
            onChangeDuration={updateTransitionDuration}
          />
        )}
      </>
    ))}
  </ClipsTrack>
  
  <TextOverlaysTrack>
    {textOverlays.map(text => (
      <TextTimelineItem
        key={text.id}
        overlay={text}
        onUpdateTiming={updateTextTiming}
      />
    ))}
  </TextOverlaysTrack>
  
  <MemeOverlaysTrack>
    {memeOverlays.map(meme => (
      <MemeTimelineItem
        key={meme.id}
        overlay={meme}
        onUpdateTiming={updateMemeTiming}
      />
    ))}
  </MemeOverlaysTrack>
</MontageTimeline>
```

#### Separator Interaction
```typescript
<TimelineSeparator>
  <TouchableOpacity onPress={openTransitionPicker}>
    <View style={styles.separator}>
      <Icon name="transition" color={colors.purple} />
      <Text>{transition.type.toUpperCase()}</Text>
      <Text>{transition.duration}s</Text>
      <Icon name="chevron-down" />
    </View>
  </TouchableOpacity>
</TimelineSeparator>

// When tapped, show picker modal:
<TransitionPickerModal>
  <TransitionOptions>
    {TRANSITION_TYPES.map(type => (
      <TransitionOption
        key={type.id}
        type={type}
        selected={type.id === transition.type}
        onSelect={() => updateTransition(type.id)}
      />
    ))}
  </TransitionOptions>
  
  {transition.type !== 'cut' && (
    <DurationSlider
      value={transition.duration}
      min={0.5}
      max={2.0}
      step={0.1}
      onChange={updateTransitionDuration}
    />
  )}
</TransitionPickerModal>
```

### 6.5 Text Overlay System

#### Features
- Multiple text layers
- Font selection (15+ fonts)
- Font size (12-72pt)
- Text color picker
- Background options (none, solid, gradient)
- Stroke/outline toggle
- Shadow toggle
- Text alignment (left, center, right)
- Position via drag on preview
- Timing controls (start/end time)
- Animation options (fade, slide, typewriter)

#### Data Structure
```typescript
interface TextOverlay {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  position: {
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
  };
  alignment: 'left' | 'center' | 'right';
  background: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
  shadow: {
    enabled: boolean;
    color: string;
    offset: { x: number; y: number };
    blur: number;
  };
  timing: {
    startTime: number;
    endTime: number;
  };
  animation?: {
    type: 'none' | 'fade_in' | 'fade_out' | 'slide_in' | 'typewriter';
    duration: number;
  };
}
```

#### Text Editor UI
```typescript
<TextEditorPanel>
  <TextInput
    placeholder="Enter text..."
    value={text}
    onChange={setText}
    multiline
  />
  
  <FontPicker
    fonts={AVAILABLE_FONTS}
    selected={font}
    onSelect={setFont}
  />
  
  <SizeSlider
    value={fontSize}
    min={12}
    max={72}
    onChange={setFontSize}
  />
  
  <ColorPicker
    color={color}
    onChange={setColor}
    presets={COLOR_PRESETS}
  />
  
  <ToggleGroup>
    <ToggleButton
      label="Background"
      active={background.enabled}
      onToggle={toggleBackground}
    />
    <ToggleButton
      label="Outline"
      active={stroke.enabled}
      onToggle={toggleStroke}
    />
    <ToggleButton
      label="Shadow"
      active={shadow.enabled}
      onToggle={toggleShadow}
    />
  </ToggleGroup>
  
  <TimingControls>
    <TimeInput
      label="Start"
      value={timing.startTime}
      onChange={setStartTime}
    />
    <TimeInput
      label="End"
      value={timing.endTime}
      onChange={setEndTime}
    />
  </TimingControls>
  
  <AnimationPicker
    animation={animation}
    onChange={setAnimation}
  />
  
  <ActionButtons>
    <Button variant="secondary" onPress={cancel}>
      Cancel
    </Button>
    <Button variant="primary" onPress={addText}>
      Add Text
    </Button>
  </ActionButtons>
</TextEditorPanel>
```

### 6.6 Meme/GIF Library

#### Features
- Giphy API integration
- Search functionality
- Trending GIFs
- Curated gaming memes
- Twitch emotes collection
- Categories (Gaming, Reactions, Twitch)
- Favorites system
- Drag to position on video
- Pinch to resize
- Rotate gesture
- Timing controls

#### Data Structure
```typescript
interface MemeOverlay {
  id: string;
  type: 'image' | 'gif';
  url: string;
  position: {
    x: number; // Percentage
    y: number; // Percentage
  };
  size: {
    width: number; // Percentage
    height: number; // Percentage
  };
  rotation: number; // Degrees
  timing: {
    startTime: number;
    endTime: number;
  };
  opacity?: number;
}

interface GiphyGIF {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}
```

#### Giphy Service
```typescript
class GiphyService {
  private apiKey: string = 'YOUR_GIPHY_API_KEY';
  private baseUrl: string = 'https://api.giphy.com/v1';

  async search(query: string, limit: number = 20): Promise<GiphyGIF[]> {
    const response = await fetch(
      `${this.baseUrl}/gifs/search?api_key=${this.apiKey}&q=${query}&limit=${limit}&rating=pg-13`
    );
    const data = await response.json();
    return data.data.map(this.formatGIF);
  }

  async trending(limit: number = 20): Promise<GiphyGIF[]> {
    const response = await fetch(
      `${this.baseUrl}/gifs/trending?api_key=${this.apiKey}&limit=${limit}&rating=pg-13`
    );
    const data = await response.json();
    return data.data.map(this.formatGIF);
  }

  private formatGIF(giphyData: any): GiphyGIF {
    return {
      id: giphyData.id,
      title: giphyData.title,
      url: giphyData.images.original.url,
      previewUrl: giphyData.images.fixed_width.url,
      width: giphyData.images.original.width,
      height: giphyData.images.original.height
    };
  }
}
```

#### Meme Library UI
```typescript
<MemeLibraryModal>
  <Header>
    <SearchBar
      placeholder="Search GIFs..."
      onSearch={handleSearch}
    />
  </Header>
  
  <TabBar>
    <Tab active={tab === 'trending'} onPress={() => setTab('trending')}>
      Trending
    </Tab>
    <Tab active={tab === 'gaming'} onPress={() => setTab('gaming')}>
      Gaming
    </Tab>
    <Tab active={tab === 'twitch'} onPress={() => setTab('twitch')}>
      Twitch
    </Tab>
  </TabBar>
  
  <MemeGrid>
    {memes.map(meme => (
      <MemeCard
        key={meme.id}
        meme={meme}
        onPress={() => selectMeme(meme)}
      />
    ))}
  </MemeGrid>
  
  <Footer>
    Powered by GIPHY
  </Footer>
</MemeLibraryModal>
```

### 6.7 Export & Platform Presets

#### Platform Specifications
```typescript
interface PlatformPreset {
  id: string;
  name: string;
  aspectRatio: '16:9' | '9:16' | '4:5' | '1:1';
  resolution: {
    width: number;
    height: number;
  };
  maxDuration: number; // seconds
  maxFileSize: number; // bytes
  videoCodec: string;
  audioCodec: string;
  bitrate: {
    video: string;
    audio: string;
  };
}

const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    maxDuration: 60,
    maxFileSize: 287 * 1024 * 1024, // 287MB
    videoCodec: 'h264',
    audioCodec: 'aac',
    bitrate: { video: '5000k', audio: '192k' }
  },
  instagram_reels: {
    id: 'instagram_reels',
    name: 'Instagram Reels',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    maxDuration: 90,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    videoCodec: 'h264',
    audioCodec: 'aac',
    bitrate: { video: '5000k', audio: '192k' }
  },
  youtube_shorts: {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    maxDuration: 60,
    maxFileSize: 256 * 1024 * 1024, // 256MB
    videoCodec: 'h264',
    audioCodec: 'aac',
    bitrate: { video: '8000k', audio: '256k' }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    aspectRatio: '16:9',
    resolution: { width: 1280, height: 720 },
    maxDuration: 240,
    maxFileSize: 4096 * 1024 * 1024, // 4GB
    videoCodec: 'h264',
    audioCodec: 'aac',
    bitrate: { video: '4000k', audio: '192k' }
  }
};
```

#### Export Flow
```typescript
// User Flow
1. User finishes editing
2. Taps Export button
3. Platform selector modal appears
4. User selects platform
5. App validates:
   - Duration within limits
   - Aspect ratio correct (or offer letterbox)
6. User confirms export
7. App sends export request to backend
8. Backend processes video
9. Progress updates via WebSocket
10. On complete, show share sheet
11. User shares to selected platform

// Export Request
interface ExportRequest {
  type: 'single' | 'montage';
  clipId?: string; // For single clip
  montage?: MontageData; // For montage
  platform: string;
  settings: {
    aspectRatio: string;
    resolution: { width: number; height: number };
    letterbox: boolean;
    quality: 'low' | 'medium' | 'high';
  };
}

// Progress Updates
interface ExportProgress {
  stage: 'processing' | 'encoding' | 'uploading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
}
```

#### Export UI
```typescript
<ExportModal>
  <PlatformSelector>
    {Object.values(PLATFORM_PRESETS).map(preset => (
      <PlatformCard
        key={preset.id}
        preset={preset}
        selected={selectedPlatform === preset.id}
        onSelect={() => setSelectedPlatform(preset.id)}
      />
    ))}
  </PlatformSelector>
  
  {selectedPlatform && (
    <ExportSettings>
      <AspectRatioInfo>
        Aspect Ratio: {currentPreset.aspectRatio}
      </AspectRatioInfo>
      
      <Toggle
        label="Add letterbox (black bars)"
        value={letterbox}
        onChange={setLetterbox}
      />
      
      <QualitySelector
        value={quality}
        onChange={setQuality}
        options={['Low', 'Medium', 'High']}
      />
      
      <DurationWarning>
        {duration > currentPreset.maxDuration && (
          `Duration exceeds ${currentPreset.name} limit (${currentPreset.maxDuration}s). Clip will be trimmed.`
        )}
      </DurationWarning>
    </ExportSettings>
  )}
  
  <ActionButtons>
    <Button variant="secondary" onPress={cancel}>
      Cancel
    </Button>
    <Button
      variant="primary"
      onPress={startExport}
      disabled={!selectedPlatform}
    >
      Export
    </Button>
  </ActionButtons>
</ExportModal>

// During Export
<ExportProgressModal>
  <ProgressBar progress={progress} />
  <StageIndicator stage={stage} />
  <ProgressText>
    {progressMessage}
  </ProgressText>
  <TimeRemaining>
    {estimatedTime && `Est. ${estimatedTime}s remaining`}
  </TimeRemaining>
</ExportProgressModal>

// After Export
<ExportCompleteModal>
  <SuccessIcon />
  <Title>Export Complete!</Title>
  <PreviewThumbnail src={thumbnailUrl} />
  
  <ActionButtons>
    <Button variant="secondary" onPress={downloadToDevice}>
      Download
    </Button>
    <Button variant="primary" onPress={shareToSocial}>
      Share
    </Button>
  </ActionButtons>
</ExportCompleteModal>
```

#### Native Share Integration
```typescript
import Share from 'react-native-share';

async function shareVideo(videoPath: string, platform?: string) {
  const shareOptions = {
    title: 'Share Video',
    url: `file://${videoPath}`,
    type: 'video/mp4',
    social: platform ? Share.Social[platform.toUpperCase()] : undefined,
    failOnCancel: false
  };

  try {
    const result = await Share.open(shareOptions);
    console.log('Share result:', result);
  } catch (error) {
    console.error('Share error:', error);
  }
}

// Platform-specific sharing
shareVideo(videoPath, 'tiktok');
shareVideo(videoPath, 'instagram');
shareVideo(videoPath, 'facebook');
```

---

## 7. API Specifications

### 7.1 Base Configuration

```typescript
// services/api/client.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://furyclips.ngrok.io';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FuryClipsMobile/1.0',
        'ngrok-skip-browser-warning': '69420'
      }
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - logout user
        }
        return Promise.reject(error);
      }
    );
  }

  get axios() {
    return this.client;
  }
}

export const apiClient = new APIClient().axios;
```

### 7.2 Clips API

```typescript
// services/api/clips.ts
import { apiClient } from './client';

export interface Clip {
  clip_id: string;
  channel: string;
  created_by: string;
  created_at: string;
  duration: number;
  resolution: string;
  direction: string;
  status: string;
  download_url: string;
  thumbnail_path: string;
  stream_title?: string;
  stream_game?: string;
}

export interface ClipsResponse {
  clips: Clip[];
  total: number;
}

class ClipsAPI {
  async getClips(
    channel?: string,
    status?: string,
    limit: number = 50
  ): Promise<ClipsResponse> {
    const params: any = { limit };
    if (channel) params.channel = channel;
    if (status) params.status = status;

    const response = await apiClient.get('/api/clips/', { params });
    return response.data;
  }

  async getClip(clipId: string): Promise<Clip> {
    const response = await apiClient.get(`/api/clips/${clipId}`);
    return response.data;
  }

  async deleteClip(clipId: string): Promise<void> {
    await apiClient.delete(`/api/clips/${clipId}`);
  }

  async bulkDelete(clipIds: string[]): Promise<void> {
    await apiClient.post('/api/clips/bulk-delete', clipIds);
  }

  async getDownloadUrl(clipId: string): Promise<{ url: string }> {
    const response = await apiClient.get(`/api/clips/${clipId}/download`);
    return response.data;
  }
}

export const clipsAPI = new ClipsAPI();
```

### 7.3 Montage API (New Backend Endpoints)

```typescript
// services/api/montage.ts
import { apiClient } from './client';

export interface MontageCreateRequest {
  clips: MontageClipData[];
  transitions: TransitionData[];
  global_overlays?: {
    text: TextOverlay[];
    memes: MemeOverlay[];
  };
  export_settings: ExportSettings;
}

export interface MontageClipData {
  clip_id: string;
  order_index: number;
  trim_start: number;
  trim_end: number;
  text_overlays: TextOverlay[];
  meme_overlays: MemeOverlay[];
  filters?: any;
  speed?: number;
}

export interface TransitionData {
  from_clip_index: number;
  to_clip_index: number;
  type: string;
  duration: number;
}

export interface TextOverlay {
  text: string;
  font: string;
  font_size: number;
  color: string;
  position: { x: number; y: number };
  alignment: string;
  background?: any;
  stroke?: any;
  shadow?: any;
  timing: { start_time: number; end_time: number };
  animation?: any;
}

export interface MemeOverlay {
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  timing: { start_time: number; end_time: number };
  opacity?: number;
}

export interface ExportSettings {
  platform: string;
  aspect_ratio: string;
  resolution: { width: number; height: number };
  letterbox: boolean;
  quality: string;
}

export interface MontageResponse {
  montage_id: string;
  status: 'processing' | 'complete' | 'error';
  progress?: number;
  download_url?: string;
  error_message?: string;
}

class MontageAPI {
  async createMontage(data: MontageCreateRequest): Promise<MontageResponse> {
    const response = await apiClient.post('/api/mobile/montage/create', data);
    return response.data;
  }

  async getMontageStatus(montageId: string): Promise<MontageResponse> {
    const response = await apiClient.get(`/api/mobile/montage/${montageId}/status`);
    return response.data;
  }

  async cancelMontage(montageId: string): Promise<void> {
    await apiClient.delete(`/api/mobile/montage/${montageId}/cancel`);
  }
}

export const montageAPI = new MontageAPI();
```

### 7.4 Single Clip Edit API (New Backend Endpoints)

```typescript
// services/api/edit.ts
import { apiClient } from './client';

export interface ClipEditRequest {
  clip_id: string;
  trim_start?: number;
  trim_end?: number;
  text_overlays?: TextOverlay[];
  meme_overlays?: MemeOverlay[];
  filters?: any;
  speed?: number;
  export_settings: ExportSettings;
}

export interface ClipEditResponse {
  edit_id: string;
  status: 'processing' | 'complete' | 'error';
  progress?: number;
  download_url?: string;
  error_message?: string;
}

class ClipEditAPI {
  async editClip(data: ClipEditRequest): Promise<ClipEditResponse> {
    const response = await apiClient.post('/api/mobile/clips/edit', data);
    return response.data;
  }

  async getEditStatus(editId: string): Promise<ClipEditResponse> {
    const response = await apiClient.get(`/api/mobile/clips/edit/${editId}/status`);
    return response.data;
  }
}

export const clipEditAPI = new ClipEditAPI();
```

### 7.5 WebSocket Connection

```typescript
// services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    const wsUrl = 'wss://furyclips.ngrok.io/ws/queue';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', true);
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
      this.emit(message.type, message.data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.emit('connected', false);
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
```

### 7.6 Backend Endpoints Summary

#### Existing Endpoints (Already Implemented)
```
GET    /api/clips/                    - List clips
GET    /api/clips/{id}                - Get single clip
DELETE /api/clips/{id}                - Delete clip
POST   /api/clips/bulk-delete         - Bulk delete clips
GET    /api/clips/{id}/download       - Get download URL
GET    /api/clips/stats/summary       - Get statistics
GET    /api/bot/status                - Get bot status
POST   /api/bot/start                 - Start bot
POST   /api/bot/stop                  - Stop bot
POST   /api/bot/restart               - Restart bot
WS     /ws/queue                      - WebSocket for queue updates
```

#### New Endpoints (Need Implementation)
```
POST   /api/mobile/clips/edit         - Edit single clip
GET    /api/mobile/clips/edit/{id}/status - Get edit status
POST   /api/mobile/montage/create     - Create montage
GET    /api/mobile/montage/{id}/status - Get montage status
DELETE /api/mobile/montage/{id}/cancel - Cancel montage
POST   /api/mobile/clips/import       - Import video from device
GET    /api/mobile/export/{platform}  - Get platform-specific export settings
```

---

## 8. Database Schema

### 8.1 Firestore Collections

#### clips (Existing)
```typescript
{
  clip_id: string,
  channel: string,
  created_by: string,
  created_at: Timestamp,
  duration: number,
  resolution: string,
  direction: string,
  status: string,
  gcs_path: string,
  thumbnail_path: string,
  download_url: string,
  file_size: number,
  stream_title?: string,
  stream_game?: string,
  error_message?: string
}
```

#### montages (New Collection)
```typescript
{
  montage_id: string,
  user_id: string,
  created_at: Timestamp,
  clips: [
    {
      clip_id: string,
      order_index: number,
      trim_start: number,
      trim_end: number,
      text_overlays: Array,
      meme_overlays: Array,
      filters: Object,
      speed: number
    }
  ],
  transitions: [
    {
      from_clip_index: number,
      to_clip_index: number,
      type: string,
      duration: number
    }
  ],
  global_overlays: {
    text: Array,
    memes: Array
  },
  export_settings: Object,
  status: string, // 'processing' | 'complete' | 'error'
  progress: number,
  gcs_path?: string,
  download_url?: string,
  file_size?: number,
  error_message?: string,
  processing_started_at?: Timestamp,
  processing_completed_at?: Timestamp
}
```

#### clip_edits (New Collection)
```typescript
{
  edit_id: string,
  user_id: string,
  clip_id: string,
  created_at: Timestamp,
  edits: {
    trim_start?: number,
    trim_end?: number,
    text_overlays: Array,
    meme_overlays: Array,
    filters?: Object,
    speed?: number
  },
  export_settings: Object,
  status: string,
  progress: number,
  gcs_path?: string,
  download_url?: string,
  file_size?: number,
  error_message?: string
}
```

#### users (Existing/Enhanced)
```typescript
{
  user_id: string,
  email: string,
  display_name: string,
  created_at: Timestamp,
  preferences: {
    default_resolution: string,
    default_export_platform: string,
    favorite_fonts: Array,
    favorite_memes: Array
  },
  stats: {
    total_clips: number,
    total_montages: number,
    total_exports: number
  }
}
```

### 8.2 Local Storage (AsyncStorage)

```typescript
// Keys used in AsyncStorage
const STORAGE_KEYS = {
  AUTH_TOKEN: '@furyclips:authToken',
  USER_DATA: '@furyclips:userData',
  SELECTED_CLIPS: '@furyclips:selectedClips',
  EDITOR_STATE: '@furyclips:editorState',
  RECENT_FONTS: '@furyclips:recentFonts',
  RECENT_COLORS: '@furyclips:recentColors',
  FAVORITE_MEMES: '@furyclips:favoriteMemes',
  APP_SETTINGS: '@furyclips:appSettings'
};
```

---

## 9. UI/UX Specifications

### 9.1 Night Fury Color Palette

```typescript
// theme/colors.ts
export const colors = {
  // Primary Colors
  purple: '#6366f1',      // Primary actions, buttons, active states
  green: '#10b981',       // Success, processing, live indicators
  white: '#ffffff',       // Text, icons on dark backgrounds
  black: '#0f172a',       // Main background, headers

  // Secondary Colors
  darkGray: '#1e293b',    // Card backgrounds, secondary backgrounds
  mediumGray: '#334155',  // Borders, inactive elements, separators
  lightGray: '#94a3b8',   // Secondary text, placeholders

  // Accent Colors
  purpleBright: '#7c3aed', // Hover states for purple
  purpleDark: '#4f46e5',   // Active/pressed states for purple
  greenBright: '#34d399',  // Hover states for green
  greenDark: '#059669',    // Active/pressed states for green

  // Semantic Colors
  error: '#ef4444',       // Destructive actions, errors
  warning: '#f59e0b',     // Warnings, alerts
  info: '#3b82f6',        // Info states
  success: '#10b981',     // Same as green

  // Transparency
  purpleAlpha10: 'rgba(99, 102, 241, 0.1)',
  purpleAlpha20: 'rgba(99, 102, 241, 0.2)',
  greenAlpha10: 'rgba(16, 185, 129, 0.1)',
  blackAlpha50: 'rgba(15, 23, 42, 0.5)',
  blackAlpha80: 'rgba(15, 23, 42, 0.8)'
};
```

### 9.2 Typography

```typescript
// theme/typography.ts
export const typography = {
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold'
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
};
```

### 9.3 Spacing System

```typescript
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64
};
```

### 9.4 Component Styles

```typescript
// theme/styles.ts
import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from './index';

export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.darkGray
  },
  card: {
    backgroundColor: colors.mediumGray,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: colors.purple,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.semiBold
  },

  // Text
  heading1: {
    fontSize: typography.sizes['4xl'],
    fontFamily: typography.fonts.bold,
    color: colors.white,
    marginBottom: spacing.md
  },
  heading2: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.bold,
    color: colors.white,
    marginBottom: spacing.sm
  },
  heading3: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.semiBold,
    color: colors.white,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    color: colors.white,
    lineHeight: typography.sizes.base * typography.lineHeights.normal
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.lightGray
  },

  // Inputs
  input: {
    backgroundColor: colors.mediumGray,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.white,
    fontSize: typography.sizes.base
  },
  inputFocused: {
    borderColor: colors.purple
  },

  // Shadows
  shadowSm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  shadowMd: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  shadowLg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  }
});
```

### 9.5 Animation Configurations

```typescript
// theme/animations.ts
import { Easing } from 'react-native-reanimated';

export const animations = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    ease: Easing.ease,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),
    bounce: Easing.bounce
  },
  spring: {
    damping: 15,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01
  }
};
```

---

## 10. Development Phases

### Phase 1: Foundation (Weeks 1-3)

#### Week 1: Project Setup
- [ ] Initialize React Native project with TypeScript
- [ ] Set up development environment
- [ ] Configure Android build settings
- [ ] Install and configure core dependencies
- [ ] Set up Firebase (Firestore, Auth, Storage)
- [ ] Configure Giphy API access
- [ ] Create basic project structure (folders, files)
- [ ] Set up Git repository and version control
- [ ] Configure ESLint and Prettier
- [ ] Set up Redux store with basic slices

**Deliverables:**
- Working development environment
- App launches on Android emulator/device
- Basic navigation structure
- Redux store configured

#### Week 2: Authentication & Navigation
- [ ] Implement Firebase Authentication
- [ ] Create Login screen
- [ ] Create Signup screen
- [ ] Create Forgot Password screen
- [ ] Implement Google Sign-In
- [ ] Set up navigation structure (Auth & Main navigators)
- [ ] Implement session persistence
- [ ] Create splash screen with auto-login
- [ ] Style auth screens with Night Fury theme

**Deliverables:**
- Complete authentication flow
- Session management working
- User can sign up, log in, and log out
- Smooth navigation between screens

#### Week 3: Clips Library
- [ ] Create ClipsLibraryScreen layout
- [ ] Implement Firestore clips fetching
- [ ] Create ClipCard component
- [ ] Implement ClipGrid with FlatList
- [ ] Add pull-to-refresh
- [ ] Add infinite scroll pagination
- [ ] Implement search functionality
- [ ] Add filters (status, resolution, date)
- [ ] Create single/multi-select mode toggle
- [ ] Implement clip selection logic
- [ ] Add floating action button for montage creation
- [ ] Style with Night Fury theme

**Deliverables:**
- Functional clips library
- Users can browse, search, and filter clips
- Multi-select mode working
- Smooth performance with large clip lists

### Phase 2: Single Clip Editor (Weeks 4-6)

#### Week 4: Editor Foundation
- [ ] Create SingleClipEditorScreen layout
- [ ] Implement react-native-video player
- [ ] Create VideoPreview component with controls
- [ ] Implement playback (play, pause, seek)
- [ ] Create Timeline component
- [ ] Generate video thumbnails for timeline
- [ ] Implement timeline scrubbing
- [ ] Add playhead indicator
- [ ] Sync playhead with video playback
- [ ] Style editor screen

**Deliverables:**
- Basic video editor screen
- Video playback working smoothly
- Timeline displays thumbnails
- Scrubbing and seeking functional

#### Week 5: Trim & Text Features
- [ ] Implement trim handles on timeline
- [ ] Add trim logic (update trimStart/trimEnd)
- [ ] Preview trimmed region
- [ ] Create TextEditorPanel component
- [ ] Implement font picker
- [ ] Add font size slider
- [ ] Create color picker with presets
- [ ] Add background toggle and settings
- [ ] Implement outline/stroke toggle
- [ ] Add shadow toggle
- [ ] Create text alignment options
- [ ] Implement text positioning on preview (draggable)
- [ ] Add timing controls for text
- [ ] Store text overlays in state

**Deliverables:**
- Trimming functionality complete
- Text editor panel fully functional
- Users can add multiple text layers
- Text positioning and timing working

#### Week 6: Meme Integration & Backend
- [ ] Create MemeLibrary modal
- [ ] Integrate Giphy API search
- [ ] Implement trending GIFs display
- [ ] Create curated meme categories
- [ ] Add meme/GIF selection
- [ ] Implement meme overlay on preview
- [ ] Add drag to position
- [ ] Implement pinch to resize
- [ ] Add rotation gesture
- [ ] Create timing controls for memes
- [ ] Connect to backend edit API
- [ ] Implement export request
- [ ] Add progress tracking
- [ ] Display export result

**Deliverables:**
- Meme library fully functional
- Users can add GIFs/memes to videos
- Single clip export working end-to-end
- Backend integration complete

### Phase 3: Multi-Clip Montage (Weeks 7-9)

#### Week 7: Montage Timeline UI
- [ ] Create MontageEditorScreen layout
- [ ] Implement continuous timeline design
- [ ] Create TimelineClip component
- [ ] Display multiple clips in sequence
- [ ] Add color coding per clip
- [ ] Create TimelineSeparator component
- [ ] Display transition indicators
- [ ] Implement clip selection in timeline
- [ ] Add per-clip controls (edit, remove)
- [ ] Implement timeline scrolling
- [ ] Create unified playback across clips

**Deliverables:**
- Montage editor UI complete
- Timeline displays multiple clips
- Visual separators showing transitions
- Unified playback working

#### Week 8: Transitions & Clip Management
- [ ] Create TransitionPicker modal
- [ ] Implement transition type selection
- [ ] Add transition duration slider
- [ ] Update separator on transition change
- [ ] Implement clip reordering (drag to rearrange)
- [ ] Add clip to montage mid-timeline
- [ ] Remove clip from timeline
- [ ] Create ClipEditModal for per-clip editing
- [ ] Implement per-clip trim
- [ ] Add per-clip text overlays
- [ ] Add per-clip meme overlays
- [ ] Calculate total montage duration

**Deliverables:**
- Transition system complete
- Clip management working
- Per-clip editing functional
- Smooth UX for montage creation

#### Week 9: Montage Backend & Export
- [ ] Connect to backend montage API
- [ ] Implement montage data serialization
- [ ] Send montage request to backend
- [ ] Implement WebSocket progress updates
- [ ] Display progress indicator
- [ ] Handle montage completion
- [ ] Add montage to user's library (optional)
- [ ] Implement montage export
- [ ] Test end-to-end montage flow
- [ ] Optimize performance for large montages

**Deliverables:**
- Complete montage creation flow
- Backend integration working
- Users can export multi-clip montages
- Progress tracking functional

### Phase 4: Export & Polish (Weeks 10-11)

#### Week 10: Platform Presets & Sharing
- [ ] Create PlatformSelector component
- [ ] Implement platform presets (TikTok, Instagram, YouTube, Facebook)
- [ ] Add aspect ratio display
- [ ] Implement letterbox toggle
- [ ] Add quality selector
- [ ] Validate duration against platform limits
- [ ] Create ExportProgress modal
- [ ] Integrate native share functionality
- [ ] Test sharing to each platform
- [ ] Add download to device option

**Deliverables:**
- Platform-specific exports working
- Native share integration complete
- Users can share to social media
- Download functionality working

#### Week 11: UI Polish & Bug Fixes
- [ ] Refine all animations
- [ ] Add loading states everywhere
- [ ] Implement error handling
- [ ] Add user feedback (toasts, alerts)
- [ ] Optimize performance
- [ ] Fix any navigation issues
- [ ] Test on multiple Android devices
- [ ] Refine Night Fury theming
- [ ] Add haptic feedback
- [ ] Create app icon and splash screen

**Deliverables:**
- Polished, professional UI
- Smooth animations throughout
- Proper error handling
- Tested on multiple devices

### Phase 5: Advanced Features (Weeks 12-14) - Optional

#### Week 12: Filters & Speed Control
- [ ] Implement video filters (B&W, Vintage, Vivid, etc.)
- [ ] Create filter preview
- [ ] Add filter selector UI
- [ ] Implement speed control (0.5x - 2x)
- [ ] Add speed UI slider
- [ ] Update backend to support filters and speed
- [ ] Test filter and speed in exports

**Deliverables:**
- Filters working
- Speed control functional
- Backend supports new features

#### Week 13: Background Music & Import
- [ ] Add music library (local files)
- [ ] Implement audio mixing
- [ ] Add volume controls
- [ ] Implement fade in/out for music
- [ ] Create import from gallery feature
- [ ] Upload imported video to backend
- [ ] Add to clips library
- [ ] Test import flow

**Deliverables:**
- Background music feature complete
- Import from device working

#### Week 14: Final Testing & Release Prep
- [ ] Comprehensive testing on all features
- [ ] Performance optimization
- [ ] Memory leak fixes
- [ ] Battery usage optimization
- [ ] Prepare Play Store assets (screenshots, description)
- [ ] Create privacy policy
- [ ] Set up analytics
- [ ] Final QA pass
- [ ] Create release build

**Deliverables:**
- Production-ready app
- Play Store listing prepared
- Ready for submission

---

## 11. Testing Strategy

### 11.1 Unit Testing

```typescript
// __tests__/services/api/clips.test.ts
import { clipsAPI } from '../../../src/services/api/clips';
import { apiClient } from '../../../src/services/api/client';

jest.mock('../../../src/services/api/client');

describe('ClipsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClips', () => {
    it('should fetch clips successfully', async () => {
      const mockClips = [
        { clip_id: '1', channel: 'test', duration: 60 }
      ];
      
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { clips: mockClips, total: 1 }
      });

      const result = await clipsAPI.getClips();

      expect(result.clips).toEqual(mockClips);
      expect(result.total).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/api/clips/', {
        params: { limit: 50 }
      });
    });

    it('should handle errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(clipsAPI.getClips()).rejects.toThrow('Network error');
    });
  });
});
```

### 11.2 Component Testing

```typescript
// __tests__/components/clips/ClipCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ClipCard from '../../../src/components/clips/ClipCard';

describe('ClipCard', () => {
  const mockClip = {
    id: '1',
    title: 'Test Clip',
    duration: 120,
    resolution: '720p',
    thumbnailUrl: 'https://example.com/thumb.jpg'
  };

  it('renders clip information correctly', () => {
    const { getByText } = render(
      <ClipCard clip={mockClip} onPress={jest.fn()} />
    );

    expect(getByText('Test Clip')).toBeTruthy();
    expect(getByText('2:00')).toBeTruthy();
    expect(getByText('720p')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ClipCard clip={mockClip} onPress={onPress} />
    );

    fireEvent.press(getByTestId('clip-card'));
    expect(onPress).toHaveBeenCalledWith(mockClip);
  });

  it('shows checkbox in selectable mode', () => {
    const { getByTestId } = render(
      <ClipCard
        clip={mockClip}
        onPress={jest.fn()}
        selectable={true}
        selected={false}
      />
    );

    expect(getByTestId('clip-checkbox')).toBeTruthy();
  });
});
```

### 11.3 Integration Testing

```typescript
// __tests__/integration/montage-flow.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectClip,
  createMontage,
  addTransition
} from '../../src/store/slices/editorSlice';

describe('Montage Creation Flow', () => {
  it('should create montage from selected clips', async () => {
    // Test the full flow of selecting clips and creating a montage
    // This would involve dispatching actions and checking state updates
  });
});
```

### 11.4 E2E Testing (Detox)

```typescript
// e2e/montage.e2e.js
describe('Montage Creation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create a montage from two clips', async () => {
    // Log in
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for clips library
    await waitFor(element(by.id('clips-library')))
      .toBeVisible()
      .withTimeout(5000);

    // Switch to multi-select mode
    await element(by.id('multi-select-toggle')).tap();

    // Select two clips
    await element(by.id('clip-card-0')).tap();
    await element(by.id('clip-card-1')).tap();

    // Create montage
    await element(by.id('create-montage-button')).tap();

    // Verify montage editor opened
    await expect(element(by.id('montage-editor'))).toBeVisible();

    // Verify two clips in timeline
    await expect(element(by.id('timeline-clip-0'))).toBeVisible();
    await expect(element(by.id('timeline-clip-1'))).toBeVisible();
  });
});
```

### 11.5 Manual Testing Checklist

#### Authentication Flow
- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User can log in with Google
- [ ] User can reset password
- [ ] Session persists after app close
- [ ] User can log out
- [ ] Error messages display correctly

#### Clips Library
- [ ] Clips load and display correctly
- [ ] Thumbnails load properly
- [ ] Search filters clips
- [ ] Status filter works
- [ ] Resolution filter works
- [ ] Date filter works
- [ ] Pull-to-refresh updates clips
- [ ] Infinite scroll loads more clips
- [ ] Multi-select mode enables checkboxes
- [ ] Selected clips count updates
- [ ] Create montage button appears when 2+ clips selected

#### Single Clip Editor
- [ ] Video loads and plays
- [ ] Play/pause works
- [ ] Seeking works
- [ ] Timeline displays thumbnails
- [ ] Trim handles drag smoothly
- [ ] Trimmed region previews correctly
- [ ] Text editor opens
- [ ] Text can be added with custom properties
- [ ] Text can be positioned on video
- [ ] Multiple text layers work
- [ ] Meme library opens
- [ ] GIFs can be searched
- [ ] Memes can be added to video
- [ ] Memes can be positioned/resized
- [ ] Export sends to backend
- [ ] Progress displays during export
- [ ] Share sheet opens on completion

#### Montage Editor
- [ ] Multiple clips display in timeline
- [ ] Clips show in correct order
- [ ] Separators display between clips
- [ ] Transitions can be changed
- [ ] Transition duration can be adjusted
- [ ] Clips can be reordered
- [ ] Clips can be removed
- [ ] Per-clip editing works
- [ ] Text overlays can span clips
- [ ] Memes can span clips
- [ ] Playback works across all clips
- [ ] Export creates proper montage

#### Platform Export
- [ ] All platforms display in selector
- [ ] Aspect ratio displayed correctly
- [ ] Duration warnings show if needed
- [ ] Letterbox toggle works
- [ ] Export processes correctly
- [ ] Native share sheet opens
- [ ] Video can be shared to TikTok
- [ ] Video can be shared to Instagram
- [ ] Video can be shared to YouTube
- [ ] Video can be shared to Facebook

#### Performance
- [ ] App launches within 3 seconds
- [ ] Video playback is smooth (60fps)
- [ ] Timeline scrubbing is responsive
- [ ] No memory leaks during extended use
- [ ] App handles low memory conditions
- [ ] Battery usage is reasonable

#### Cross-Device
- [ ] Test on Android 8.0
- [ ] Test on Android 10
- [ ] Test on Android 12
- [ ] Test on Android 13+
- [ ] Test on various screen sizes
- [ ] Test on low-end device
- [ ] Test on high-end device

---

## 12. Deployment Strategy

### 12.1 Build Configuration

#### Release Build Setup

```bash
# Generate release keystore
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore furyclips-release.keystore -alias furyclips -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties
FURYCLIPS_RELEASE_STORE_FILE=furyclips-release.keystore
FURYCLIPS_RELEASE_KEY_ALIAS=furyclips
FURYCLIPS_RELEASE_STORE_PASSWORD=****
FURYCLIPS_RELEASE_KEY_PASSWORD=****
```

#### android/app/build.gradle

```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('FURYCLIPS_RELEASE_STORE_FILE')) {
                storeFile file(FURYCLIPS_RELEASE_STORE_FILE)
                storePassword FURYCLIPS_RELEASE_STORE_PASSWORD
                keyAlias FURYCLIPS_RELEASE_KEY_ALIAS
                keyPassword FURYCLIPS_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 12.2 ProGuard Rules

#### android/app/proguard-rules.pro

```
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Video player
-keep class com.brentvatne.react.** { *; }

# Keep data classes
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
```

### 12.3 Build Process

```bash
# Clean build
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Output locations
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### 12.4 Google Play Store Setup

#### App Information
- **App Name**: FuryClips
- **Package Name**: com.furyclips
- **Category**: Video Players & Editors
- **Content Rating**: Everyone
- **Privacy Policy URL**: https://furyclips.com/privacy

#### Store Listing
```
Title: FuryClips - Edit & Share Gaming Clips

Short Description:
Transform your Twitch clips into viral videos with professional editing tools and instant social sharing.

Full Description:
FuryClips is the ultimate mobile companion for streamers and gamers who want to create engaging content from their Twitch streams.

KEY FEATURES:
🎬 Multi-Clip Montages - Combine multiple clips with smooth transitions
📝 Professional Text Overlays - Add custom text with 15+ fonts and effects
😎 Meme Library - Powered by GIPHY with gaming-focused content
✂️ Precise Trimming - Frame-accurate editing with intuitive timeline
📱 One-Tap Sharing - Export directly to TikTok, Instagram Reels, YouTube Shorts, and Facebook
🎨 Night Fury Theme - Sleek dark design inspired by gaming culture

PERFECT FOR:
- Twitch streamers creating highlight reels
- Content creators making viral clips
- Gamers sharing epic moments
- Anyone wanting professional video edits on mobile

EXPORT TO:
✓ TikTok (optimized for viral content)
✓ Instagram Reels (perfect dimensions)
✓ YouTube Shorts (high quality)
✓ Facebook (broad reach)

NO WATERMARKS. NO SUBSCRIPTIONS. UNLIMITED EXPORTS.

Join thousands of creators using FuryClips to grow their audience and share their best gaming moments!

Tags: video editor, twitch, gaming clips, montage maker, tiktok editor, instagram reels, youtube shorts
```

#### Screenshots Required
1. Clips Library (1080x1920)
2. Montage Timeline (1080x1920)
3. Text Editor (1080x1920)
4. Meme Library (1080x1920)
5. Export Options (1080x1920)
6. Share Result (1080x1920)
7. Feature Graphic (1024x500)

#### App Icon
- 512x512px high-res icon
- Night Fury themed (purple/green dragon eyes)
- Transparent background or solid color

### 12.5 Release Checklist

#### Pre-Release
- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Memory leaks fixed
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] All third-party API keys configured
- [ ] Analytics integrated
- [ ] Crash reporting set up (Firebase Crashlytics)
- [ ] App icon finalized
- [ ] Screenshots prepared
- [ ] Store listing written
- [ ] Release build tested on multiple devices

#### Submission
- [ ] Build signed AAB
- [ ] Upload to Play Console
- [ ] Complete store listing
- [ ] Upload screenshots
- [ ] Set content rating
- [ ] Configure pricing (free)
- [ ] Set countries/regions
- [ ] Submit for review

#### Post-Release
- [ ] Monitor crash reports
- [ ] Track user reviews
- [ ] Respond to user feedback
- [ ] Plan updates based on feedback
- [ ] Monitor analytics
- [ ] Track key metrics (DAU, retention, exports)

### 12.6 Version Management

```
Version Code: Integer that increments with each release
Version Name: Semantic versioning (MAJOR.MINOR.PATCH)

Example:
v1.0.0 (1)   - Initial release
v1.0.1 (2)   - Bug fix
v1.1.0 (3)   - New feature (filters)
v2.0.0 (4)   - Major update (iOS version)
```

### 12.7 Continuous Integration (Optional)

#### GitHub Actions Workflow

```yaml
# .github/workflows/android.yml
name: Android Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 11
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
    
    - name: Install Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Build Android
      run: |
        cd android
        ./gradlew assembleRelease
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release.apk
        path: android/app/build/outputs/apk/release/
```

---

## 13. Maintenance & Updates

### 13.1 Monitoring

#### Analytics to Track
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention (Day 1, Day 7, Day 30)
- Feature usage (clips edited, montages created, exports)
- Platform export breakdown (TikTok, Instagram, etc.)
- Average session duration
- Crash-free rate
- App load time

#### Tools
- Firebase Analytics
- Firebase Crashlytics
- Google Play Console metrics

### 13.2 Update Strategy

#### Bug Fix Releases (Patch)
- Critical bugs
- Security issues
- Performance improvements
- Release within 24-48 hours

#### Feature Updates (Minor)
- New editing features
- UI improvements
- New platform support
- Release every 2-4 weeks

#### Major Updates (Major)
- Complete redesigns
- New core functionality
- Platform expansion (iOS)
- Release every 3-6 months

### 13.3 User Feedback Loop

```
User Reports Issue
        ↓
Create GitHub Issue
        ↓
Prioritize (Critical/High/Medium/Low)
        ↓
Assign to Sprint
        ↓
Develop & Test Fix
        ↓
Release Update
        ↓
Notify User (if possible)
        ↓
Monitor Metrics
```

### 13.4 Backend Maintenance

#### Server Monitoring
- API response times
- Error rates
- Processing queue length
- FFmpeg processing times
- GCS storage usage
- Firestore read/write operations

#### Backend Updates
- Keep FFmpeg updated
- Update Python dependencies
- Monitor for security vulnerabilities
- Optimize video processing algorithms
- Scale infrastructure as needed

### 13.5 Deprecation Strategy

When removing features:
1. Announce deprecation 30 days in advance
2. Show in-app notice
3. Provide migration path if applicable
4. Remove in next major version
5. Update documentation

---

## 14. Appendices

### 14.1 Glossary

- **Clip**: A recorded segment of video from a Twitch stream
- **Montage**: A combination of multiple clips with transitions
- **Timeline**: Visual representation of video with time markers
- **Overlay**: Text or image element placed on top of video
- **Transition**: Effect between two clips (fade, slide, etc.)
- **Trim**: Removing portions from start/end of clip
- **Export**: Processing and encoding video for specific platform
- **Letterbox**: Black bars added to maintain aspect ratio

### 14.2 Third-Party Services

#### Required API Keys
1. **Firebase**
   - Project ID
   - API Key
   - google-services.json

2. **Giphy**
   - API Key (free tier: 42 requests/hour, 1000/day)
   - Sign up: https://developers.giphy.com/

3. **Google Cloud Storage**
   - Bucket name
   - Service account credentials

4. **Firestore**
   - Database name
   - Security rules configured

### 14.3 Performance Benchmarks

#### Target Metrics
- App launch: < 3 seconds
- Clips library load: < 2 seconds
- Video playback start: < 1 second
- Timeline scrubbing: < 16ms (60fps)
- Text overlay positioning: < 16ms
- Export request: < 1 second
- Memory usage: < 300MB average
- Battery drain: < 5% per hour of active use

### 14.4 Known Limitations

#### Current Limitations
- Android only (iOS planned)
- Server-side processing required (no offline editing)
- Video processing time depends on backend availability
- Giphy API rate limits (42 requests/hour on free tier)
- Maximum montage clips: 10 (backend limitation)
- Maximum text overlays per clip: 5
- Maximum meme overlays per clip: 3

#### Future Improvements
- Client-side processing for simple edits
- Offline mode with sync
- More transition effects
- Audio editing features
- Collaborative editing
- Project templates
- Advanced color grading
- Green screen support
- Auto-captions via speech-to-text

### 14.5 Troubleshooting

#### Common Issues

**Video won't load**
- Check internet connection
- Verify video URL is accessible
- Check Firestore permissions

**Export fails**
- Check backend server status
- Verify FFmpeg is running
- Check GCS write permissions
- Validate video file integrity

**App crashes on startup**
- Clear app cache
- Reinstall app
- Check Android version compatibility
- Verify Firebase configuration

**Timeline lag**
- Reduce thumbnail density
- Optimize video preview quality
- Check device memory

**Share fails**
- Verify app has storage permissions
- Check if target app is installed
- Try downloading first, then sharing

### 14.6 Resources

#### Documentation
- React Native: https://reactnative.dev/
- Firebase: https://firebase.google.com/docs
- FFmpeg: https://ffmpeg.org/documentation.html
- Giphy API: https://developers.giphy.com/docs/api

#### Community
- React Native Discord
- Stack Overflow (react-native tag)
- GitHub Discussions

#### Learning
- React Native School: https://www.reactnativeschool.com/
- Udemy React Native courses
- YouTube tutorials

---

## 15. Conclusion

This specification provides a comprehensive roadmap for building the FuryClips Android mobile app. Following this guide will result in a professional, feature-rich video editing application with a unique Night Fury brand identity.

### Key Success Factors
1. **Follow the phases sequentially** - Don't skip ahead
2. **Test continuously** - Don't wait until the end
3. **Keep UX smooth** - Prioritize performance
4. **Maintain brand consistency** - Night Fury theme throughout
5. **Iterate based on feedback** - Listen to users

### Timeline Summary
- **MVP (Phases 1-4)**: 11 weeks
- **Full Feature Set (Phases 1-5)**: 14 weeks
- **Additional Polish**: 1-2 weeks
- **Total**: 12-16 weeks for production-ready app

### Next Steps
1. Set up development environment
2. Initialize React Native project
3. Configure Firebase and backend
4. Begin Phase 1 development
5. Test on real Android devices regularly
6. Prepare for Play Store submission

Good luck building FuryClips! 🐉🎬

---

**Document Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Author**: FuryClips Development Team
