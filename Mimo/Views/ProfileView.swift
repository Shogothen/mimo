import SwiftUI

/// Profil: Pet-Steckbrief, Persönlichkeit, Notifications, Reset.
struct ProfileView: View {
    @EnvironmentObject var viewModel: AppViewModel
    @State private var showResetAlert = false
    @State private var notificationsEnabled = false

    var body: some View {
        ZStack {
            AtmosphereBackground()
            FloatingParticlesView()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Steckbrief
                    VStack(spacing: 4) {
                        PetView(mood: viewModel.mood,
                                isSleeping: viewModel.pet.isSleeping,
                                size: 110,
                                hat: viewModel.pet.hat)
                        Text(viewModel.pet.name)
                            .font(.system(size: 30, weight: .bold, design: .serif))
                            .foregroundStyle(Theme.textPrimary)
                        Text("wohnt bei \(viewModel.state.profile.userName)")
                            .font(.system(.footnote, design: .rounded))
                            .foregroundStyle(Theme.textSecondary)
                        HStack(spacing: 6) {
                            Chip(text: "Level \(viewModel.pet.stats.level)", icon: "sparkles")
                            Chip(text: viewModel.pet.basePersonality.rawValue,
                                 icon: "face.smiling", tint: Theme.joy)
                            if viewModel.pet.checkInStreak >= 2 {
                                Chip(text: "\(viewModel.pet.checkInStreak) Tage",
                                     icon: "flame.fill", tint: Theme.energy)
                            }
                        }
                        .padding(.top, 6)
                    }
                    .padding(.top, 14)

                    // Zahlen
                    HStack(spacing: 10) {
                        numberTile(value: "\(Int(viewModel.pet.stats.bond))",
                                   label: "Bond", icon: "heart.fill", tint: Theme.bond)
                        numberTile(value: "\(viewModel.pet.stats.xp)",
                                   label: "XP gesamt", icon: "sparkles", tint: Theme.energy)
                        numberTile(value: "\(viewModel.state.diary.count)",
                                   label: "Einträge", icon: "book.fill", tint: Theme.food)
                        numberTile(value: "\(viewModel.pet.bestGameScore)",
                                   label: "Rekord", icon: "trophy.fill",
                                   tint: Color(red: 0.85, green: 0.48, blue: 0.25))
                    }

                    // Persönlichkeit
                    VStack(alignment: .leading, spacing: 12) {
                        SectionLabel(text: "Persönlichkeit")
                        personalityBar("Frech", viewModel.pet.personality.frech,
                                       Color(red: 0.85, green: 0.48, blue: 0.25))
                        personalityBar("Lieb", viewModel.pet.personality.lieb, Theme.joy)
                        personalityBar("Chaotisch", viewModel.pet.personality.chaotisch, Theme.energy)
                        personalityBar("Verträumt", viewModel.pet.personality.vertraeumt,
                                       Color(red: 0.48, green: 0.56, blue: 0.80))
                        personalityBar("Anhänglich", viewModel.pet.personality.anhaenglich, Theme.accent)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cozyCard()

                    // Macken
                    quirksCard

                    // Erfolge
                    achievementsCard

                    // Notifications (opt-in)
                    VStack(alignment: .leading, spacing: 8) {
                        Toggle(isOn: $notificationsEnabled) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Tägliche Erinnerung")
                                    .font(.system(.subheadline, design: .rounded).weight(.semibold))
                                    .foregroundStyle(Theme.textPrimary)
                                Text("\(viewModel.pet.name) meldet sich einmal am Tag. Rein geschäftlich.")
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundStyle(Theme.textSecondary)
                            }
                        }
                        .tint(Theme.accent)
                        .onChange(of: notificationsEnabled) { _, enabled in
                            if enabled {
                                NotificationService.requestPermission { granted in
                                    if granted {
                                        NotificationService.scheduleDailyReminder(petName: viewModel.pet.name)
                                    } else {
                                        notificationsEnabled = false
                                    }
                                }
                            } else {
                                NotificationService.cancelAll()
                            }
                        }
                    }
                    .cozyCard()

                    // Reset
                    Button {
                        showResetAlert = true
                    } label: {
                        Text("App zurücksetzen")
                            .font(.system(.subheadline, design: .rounded).weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.red.opacity(0.1))
                            .foregroundStyle(.red)
                            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                    .buttonStyle(SquishButtonStyle())
                    .padding(.top, 4)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 110)
            }
        }
        .alert("Alles zurücksetzen?", isPresented: $showResetAlert) {
            Button("Abbrechen", role: .cancel) {}
            Button("Zurücksetzen", role: .destructive) {
                viewModel.resetApp()
            }
        } message: {
            Text("\(viewModel.pet.name) und alle Daten werden gelöscht. Das Onboarding startet neu.")
        }
    }

    // MARK: - Macken

    @ViewBuilder
    private var quirksCard: some View {
        let quirks = viewModel.pet.memory.quirkIds.compactMap { Quirks.def(for: $0) }
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                SectionLabel(text: "Macken")
                Spacer()
                Text("\(quirks.count)/\(Quirks.all.count)")
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
            }
            if quirks.isEmpty {
                Text("\(viewModel.pet.name) hat noch keine Macken entwickelt. Das ändert sich mit jedem zweiten Level. Garantiert.")
                    .font(.system(.caption, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
            } else {
                ForEach(quirks) { quirk in
                    HStack(spacing: 10) {
                        Image(systemName: "sparkle")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Theme.accent)
                        Text("\(viewModel.pet.name) \(quirk.title)")
                            .font(.system(.subheadline, design: .rounded))
                            .foregroundStyle(Theme.textPrimary)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cozyCard()
    }

    // MARK: - Erfolge

    private var achievementsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SectionLabel(text: "Erfolge")
                Spacer()
                Text("\(viewModel.state.unlockedAchievements.count)/\(Achievements.all.count)")
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
            }

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3),
                      spacing: 12) {
                ForEach(Achievements.all) { def in
                    let unlocked = viewModel.state.unlockedAchievements.contains(def.id)
                    VStack(spacing: 5) {
                        Image(systemName: unlocked ? def.icon : "lock.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(unlocked ? .white : Theme.textSecondary.opacity(0.5))
                            .frame(width: 42, height: 42)
                            .background(unlocked ? Theme.accent : Color.white.opacity(0.5))
                            .clipShape(Circle())
                        Text(unlocked ? def.title : "???")
                            .font(.system(.caption2, design: .rounded).weight(.semibold))
                            .foregroundStyle(unlocked ? Theme.textPrimary : Theme.textSecondary.opacity(0.6))
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cozyCard()
    }

    // MARK: - Bausteine

    private func numberTile(value: String, label: String, icon: String, tint: Color) -> some View {
        VStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(tint)
            Text(value)
                .font(.system(.title3, design: .rounded).weight(.bold))
                .foregroundStyle(Theme.textPrimary)
            Text(label)
                .font(.system(.caption2, design: .rounded))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func personalityBar(_ label: String, _ value: Double, _ tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                Text("\(Int(value))")
                    .font(.system(.caption2, design: .rounded))
                    .foregroundStyle(Theme.textSecondary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(tint.opacity(0.15))
                    Capsule()
                        .fill(tint)
                        .frame(width: geo.size.width * CGFloat(min(max(value, 0), 100) / 100))
                        .animation(.spring(duration: 0.5), value: value)
                }
            }
            .frame(height: 8)
        }
    }
}
