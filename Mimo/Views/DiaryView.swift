import SwiftUI

/// Tagebuch aus Mimos Sicht als Zeitstrahl mit Stimmungs-Markern.
struct DiaryView: View {
    @EnvironmentObject var viewModel: AppViewModel

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .short
        f.locale = Locale(identifier: "de_DE")
        return f
    }()

    var body: some View {
        ZStack {
            AtmosphereBackground()
            FloatingParticlesView()

            VStack(spacing: 0) {
                Text("\(viewModel.pet.name)s Tagebuch")
                    .font(.system(size: 26, weight: .bold, design: .serif))
                    .foregroundStyle(Theme.textPrimary)
                    .padding(.top, 16)

                if viewModel.state.diary.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        PetView(mood: .vertraeumt, size: 110)
                        Text("Noch keine Einträge.\n\(viewModel.pet.name) sammelt noch Material.")
                            .font(.system(.subheadline, design: .rounded))
                            .foregroundStyle(Theme.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    Spacer()
                    Color.clear.frame(height: 110)
                } else {
                    ScrollView(showsIndicators: false) {
                        weekReview
                            .padding(.horizontal, 20)
                            .padding(.top, 16)

                        LazyVStack(alignment: .leading, spacing: 0) {
                            ForEach(Array(viewModel.state.diary.enumerated()), id: \.element.id) { index, entry in
                                timelineRow(entry, isLast: index == viewModel.state.diary.count - 1)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 18)
                        .padding(.bottom, 110)
                    }
                }
            }
        }
    }

    // MARK: - Wochenrückblick

    private func answerTint(_ raw: String) -> Color {
        switch raw {
        case CheckInAnswer.superTag.rawValue:    return Theme.energy
        case CheckInAnswer.okay.rawValue:        return Theme.food
        case CheckInAnswer.stressig.rawValue:    return Theme.accent
        case CheckInAnswer.muede.rawValue:       return Color(red: 0.55, green: 0.53, blue: 0.72)
        default:                                 return Color(red: 0.60, green: 0.56, blue: 0.52)
        }
    }

    @ViewBuilder
    private var weekReview: some View {
        let memory = viewModel.pet.memory
        if !memory.recentCheckIns.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                SectionLabel(text: "Deine letzten Tage")

                HStack(spacing: 8) {
                    // Neueste rechts, wie ein Zeitverlauf
                    ForEach(Array(memory.recentCheckIns.reversed().enumerated()), id: \.offset) { _, raw in
                        VStack(spacing: 4) {
                            Circle()
                                .fill(answerTint(raw))
                                .frame(width: 14, height: 14)
                            Text(String(raw.prefix(2)))
                                .font(.system(size: 8, weight: .semibold, design: .rounded))
                                .foregroundStyle(Theme.textSecondary)
                        }
                    }
                    Spacer()
                }

                Text(ReactionEngine.weekSummary(memory: memory, name: viewModel.pet.name))
                    .font(.system(.caption, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cozyCard()
        }
    }

    // MARK: - Zeitstrahl

    private func timelineRow(_ entry: DiaryEntry, isLast: Bool) -> some View {
        HStack(alignment: .top, spacing: 14) {
            // Marker + Linie
            VStack(spacing: 0) {
                Circle()
                    .fill(entry.mood.tint)
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(.white, lineWidth: 2.5))
                    .padding(.top, 20)
                if !isLast {
                    Rectangle()
                        .fill(Theme.textSecondary.opacity(0.22))
                        .frame(width: 2)
                        .frame(maxHeight: .infinity)
                }
            }
            .frame(width: 14)

            // Eintrag
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(Self.dateFormatter.string(from: entry.date))
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(Theme.textSecondary)
                    Spacer()
                    Chip(text: entry.mood.rawValue, tint: entry.mood.tint)
                }
                Text(entry.text)
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundStyle(Theme.textPrimary)
                    .lineSpacing(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cozyCard()
            .padding(.bottom, 12)
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}
