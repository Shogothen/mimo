import SwiftUI

/// Stat als Ring mit Icon: kompakt, lesbar, kein Card-Grab.
struct StatRing: View {
    let label: String
    let value: Double        // 0–100
    let systemImage: String
    let tint: Color

    var body: some View {
        VStack(spacing: 7) {
            ZStack {
                Circle()
                    .stroke(tint.opacity(0.18), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: CGFloat(min(max(value, 0), 100) / 100))
                    .stroke(tint, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(duration: 0.6), value: value)
                Image(systemName: systemImage)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(tint)
            }
            .frame(width: 52, height: 52)

            Text(label)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

/// Sprechblase mit Schwanz.
struct SpeechBubble: View {
    let text: String

    var body: some View {
        VStack(spacing: -1) {
            Text(text)
                .font(.system(.footnote, design: .rounded))
                .foregroundStyle(Theme.textPrimary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 16)
                .padding(.vertical, 11)
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

            BubbleTail()
                .fill(.white)
                .frame(width: 18, height: 9)
        }
        .shadow(color: Theme.accent.opacity(0.15), radius: 10, y: 4)
        .padding(.horizontal, 30)
    }
}

struct BubbleTail: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}

/// Konfetti fürs Level-Up: fallende, taumelnde Rechtecke im Canvas.
struct ConfettiView: View {
    struct Particle {
        let x: CGFloat
        let delay: Double
        let color: Color
        let size: CGFloat
        let speed: Double
        let sway: CGFloat
        let spin: Double
    }

    private let particles: [Particle]
    private let start = Date()

    init() {
        let palette: [Color] = [Theme.accent, Theme.energy, Theme.joy, Theme.food,
                                Theme.petBody, Color(red: 0.48, green: 0.56, blue: 0.80)]
        particles = (0..<42).map { _ in
            Particle(
                x: CGFloat.random(in: 0.02...0.98),
                delay: Double.random(in: 0...0.7),
                color: palette.randomElement()!,
                size: CGFloat.random(in: 6...11),
                speed: Double.random(in: 0.55...1.0),
                sway: CGFloat.random(in: 8...26),
                spin: Double.random(in: 1.5...4.0)
            )
        }
    }

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let t = timeline.date.timeIntervalSince(start)
                for p in particles {
                    let time = t - p.delay
                    guard time > 0 else { continue }
                    let y = CGFloat(time * p.speed) * size.height * 0.45 - 20
                    guard y < size.height + 20 else { continue }
                    let x = p.x * size.width + sin(CGFloat(time) * 3) * p.sway
                    var ctx = context
                    ctx.translateBy(x: x, y: y)
                    ctx.rotate(by: .radians(time * p.spin))
                    let rect = CGRect(x: -p.size / 2, y: -p.size * 0.3,
                                      width: p.size, height: p.size * 0.6)
                    ctx.fill(Path(roundedRect: rect, cornerRadius: 2), with: .color(p.color))
                }
            }
        }
        .allowsHitTesting(false)
    }
}
