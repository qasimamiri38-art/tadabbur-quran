# Tadabbur Quran — Native TV App Strategy

## Product decision

Tadabbur Quran will have two first-class experiences:

1. **Native TV apps (primary TV experience):** people install Tadabbur Quran directly from the app store on their television and use the TV remote. No phone mirroring or phone connection is required for normal use.
2. **Phone/tablet casting or mirroring (compatibility fallback):** people whose TVs cannot install a supported Tadabbur Quran app can still display the mobile experience through a compatible AirPlay, Google Cast, or screen-mirroring path. This fallback is not the main TV product.

Publishing the iPhone/iPad app does not automatically publish a TV app. Each TV platform has its own app target, packaging, store listing, review, and compatibility requirements.

## Target platforms

| Platform | Native application target | Distribution |
|---|---|---|
| Samsung Smart TV | Samsung Tizen TV app | Samsung Apps / TV app distribution |
| LG Smart TV | LG webOS TV app | LG Content Store / TV app distribution |
| Android TV / Google TV | Android TV app | Google Play on TV |
| Apple TV | tvOS app | Apple App Store for tvOS |
| iPhone / iPad | Existing web app plus a future native iOS app if needed | Apple App Store for iOS/iPadOS |

Build and publish each target only after checking supported model years, OS versions, store policies, and actual device testing. Do not assume every Samsung or LG television supports every new app.

## Shared product architecture

Keep one product identity and shared Quran content/services, while using native user interfaces adapted to each platform:

- **Quran content:** Arabic Uthmani text, ayah numbering, surah metadata, Dari translation, and selected recitation metadata.
- **Playback service:** one consistent playback state model (surah, ayah, reciter, play/pause, seek, repeat, volume where supported).
- **TV user interface:** large readable Arabic typography, comfortable viewing distance, remote-control navigation, focus states, simple home screen, and accessible playback controls.
- **Mobile user interface:** touch-first layout and optional casting controls.
- **Backend/content:** reuse the existing trusted Quran and recitation sources where licensing, availability, and reliability have been verified. Avoid duplicating Quran content separately for each platform.
- **Offline support:** design explicit downloadable content and storage policies per platform; TV storage and background behavior differ from phones.

## TV user experience

The TV app should open directly to a clear home screen and support:

- Continue recitation / resume last position
- Quran surah and ayah browsing
- Arabic Uthmani text with readable, scalable typography
- Dari translation and reflection content where available
- Reciter library and reciter selection
- Playback controls operated entirely by the TV remote
- Bookmarks / saved ayat if account or sync is implemented
- Prayer/adhan features only where location permissions, scheduling, and platform background limits are handled correctly
- Settings for font size, display, translation, reciter, and playback

Do not assume that mobile background audio behavior is identical on TV platforms. Validate playback, sleep/standby, app suspension, and remote-control behavior separately on real devices.

## Casting and mirroring fallback

The fallback should be simple and clearly labeled in the mobile app:

- Show compatible destinations using the native platform mechanism (AirPlay or Google Cast where supported).
- If a platform cannot render the full Quran interface as a remote receiver, explain the limitation and offer screen mirroring as a fallback.
- Do not describe ordinary audio-only AirPlay as full-screen Quran casting.
- Do not promise playback continues after the phone is disconnected unless the receiver or TV app owns the playback session and this has been verified.

## Delivery sequence

### Phase 0 — Protect the current product
- Keep the current web app and its existing Quran, audio, adhan, and layout features working.
- Keep TV-specific experiments isolated from the production reader.
- Document shared data contracts before implementing platform-specific apps.

### Phase 1 — Product and technical readiness
- Inventory existing Quran text, Dari translation, reciter audio, adhan assets, bookmarks, and settings.
- Verify source permissions, stable media URLs, and offline/download behavior.
- Define a shared playback/session contract and test fixtures.
- Create a design system for mobile and TV, including Arabic typography and remote focus states.

### Phase 2 — First native TV implementation
- Select one first TV platform based on the user's devices, developer access, and store requirements.
- Build a minimum complete TV app: home, surah list, reader, reciter selection, player, and remote navigation.
- Test on a real TV and emulator; verify audio/video, Arabic shaping, font rendering, focus navigation, standby/resume, and performance.
- Complete platform store review and release requirements.

### Phase 3 — Expand TV coverage
- Port the shared product behavior to the remaining platforms (Tizen, webOS, Android TV/Google TV, tvOS).
- Keep platform-specific UI and playback adapters; do not assume one binary can run on every TV OS.
- Publish each platform app through its own store process.

### Phase 4 — Mobile casting fallback
- Implement AirPlay and Google Cast according to actual device support.
- Use a receiver-based session for independent playback when supported.
- Keep screen mirroring as a compatibility fallback for unsupported TVs.

## Acceptance criteria

The TV product is not considered complete until a person can:

1. Install Tadabbur Quran directly from the TV's supported app store.
2. Launch and navigate the app using only the TV remote.
3. Select a surah and reciter and play Quran audio without a phone connected.
4. Read Arabic text comfortably on the TV and view the selected translation.
5. Pause, resume, seek, and continue after normal app/TV interruptions as supported by that platform.
6. Use the mobile app as an optional companion, not a required playback host.

## Current implementation status

- The current production repository is a GitHub Pages web application.
- The existing TV receiver / casting work is experimental groundwork, not a released native TV app.
- The `ios/TadabburAirPlay` Swift files are native iOS integration groundwork only; this repository does not currently contain a complete signed Xcode project or a deployed audiovisual stream generator.
- No Samsung Tizen, LG webOS, Android TV, or tvOS app has been built, submitted, or tested through its store in this repository.
- The next practical step when the TV phase begins is to inventory the current web app's data and playback interfaces, then select the first native TV platform and create its actual app project. Do not claim a TV app is installable until a platform build has passed device tests and store review.

## Guiding principle

**Install directly on the TV whenever a native app is available. Use phone casting or mirroring only as a fallback.**
