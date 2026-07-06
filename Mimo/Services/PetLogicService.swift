import Foundation

/// Kernlogik des Pets: Stimmung, zeitbasierter Decay, Interaktionseffekte, XP/Level.
struct PetLogicService {

    // MARK: - Stimmung

    /// Stimmung ergibt sich aus Energie, Laune, Sättigung, letzter Interaktion,
    /// Persönlichkeit und Tageszeit. Reihenfolge = Priorität.
    static func mood(for pet: Pet) -> Mood {
        let s = pet.stats
        let hour = Calendar.current.component(.hour, from: Date())
        let hoursSinceInteraction = Date().timeIntervalSince(pet.lastInteractionDate) / 3600

        if pet.isSleeping { return .vertraeumt }
        if s.energie < 25 { return .muede }
        if s.saettigung < 30 { return .hungrig }

        // Vernachlässigung führt zu dramatisch/anhänglich, nie zu Bestrafung.
        if hoursSinceInteraction > 12 {
            return pet.personality.anhaenglich >= pet.personality.frech ? .anhaenglich : .dramatisch
        }

        if s.laune > 75 && s.energie > 50 { return .gluecklich }
        if s.laune < 40 { return .gelangweilt }

        // Abends und nachts wird das Pet verträumter.
        if hour >= 21 || hour < 6 { return .vertraeumt }

        // Persönlichkeit färbt den Normalzustand.
        switch pet.personality.dominantTrait {
        case "frech":       return .frech
        case "vertraeumt":  return .vertraeumt
        case "anhaenglich": return .anhaenglich
        default:            return .gluecklich
        }
    }

    /// Kurzer Stimmungstext für den Homescreen.
    static func moodDescription(_ mood: Mood, name: String) -> String {
        switch mood {
        case .gluecklich:   return "\(name) ist bester Laune."
        case .muede:        return "\(name) ist müde. Sehr müde. Historisch müde."
        case .hungrig:      return "\(name) denkt ausschließlich an Essen."
        case .frech:        return "\(name) plant etwas. Man sieht es ihm an."
        case .anhaenglich:  return "\(name) will heute einfach in deiner Nähe sein."
        case .dramatisch:   return "\(name) ist in seiner dramatischen Phase."
        case .vertraeumt:   return "\(name) ist gedanklich woanders. Irgendwo Schönes."
        case .gelangweilt:  return "\(name) langweilt sich auf hohem Niveau."
        }
    }

    // MARK: - Zeitbasierter Decay

    /// Werte sinken sanft über Zeit. Kein Sterben, keine harte Bestrafung.
    static func applyDecay(to pet: inout Pet) {
        let hours = Date().timeIntervalSince(pet.lastUpdate) / 3600
        guard hours > 0.1 else { return }

        pet.stats.energie -= hours * (pet.isSleeping ? -6 : 1.5) // Schlafen lädt auf
        pet.stats.saettigung -= hours * 2.5
        pet.stats.laune -= hours * 1.2

        // Sanfte Untergrenzen: Mimo wird nie "kaputt", nur bedürftig.
        pet.stats.energie = max(pet.stats.energie, 10)
        pet.stats.saettigung = max(pet.stats.saettigung, 10)
        pet.stats.laune = max(pet.stats.laune, 15)
        pet.stats.clamp()

        // Wacht von selbst auf, wenn voll erholt.
        if pet.isSleeping && pet.stats.energie >= 95 { pet.isSleeping = false }

        // Lange Vernachlässigung formt Persönlichkeit leicht Richtung dramatisch/frech.
        let hoursSinceInteraction = Date().timeIntervalSince(pet.lastInteractionDate) / 3600
        if hoursSinceInteraction > 24 {
            pet.personality.bump(\.frech, by: 1)
            pet.personality.bump(\.anhaenglich, by: 1)
        }

        pet.lastUpdate = Date()
    }

    // MARK: - Interaktionen

    /// Wendet eine Interaktion auf das Pet an und liefert zurück, ob ein Level-Up passiert ist.
    static func apply(_ interaction: InteractionType, to pet: inout Pet) -> Int? {
        pet.isSleeping = false

        switch interaction {
        case .streicheln:
            pet.stats.laune += 8
            pet.stats.bond += 2
            pet.personality.bump(\.lieb, by: 1.5)
        case .fuettern:
            pet.stats.saettigung += 30
            pet.stats.laune += 4
        case .spielen:
            pet.stats.laune += 14
            pet.stats.energie -= 10
            pet.stats.bond += 2
            pet.personality.bump(\.chaotisch, by: 1.5)
        case .reden:
            pet.stats.laune += 6
            pet.stats.bond += 3
            pet.personality.bump(\.anhaenglich, by: 1.5)
        case .schlafen:
            pet.isSleeping = true
            pet.stats.energie += 25
            pet.personality.bump(\.vertraeumt, by: 1.5)
        case .checkIn:
            pet.stats.bond += 5
            pet.stats.laune += 5
        }

        pet.stats.clamp()
        pet.lastInteractionDate = Date()
        pet.lastInteractionType = interaction
        pet.lastUpdate = Date()

        return addXP(interaction.xp, to: &pet)
    }

    /// XP hinzufügen. Gibt das neue Level zurück, falls ein Level-Up passiert ist.
    static func addXP(_ amount: Int, to pet: inout Pet) -> Int? {
        pet.stats.xp += amount
        let newLevel = pet.stats.xp / 100 + 1
        if newLevel > pet.stats.level {
            pet.stats.level = newLevel
            return newLevel
        }
        return nil
    }

    // MARK: - Check-in

    static func todayKey() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }

    static func yesterdayKey() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date())
    }

    static func canCheckInToday(pet: Pet) -> Bool {
        pet.lastCheckInDay != todayKey()
    }

    /// Registriert den heutigen Check-in und aktualisiert die Streak.
    static func registerCheckIn(for pet: inout Pet) {
        if pet.lastCheckInDay == yesterdayKey() {
            pet.checkInStreak += 1
        } else {
            pet.checkInStreak = 1
        }
        pet.lastCheckInDay = todayKey()
    }
}
