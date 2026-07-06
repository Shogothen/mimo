import SwiftUI
import Combine

// MARK: - Wabernder Blob

/// Organische Blob-Form: Radius variiert sinusförmig, Phase wird animiert.
struct BlobShape: Shape {
    var phase: CGFloat
    var wobble: CGFloat = 0.035

    var animatableData: CGFloat {
        get { phase }
        set { phase = newValue }
    }

    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let rx = rect.width / 2
        let ry = rect.height / 2
        let n = 72

        var points: [CGPoint] = []
        for i in 0..<n {
            let a = CGFloat(i) / CGFloat(n) * .pi * 2
            let w = 1
                + wobble * sin(a * 3 + phase)
                + wobble * 0.6 * cos(a * 2 - phase * 1.4)
            points.append(CGPoint(x: center.x + cos(a) * rx * w,
                                  y: center.y + sin(a) * ry * w))
        }

        var p = Path()
        let firstMid = CGPoint(x: (points[n - 1].x + points[0].x) / 2,
                               y: (points[n - 1].y + points[0].y) / 2)
        p.move(to: firstMid)
        for i in 0..<n {
            let current = points[i]
            let next = points[(i + 1) % n]
            let mid = CGPoint(x: (current.x + next.x) / 2, y: (current.y + next.y) / 2)
            p.addQuadCurve(to: mid, control: current)
        }
        p.closeSubpath()
        return p
    }
}

// MARK: - PetView

/// Mimo als reine SwiftUI-Illustration: wabernder Blob, Ohren, Arme, Wangen,
/// Glanzlicht, Bodenschatten. Blinzelt, atmet, hüpft wenn glücklich, schläft mit z z z.
struct PetView: View {
    let mood: Mood
    var isSleeping: Bool = false
    var size: CGFloat = 220
    var squishTrigger: Int = 0
    var hat: Hat = .none

    @State private var breathe = false
    @State private var isBlinking = false
    @State private var zzzFloat = false
    @State private var wobblePhase: CGFloat = 0
    @State private var squish = false
    @State private var hop = false

    private let blinkTimer = Timer.publish(every: 3.4, on: .main, in: .common).autoconnect()

    private var isHappy: Bool { mood == .gluecklich && !isSleeping }

    var body: some View {
        ZStack {
            // Bodenschatten: verankert das Pet im Raum
            Ellipse()
                .fill(Theme.textPrimary.opacity(0.14))
                .frame(width: size * 0.72, height: size * 0.13)
                .blur(radius: 6)
                .offset(y: size * 0.50)
                .scaleEffect(breathe ? 1.05 : 0.98)

            petBody
                .offset(y: isHappy && hop ? -size * 0.035 : 0)
        }
        .animation(.easeInOut(duration: isSleeping ? 3.0 : 2.2).repeatForever(autoreverses: true), value: breathe)
        .animation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true), value: hop)
        .onAppear {
            breathe = true
            zzzFloat = true
            hop = true
            withAnimation(.linear(duration: 7).repeatForever(autoreverses: false)) {
                wobblePhase = .pi * 2
            }
        }
        .onReceive(blinkTimer) { _ in
            guard !isSleeping else { return }
            withAnimation(.easeInOut(duration: 0.1)) { isBlinking = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.14) {
                withAnimation(.easeInOut(duration: 0.1)) { isBlinking = false }
            }
        }
        .onChange(of: squishTrigger) { _, _ in
            withAnimation(.spring(duration: 0.18, bounce: 0.5)) { squish = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.16) {
                withAnimation(.spring(duration: 0.35, bounce: 0.6)) { squish = false }
            }
        }
        .frame(width: size * 1.3, height: size * 1.3)
    }

    // MARK: - Körper

    private var petBody: some View {
        ZStack {
            // Ohren
            HStack(spacing: size * 0.42) {
                ear
                ear
            }
            .offset(y: -size * 0.42)

            // Arme
            HStack(spacing: size * 0.88) {
                arm(angle: isHappy ? -30 : 15)
                arm(angle: isHappy ? 30 : -15)
            }
            .offset(y: size * 0.12)

            // Körper: wabernder Blob mit Verlauf
            BlobShape(phase: wobblePhase)
                .fill(
                    LinearGradient(colors: [Theme.petBody, Theme.petBodyDark],
                                   startPoint: .top, endPoint: .bottom)
                )
                .frame(width: size, height: size * 0.92)

            // Glanzlicht oben links
            Ellipse()
                .fill(Color.white.opacity(0.38))
                .frame(width: size * 0.34, height: size * 0.18)
                .blur(radius: size * 0.03)
                .rotationEffect(.degrees(-18))
                .offset(x: -size * 0.20, y: -size * 0.28)

            // Wangen
            HStack(spacing: size * 0.62) {
                cheek
                cheek
            }
            .offset(y: size * 0.06)

            // Gesicht
            face
                .offset(y: -size * 0.05)

            // Hut
            hatView

            // Schlaf-Zs
            if isSleeping {
                Text("z z z")
                    .font(.system(size: size * 0.11, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary.opacity(0.5))
                    .rotationEffect(.degrees(-14))
                    .offset(x: size * 0.42, y: zzzFloat ? -size * 0.54 : -size * 0.42)
                    .opacity(zzzFloat ? 0.3 : 0.9)
                    .animation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true), value: zzzFloat)
            }
        }
        .scaleEffect(x: squish ? 1.09 : (breathe ? 1.02 : 1.0),
                     y: squish ? 0.90 : (breathe ? 1.03 : 1.0),
                     anchor: .bottom)
    }


    // MARK: - Hüte

    @ViewBuilder
    private var hatView: some View {
        switch hat {
        case .none:
            EmptyView()
        case .schleife:
            bow
                .offset(x: size * 0.26, y: -size * 0.44)
                .rotationEffect(.degrees(12))
        case .muetze:
            beanie
                .offset(y: -size * 0.47)
        case .blume:
            flower
                .offset(x: -size * 0.24, y: -size * 0.45)
        case .krone:
            CrownShape()
                .fill(Color(red: 0.95, green: 0.76, blue: 0.22))
                .frame(width: size * 0.30, height: size * 0.16)
                .overlay(
                    CrownShape().stroke(Color(red: 0.80, green: 0.58, blue: 0.10), lineWidth: 1.5)
                )
                .offset(y: -size * 0.50)
        }
    }

    private var bow: some View {
        ZStack {
            Ellipse()
                .fill(Theme.accent)
                .frame(width: size * 0.13, height: size * 0.08)
                .rotationEffect(.degrees(-28))
                .offset(x: -size * 0.055)
            Ellipse()
                .fill(Theme.accent)
                .frame(width: size * 0.13, height: size * 0.08)
                .rotationEffect(.degrees(28))
                .offset(x: size * 0.055)
            Circle()
                .fill(Color(red: 0.50, green: 0.20, blue: 0.33))
                .frame(width: size * 0.05, height: size * 0.05)
        }
    }

    private var beanie: some View {
        VStack(spacing: -size * 0.01) {
            Circle()
                .fill(.white)
                .frame(width: size * 0.06, height: size * 0.06)
            Ellipse()
                .fill(Theme.accent)
                .frame(width: size * 0.34, height: size * 0.20)
                .clipShape(Rectangle().offset(y: -size * 0.05))
            Capsule()
                .fill(Color(red: 0.50, green: 0.20, blue: 0.33))
                .frame(width: size * 0.36, height: size * 0.045)
        }
    }

    private var flower: some View {
        ZStack {
            ForEach(0..<5, id: \.self) { i in
                Ellipse()
                    .fill(.white)
                    .frame(width: size * 0.055, height: size * 0.085)
                    .offset(y: -size * 0.045)
                    .rotationEffect(.degrees(Double(i) * 72))
            }
            Circle()
                .fill(Color(red: 0.95, green: 0.76, blue: 0.22))
                .frame(width: size * 0.055, height: size * 0.055)
        }
    }

    // MARK: - Gesicht je nach Stimmung

    @ViewBuilder
    private var face: some View {
        VStack(spacing: size * 0.06) {
            HStack(spacing: size * 0.22) {
                eye
                eye
            }
            mouth
        }
    }

    @ViewBuilder
    private var eye: some View {
        if isSleeping || isBlinking {
            SmileShape()
                .stroke(Theme.textPrimary, style: StrokeStyle(lineWidth: size * 0.022, lineCap: .round))
                .frame(width: size * 0.10, height: size * 0.03)
        } else {
            switch mood {
            case .muede, .vertraeumt:
                Capsule()
                    .fill(Theme.textPrimary)
                    .frame(width: size * 0.10, height: size * 0.035)
            case .frech:
                Capsule()
                    .fill(Theme.textPrimary)
                    .frame(width: size * 0.09, height: size * 0.05)
                    .rotationEffect(.degrees(-12))
            case .dramatisch:
                ZStack {
                    Circle().fill(Theme.textPrimary).frame(width: size * 0.11, height: size * 0.11)
                    Circle().fill(.white).frame(width: size * 0.035).offset(x: -size * 0.02, y: -size * 0.02)
                }
            default:
                ZStack {
                    Circle().fill(Theme.textPrimary).frame(width: size * 0.09, height: size * 0.09)
                    Circle().fill(.white).frame(width: size * 0.028).offset(x: -size * 0.015, y: -size * 0.015)
                }
            }
        }
    }

    @ViewBuilder
    private var mouth: some View {
        if isSleeping {
            Circle()
                .fill(Theme.textPrimary.opacity(0.85))
                .frame(width: size * 0.045, height: size * 0.045)
        } else {
            switch mood {
            case .gluecklich, .anhaenglich:
                SmileShape()
                    .stroke(Theme.textPrimary, style: StrokeStyle(lineWidth: size * 0.02, lineCap: .round))
                    .frame(width: size * 0.16, height: size * 0.08)
            case .hungrig, .dramatisch:
                Ellipse()
                    .fill(Theme.textPrimary)
                    .frame(width: size * 0.10, height: size * 0.09)
            case .muede, .gelangweilt:
                Capsule()
                    .fill(Theme.textPrimary)
                    .frame(width: size * 0.10, height: size * 0.02)
            case .frech:
                SmileShape()
                    .stroke(Theme.textPrimary, style: StrokeStyle(lineWidth: size * 0.02, lineCap: .round))
                    .frame(width: size * 0.12, height: size * 0.05)
                    .rotationEffect(.degrees(-8))
            case .vertraeumt:
                SmileShape()
                    .stroke(Theme.textPrimary, style: StrokeStyle(lineWidth: size * 0.018, lineCap: .round))
                    .frame(width: size * 0.10, height: size * 0.04)
            }
        }
    }

    // MARK: - Bauteile

    private var ear: some View {
        Ellipse()
            .fill(Theme.petBodyDark)
            .frame(width: size * 0.16, height: size * 0.22)
    }

    private func arm(angle: Double) -> some View {
        Capsule()
            .fill(Theme.petBodyDark)
            .frame(width: size * 0.10, height: size * 0.22)
            .rotationEffect(.degrees(angle))
    }

    private var cheek: some View {
        Ellipse()
            .fill(Color(red: 0.97, green: 0.55, blue: 0.48).opacity(0.5))
            .frame(width: size * 0.11, height: size * 0.07)
    }
}

/// Einfache Lächel-Kurve.
struct SmileShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.minY))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY),
                       control: CGPoint(x: rect.midX, y: rect.maxY))
        return p
    }
}

/// Krone: drei Zacken mit Basis.
struct CrownShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width
        let h = rect.height
        var p = Path()
        p.move(to: CGPoint(x: 0, y: h))
        p.addLine(to: CGPoint(x: 0, y: h * 0.42))
        p.addLine(to: CGPoint(x: w * 0.20, y: h * 0.66))
        p.addLine(to: CGPoint(x: w * 0.34, y: h * 0.08))
        p.addLine(to: CGPoint(x: w * 0.50, y: h * 0.58))
        p.addLine(to: CGPoint(x: w * 0.66, y: h * 0.08))
        p.addLine(to: CGPoint(x: w * 0.80, y: h * 0.66))
        p.addLine(to: CGPoint(x: w, y: h * 0.42))
        p.addLine(to: CGPoint(x: w, y: h))
        p.closeSubpath()
        return p
    }
}
