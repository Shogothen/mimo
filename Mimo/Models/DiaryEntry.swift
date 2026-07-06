import Foundation

struct DiaryEntry: Codable, Identifiable {
    var id: UUID = UUID()
    var date: Date = Date()
    var mood: Mood
    var text: String
}

/// Gesamter persistierter App-Zustand. Wird als eine JSON-Datei gespeichert.
struct AppState: Codable {
    var onboardingCompleted: Bool = false
    var profile: UserProfile = UserProfile()
    var pet: Pet = Pet()
    var diary: [DiaryEntry] = []

    // Spielsysteme
    var quests: DailyQuests? = nil
    var unlockedAchievements: Set<String> = []
    var unlockedHats: Set<String> = [Hat.none.rawValue]

    init() {}

    /// Robustes Decoding wie beim Pet: fehlende Keys fallen auf Defaults zurück.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        onboardingCompleted = try c.decodeIfPresent(Bool.self, forKey: .onboardingCompleted) ?? false
        profile = try c.decodeIfPresent(UserProfile.self, forKey: .profile) ?? UserProfile()
        pet = try c.decodeIfPresent(Pet.self, forKey: .pet) ?? Pet()
        diary = try c.decodeIfPresent([DiaryEntry].self, forKey: .diary) ?? []
        quests = try c.decodeIfPresent(DailyQuests.self, forKey: .quests)
        unlockedAchievements = try c.decodeIfPresent(Set<String>.self, forKey: .unlockedAchievements) ?? []
        unlockedHats = try c.decodeIfPresent(Set<String>.self, forKey: .unlockedHats) ?? [Hat.none.rawValue]
    }
}
