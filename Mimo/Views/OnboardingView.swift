import SwiftUI

/// Onboarding: Nutzername, Petname, Grundpersönlichkeit. Drei Schritte mit Fortschritts-Punkten.
struct OnboardingView: View {
    @EnvironmentObject var viewModel: AppViewModel

    @State private var step = 0
    @State private var userName = ""
    @State private var petName = "Mimo"
    @State private var base: BasePersonality = .frech

    var body: some View {
        ZStack {
            AtmosphereBackground()

            VStack(spacing: 24) {
                // Fortschritt
                HStack(spacing: 8) {
                    ForEach(0..<3, id: \.self) { i in
                        Capsule()
                            .fill(i <= step ? Theme.accent : Theme.accent.opacity(0.2))
                            .frame(width: i == step ? 26 : 8, height: 8)
                    }
                }
                .animation(.spring(duration: 0.35), value: step)
                .padding(.top, 20)

                Spacer()

                PetView(mood: step == 2 ? .frech : .gluecklich, size: 145)

                Group {
                    switch step {
                    case 0: nameStep
                    case 1: petNameStep
                    default: personalityStep
                    }
                }
                .cozyCard()
                .padding(.horizontal, 24)
                .animation(.spring(duration: 0.35), value: step)

                Spacer()

                HStack(spacing: 10) {
                    if step > 0 {
                        Button {
                            withAnimation(.spring(duration: 0.35)) { step -= 1 }
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.headline)
                                .foregroundStyle(Theme.accent)
                                .frame(width: 54, height: 54)
                                .background(.white.opacity(0.85))
                                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                        }
                        .buttonStyle(SquishButtonStyle())
                    }

                    Button(action: next) {
                        Text(step < 2 ? "Weiter" : "Los geht's")
                            .font(.system(.headline, design: .rounded))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(canProceed ? Theme.accent : Theme.accent.opacity(0.35))
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                    .buttonStyle(SquishButtonStyle())
                    .disabled(!canProceed)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }

    private var canProceed: Bool {
        step == 0 ? !userName.trimmingCharacters(in: .whitespaces).isEmpty : true
    }

    private func next() {
        if step < 2 {
            withAnimation(.spring(duration: 0.4)) { step += 1 }
        } else {
            viewModel.completeOnboarding(userName: userName, petName: petName, base: base)
        }
    }

    // MARK: - Steps

    private var nameStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hey. Da wohnt jetzt jemand in deinem iPhone.")
                .font(.system(size: 21, weight: .bold, design: .serif))
                .foregroundStyle(Theme.textPrimary)
            Text("Wie heißt du?")
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(Theme.textSecondary)
            TextField("Dein Name", text: $userName)
                .font(.system(.body, design: .rounded))
                .padding(12)
                .background(.white.opacity(0.9))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
    }

    private var petNameStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Und wie soll dein kleines Wesen heißen?")
                .font(.system(size: 21, weight: .bold, design: .serif))
                .foregroundStyle(Theme.textPrimary)
            Text("Es besteht auf einen würdevollen Namen.")
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(Theme.textSecondary)
            TextField("Mimo", text: $petName)
                .font(.system(.body, design: .rounded))
                .padding(12)
                .background(.white.opacity(0.9))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
    }

    private var personalityStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Welcher Typ soll \(petName.isEmpty ? "Mimo" : petName) sein?")
                .font(.system(size: 21, weight: .bold, design: .serif))
                .foregroundStyle(Theme.textPrimary)

            ForEach(BasePersonality.allCases) { option in
                Button {
                    withAnimation(.spring(duration: 0.3)) { base = option }
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(option.rawValue)
                                .font(.system(.subheadline, design: .rounded).weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                            Text(option.description)
                                .font(.system(.caption, design: .rounded))
                                .foregroundStyle(Theme.textSecondary)
                        }
                        Spacer()
                        Image(systemName: base == option ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(Theme.accent)
                    }
                    .padding(12)
                    .background(base == option ? Theme.accentSoft.opacity(0.35) : Color.white.opacity(0.4))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .buttonStyle(SquishButtonStyle())
            }
        }
    }
}
