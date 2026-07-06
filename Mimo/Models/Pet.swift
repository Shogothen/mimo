import Foundation

// MARK: - Interaktionstypen

enum InteractionType: String, Codable, CaseIterable {
    case streicheln
    case fuettern
    case spielen
    case reden
    case schlafen
    case checkIn

    var xp: Int {
        switch self {
        case .streicheln: return 5
        case .fuettern:   return 5
        case .spielen:    return 8
        case .reden:      return 6
        case .schlafen:   return 3
        case .checkIn:    return 15
        }
    }

    var label: String {
        switch self {
        case .streicheln: return "Streicheln"
        case .fuettern:   return "Füttern"
        case .spielen:    return "Spielen"
        case .reden:      return "Reden"
        case .schlafen:   return "Schlafen"
        case .checkIn:    return "Check-in"
        }
    }

    var systemImage: String {
        switch self {
        case .streicheln: return "hand.raised.fill"
        case .fuettern:   return "fork.knife"
        case .spielen:    return "gamecontroller.fill"
        case .reden:      return "bubble.left.fill"
        case .schlafen:   return "moon.zzz.fill"
        case .checkIn:    return "checkmark.seal.fill"
        }
    }
}

// MARK: - Stimmung

enum Mood: String, Codable, CaseIterable {
    case gluecklich = "Glücklich"
    case muede = "Müde"
    case hungrig = "Hungrig"
    case frech = "Frech"
    case anhaenglich = "Anhänglich"
    case dramatisch = "Dramatisch"
    case vertraeumt = "Verträumt"
    case gelangweilt = "Gelangweilt"
}

// MARK: - Grundpersönlichkeit (Onboarding-Auswahl)

enum BasePersonality: String, Codable, CaseIterable, Identifiable {
    case frech = "Frech"
    case lieb = "Lieb"
    case vertraeumt = "Verträumt"
    case chaotisch = "Chaotisch"

    var id: String { rawValue }

    var description: String {
        switch self {
        case .frech:      return "Kommentiert alles. Wirklich alles."
        case .lieb:       return "Weich, warm, bedingungslos auf deiner Seite."
        case .vertraeumt: return "Lebt zu 60 Prozent in einer anderen Welt."
        case .chaotisch:  return "Hat einen Plan. Der Plan ändert sich stündlich."
        }
    }
}

// MARK: - Persönlichkeitsachsen (entwickeln sich über Interaktionen)

struct Personality: Codable {
    var frech: Double = 20
    var lieb: Double = 20
    var chaotisch: Double = 20
    var vertraeumt: Double = 20
    var anhaenglich: Double = 20

    /// Startwerte abhängig von der gewählten Grundpersönlichkeit.
    static func initial(base: BasePersonality) -> Personality {
        var p = Personality()
        switch base {
        case .frech:      p.frech = 45
        case .lieb:       p.lieb = 45
        case .vertraeumt: p.vertraeumt = 45
        case .chaotisch:  p.chaotisch = 45
        }
        return p
    }

    /// Dominante Achse, bestimmt Textfärbung der Reaction Engine.
    var dominantTrait: String {
        let all: [(String, Double)] = [
            ("frech", frech), ("lieb", lieb), ("chaotisch", chaotisch),
            ("vertraeumt", vertraeumt), ("anhaenglich", anhaenglich)
        ]
        return all.max(by: { $0.1 < $1.1 })?.0 ?? "lieb"
    }

    mutating func bump(_ keyPath: WritableKeyPath<Personality, Double>, by amount: Double) {
        self[keyPath: keyPath] = min(100, max(0, self[keyPath: keyPath] + amount))
    }
}

// MARK: - Stats

struct PetStats: Codable {
    var energie: Double = 80      // 0–100
    var laune: Double = 70        // 0–100
    var saettigung: Double = 70   // 0–100, niedrig = hungrig
    var bond: Double = 10         // 0–100, wächst langsam
    var xp: Int = 0
    var level: Int = 1

    mutating func clamp() {
        energie = min(100, max(0, energie))
        laune = min(100, max(0, laune))
        saettigung = min(100, max(0, saettigung))
        bond = min(100, max(0, bond))
    }
}

// MARK: - Pet

struct Pet: Codable {
    var name: String = "Mimo"
    var basePersonality: BasePersonality = .frech
    var stats: PetStats = PetStats()
    var personality: Personality = Personality()
    var lastInteractionDate: Date = Date()
    var lastInteractionType: InteractionType? = nil
    var lastCheckInDay: String? = nil   // "yyyy-MM-dd", damit Check-in 1x pro Tag geht
    var checkInStreak: Int = 0          // aufeinanderfolgende Check-in-Tage
    var lastUpdate: Date = Date()       // für zeitbasierten Decay
    var isSleeping: Bool = false

    // Spielsysteme
    var favoriteSnack: SnackType = SnackType.allCases.randomElement() ?? .fisch
    var favoriteSnackDiscovered: Bool = false
    var bestGameScore: Int = 0
    var hatId: String = Hat.none.rawValue
    var memory: MemoryBank = MemoryBank()

    var hat: Hat { Hat(rawValue: hatId) ?? .none }

    init() {}

    /// Robustes Decoding: fehlende Keys fallen auf Defaults zurück.
    /// Dadurch überleben gespeicherte Spielstände zukünftige Model-Erweiterungen.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        name = try c.decodeIfPresent(String.self, forKey: .name) ?? "Mimo"
        basePersonality = try c.decodeIfPresent(BasePersonality.self, forKey: .basePersonality) ?? .frech
        stats = try c.decodeIfPresent(PetStats.self, forKey: .stats) ?? PetStats()
        personality = try c.decodeIfPresent(Personality.self, forKey: .personality) ?? Personality()
        lastInteractionDate = try c.decodeIfPresent(Date.self, forKey: .lastInteractionDate) ?? Date()
        lastInteractionType = try c.decodeIfPresent(InteractionType.self, forKey: .lastInteractionType)
        lastCheckInDay = try c.decodeIfPresent(String.self, forKey: .lastCheckInDay)
        checkInStreak = try c.decodeIfPresent(Int.self, forKey: .checkInStreak) ?? 0
        lastUpdate = try c.decodeIfPresent(Date.self, forKey: .lastUpdate) ?? Date()
        isSleeping = try c.decodeIfPresent(Bool.self, forKey: .isSleeping) ?? false
        favoriteSnack = try c.decodeIfPresent(SnackType.self, forKey: .favoriteSnack)
            ?? (SnackType.allCases.randomElement() ?? .fisch)
        favoriteSnackDiscovered = try c.decodeIfPresent(Bool.self, forKey: .favoriteSnackDiscovered) ?? false
        bestGameScore = try c.decodeIfPresent(Int.self, forKey: .bestGameScore) ?? 0
        hatId = try c.decodeIfPresent(String.self, forKey: .hatId) ?? Hat.none.rawValue
        memory = try c.decodeIfPresent(MemoryBank.self, forKey: .memory) ?? MemoryBank()
    }
}
