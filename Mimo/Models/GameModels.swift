import Foundation

// MARK: - Snacks (Füttern mit Auswahl + verstecktem Lieblingssnack)

enum SnackType: String, Codable, CaseIterable, Identifiable {
    case karotte, kuchen, fisch, suppe

    var id: String { rawValue }

    var title: String {
        switch self {
        case .karotte: return "Karotte"
        case .kuchen:  return "Kuchen"
        case .fisch:   return "Fisch"
        case .suppe:   return "Suppe"
        }
    }

    var systemImage: String {
        switch self {
        case .karotte: return "carrot.fill"
        case .kuchen:  return "birthday.cake.fill"
        case .fisch:   return "fish.fill"
        case .suppe:   return "cup.and.saucer.fill"
        }
    }

    var subtitle: String {
        switch self {
        case .karotte: return "Knackig, gesund"
        case .kuchen:  return "Purer Luxus"
        case .fisch:   return "Der Klassiker"
        case .suppe:   return "Warm und viel"
        }
    }

    /// Effekte: (Sättigung, Laune, Energie)
    var effects: (saettigung: Double, laune: Double, energie: Double) {
        switch self {
        case .karotte: return (18, 3, 5)
        case .kuchen:  return (14, 9, 0)
        case .fisch:   return (22, 5, 2)
        case .suppe:   return (30, 4, 4)
        }
    }
}

// MARK: - Hüte (Garderobe)

enum Hat: String, Codable, CaseIterable, Identifiable {
    case none, schleife, muetze, blume, krone

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none:     return "Ohne"
        case .schleife: return "Schleife"
        case .muetze:   return "Mütze"
        case .blume:    return "Blume"
        case .krone:    return "Krone"
        }
    }

    /// Beschreibung der Freischalt-Bedingung.
    var unlockHint: String {
        switch self {
        case .none:     return ""
        case .schleife: return "Level 3 erreichen"
        case .muetze:   return "3-Tage-Check-in-Serie"
        case .blume:    return "Lieblingssnack entdecken"
        case .krone:    return "Level 8 erreichen"
        }
    }
}

// MARK: - Tägliche Quests

enum QuestType: String, Codable, CaseIterable {
    case streicheln, fuettern, spielen, reden, checkIn, minigame

    var title: String {
        switch self {
        case .streicheln: return "2x streicheln"
        case .fuettern:   return "Einmal füttern"
        case .spielen:    return "Eine Runde Sterne fangen"
        case .reden:      return "Einmal reden"
        case .checkIn:    return "Tages-Check-in machen"
        case .minigame:   return "10 Punkte in einer Runde"
        }
    }

    var target: Int {
        switch self {
        case .streicheln: return 2
        default:          return 1
        }
    }

    var systemImage: String {
        switch self {
        case .streicheln: return "hand.raised.fill"
        case .fuettern:   return "fork.knife"
        case .spielen:    return "star.fill"
        case .reden:      return "bubble.left.fill"
        case .checkIn:    return "checkmark.seal.fill"
        case .minigame:   return "trophy.fill"
        }
    }
}

struct Quest: Codable, Identifiable {
    var id: String
    var type: QuestType
    var progress: Int = 0

    var target: Int { type.target }
    var isDone: Bool { progress >= target }
}

struct DailyQuests: Codable {
    var dayKey: String
    var quests: [Quest]
    var bonusClaimed: Bool = false

    var allDone: Bool { quests.allSatisfy { $0.isDone } }

    /// Wählt drei zufällige, unterschiedliche Tagesziele.
    static func generate(dayKey: String) -> DailyQuests {
        let pool = QuestType.allCases.shuffled().prefix(3)
        let quests = pool.map { Quest(id: "\($0.rawValue)-\(dayKey)", type: $0) }
        return DailyQuests(dayKey: dayKey, quests: quests)
    }
}

// MARK: - Erfolge

struct AchievementDef: Identifiable {
    let id: String
    let title: String
    let detail: String
    let icon: String
}

enum Achievements {
    static let all: [AchievementDef] = [
        AchievementDef(id: "erster.checkin", title: "Angekommen",
                       detail: "Ersten Tages-Check-in gemacht", icon: "checkmark.seal.fill"),
        AchievementDef(id: "streak.7", title: "Eine Woche ihr zwei",
                       detail: "7 Tage in Folge eingecheckt", icon: "flame.fill"),
        AchievementDef(id: "bond.50", title: "Beste Freunde",
                       detail: "Bond von 50 erreicht", icon: "heart.fill"),
        AchievementDef(id: "level.5", title: "Königreich",
                       detail: "Level 5 erreicht", icon: "crown.fill"),
        AchievementDef(id: "level.10", title: "Etabliert",
                       detail: "Level 10 erreicht", icon: "sparkles"),
        AchievementDef(id: "tagebuch.10", title: "Chronist",
                       detail: "10 Tagebucheinträge gesammelt", icon: "book.fill"),
        AchievementDef(id: "snack.entdeckt", title: "Feinschmecker",
                       detail: "Lieblingssnack entdeckt", icon: "fork.knife"),
        AchievementDef(id: "highscore.15", title: "Fangprofi",
                       detail: "15 Punkte beim Sternefangen", icon: "trophy.fill"),
        AchievementDef(id: "nachteule", title: "Nachteule",
                       detail: "Zwischen Mitternacht und 4 Uhr vorbeigeschaut", icon: "moon.stars.fill")
    ]

    static func def(for id: String) -> AchievementDef? {
        all.first { $0.id == id }
    }

    /// Zustandsbasierte Erfolge prüfen. Gibt die IDs zurück, die neu erfüllt sind.
    static func evaluate(state: AppState) -> [String] {
        var earned: [String] = []
        let pet = state.pet

        func check(_ id: String, _ condition: Bool) {
            if condition && !state.unlockedAchievements.contains(id) {
                earned.append(id)
            }
        }

        check("erster.checkin", pet.lastCheckInDay != nil)
        check("streak.7", pet.checkInStreak >= 7)
        check("bond.50", pet.stats.bond >= 50)
        check("level.5", pet.stats.level >= 5)
        check("level.10", pet.stats.level >= 10)
        check("tagebuch.10", state.diary.count >= 10)
        check("snack.entdeckt", pet.favoriteSnackDiscovered)
        check("highscore.15", pet.bestGameScore >= 15)

        return earned
    }

    /// Prüft, welche Hüte neu freigeschaltet werden.
    static func evaluateHats(state: AppState) -> [Hat] {
        var earned: [Hat] = []
        let pet = state.pet

        func check(_ hat: Hat, _ condition: Bool) {
            if condition && !state.unlockedHats.contains(hat.rawValue) {
                earned.append(hat)
            }
        }

        check(.schleife, pet.stats.level >= 3)
        check(.muetze, pet.checkInStreak >= 3)
        check(.blume, pet.favoriteSnackDiscovered)
        check(.krone, pet.stats.level >= 8)

        return earned
    }
}

// MARK: - Erinnerungen

/// Mimos Gedächtnis: was der Nutzer tut, wie seine Tage laufen, welche Macken
/// Mimo entwickelt hat. Wird von der Reaction Engine referenziert.
struct MemoryBank: Codable {
    /// Zählt Check-in-Antworten (rawValue -> Anzahl).
    var checkInCounts: [String: Int] = [:]
    /// Zählt Interaktionen (rawValue -> Anzahl).
    var interactionCounts: [String: Int] = [:]
    /// Die letzten 7 Check-in-Antworten, neueste zuerst.
    var recentCheckIns: [String] = []
    /// IDs der entwickelten Macken.
    var quirkIds: [String] = []

    mutating func recordInteraction(_ type: InteractionType) {
        interactionCounts[type.rawValue, default: 0] += 1
    }

    mutating func recordCheckIn(_ answer: CheckInAnswer) {
        checkInCounts[answer.rawValue, default: 0] += 1
        recentCheckIns.insert(answer.rawValue, at: 0)
        if recentCheckIns.count > 7 {
            recentCheckIns = Array(recentCheckIns.prefix(7))
        }
    }

    /// Die Interaktion, die der Nutzer am häufigsten wählt (ab 5 Wiederholungen).
    var favoriteInteraction: InteractionType? {
        guard let best = interactionCounts.max(by: { $0.value < $1.value }),
              best.value >= 5 else { return nil }
        return InteractionType(rawValue: best.key)
    }

    /// Wie oft die letzten beiden Check-ins "Stressig" waren.
    var consecutiveStressDays: Int {
        var count = 0
        for raw in recentCheckIns {
            if raw == CheckInAnswer.stressig.rawValue { count += 1 } else { break }
        }
        return count
    }

    /// Gestern stressig, heute super?
    var isComeback: Bool {
        recentCheckIns.count >= 2
            && recentCheckIns[0] == CheckInAnswer.superTag.rawValue
            && recentCheckIns[1] == CheckInAnswer.stressig.rawValue
    }
}

// MARK: - Gesprächsthemen (Reden)

enum TalkTopic: String, CaseIterable, Identifiable {
    case vomTag, frage, quatschen

    var id: String { rawValue }

    var title: String {
        switch self {
        case .vomTag:    return "Von deinem Tag erzählen"
        case .frage:     return "Mimo etwas fragen"
        case .quatschen: return "Einfach quatschen"
        }
    }

    var systemImage: String {
        switch self {
        case .vomTag:    return "text.bubble.fill"
        case .frage:     return "questionmark.bubble.fill"
        case .quatschen: return "face.smiling.inverse"
        }
    }
}

// MARK: - Macken

struct QuirkDef: Identifiable {
    let id: String
    /// Kurzbeschreibung fürs Profil, z. B. "misstraut der Lampe".
    let title: String
    /// Zeile für die Tagesnachricht. \(name) wird ersetzt.
    let dailyLine: String
    /// Tagebucheintrag aus Mimos Sicht, wenn die Macke entsteht.
    let diaryLine: String
}

enum Quirks {
    static let all: [QuirkDef] = [
        QuirkDef(id: "lampe",
                 title: "misstraut der Lampe",
                 dailyLine: "%@ beobachtet die Lampe. Sie weiß, warum.",
                 diaryLine: "Ich habe beschlossen, der Lampe nicht zu trauen. Sie ist zu ruhig. Niemand ist so ruhig ohne Grund."),
        QuirkDef(id: "steine",
                 title: "sammelt unsichtbare Steine",
                 dailyLine: "%@ hat heute drei unsichtbare Steine gefunden. Prachtexemplare.",
                 diaryLine: "Ich sammle jetzt unsichtbare Steine. Die Sammlung wächst schnell. Platzprobleme gibt es praktischerweise keine."),
        QuirkDef(id: "montage",
                 title: "hasst Montage aus Prinzip",
                 dailyLine: "%@ möchte festhalten, dass Montage weiterhin eine Frechheit sind.",
                 diaryLine: "Ich habe eine Grundsatzentscheidung getroffen: Montage sind ab sofort mein Feind. Auch dienstags. Aus Prinzip."),
        QuirkDef(id: "nachtaktiv",
                 title: "hält sich für nachtaktiv",
                 dailyLine: "%@ betont, dass er eigentlich nachtaktiv ist. Er schläft trotzdem früh.",
                 diaryLine: "Ich bin jetzt offiziell nachtaktiv. Dass ich abends müde werde, ändert daran gar nichts. Es ist eine Identität, kein Verhalten."),
        QuirkDef(id: "selbstgespraeche",
                 title: "führt Selbstgespräche auf hohem Niveau",
                 dailyLine: "%@ hat sich heute selbst etwas Kluges gesagt. Er war beeindruckt.",
                 diaryLine: "Ich führe jetzt Selbstgespräche. Das Niveau ist hoch. Der Gesprächspartner ist erstklassig."),
        QuirkDef(id: "verbeugung",
                 title: "verbeugt sich vor dem Fenster",
                 dailyLine: "%@ hat sich vorhin vor dem Fenster verbeugt. Aus Respekt.",
                 diaryLine: "Ich verbeuge mich neuerdings vor dem Fenster. Es zeigt mir jeden Tag draußen. Das verdient Anerkennung."),
        QuirkDef(id: "zaehlen",
                 title: "zählt Dinge. Welche, bleibt geheim",
                 dailyLine: "%@ zählt gerade etwas. Er sagt nicht, was. Es sind viele.",
                 diaryLine: "Ich habe angefangen, Dinge zu zählen. Welche Dinge, bleibt mein Geheimnis. Der aktuelle Stand ist zufriedenstellend."),
        QuirkDef(id: "staubkorn",
                 title: "hat eine Erzfeindschaft mit einem Staubkorn",
                 dailyLine: "%@ und das Staubkorn hatten heute wieder Blickkontakt. Es bleibt angespannt.",
                 diaryLine: "Es gibt hier ein Staubkorn, das mich provoziert. Wir sind jetzt Erzfeinde. Es weiß es noch nicht."),
        QuirkDef(id: "blicke",
                 title: "übt heimlich dramatische Blicke",
                 dailyLine: "%@ hat heute den Blick 'enttäuscht, aber gefasst' perfektioniert.",
                 diaryLine: "Ich übe jetzt dramatische Blicke. Heimlich. Der Spiegel ist mein Trainingspartner und größter Fan."),
        QuirkDef(id: "kuehlschrank",
                 title: "glaubt, der Kühlschrank grüßt ihn",
                 dailyLine: "%@ ist sicher, dass der Kühlschrank ihn vorhin gegrüßt hat. Es klang freundlich.",
                 diaryLine: "Der Kühlschrank hat heute gebrummt, als ich vorbeikam. Das war eindeutig ein Gruß. Wir sind jetzt per Du.")
    ]

    static func def(for id: String) -> QuirkDef? {
        all.first { $0.id == id }
    }
}
