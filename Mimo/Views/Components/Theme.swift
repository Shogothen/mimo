import SwiftUI

// MARK: - Tagesphasen (Signatur: die App lebt auf einem Himmel, der der Tageszeit folgt)

enum DayPhase {
    case morning, day, evening, night

    static func current(_ date: Date = Date()) -> DayPhase {
        let h = Calendar.current.component(.hour, from: date)
        switch h {
        case 6..<11:  return .morning
        case 11..<17: return .day
        case 17..<21: return .evening
        default:      return .night
        }
    }

    /// Himmelsverlauf der Phase. Alle Phasen bleiben hell genug für dunkle Typo.
    var sky: [Color] {
        switch self {
        case .morning: return [Color(red: 1.00, green: 0.94, blue: 0.80),
                               Color(red: 1.00, green: 0.85, blue: 0.72)]
        case .day:     return [Color(red: 0.87, green: 0.93, blue: 0.97),
                               Color(red: 0.99, green: 0.93, blue: 0.84)]
        case .evening: return [Color(red: 0.99, green: 0.84, blue: 0.78),
                               Color(red: 0.90, green: 0.78, blue: 0.88)]
        case .night:   return [Color(red: 0.78, green: 0.76, blue: 0.90),
                               Color(red: 0.66, green: 0.64, blue: 0.82)]
        }
    }

    /// Weiches Leuchten hinter dem Pet.
    var glow: Color {
        switch self {
        case .morning: return Color(red: 1.00, green: 0.80, blue: 0.55)
        case .day:     return Color(red: 1.00, green: 0.90, blue: 0.65)
        case .evening: return Color(red: 1.00, green: 0.70, blue: 0.60)
        case .night:   return Color(red: 0.85, green: 0.82, blue: 1.00)
        }
    }
}

// MARK: - Farbwelt

enum Theme {
    // Tinte: tiefes Pflaumenbraun statt Schwarz
    static let textPrimary = Color(red: 0.26, green: 0.18, blue: 0.22)
    static let textSecondary = Color(red: 0.48, green: 0.38, blue: 0.43)

    // Akzent: Beere
    static let accent = Color(red: 0.62, green: 0.28, blue: 0.42)
    static let accentSoft = Color(red: 0.93, green: 0.76, blue: 0.82)

    // Pet: Aprikose
    static let petBody = Color(red: 0.99, green: 0.74, blue: 0.53)
    static let petBodyDark = Color(red: 0.95, green: 0.57, blue: 0.42)

    // Flächen
    static let card = Color.white.opacity(0.72)

    // Stat-Farben
    static let energy = Color(red: 0.94, green: 0.66, blue: 0.23)
    static let joy = Color(red: 0.90, green: 0.42, blue: 0.42)
    static let food = Color(red: 0.55, green: 0.65, blue: 0.35)
    static let bond = accent
}

extension Mood {
    /// Stimmungsfarbe für Chips und Tagebuch-Marker.
    var tint: Color {
        switch self {
        case .gluecklich:  return Theme.energy
        case .muede:       return Color(red: 0.55, green: 0.53, blue: 0.72)
        case .hungrig:     return Theme.food
        case .frech:       return Color(red: 0.85, green: 0.48, blue: 0.25)
        case .anhaenglich: return Theme.joy
        case .dramatisch:  return Theme.accent
        case .vertraeumt:  return Color(red: 0.48, green: 0.56, blue: 0.80)
        case .gelangweilt: return Color(red: 0.60, green: 0.56, blue: 0.52)
        }
    }
}

// MARK: - Hintergrund

/// Lebendiger Himmel: Verlauf nach Tagesphase plus weiche Lichtinseln.
struct AtmosphereBackground: View {
    var phase: DayPhase = .current()

    var body: some View {
        ZStack {
            LinearGradient(colors: phase.sky, startPoint: .top, endPoint: .bottom)

            Circle()
                .fill(phase.glow.opacity(0.45))
                .frame(width: 360, height: 360)
                .blur(radius: 90)
                .offset(x: -110, y: -270)

            Circle()
                .fill(Color.white.opacity(0.35))
                .frame(width: 300, height: 300)
                .blur(radius: 100)
                .offset(x: 150, y: 260)
        }
        .ignoresSafeArea()
    }
}

// MARK: - Bausteine

/// "Papier"-Card: weicher Verlauf statt flachem Weiß, Lichtkante oben,
/// getönter Rand, farbiger statt grauer Schatten.
struct CozyCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(
                LinearGradient(colors: [Color.white.opacity(0.92), Color.white.opacity(0.68)],
                               startPoint: .top, endPoint: .bottom)
            )
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .strokeBorder(
                        LinearGradient(colors: [Color.white.opacity(0.9), Theme.accent.opacity(0.10)],
                                       startPoint: .top, endPoint: .bottom),
                        lineWidth: 1
                    )
            )
            .shadow(color: Theme.accent.opacity(0.10), radius: 14, x: 0, y: 6)
    }
}

extension View {
    func cozyCard() -> some View { modifier(CozyCard()) }
}

/// Buttons drücken sich weich ein.
struct SquishButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.93 : 1)
            .animation(.spring(duration: 0.25, bounce: 0.4), value: configuration.isPressed)
    }
}

/// Kleiner Kapsel-Chip.
struct Chip: View {
    let text: String
    var icon: String? = nil
    var tint: Color = Theme.accent

    var body: some View {
        HStack(spacing: 4) {
            if let icon {
                Image(systemName: icon).font(.caption2.weight(.bold))
            }
            Text(text).font(.caption.weight(.semibold))
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(tint.opacity(0.14))
        .clipShape(Capsule())
    }
}

/// Editoriale Sektions-Überschrift: Versalien, Letterspacing, Akzentstrich.
struct SectionLabel: View {
    let text: String

    var body: some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(Theme.accent)
                .frame(width: 16, height: 3)
            Text(text.uppercased())
                .font(.system(size: 11, weight: .bold, design: .rounded))
                .kerning(1.6)
                .foregroundStyle(Theme.textSecondary)
        }
    }
}

/// Schwebende Lichtpartikel: tagsüber Pollen im Gegenlicht, nachts Glühwürmchen.
/// Macht den Himmel lebendig, ohne aufdringlich zu sein.
struct FloatingParticlesView: View {
    var phase: DayPhase = .current()

    private struct Mote {
        let x: CGFloat        // 0–1 Startposition
        let baseY: CGFloat    // 0–1
        let size: CGFloat
        let speed: Double     // Aufwärtsdrift
        let sway: CGFloat
        let swaySpeed: Double
        let pulseOffset: Double
    }

    private let motes: [Mote] = (0..<16).map { _ in
        Mote(
            x: CGFloat.random(in: 0.03...0.97),
            baseY: CGFloat.random(in: 0.05...0.95),
            size: CGFloat.random(in: 2.5...5.5),
            speed: Double.random(in: 0.008...0.02),
            sway: CGFloat.random(in: 6...18),
            swaySpeed: Double.random(in: 0.3...0.7),
            pulseOffset: Double.random(in: 0...6)
        )
    }

    private let start = Date()

    private var color: Color {
        phase == .night
            ? Color(red: 0.98, green: 0.95, blue: 0.70)   // Glühwürmchen
            : Color.white                                  // Lichtpollen
    }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { timeline in
            Canvas { context, size in
                let t = timeline.date.timeIntervalSince(start)
                for mote in motes {
                    // Langsam nach oben treiben, oben wieder unten einsteigen
                    var y = mote.baseY - CGFloat(t * mote.speed).truncatingRemainder(dividingBy: 1.2)
                    if y < -0.05 { y += 1.2 }
                    let x = mote.x + sin(CGFloat(t * mote.swaySpeed)) * (mote.sway / size.width)

                    // Sanftes Pulsieren; nachts deutlicher (Glühwürmchen)
                    let pulse = (sin(t * 0.8 + mote.pulseOffset) + 1) / 2
                    let opacity = phase == .night
                        ? 0.25 + pulse * 0.55
                        : 0.12 + pulse * 0.25

                    let rect = CGRect(x: x * size.width - mote.size / 2,
                                      y: y * size.height - mote.size / 2,
                                      width: mote.size, height: mote.size)
                    context.opacity = opacity
                    context.fill(Path(ellipseIn: rect), with: .color(color))
                }
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}

/// Weicher Hügel als Bühne fürs Pet.
struct HillShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: 0, y: rect.maxY))
        p.addLine(to: CGPoint(x: 0, y: rect.height * 0.55))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.height * 0.55),
                       control: CGPoint(x: rect.midX, y: -rect.height * 0.15))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}

extension DayPhase {
    /// Hügelfarbe passend zur Phase.
    var hill: Color {
        switch self {
        case .morning: return Color(red: 0.72, green: 0.78, blue: 0.52)
        case .day:     return Color(red: 0.66, green: 0.78, blue: 0.52)
        case .evening: return Color(red: 0.62, green: 0.66, blue: 0.52)
        case .night:   return Color(red: 0.42, green: 0.46, blue: 0.55)
        }
    }
}
