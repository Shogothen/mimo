import SwiftUI

/// Hauptscreen: Pet als Held direkt auf dem Himmel, Rings statt Card-Grab,
/// Interaktions-Dock, Konfetti beim Level-Up.
struct HomeView: View {
    @EnvironmentObject var viewModel: AppViewModel
    @State private var showCheckIn = false
    @State private var showFeedSheet = false
    @State private var showTalkSheet = false
    @State private var showMiniGame = false
    @State private var squishTrigger = 0

    var body: some View {
        ZStack {
            AtmosphereBackground()
            FloatingParticlesView()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    header

                    // Pet-Bühne: Aura in Stimmungsfarbe, Hügel als Boden
                    ZStack(alignment: .top) {
                        // Mood-Aura: die Stimmung ist ambient sichtbar
                        Circle()
                            .fill(viewModel.mood.tint.opacity(0.28))
                            .frame(width: 260, height: 260)
                            .blur(radius: 55)
                            .offset(y: 60)
                            .animation(.easeInOut(duration: 1.2), value: viewModel.mood)

                        // Hügel: das Pet steht auf etwas, statt zu schweben
                        VStack {
                            Spacer()
                            ZStack {
                                HillShape()
                                    .fill(DayPhase.current().hill.opacity(0.35))
                                    .frame(height: 90)
                                    .offset(y: 14)
                                HillShape()
                                    .fill(DayPhase.current().hill.opacity(0.55))
                                    .frame(height: 62)
                                    .padding(.horizontal, 26)
                                    .offset(y: 22)
                            }
                        }
                        .frame(height: 330)

                        VStack(spacing: 0) {
                            Color.clear.frame(height: 62)
                            PetView(mood: viewModel.mood,
                                    isSleeping: viewModel.pet.isSleeping,
                                    size: 195,
                                    squishTrigger: squishTrigger,
                                    hat: viewModel.pet.hat)
                                .onTapGesture {
                                    squishTrigger += 1
                                    if viewModel.pet.isSleeping {
                                        viewModel.wakeUp()
                                    } else {
                                        viewModel.interact(.streicheln)
                                    }
                                }
                        }

                        if let reaction = viewModel.currentReaction {
                            SpeechBubble(text: reaction)
                                .transition(.scale(scale: 0.7, anchor: .bottom).combined(with: .opacity))
                        }
                    }
                    .frame(height: 330)
                    .animation(.spring(duration: 0.35, bounce: 0.35), value: viewModel.currentReaction)

                    if viewModel.pet.isSleeping {
                        Text("Tippen zum Aufwecken")
                            .font(.caption2)
                            .foregroundStyle(Theme.textSecondary)
                            .padding(.top, -10)
                    }

                    // Stimmung + Tagesnachricht: direkt auf dem Himmel, keine Card
                    VStack(spacing: 8) {
                        Chip(text: viewModel.mood.rawValue, tint: viewModel.mood.tint)
                        Text(viewModel.moodText)
                            .font(.system(.subheadline, design: .rounded).weight(.semibold))
                            .foregroundStyle(Theme.textPrimary)
                        Text(viewModel.dailyMessage)
                            .font(.system(.footnote, design: .rounded))
                            .foregroundStyle(Theme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 28)
                    }

                    // Stats als Rings
                    HStack(spacing: 4) {
                        StatRing(label: "Energie", value: viewModel.pet.stats.energie,
                                 systemImage: "bolt.fill", tint: Theme.energy)
                        StatRing(label: "Laune", value: viewModel.pet.stats.laune,
                                 systemImage: "face.smiling.fill", tint: Theme.joy)
                        StatRing(label: "Sättigung", value: viewModel.pet.stats.saettigung,
                                 systemImage: "fork.knife", tint: Theme.food)
                        StatRing(label: "Bond", value: viewModel.pet.stats.bond,
                                 systemImage: "heart.fill", tint: Theme.bond)
                    }
                    .padding(.vertical, 14)
                    .padding(.horizontal, 10)
                    .background(Theme.card)
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .shadow(color: Theme.accent.opacity(0.08), radius: 12, y: 5)

                    // Tagesziele
                    questsCard

                    // Interaktionen
                    interactionGrid
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 110)
            }

            levelUpOverlay
        }
        .sheet(isPresented: $showCheckIn) {
            CheckInSheet()
                .presentationDetents([.medium])
                .presentationCornerRadius(32)
        }
        .sheet(isPresented: $showFeedSheet) {
            FeedSheet()
                .presentationDetents([.medium])
                .presentationCornerRadius(32)
        }
        .sheet(isPresented: $showTalkSheet) {
            TalkSheet()
                .presentationDetents([.medium])
                .presentationCornerRadius(32)
        }
        .fullScreenCover(isPresented: $showMiniGame) {
            MiniGameView()
        }
        .onAppear { viewModel.applyTimeDecay() }
    }

    // MARK: - Header

    private var header: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 5) {
                Text(viewModel.pet.name)
                    .font(.system(size: 36, weight: .bold, design: .serif))
                    .foregroundStyle(Theme.textPrimary)
                HStack(spacing: 6) {
                    Chip(text: "Level \(viewModel.pet.stats.level)", icon: "sparkles")
                    if viewModel.pet.checkInStreak >= 2 {
                        Chip(text: "\(viewModel.pet.checkInStreak) Tage",
                             icon: "flame.fill", tint: Theme.energy)
                    }
                }
            }
            Spacer()
            // XP-Ring
            ZStack {
                Circle().stroke(Theme.accent.opacity(0.15), lineWidth: 5)
                Circle()
                    .trim(from: 0, to: viewModel.xpProgress)
                    .stroke(Theme.accent, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(duration: 0.6), value: viewModel.xpProgress)
                Text("XP")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
            }
            .frame(width: 42, height: 42)
        }
        .padding(.top, 8)
    }

    // MARK: - Interaktionen

    private var interactionGrid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3),
                  spacing: 10) {
            interactionButton(.streicheln)
            actionButton(icon: InteractionType.fuettern.systemImage, label: "Füttern") {
                showFeedSheet = true
            }
            actionButton(icon: "star.fill", label: "Spielen") {
                showMiniGame = true
            }
            actionButton(icon: InteractionType.reden.systemImage, label: "Reden") {
                showTalkSheet = true
            }
            interactionButton(.schlafen)
            checkInButton
        }
    }

    private func interactionButton(_ type: InteractionType) -> some View {
        Button {
            squishTrigger += 1
            viewModel.interact(type)
        } label: {
            VStack(spacing: 8) {
                Image(systemName: type.systemImage)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .background(
                        LinearGradient(colors: [Theme.petBody, Theme.petBodyDark],
                                       startPoint: .top, endPoint: .bottom)
                    )
                    .clipShape(Circle())
                    .overlay(
                        Circle().strokeBorder(
                            LinearGradient(colors: [.white.opacity(0.55), .clear],
                                           startPoint: .top, endPoint: .bottom),
                            lineWidth: 1.5
                        )
                    )
                    .shadow(color: Theme.petBodyDark.opacity(0.45), radius: 5, y: 3)
                Text(type.label)
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .buttonStyle(SquishButtonStyle())
    }

    /// Interaktions-Button mit eigener Aktion (für Sheets statt Direkt-Interaktion).
    private func actionButton(icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .background(
                        LinearGradient(colors: [Theme.petBody, Theme.petBodyDark],
                                       startPoint: .top, endPoint: .bottom)
                    )
                    .clipShape(Circle())
                    .overlay(
                        Circle().strokeBorder(
                            LinearGradient(colors: [.white.opacity(0.55), .clear],
                                           startPoint: .top, endPoint: .bottom),
                            lineWidth: 1.5
                        )
                    )
                    .shadow(color: Theme.petBodyDark.opacity(0.45), radius: 5, y: 3)
                Text(label)
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .buttonStyle(SquishButtonStyle())
    }

    // MARK: - Tagesziele

    @ViewBuilder
    private var questsCard: some View {
        if let daily = viewModel.quests {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    SectionLabel(text: "Tagesziele")
                    Spacer()
                    if daily.allDone {
                        Chip(text: "Geschafft", icon: "checkmark", tint: Theme.food)
                    } else {
                        Chip(text: "+20 XP Bonus", icon: "sparkles", tint: Theme.energy)
                    }
                }
                ForEach(daily.quests) { quest in
                    HStack(spacing: 10) {
                        Image(systemName: quest.isDone ? "checkmark.circle.fill" : quest.type.systemImage)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(quest.isDone ? Theme.food : Theme.accent)
                            .frame(width: 22)
                        Text(quest.type.title)
                            .font(.system(.subheadline, design: .rounded))
                            .foregroundStyle(quest.isDone ? Theme.textSecondary : Theme.textPrimary)
                            .strikethrough(quest.isDone, color: Theme.textSecondary)
                        Spacer()
                        if quest.target > 1 {
                            Text("\(quest.progress)/\(quest.target)")
                                .font(.system(.caption, design: .rounded).weight(.semibold))
                                .foregroundStyle(Theme.textSecondary)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cozyCard()
        }
    }

    private var checkInButton: some View {
        Button {
            showCheckIn = true
        } label: {
            VStack(spacing: 8) {
                Image(systemName: InteractionType.checkIn.systemImage)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(viewModel.canCheckInToday ? .white : Theme.textSecondary.opacity(0.6))
                    .frame(width: 42, height: 42)
                    .background(viewModel.canCheckInToday ? Theme.accent : Theme.accentSoft.opacity(0.4))
                    .clipShape(Circle())
                    .overlay(
                        Circle().strokeBorder(
                            LinearGradient(colors: [.white.opacity(0.5), .clear],
                                           startPoint: .top, endPoint: .bottom),
                            lineWidth: 1.5
                        )
                    )
                    .shadow(color: viewModel.canCheckInToday ? Theme.accent.opacity(0.4) : .clear,
                            radius: 5, y: 3)
                Text("Check-in")
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(viewModel.canCheckInToday ? Theme.textPrimary : Theme.textSecondary.opacity(0.6))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(viewModel.canCheckInToday ? Theme.accentSoft.opacity(0.4) : Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .buttonStyle(SquishButtonStyle())
        .disabled(!viewModel.canCheckInToday)
    }

    // MARK: - Level-Up-Overlay

    @ViewBuilder
    private var levelUpOverlay: some View {
        if let message = viewModel.levelUpMessage {
            ZStack {
                Color.black.opacity(0.35).ignoresSafeArea()

                ConfettiView().ignoresSafeArea()

                VStack(spacing: 16) {
                    Text("Level \(viewModel.pet.stats.level)")
                        .font(.system(size: 30, weight: .bold, design: .serif))
                        .foregroundStyle(Theme.accent)
                    PetView(mood: .gluecklich, size: 105)
                    Text(message)
                        .font(.system(.subheadline, design: .rounded))
                        .foregroundStyle(Theme.textPrimary)
                        .multilineTextAlignment(.center)
                    Button {
                        withAnimation { viewModel.levelUpMessage = nil }
                    } label: {
                        Text("Weiter")
                            .font(.system(.headline, design: .rounded))
                            .padding(.horizontal, 36)
                            .padding(.vertical, 13)
                            .background(Theme.accent)
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(SquishButtonStyle())
                }
                .padding(28)
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 32, style: .continuous))
                .shadow(color: .black.opacity(0.2), radius: 30, y: 12)
                .padding(.horizontal, 40)
                .transition(.scale(scale: 0.85).combined(with: .opacity))
            }
            .transition(.opacity)
        }
    }
}

// MARK: - Check-in-Sheet

struct CheckInSheet: View {
    @EnvironmentObject var viewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    private func icon(for answer: CheckInAnswer) -> String {
        switch answer {
        case .superTag:    return "sun.max.fill"
        case .okay:        return "cloud.sun.fill"
        case .stressig:    return "wind"
        case .muede:       return "moon.zzz.fill"
        case .keineAhnung: return "questionmark.circle.fill"
        }
    }

    var body: some View {
        ZStack {
            AtmosphereBackground()
            VStack(spacing: 12) {
                Text("Wie war dein Tag?")
                    .font(.system(.title2, design: .rounded).weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .padding(.top, 30)
                Text("\(viewModel.pet.name) hört zu. Angeblich neutral.")
                    .font(.system(.footnote, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
                    .padding(.bottom, 6)

                ForEach(CheckInAnswer.allCases) { answer in
                    Button {
                        viewModel.checkIn(answer: answer)
                        dismiss()
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: icon(for: answer))
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Theme.accent)
                                .frame(width: 30)
                            Text(answer.rawValue)
                                .font(.system(.headline, design: .rounded))
                                .foregroundStyle(Theme.textPrimary)
                            Spacer()
                        }
                        .padding(.horizontal, 18)
                        .padding(.vertical, 14)
                        .background(.white.opacity(0.85))
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                    .buttonStyle(SquishButtonStyle())
                }
                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }
}


// MARK: - Fütter-Sheet

struct FeedSheet: View {
    @EnvironmentObject var viewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            AtmosphereBackground()
            VStack(spacing: 12) {
                Text("Was gibt es heute?")
                    .font(.system(.title2, design: .rounded).weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .padding(.top, 30)
                Text(viewModel.pet.favoriteSnackDiscovered
                     ? "Lieblingssnack: \(viewModel.pet.favoriteSnack.title)"
                     : "\(viewModel.pet.name) hat einen geheimen Lieblingssnack.")
                    .font(.system(.footnote, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
                    .padding(.bottom, 6)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
                          spacing: 12) {
                    ForEach(SnackType.allCases) { snack in
                        Button {
                            viewModel.feed(snack)
                            dismiss()
                        } label: {
                            VStack(spacing: 8) {
                                ZStack {
                                    Image(systemName: snack.systemImage)
                                        .font(.system(size: 24, weight: .semibold))
                                        .foregroundStyle(Theme.accent)
                                    if viewModel.pet.favoriteSnackDiscovered
                                        && snack == viewModel.pet.favoriteSnack {
                                        Image(systemName: "heart.fill")
                                            .font(.system(size: 11))
                                            .foregroundStyle(Theme.joy)
                                            .offset(x: 18, y: -14)
                                    }
                                }
                                .frame(height: 32)
                                Text(snack.title)
                                    .font(.system(.subheadline, design: .rounded).weight(.semibold))
                                    .foregroundStyle(Theme.textPrimary)
                                Text(snack.subtitle)
                                    .font(.system(.caption2, design: .rounded))
                                    .foregroundStyle(Theme.textSecondary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(.white.opacity(0.85))
                            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                        }
                        .buttonStyle(SquishButtonStyle())
                    }
                }
                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }
}


// MARK: - Gesprächs-Sheet

struct TalkSheet: View {
    @EnvironmentObject var viewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            AtmosphereBackground()
            VStack(spacing: 12) {
                Text("Worüber wollt ihr reden?")
                    .font(.system(.title2, design: .rounded).weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .padding(.top, 30)
                Text("\(viewModel.pet.name) hat Zeit. \(viewModel.pet.name) hat immer Zeit.")
                    .font(.system(.footnote, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
                    .padding(.bottom, 6)

                ForEach(TalkTopic.allCases) { topic in
                    Button {
                        viewModel.talk(topic)
                        dismiss()
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: topic.systemImage)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Theme.accent)
                                .frame(width: 30)
                            Text(topic.title)
                                .font(.system(.headline, design: .rounded))
                                .foregroundStyle(Theme.textPrimary)
                            Spacer()
                        }
                        .padding(.horizontal, 18)
                        .padding(.vertical, 16)
                        .background(.white.opacity(0.85))
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                    .buttonStyle(SquishButtonStyle())
                }
                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }
}
