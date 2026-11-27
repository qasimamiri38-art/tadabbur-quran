# Tadabbur Quran — Samsung Tizen TV (first prototype)

This is the first native-TV platform scaffold, chosen because the project owner has a Samsung television.

## Included in this prototype

- Tizen TV Web App manifest (`config.xml`)
- TV-first RTL home screen and navigation
- Remote-control focus styling and key handling
- Surah list loaded from AlQuranCloud
- Uthmani Arabic text and Dari Badakhshani translation request
- Three existing reciters from the mobile app: Mishary Alafasy, Abdul Basit Murattal, and Mahmoud Khalil Al-Husary
- Sequential ayah audio playback with active-ayah highlighting

## Build and test

1. Install Samsung Tizen Studio and the TV Extension on a computer.
2. Create/import a Tizen TV Web Application project using this folder.
3. Confirm the Tizen SDK version and app profile match the target TV model.
4. Use the Tizen Certificate Manager to create a Samsung TV signing certificate.
5. Build a `.wgt` package and install it on a Samsung TV in Developer Mode for testing.
6. Test remote focus/navigation, Arabic font rendering, audio, translation API, standby/resume, and network error handling on the physical TV.
7. Only after successful device testing, prepare Samsung Apps TV submission and store assets.

## Important limitations

- This is a source-code prototype, not a signed `.wgt` installer and not yet published in Samsung Apps.
- The Dari translation request uses the same QuranEnc translation identifier already used in the web app. Verify response fields and content on a real TV before release.
- The prototype fetches surah text, translation, and reciter audio from online services; it does not yet provide offline downloads.
- Playback/background behavior must be tested against the specific Samsung TV model and Tizen version.
- This app does not yet include every mobile feature (adhan scheduling, qibla, tafsir, bookmarks, memorization, offline library, account sync). Add these in later TV milestones.
- No claim is made that it has been built, installed, or tested on the user's TV.

## Product principle

The installed TV app is the primary TV experience. Casting or mirroring from a phone/tablet remains a fallback for unsupported televisions.
