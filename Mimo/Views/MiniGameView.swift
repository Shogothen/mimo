import SwiftUI
import Combine

/// Mini-Game "Sterne fangen": Sterne fallen vom Himmel, Mimo wird per Drag
/// bewegt. 30 Sekunden, goldene Sterne zählen dreifach.
struct MiniGameView: View {
    @EnvironmentObject var viewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    private enum GamePhase {
        case ready, running, finished
    }

    private struct FallingItem: Identifiable {
        let id = UUID()
        var x: CGFloat        // 0–1
        var y: CGFloat        // 0–1 (1 = unten)
        let speed: CGFloat    // Anteil der Höhe pro Sekunde
        let isGolden: Bool
    }

    @State private var phase: GamePhase = .ready
    @State private var items: [FallingItem] = []
    @State private var petX: CGFloat = 0.5
    @State private var score = 0
    @State private var timeLeft: Double = 30
    @State private var spawnAccumulator: Double = 0
    @State private var lastTick: Date = Date()
    @State private var resultSubmitted = false

    private let tick = Timer.publish(every: 1.0 / 50.0, on: .main, in: .common).autoconnect()

    private let gameDuration: Double = 30
    private let petYFraction: CGFloat = 0.80
    private let catchRadius: CGFloat = 0.11

    var body: some View {
        GeometryReader { geo in
            ZStack {
                AtmosphereBackground()

                // Fallende Sterne
                ForEach(items) { item in
                    Image(systemName: item.isGolden ? "star.circle.fill" : "star.fill")
                        .font(.system(size: item.isGolden ? 34 : 26))
                        .foregroundStyle(item.isGolden
                            ? Color(red: 0.95, green: 0.72, blue: 0.15)
                            : Color(red: 0.99, green: 0.85, blue: 0.35))
                        .shadow(color: .yellow.opacity(0.5), radius: 6)
                        .position(x: item.x * geo.size.width,
                                  y: item.y * geo.size.height)
                }

                // Pet unten, folgt dem Finger
                PetView(mood: .gluecklich, size: 95)
                    .position(x: petX * geo.size.width,
                              y: petYFraction * geo.size.height)

                // HUD
                VStack {
                    HStack {
                        hudChip(icon: "star.fill", text: "\(score)")
                        Spacer()
                        hudChip(icon: "clock.fill", text: "\(Int(timeLeft.rounded(.up)))s")
                        Spacer()
                        Button {
                            submitIfNeeded()
                            dismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(Theme.textSecondary)
                                .frame(width: 34, height: 34)
                                .background(.white.opacity(0.85))
                                .clipShape(Circle())
                        }
                        .buttonStyle(SquishButtonStyle())
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 14)
                    Spacer()
                }

                if phase == .ready { readyOverlay }
                if phase == .finished { finishedOverlay }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        guard phase == .running else { return }
                        petX = min(max(value.location.x / geo.size.width, 0.08), 0.92)
                    }
            )
            .onReceive(tick) { now in
                update(now: now)
            }
        }
        .ignoresSafeArea(edges: .bottom)
    }

    // MARK: - Game-Loop

    private func update(now: Date) {
        let dt = min(now.timeIntervalSince(lastTick), 0.1)
        lastTick = now
        guard phase == .running else { return }

        timeLeft -= dt
        if timeLeft <= 0 {
            timeLeft = 0
            phase = .finished
            submitIfNeeded()
            return
        }

        // Spawnen: startet gemütlich, wird schneller
        spawnAccumulator += dt
        let interval = max(0.45, 0.9 - (gameDuration - timeLeft) * 0.012)
        if spawnAccumulator >= interval {
            spawnAccumulator = 0
            items.append(FallingItem(
                x: CGFloat.random(in: 0.08...0.92),
                y: -0.05,
                speed: CGFloat.random(in: 0.28...0.42),
                isGolden: Int.random(in: 0..<10) == 0
            ))
        }

        // Bewegen + Kollision
        var caughtPoints = 0
        items = items.compactMap { item in
            var item = item
            item.y += item.speed * CGFloat(dt)

            // Fangen: auf Höhe des Pets und nah genug dran
            if item.y >= petYFraction - 0.045 && item.y <= petYFraction + 0.045
                && abs(item.x - petX) < catchRadius {
                caughtPoints += item.isGolden ? 3 : 1
                return nil
            }
            // Unten raus
            if item.y > 1.1 { return nil }
            return item
        }

        if caughtPoints > 0 {
            score += caughtPoints
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            SoundService.play(.catchStar)
        }
    }

    private func startGame() {
        items = []
        score = 0
        timeLeft = gameDuration
        spawnAccumulator = 0
        petX = 0.5
        resultSubmitted = false
        lastTick = Date()
        phase = .running
    }

    private func submitIfNeeded() {
        guard !resultSubmitted, score >= 0, phase != .ready else { return }
        resultSubmitted = true
        viewModel.finishMiniGame(score: score)
    }

    // MARK: - Overlays

    private var readyOverlay: some View {
        panel {
            Text("Sterne fangen")
                .font(.system(size: 26, weight: .bold, design: .serif))
                .foregroundStyle(Theme.textPrimary)
            Text("Zieh \(viewModel.pet.name) mit dem Finger hin und her. Goldene Sterne zählen dreifach. 30 Sekunden.")
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
            if viewModel.pet.bestGameScore > 0 {
                Chip(text: "Rekord: \(viewModel.pet.bestGameScore)", icon: "trophy.fill", tint: Theme.energy)
            }
            Button {
                startGame()
            } label: {
                Text("Los")
                    .font(.system(.headline, design: .rounded))
                    .padding(.horizontal, 44)
                    .padding(.vertical, 13)
                    .background(Theme.accent)
                    .foregroundStyle(.white)
                    .clipShape(Capsule())
            }
            .buttonStyle(SquishButtonStyle())
        }
    }

    private var finishedOverlay: some View {
        panel {
            Text("\(score) Sterne")
                .font(.system(size: 38, weight: .bold, design: .serif))
                .foregroundStyle(Theme.accent)
            if score >= viewModel.pet.bestGameScore && score > 0 {
                Chip(text: "Neuer Rekord", icon: "trophy.fill", tint: Theme.energy)
            } else {
                Text("Rekord: \(viewModel.pet.bestGameScore)")
                    .font(.system(.footnote, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
            }
            HStack(spacing: 10) {
                Button {
                    startGame()
                } label: {
                    Text("Nochmal")
                        .font(.system(.headline, design: .rounded))
                        .padding(.horizontal, 26)
                        .padding(.vertical, 13)
                        .background(.white)
                        .foregroundStyle(Theme.accent)
                        .clipShape(Capsule())
                        .overlay(Capsule().stroke(Theme.accent.opacity(0.4), lineWidth: 1.5))
                }
                .buttonStyle(SquishButtonStyle())

                Button {
                    dismiss()
                } label: {
                    Text("Fertig")
                        .font(.system(.headline, design: .rounded))
                        .padding(.horizontal, 30)
                        .padding(.vertical, 13)
                        .background(Theme.accent)
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                }
                .buttonStyle(SquishButtonStyle())
            }
        }
    }

    private func panel<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(spacing: 16) {
            content()
        }
        .padding(28)
        .background(.white.opacity(0.94))
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
        .shadow(color: Theme.accent.opacity(0.2), radius: 24, y: 10)
        .padding(.horizontal, 36)
    }

    private func hudChip(icon: String, text: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .bold))
            Text(text)
                .font(.system(.subheadline, design: .rounded).weight(.bold))
        }
        .foregroundStyle(Theme.textPrimary)
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(.white.opacity(0.85))
        .clipShape(Capsule())
    }
}
