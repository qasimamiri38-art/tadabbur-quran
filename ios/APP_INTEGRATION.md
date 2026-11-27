# Native iOS app integration

The repository is currently a static web app. The Swift files in this folder are native iOS source files, not a built/installable app.

## Add to Xcode

1. On a Mac with Xcode, create an iOS App project named `TadabburQuran` using SwiftUI.
2. Add `TadabburAirPlayPlayer.swift` and `TadabburAirPlayView.swift` to the app target.
3. Add an image asset named `TadabburLogo` using the existing app logo.
4. Set the app's root view to `TadabburAirPlayView()`.
5. In Signing & Capabilities, enable Background Modes and select Audio, AirPlay, and Picture in Picture.
6. Test on a physical iPhone/iPad and the Samsung TV.

## Critical remaining media pipeline

The player intentionally accepts only a combined audiovisual HLS/MP4 stream. An MP3 recitation file alone cannot show Quran text on the TV. A stream-generation service must render the selected surah's Uthmani text, active ayah/word, and green/gold design into video frames, then mux those frames with the selected reciter's audio. It must support seek/resume and keep the media URL reachable by the TV.

The current repository has no Xcode project, signing profile, video-rendering service, or hosted audiovisual stream endpoint. Therefore these Swift files are integration groundwork and cannot yet be installed or used as a finished feature. Do not remove the existing web player while this native path is being completed.
