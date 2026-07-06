import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case home, room, diary, profile

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .home:    return "house.fill"
        case .room:    return "sofa.fill"
        case .diary:   return "book.fill"
        case .profile: return "person.fill"
        }
    }

    var label: String {
        switch self {
        case .home:    return "Home"
        case .room:    return "Room"
        case .diary:   return "Diary"
        case .profile: return "Profil"
        }
    }
}

/// Haupt-Navigation mit schwebendem Custom-Dock statt Standard-TabBar.
struct MainTabView: View {
    @EnvironmentObject var viewModel: AppViewModel
    @State private var selected: AppTab = .home
    @Namespace private var dockNamespace

    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch selected {
                case .home:    HomeView()
                case .room:    RoomView()
                case .diary:   DiaryView()
                case .profile: ProfileView()
                }
            }
            .id(selected)
            .transition(.opacity)
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            dock

            achievementToast
        }
        .ignoresSafeArea(.keyboard)
    }

    // MARK: - Erfolgs-Toast

    @ViewBuilder
    private var achievementToast: some View {
        VStack {
            if let def = viewModel.achievementToast {
                HStack(spacing: 12) {
                    Image(systemName: def.icon)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 38, height: 38)
                        .background(Theme.accent)
                        .clipShape(Circle())
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Erfolg: \(def.title)")
                            .font(.system(.subheadline, design: .rounded).weight(.bold))
                            .foregroundStyle(Theme.textPrimary)
                        Text(def.detail)
                            .font(.system(.caption, design: .rounded))
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer()
                }
                .padding(12)
                .background(.white.opacity(0.95))
                .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                .shadow(color: Theme.accent.opacity(0.25), radius: 16, y: 6)
                .padding(.horizontal, 20)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
            Spacer()
        }
        .animation(.spring(duration: 0.4, bounce: 0.3), value: viewModel.achievementToast?.id)
        .allowsHitTesting(false)
    }

    private var dock: some View {
        HStack(spacing: 4) {
            ForEach(AppTab.allCases) { tab in
                Button {
                    withAnimation(.spring(duration: 0.35, bounce: 0.25)) {
                        selected = tab
                    }
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 17, weight: .semibold))
                        Text(tab.label)
                            .font(.system(size: 10, weight: .semibold, design: .rounded))
                    }
                    .foregroundStyle(selected == tab ? .white : Theme.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background {
                        if selected == tab {
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .fill(Theme.accent)
                                .matchedGeometryEffect(id: "dock.indicator", in: dockNamespace)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(6)
        .background(.white.opacity(0.88))
        .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
        .shadow(color: Theme.accent.opacity(0.18), radius: 18, y: 8)
        .padding(.horizontal, 24)
        .padding(.bottom, 6)
    }
}
