import SwiftUI

/// Mimos Zuhause: Raum mit Fenster, dessen Himmel der echten Tageszeit folgt.
/// Dekorationen werden per Level freigeschaltet.
struct RoomView: View {
    @EnvironmentObject var viewModel: AppViewModel

    private var level: Int { viewModel.pet.stats.level }
    private var phase: DayPhase { DayPhase.current() }
    private var isNight: Bool { phase == .night }

    var body: some View {
        ZStack {
            AtmosphereBackground()
            FloatingParticlesView()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    Text("\(viewModel.pet.name)s Zuhause")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundStyle(Theme.textPrimary)
                        .padding(.top, 16)

                    roomScene
                        .frame(height: 400)

                    wardrobe

                    unlockList
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 110)
            }
        }
    }

    // MARK: - Szene

    private var roomScene: some View {
        ZStack {
            // Wand + Boden, abends und nachts gedimmt
            VStack(spacing: 0) {
                (isNight
                    ? Color(red: 0.45, green: 0.40, blue: 0.52)
                    : Color(red: 0.98, green: 0.90, blue: 0.82))
                ZStack(alignment: .top) {
                    (isNight
                        ? Color(red: 0.36, green: 0.30, blue: 0.36)
                        : Color(red: 0.89, green: 0.73, blue: 0.59))
                    // Fußleiste
                    Rectangle()
                        .fill(.white.opacity(isNight ? 0.12 : 0.5))
                        .frame(height: 5)
                }
                .frame(height: 130)
            }
            .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

            // Bilderrahmen: ein kleines Selbstportrait. Natürlich.
            pictureFrame
                .offset(x: 18, y: -122)

            // Fenster: Himmel = echte Tagesphase (immer da, das ist Mimos Blick nach draußen)
            window
                .offset(x: -78, y: -108)

            // Sternenfenster (Level 5): zweites, rundes Fenster mit Nachthimmel
            if level >= 5 {
                starWindow
                    .offset(x: 96, y: -112)
            }

            // Lampe (Level 4)
            if level >= 4 {
                lamp
                    .offset(x: 128, y: 6)
            }

            // Pflanze (Level 3)
            if level >= 3 {
                plant
                    .offset(x: -122, y: 52)
            }

            // Teppich
            Ellipse()
                .fill((isNight ? Color.white : Theme.accent).opacity(isNight ? 0.10 : 0.16))
                .frame(width: 210, height: 62)
                .offset(y: 128)

            // Kissen (Level 2)
            if level >= 2 {
                pillow
                    .offset(x: 84, y: 102)
            }

            // Pet
            PetView(mood: viewModel.mood,
                    isSleeping: viewModel.pet.isSleeping,
                    size: 125,
                    hat: viewModel.pet.hat)
                .offset(y: 62)

            // Weiche Vignette gibt der Szene Tiefe
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .strokeBorder(
                    RadialGradient(colors: [.clear, Theme.textPrimary.opacity(isNight ? 0.28 : 0.12)],
                                   center: .center, startRadius: 110, endRadius: 260),
                    lineWidth: 60
                )
                .allowsHitTesting(false)
        }
    }

    private var pictureFrame: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 6)
                .fill(Color(red: 0.62, green: 0.46, blue: 0.32))
                .frame(width: 46, height: 54)
            RoundedRectangle(cornerRadius: 4)
                .fill(Color(red: 0.99, green: 0.94, blue: 0.85))
                .frame(width: 36, height: 44)
            // Mini-Blob-Portrait
            Ellipse()
                .fill(Theme.petBody)
                .frame(width: 20, height: 18)
                .offset(y: 6)
            Circle().fill(Theme.textPrimary).frame(width: 2.5, height: 2.5).offset(x: -4, y: 4)
            Circle().fill(Theme.textPrimary).frame(width: 2.5, height: 2.5).offset(x: 4, y: 4)
        }
        .rotationEffect(.degrees(-2))
        .opacity(isNight ? 0.7 : 1)
    }

    private var window: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(LinearGradient(colors: phase.sky, startPoint: .top, endPoint: .bottom))
                .frame(width: 104, height: 84)
            if isNight {
                // Mond + Sterne
                Circle().fill(.white.opacity(0.9)).frame(width: 16, height: 16).offset(x: 26, y: -22)
                ForEach(0..<5, id: \.self) { i in
                    Circle()
                        .fill(.white.opacity(0.9))
                        .frame(width: 2.5, height: 2.5)
                        .offset(x: CGFloat([-32, -12, 8, -24, 18][i]),
                                y: CGFloat([-18, 6, 20, 24, -8][i]))
                }
            } else {
                // Sonne
                Circle()
                    .fill(Color(red: 1.0, green: 0.85, blue: 0.5))
                    .frame(width: 20, height: 20)
                    .blur(radius: 1)
                    .offset(x: 24, y: -20)
            }
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(.white.opacity(isNight ? 0.5 : 0.9), lineWidth: 5)
                .frame(width: 104, height: 84)
            // Fensterkreuz
            Rectangle().fill(.white.opacity(isNight ? 0.5 : 0.9)).frame(width: 3, height: 84)
            Rectangle().fill(.white.opacity(isNight ? 0.5 : 0.9)).frame(width: 104, height: 3)
        }
    }

    private var starWindow: some View {
        ZStack {
            Circle()
                .fill(Color(red: 0.14, green: 0.16, blue: 0.30))
                .frame(width: 84, height: 84)
            ForEach(0..<6, id: \.self) { i in
                Circle()
                    .fill(.white)
                    .frame(width: 3, height: 3)
                    .offset(x: CGFloat([-24, -8, 14, 24, 3, -16][i]),
                            y: CGFloat([-14, 9, -18, 6, -3, 18][i]))
            }
            Circle()
                .stroke(.white.opacity(0.8), lineWidth: 5)
                .frame(width: 84, height: 84)
        }
    }

    private var lamp: some View {
        VStack(spacing: 0) {
            ZStack {
                if isNight {
                    Circle()
                        .fill(Color(red: 1.0, green: 0.88, blue: 0.55).opacity(0.5))
                        .frame(width: 80, height: 80)
                        .blur(radius: 22)
                }
                Circle()
                    .fill(Color(red: 1.0, green: 0.90, blue: 0.62))
                    .frame(width: 32, height: 32)
                    .shadow(color: .yellow.opacity(isNight ? 0.8 : 0.4), radius: isNight ? 14 : 8)
            }
            Rectangle()
                .fill(Theme.textSecondary.opacity(0.6))
                .frame(width: 4, height: 66)
            Capsule()
                .fill(Theme.textSecondary.opacity(0.6))
                .frame(width: 30, height: 6)
        }
    }

    private var plant: some View {
        VStack(spacing: -6) {
            ZStack {
                Ellipse().fill(Color(red: 0.42, green: 0.60, blue: 0.40))
                    .frame(width: 20, height: 44).rotationEffect(.degrees(-22))
                Ellipse().fill(Color(red: 0.50, green: 0.68, blue: 0.46))
                    .frame(width: 20, height: 52)
                Ellipse().fill(Color(red: 0.42, green: 0.60, blue: 0.40))
                    .frame(width: 20, height: 44).rotationEffect(.degrees(22))
            }
            ZStack(alignment: .top) {
                RoundedRectangle(cornerRadius: 7)
                    .fill(Theme.accent.opacity(0.85))
                    .frame(width: 40, height: 32)
                Rectangle()
                    .fill(.white.opacity(0.25))
                    .frame(width: 40, height: 8)
            }
        }
    }

    private var pillow: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 15, style: .continuous)
                .fill(Theme.accentSoft)
                .frame(width: 74, height: 36)
            RoundedRectangle(cornerRadius: 15, style: .continuous)
                .stroke(Theme.accent.opacity(0.35), lineWidth: 2)
                .frame(width: 74, height: 36)
            // Naht
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [4, 4]))
                .foregroundStyle(Theme.accent.opacity(0.3))
                .frame(width: 60, height: 24)
        }
    }

    // MARK: - Garderobe

    private var wardrobe: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Garderobe")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(Hat.allCases) { hat in
                        wardrobeItem(hat)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cozyCard()
    }

    private func wardrobeItem(_ hat: Hat) -> some View {
        let unlocked = viewModel.state.unlockedHats.contains(hat.rawValue)
        let equipped = viewModel.pet.hat == hat

        return Button {
            viewModel.equipHat(hat)
        } label: {
            VStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(equipped ? Theme.accentSoft.opacity(0.5) : Color.white.opacity(0.6))
                        .frame(width: 62, height: 62)
                    if hat == .none {
                        Image(systemName: "circle.slash")
                            .font(.system(size: 20))
                            .foregroundStyle(Theme.textSecondary)
                    } else if unlocked {
                        PetView(mood: .gluecklich, size: 34, hat: hat)
                            .frame(width: 56, height: 56)
                            .offset(y: 6)
                            .clipShape(Circle())
                    } else {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 18))
                            .foregroundStyle(Theme.textSecondary.opacity(0.5))
                    }
                    if equipped {
                        Circle()
                            .stroke(Theme.accent, lineWidth: 2.5)
                            .frame(width: 62, height: 62)
                    }
                }
                Text(hat.title)
                    .font(.system(.caption2, design: .rounded).weight(.semibold))
                    .foregroundStyle(unlocked ? Theme.textPrimary : Theme.textSecondary.opacity(0.6))
                if !unlocked {
                    Text(hat.unlockHint)
                        .font(.system(size: 8, design: .rounded))
                        .foregroundStyle(Theme.textSecondary.opacity(0.7))
                        .lineLimit(1)
                }
            }
            .frame(width: 84)
        }
        .buttonStyle(SquishButtonStyle())
        .disabled(!unlocked)
    }

    // MARK: - Unlock-Liste

    private var unlockList: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Einrichtung")

            unlockRow(name: "Kissen", requiredLevel: 2)
            unlockRow(name: "Pflanze", requiredLevel: 3)
            unlockRow(name: "Lampe", requiredLevel: 4)
            unlockRow(name: "Sternenfenster", requiredLevel: 5)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cozyCard()
    }

    private func unlockRow(name: String, requiredLevel: Int) -> some View {
        HStack {
            Image(systemName: level >= requiredLevel ? "checkmark.circle.fill" : "lock.fill")
                .foregroundStyle(level >= requiredLevel ? Theme.accent : Theme.textSecondary.opacity(0.45))
            Text(name)
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(Theme.textPrimary)
            Spacer()
            if level < requiredLevel {
                Chip(text: "Level \(requiredLevel)", tint: Theme.textSecondary)
            }
        }
    }
}
