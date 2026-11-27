# Tadabbur Quran — Native AirPlay playback foundation

This folder starts the native iOS AirPlay playback path.

## Important architecture boundary

The current production site is a web app (GitHub Pages); this repository does not currently contain an Xcode project or an iOS application target. A web page cannot send its arbitrary HTML layout to an AirPlay TV as a standalone video stream.

For the requested YouTube-like behavior, the native iOS app must play an audiovisual HLS/MP4 stream through AVPlayer. The stream's video frames must render the Tadabbur Quran screen (green/gold theme, Uthmani ayah text, active-ayah highlight), and its audio track must contain the selected reciter. Once the user chooses the Samsung TV in Apple's AirPlay route picker, the TV receives the audiovisual stream; the phone can then go to the background while playback continues, subject to the TV/network and iOS playback session remaining available.

## Included

- `TadabburAirPlayPlayer.swift`: AVPlayer setup, AirPlay external playback, background-capable playback session, and lock-screen/remote play-pause-stop commands.
- `TadabburAirPlayRouteButton`: Apple's native AirPlay destination picker.

## Still required before this is a working user feature

1. Add these sources to a signed Xcode iOS app target (none exists in this repository yet).
2. Enable **Background Modes → Audio, AirPlay, and Picture in Picture** in Signing & Capabilities.
3. Build the Quran audiovisual stream generator. It must produce an HLS or MP4 asset with the Quran design as video and the selected reciter as audio. Do not point AVPlayer at the existing MP3-only ayah audio and expect the Quran page to appear.
4. Connect the existing web app's selected surah, reciter, and ayah progress to the native player.
5. Test on the user's Samsung AirPlay TV and an iPhone/iPad, including lock-screen/background playback.

Apple references:
- https://developer.apple.com/documentation/avfoundation/configuring-your-app-for-media-playback
- https://developer.apple.com/documentation/avfoundation/avplayer
- https://developer.apple.com/design/human-interface-guidelines/airplay

This is implementation groundwork, not a deployed or device-tested feature.
