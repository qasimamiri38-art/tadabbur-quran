import AVFoundation
import AVKit
import MediaPlayer
import SwiftUI

/// Native AirPlay transport for Tadabbur Quran.
/// The URL must point to an audiovisual HLS/MP4 stream whose video frames
/// already contain the Quran page/ayah design and whose audio contains recitation.
@MainActor
final class TadabburAirPlayPlayer: ObservableObject {
    @Published private(set) var isPlaying = false
    @Published private(set) var isExternalPlaybackActive = false
    @Published private(set) var errorMessage: String?

    let player = AVPlayer()
    private var timeObserver: Any?

    init() {
        configureAudioSession()
        player.allowsExternalPlayback = true
        player.usesExternalPlaybackWhileExternalScreenIsActive = true
        player.audiovisualBackgroundPlaybackPolicy = .continuesIfPossible
        installRemoteCommands()
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600),
            queue: .main
        ) { [weak self] _ in
            guard let self else { return }
            self.isPlaying = self.player.timeControlStatus == .playing
            self.isExternalPlaybackActive = self.player.isExternalPlaybackActive
        }
    }

    deinit {
        if let timeObserver { player.removeTimeObserver(timeObserver) }
    }

    func play(streamURL: URL) {
        errorMessage = nil
        let item = AVPlayerItem(url: streamURL)
        player.replaceCurrentItem(with: item)
        player.play()
    }

    func pause() { player.pause() }

    func stop() {
        player.pause()
        player.replaceCurrentItem(with: nil)
        isPlaying = false
    }

    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
            try session.setActive(true)
        } catch {
            errorMessage = "تنظیم صدای AirPlay ناموفق بود: \(error.localizedDescription)"
        }
    }

    private func installRemoteCommands() {
        let center = MPRemoteCommandCenter.shared()
        center.playCommand.addTarget { [weak self] _ in
            self?.player.play()
            return .success
        }
        center.pauseCommand.addTarget { [weak self] _ in
            self?.player.pause()
            return .success
        }
        center.stopCommand.addTarget { [weak self] _ in
            self?.stop()
            return .success
        }
    }
}

/// Place this control beside the Tadabbur Quran play controls in the native iOS app.
/// It opens Apple's standard AirPlay destination picker (same familiar flow as media apps).
struct TadabburAirPlayRouteButton: UIViewRepresentable {
    func makeUIView(context: Context) -> AVRoutePickerView {
        let picker = AVRoutePickerView()
        picker.prioritizesVideoDevices = true
        picker.activeTintColor = UIColor.systemGreen
        picker.tintColor = UIColor.secondaryLabel
        return picker
    }

    func updateUIView(_ uiView: AVRoutePickerView, context: Context) {}
}
