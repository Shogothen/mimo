import SwiftUI

/// Zentrales ViewModel (MVVM). Hält den AppState, wendet Logik an, speichert automatisch.
/// Wird ausschließlich vom Main Thread (SwiftUI) benutzt.
final class AppViewModel: ObservableObject {

    @Published var state: AppState {
        didSet { PersistenceService.save(state) }
    }

    /// Aktuelle Reaktion des Pets (wird im HomeView als Sprechblase gezeigt).
    @Published var currentReaction: String? = nil
    private var reactionDismissWorkItem: DispatchWorkItem?

    /// Level-Up-Nachricht für Overlay.
    @Published var levelUpMessage: String? = nil

    /// Frisch freigeschalteter Erfolg (Toast oben).
    @Published var achievementToast: AchievementDef? = nil
    private var toastDismissWorkItem: DispatchWorkItem?

    /// Tagesnachricht, wird pro App-Session einmal erzeugt.
    @Published var dailyMessage: String = ""

    init() {
        let loaded = PersistenceService.load()
        self.state = loaded
        self.dailyMessage = ReactionEngine.dailyMessage(pet: loaded.pet, userName: loaded.profile.userName)
    }


    /// Zeigt eine Reaktion und blendet sie nach 5 Sekunden automatisch aus.
    private func showReaction(_ text: String) {
        currentReaction = text
        reactionDismissWorkItem?.cancel()
        let item = DispatchWorkItem { [weak self] in
            self?.currentReaction = nil
        }
        reactionDismissWorkItem = item
        DispatchQueue.main.asyncAfter(deadline: .now() + 5, execute: item)
    }

    // MARK: - Abgeleitete Werte

    var pet: Pet { state.pet }
    var mood: Mood { PetLogicService.mood(for: state.pet) }
    var moodText: String { PetLogicService.moodDescription(mood, name: state.pet.name) }
    var canCheckInToday: Bool { PetLogicService.canCheckInToday(pet: state.pet) }
    var xpProgress: Double { Double(state.pet.stats.xp % 100) / 100.0 }
    var quests: DailyQuests? { state.quests }

    /// Tage seit dem Onboarding (mindestens 1).
    var daysKnown: Int {
        max(1, (Calendar.current.dateComponents([.day],
            from: state.profile.createdAt, to: Date()).day ?? 0) + 1)
    }

    // MARK: - Onboarding

    func completeOnboarding(userName: String, petName: String, base: BasePersonality) {
        state.profile.userName = userName.trimmingCharacters(in: .whitespaces)
        state.pet.name = petName.trimmingCharacters(in: .whitespaces).isEmpty ? "Mimo" : petName
        state.pet.basePersonality = base
        state.pet.personality = Personality.initial(base: base)
        state.onboardingCompleted = true
        dailyMessage = ReactionEngine.dailyMessage(pet: state.pet, userName: state.profile.userName)
    }

    // MARK: - Interaktionen

    func interact(_ type: InteractionType) {
        PetLogicService.applyDecay(to: &state.pet)
        let newLevel = PetLogicService.apply(type, to: &state.pet)

        state.pet.memory.recordInteraction(type)
        showReaction(ReactionEngine.reaction(to: type, pet: state.pet, userName: state.profile.userName))
        hapticLight()

        // Gelegentlich schreibt Mimo von sich aus einen Tagebucheintrag (ca. 1 von 4 Interaktionen).
        if Int.random(in: 0..<4) == 0 {
            addDiaryEntry(event: .interaction(type))
        }

        handleLevelUp(newLevel)

        // Quests + Erfolge
        switch type {
        case .streicheln: questProgress(.streicheln)
        case .reden:      questProgress(.reden)
        default:          break
        }
        let hour = Calendar.current.component(.hour, from: Date())
        if hour >= 0 && hour < 4 {
            unlockAchievement(id: "nachteule")
        }
        checkUnlocks()
    }

    // MARK: - Füttern mit Snack-Auswahl

    func feed(_ snack: SnackType) {
        PetLogicService.applyDecay(to: &state.pet)
        state.pet.isSleeping = false

        let effects = snack.effects
        let isFavorite = snack == state.pet.favoriteSnack
        let firstDiscovery = isFavorite && !state.pet.favoriteSnackDiscovered

        state.pet.stats.saettigung += effects.saettigung
        state.pet.stats.laune += effects.laune + (isFavorite ? 8 : 0)
        state.pet.stats.energie += effects.energie
        if isFavorite { state.pet.stats.bond += 2 }
        state.pet.stats.clamp()
        state.pet.lastInteractionDate = Date()
        state.pet.lastInteractionType = .fuettern
        state.pet.lastUpdate = Date()

        state.pet.memory.recordInteraction(.fuettern)
        if firstDiscovery {
            state.pet.favoriteSnackDiscovered = true
            addDiaryEntry(event: .snackDiscovered(snack))
            hapticSuccess()
        } else {
            hapticLight()
        }

        showReaction(ReactionEngine.feedReaction(snack: snack, isFavorite: isFavorite,
                                                 firstDiscovery: firstDiscovery, name: state.pet.name))

        handleLevelUp(PetLogicService.addXP(InteractionType.fuettern.xp, to: &state.pet))

        questProgress(.fuettern)
        checkUnlocks()
    }

    // MARK: - Mini-Game

    func finishMiniGame(score: Int) {
        PetLogicService.applyDecay(to: &state.pet)
        state.pet.isSleeping = false

        state.pet.stats.laune += 14
        state.pet.stats.energie -= 10
        state.pet.stats.bond += 2
        state.pet.personality.bump(\.chaotisch, by: 1.5)
        state.pet.stats.clamp()
        state.pet.lastInteractionDate = Date()
        state.pet.lastInteractionType = .spielen
        state.pet.lastUpdate = Date()

        state.pet.memory.recordInteraction(.spielen)
        let isNewBest = score > state.pet.bestGameScore
        if isNewBest { state.pet.bestGameScore = score }

        showReaction(ReactionEngine.miniGameReaction(score: score, isNewBest: isNewBest, name: state.pet.name))

        if Int.random(in: 0..<3) == 0 || score >= 15 {
            addDiaryEntry(event: .miniGame(score))
        }

        let xp = min(InteractionType.spielen.xp + score / 2, 25)
        handleLevelUp(PetLogicService.addXP(xp, to: &state.pet))

        questProgress(.spielen)
        if score >= 10 { questProgress(.minigame) }
        hapticSuccess()
        checkUnlocks()
    }

    // MARK: - Quests

    /// Erzeugt neue Tagesziele, wenn ein neuer Tag begonnen hat.
    func ensureQuests() {
        let key = PetLogicService.todayKey()
        if state.quests?.dayKey != key {
            state.quests = DailyQuests.generate(dayKey: key)
        }
    }

    private func questProgress(_ type: QuestType, amount: Int = 1) {
        ensureQuests()
        guard var daily = state.quests else { return }
        var changed = false
        for i in daily.quests.indices where daily.quests[i].type == type && !daily.quests[i].isDone {
            daily.quests[i].progress = min(daily.quests[i].target, daily.quests[i].progress + amount)
            changed = true
        }
        guard changed else { return }

        if daily.allDone && !daily.bonusClaimed {
            daily.bonusClaimed = true
            state.quests = daily
            handleLevelUp(PetLogicService.addXP(20, to: &state.pet))
            showReaction(ReactionEngine.questBonusReaction(name: state.pet.name))
            hapticSuccess()
        } else {
            state.quests = daily
        }
    }

    // MARK: - Level-Up + Macken

    /// Zentrale Level-Up-Behandlung: Nachricht, Diary, Sound, ggf. neue Macke.
    private func handleLevelUp(_ newLevel: Int?) {
        guard let level = newLevel else { return }
        levelUpMessage = ReactionEngine.levelUpMessage(level: level, name: state.pet.name)
        addDiaryEntry(event: .levelUp(level))
        hapticSuccess()
        SoundService.play(.levelUp)
        grantQuirkIfDue(level: level)
    }

    /// Alle zwei Level entwickelt Mimo eine neue Macke (Level 2, 4, 6, ...).
    private func grantQuirkIfDue(level: Int) {
        guard level % 2 == 0 else { return }
        let owned = Set(state.pet.memory.quirkIds)
        let candidates = Quirks.all.filter { !owned.contains($0.id) }
        guard let quirk = candidates.randomElement() else { return }
        state.pet.memory.quirkIds.append(quirk.id)
        addDiaryEntry(event: .quirk(quirk.id))
    }

    // MARK: - Erfolge + Hüte

    /// Prüft zustandsbasierte Erfolge und Hut-Freischaltungen.
    private func checkUnlocks() {
        for id in Achievements.evaluate(state: state) {
            unlockAchievement(id: id)
        }
        for hat in Achievements.evaluateHats(state: state) {
            state.unlockedHats.insert(hat.rawValue)
        }
    }

    private func unlockAchievement(id: String) {
        guard !state.unlockedAchievements.contains(id),
              let def = Achievements.def(for: id) else { return }
        state.unlockedAchievements.insert(id)
        addDiaryEntry(event: .achievement(def.title))
        showAchievementToast(def)
        hapticSuccess()
        SoundService.play(.achievement)
    }

    private func showAchievementToast(_ def: AchievementDef) {
        achievementToast = def
        toastDismissWorkItem?.cancel()
        let item = DispatchWorkItem { [weak self] in
            self?.achievementToast = nil
        }
        toastDismissWorkItem = item
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5, execute: item)
    }

    func equipHat(_ hat: Hat) {
        guard state.unlockedHats.contains(hat.rawValue) else { return }
        state.pet.hatId = hat.rawValue
        hapticLight()
    }

    // MARK: - Tages-Check-in

    func checkIn(answer: CheckInAnswer) {
        guard canCheckInToday else { return }
        PetLogicService.applyDecay(to: &state.pet)
        let newLevel = PetLogicService.apply(.checkIn, to: &state.pet)
        PetLogicService.registerCheckIn(for: &state.pet)
        state.pet.memory.recordCheckIn(answer)
        state.pet.memory.recordInteraction(.checkIn)

        showReaction(ReactionEngine.checkInReaction(
            answer: answer,
            name: state.pet.name,
            streak: state.pet.checkInStreak,
            memory: state.pet.memory
        ))
        addDiaryEntry(event: .checkIn(answer))
        hapticSuccess()

        handleLevelUp(newLevel)

        questProgress(.checkIn)
        checkUnlocks()
    }

    /// Weckt das Pet manuell auf.
    func wakeUp() {
        guard state.pet.isSleeping else { return }
        state.pet.isSleeping = false
        showReaction("\(state.pet.name) blinzelt. Er tut so, als wäre er längst wach gewesen.")
        hapticLight()
    }

    // MARK: - Reden mit Gesprächsthema

    func talk(_ topic: TalkTopic) {
        PetLogicService.applyDecay(to: &state.pet)
        let newLevel = PetLogicService.apply(.reden, to: &state.pet)
        state.pet.memory.recordInteraction(.reden)

        showReaction(ReactionEngine.talkReaction(topic: topic, pet: state.pet, userName: state.profile.userName))
        hapticLight()

        if Int.random(in: 0..<4) == 0 {
            addDiaryEntry(event: .interaction(.reden))
        }

        handleLevelUp(newLevel)
        questProgress(.reden)
        checkUnlocks()
    }

    // MARK: - Tagebuch

    func addDiaryEntry(event: DiaryEvent) {
        let text = ReactionEngine.diaryText(for: event, pet: state.pet, userName: state.profile.userName)
        let entry = DiaryEntry(mood: mood, text: text)
        state.diary.insert(entry, at: 0)
    }

    // MARK: - Zeit-Decay (beim App-Start / Vordergrund)

    func applyTimeDecay() {
        // Bei langer Abwesenheit schreibt Mimo einen Vernachlässigungs-Eintrag.
        let hours = Date().timeIntervalSince(state.pet.lastInteractionDate) / 3600
        PetLogicService.applyDecay(to: &state.pet)
        if hours > 36, state.onboardingCompleted {
            addDiaryEntry(event: .neglect)
        }
        dailyMessage = ReactionEngine.dailyMessage(pet: state.pet, userName: state.profile.userName, daysKnown: daysKnown)
        ensureQuests()
    }

    // MARK: - Reset

    func resetApp() {
        PersistenceService.reset()
        NotificationService.cancelAll()
        state = AppState()
        currentReaction = nil
        levelUpMessage = nil
        achievementToast = nil
    }

    // MARK: - Haptik

    private func hapticLight() {
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
    }

    private func hapticSuccess() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
}
