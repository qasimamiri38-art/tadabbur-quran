import SwiftUI
import AVKit

/// Native iOS screen for the Tadabbur Quran AirPlay player.
/// The stream URL must be an audiovisual HLS/MP4 asset (not an MP3-only URL).
struct TadabburAirPlayView: View {
    @StateObject private var playback = TadabburAirPlayPlayer()
    @State private var streamURLText = ""

    var body: some View {
        VStack(spacing: 22) {
            Image("TadabburLogo")
                .resizable()
                .scaledToFit()
                .frame(width: 88, height: 88)
                .accessibilityLabel("تدبر القرآن")

            Text("تدبر القرآن")
                .font(.largeTitle.bold())
                .foregroundStyle(Color(red: 0.08, green: 0.34, blue: 0.23))

            Text("پخش قرآن روی تلویزیون")
                .font(.title3.weight(.semibold))

            // Apple's native AirPlay route picker. The user selects a TV once.
            TadabburAirPlayRouteButton()
                .frame(width: 58, height: 58)
                .accessibilityLabel("انتخاب تلویزیون با AirPlay")

            Text(playback.isExternalPlaybackActive
                 ? "تلویزیون به پخش تدبر القرآن وصل است"
                 : "تلویزیون را با دکمهٔ AirPlay انتخاب کن")
                .font(.callout)
                .multilineTextAlignment(.center)

            HStack(spacing: 28) {
                Button {
                    playback.pause()
                } label: {
                    Label("مکث", systemImage: "pause.fill")
                }
                .disabled(!playback.isPlaying)

                Button {
                    guard let url = URL(string: streamURLText),
                          ["https", "http"].contains(url.scheme?.lowercased() ?? "") else {
                        playback.errorMessage = "نشانی جریان ویدیویی معتبر نیست."
                        return
                    }
                    playback.play(streamURL: url)
                } label: {
                    Label("پخش", systemImage: "play.fill")
                }

                Button {
                    playback.stop()
                } label: {
                    Label("توقف", systemImage: "stop.fill")
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.08, green: 0.34, blue: 0.23))

            TextField("نشانی جریان ویدیویی HLS/MP4", text: $streamURLText)
                .textInputAutocapitalization(.never)
                .keyboardType(.URL)
                .autocorrectionDisabled()
                .textFieldStyle(.roundedBorder)
                .environment(\.layoutDirection, .leftToRight)

            Text("برای نمایش آیات روی تلویزیون، این نشانی باید ویدیویی باشد که متن قرآن و صدای قاری را باهم داشته باشد.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            if let message = playback.errorMessage {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }

            Spacer(minLength: 0)
        }
        .padding(24)
        .environment(\.layoutDirection, .rightToLeft)
        .background(Color(red: 0.96, green: 0.97, blue: 0.94))
    }
}
