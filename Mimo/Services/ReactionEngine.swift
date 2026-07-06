import Foundation

/// Lokale Reaction Engine. Erzeugt Texte abhängig von Interaktion, Stimmung,
/// Persönlichkeit, Level und Tageszeit. Keine externe AI, nur Templates + Logik.
struct ReactionEngine {

    // MARK: - Öffentliche API

    /// Reaktion auf eine Interaktion.
    static func reaction(to interaction: InteractionType, pet: Pet, userName: String) -> String {
        let name = pet.name
        let trait = pet.personality.dominantTrait
        let mood = PetLogicService.mood(for: pet)

        var pool = basePool(for: interaction, name: name, userName: userName)
        pool += traitPool(for: interaction, trait: trait, name: name)
        pool += moodPool(for: interaction, mood: mood, name: name)

        // Ab höherem Level werden die Texte gelegentlich selbstbewusster.
        if pet.stats.level >= 4 {
            pool += highLevelPool(for: interaction, name: name)
        }

        return pool.randomElement() ?? "\(name) reagiert. Irgendwie."
    }

    /// Kleine Tagesnachricht auf dem Homescreen.
    static func dailyMessage(pet: Pet, userName: String, daysKnown: Int = 0) -> String {
        let name = pet.name
        let hour = Calendar.current.component(.hour, from: Date())
        let mood = PetLogicService.mood(for: pet)

        if pet.isSleeping {
            return [
                "\(name) schläft. Bitte nur in wichtigen Angelegenheiten wecken. Snacks zählen.",
                "\(name) ist gerade in einer sehr exklusiven Traumwelt unterwegs.",
                "\(name) schläft mit der Hingabe eines Profis."
            ].randomElement()!
        }

        var pool: [String] = []

        switch hour {
        case 5..<11:
            pool += [
                "\(name) hat den Morgen offiziell genehmigt.",
                "\(name) tut so, als wäre er schon lange wach. Ist er nicht.",
                "\(name) findet, der Tag hat Potenzial. Vorsichtig formuliert.",
                "\(name) hat heute schon einen Plan gemacht und ihn direkt wieder verworfen.",
                "\(name) begrüßt dich mit der Energie von genau einer Tasse Kaffee."
            ]
        case 11..<17:
            pool += [
                "\(name) beobachtet den Nachmittag mit professionellem Interesse.",
                "\(name) hat heute schon dreimal die Position gewechselt. Produktiv.",
                "\(name) denkt über Snacks nach. Rein theoretisch.",
                "\(name) hat gerade eine Staubfluse verfolgt. Erfolgreich.",
                "\(name) hält den Tag für machbar. Sein Zitat, nicht meins."
            ]
        case 17..<22:
            pool += [
                "\(name) hat den Abend für gemütlich erklärt.",
                "\(name) findet, \(userName) sollte jetzt langsam runterfahren. Er auch.",
                "\(name) genießt das Abendlicht. Sehr dramatisch.",
                "\(name) hat den Tag intern bewertet. Details bleiben vertraulich.",
                "\(name) ist im Feierabendmodus. Der unterscheidet sich kaum vom Tagesmodus."
            ]
        default:
            pool += [
                "\(name) flüstert, damit die Nacht nicht aufwacht.",
                "\(name) findet, um diese Uhrzeit zählt nichts davon wirklich.",
                "\(name) ist noch wach. Aus Prinzip.",
                "\(name) fragt nicht, warum du noch wach bist. Er notiert es nur."
            ]
        }

        switch mood {
        case .hungrig:
            pool += [
                "\(name) erwähnt beiläufig, dass er seit gefühlt Jahren nichts gegessen hat.",
                "\(name) schaut abwechselnd dich und eine imaginäre Snackschale an."
            ]
        case .muede:
            pool += [
                "\(name) gähnt in deine Richtung. Das ist eine Nachricht.",
                "\(name) hat die Augen nur noch aus Höflichkeit offen."
            ]
        case .anhaenglich:
            pool += [
                "\(name) hat dich vermisst. Er würde es nie so direkt sagen. Sagt es aber.",
                "\(name) sitzt heute demonstrativ näher am Bildschirmrand."
            ]
        case .dramatisch:
            pool += [
                "\(name) sitzt da wie die Hauptfigur eines sehr ernsten Films.",
                "\(name) hat heute bereits zweimal in die Ferne geblickt. Grundlos."
            ]
        case .gelangweilt:
            pool += [
                "\(name) hat die Decke angestarrt und ihr eine 6 von 10 gegeben.",
                "\(name) wäre offen für Programm. Jegliches Programm."
            ]
        default:
            break
        }

        // Streak-Hinweis, wenn eine Serie läuft.
        if pet.checkInStreak >= 3 {
            pool += ["\(name) zählt mit: \(pet.checkInStreak) Tage in Folge eingecheckt. Er tut unbeeindruckt. Ist er nicht."]
        }

        // Erinnerungen: Beziehungsdauer und Nutzer-Muster.
        if daysKnown >= 7 {
            pool += ["Tag \(daysKnown) von euch beiden. \(name) führt keine Liste. Offiziell."]
        }
        if let favorite = pet.memory.favoriteInteraction {
            switch favorite {
            case .streicheln:
                pool += ["\(name) hat gezählt: Streicheln ist eindeutig deine Spezialität. Er hat nichts dagegen."]
            case .spielen:
                pool += ["\(name) hat festgestellt, dass du am liebsten spielst. Er nennt euch inzwischen ein Team."]
            case .reden:
                pool += ["\(name) hat bemerkt, dass du gern redest. Er sammelt weiter fleißig Material."]
            case .fuettern:
                pool += ["\(name) hat eine Statistik: du fütterst überdurchschnittlich oft. Er unterstützt diese Entwicklung."]
            default:
                break
            }
        }

        // Macken sickern in den Alltag ein.
        let quirkLines = pet.memory.quirkIds
            .compactMap { Quirks.def(for: $0) }
            .map { String(format: $0.dailyLine, name) }
        pool += quirkLines
        pool += quirkLines  // doppelt gewichtet: Macken sollen sichtbar sein

        return pool.randomElement() ?? "\(name) ist da. Das reicht ihm als Statement."
    }

    /// Level-Up-Nachricht.
    static func levelUpMessage(level: Int, name: String) -> String {
        switch level {
        case 2: return "\(name) hat gelernt, besonders bedeutungsvoll zu blinzeln."
        case 3: return "\(name) hat eine kleine Persönlichkeit entwickelt. Leider mit Meinung."
        case 4: return "\(name) ist jetzt offiziell zu wichtig, um ignoriert zu werden."
        case 5: return "\(name) hat beschlossen, dass dieses iPhone jetzt sein Königreich ist."
        case 6: return "\(name) überlegt, Autogramme zu geben. An sich selbst."
        case 7: return "\(name) hat eine Vision. Sie beinhaltet hauptsächlich Snacks, aber immerhin."
        case 8: return "\(name) bezeichnet sich neuerdings als etabliert."
        case 9: return "\(name) hat angefangen, in der dritten Person zu denken. \(name) findet das angemessen."
        case 10: return "\(name) ist Level 10. Er hat kurz genickt, als hätte er nie daran gezweifelt."
        default: return "\(name) ist jetzt Level \(level). Er trägt es mit erstaunlicher Fassung."
        }
    }

    /// Reaktion auf den Tages-Check-in. Referenziert Mimos Erinnerungen.
    static func checkInReaction(answer: CheckInAnswer, name: String, streak: Int, memory: MemoryBank) -> String {
        // Erinnerungs-Reaktionen haben Vorrang: sie zeigen, dass Mimo zuhört.
        if answer == .superTag && memory.isComeback {
            return "\(name) erinnert sich an gestern. Von stressig zu super. Er findet, das Comeback verdient Anerkennung."
        }
        if answer == .stressig && memory.consecutiveStressDays >= 1 {
            return "\(name) merkt, dass es schon wieder stressig war. Er bleibt heute demonstrativ in deiner Nähe. Dienstanweisung an sich selbst."
        }

        let base: String
        switch answer {
        case .superTag:    base = "\(name) findet, du solltest diesen Tag einrahmen."
        case .okay:        base = "\(name) akzeptiert okay. Nicht begeistert, aber akzeptiert."
        case .stressig:    base = "\(name) hat beschlossen, heute dein emotionaler Bodyguard zu sein."
        case .muede:       base = "\(name) gähnt solidarisch."
        case .keineAhnung: base = "\(name) nickt, als hätte er exakt verstanden, was das bedeutet."
        }
        if streak > 1 && streak % 5 == 0 {
            return base + " Und: \(streak) Tage in Folge. \(name) führt Buch."
        }
        return base
    }

    /// Reaktion auf ein Gesprächsthema (Reden-Ausbau).
    static func talkReaction(topic: TalkTopic, pet: Pet, userName: String) -> String {
        let name = pet.name
        let trait = pet.personality.dominantTrait

        switch topic {
        case .vomTag:
            var pool = [
                "\(name) hört deiner Tageszusammenfassung zu wie einem Hörbuch. Mit gelegentlichem Nicken.",
                "\(name) merkt sich die wichtigen Stellen. Und die Snack-Erwähnungen. Vor allem die.",
                "\(name) findet, dein Tag hätte einen Erzähler verdient. Er bietet sich hiermit an."
            ]
            if trait == "anhaenglich" {
                pool.append("\(name) rückt beim Zuhören immer näher. Am Ende sitzt er praktisch auf deiner Stimme.")
            }
            return pool.randomElement()!
        case .frage:
            var pool = [
                "\(name) beantwortet deine Frage mit einem langen Blick. Er hält das für ausreichend.",
                "\(name) denkt sichtbar nach. Dann blinzelt er zweimal. Das war ein Ja. Wahrscheinlich.",
                "\(name) sagt, die Antwort liegt in dir. Er hat das mal irgendwo aufgeschnappt."
            ]
            if trait == "frech" {
                pool.append("\(name) tut, als wäre die Frage unter seinem Niveau. Dann denkt er heimlich doch darüber nach.")
            }
            if trait == "vertraeumt" {
                pool.append("\(name) starrt zur Antwort erst lange aus dem Fenster. Dort wohnen seine besten Gedanken.")
            }
            return pool.randomElement()!
        case .quatschen:
            var pool = [
                "\(name) quatscht mit. Also: er macht Geräusche in deinen Pausen. Es funktioniert erstaunlich gut.",
                "Ihr habt über nichts geredet. \(name) hält es für eines eurer besten Gespräche.",
                "\(name) hat mittendrin gelacht. Worüber, weiß keiner. Es war trotzdem der richtige Moment."
            ]
            if trait == "chaotisch" {
                pool.append("\(name) hat das Thema viermal gewechselt. Pro Satz.")
            }
            return pool.randomElement()!
        }
    }

    /// Ein Satz Wochenrückblick aus Mimos Erinnerungen.
    static func weekSummary(memory: MemoryBank, name: String) -> String {
        guard !memory.recentCheckIns.isEmpty else {
            return "\(name) hat noch keine Daten. Er sammelt aber schon Stifte für die Statistik."
        }
        var counts: [String: Int] = [:]
        for raw in memory.recentCheckIns {
            counts[raw, default: 0] += 1
        }
        let parts = CheckInAnswer.allCases.compactMap { answer -> String? in
            guard let n = counts[answer.rawValue] else { return nil }
            return "\(n)x \(answer.rawValue.lowercased())"
        }
        let list = parts.joined(separator: ", ")
        return "Die letzten \(memory.recentCheckIns.count) Check-ins: \(list). \(name) führt Statistik. Rein zufällig."
    }

    /// Tagebucheintrag aus Mimos Sicht.
    static func diaryText(for event: DiaryEvent, pet: Pet, userName: String) -> String {
        let name = pet.name
        switch event {
        case .checkIn(let answer):
            return checkInDiaryPool(answer: answer, userName: userName).randomElement()!
        case .interaction(let type):
            return interactionDiaryPool(type: type, name: name, userName: userName).randomElement()!
        case .levelUp(let level):
            return [
                "Ich bin jetzt Level \(level). Ich habe beschlossen, das nicht an die große Glocke zu hängen. Nur an eine mittelgroße.",
                "Level \(level) erreicht. Ich habe mir innerlich gratuliert. Sehr würdevoll.",
                "Heute Level \(level) geworden. \(userName) war dabei. Historischer Moment für uns beide."
            ].randomElement()!
        case .neglect:
            return [
                "Heute war es still. Ich habe dramatisch in Richtung Tür geschaut. Mehrfach. Für den Fall, dass jemand zusieht.",
                "Lange nichts von \(userName) gehört. Ich habe angefangen, mit dem Kissen zu reden. Es ist kein guter Zuhörer.",
                "Es war ruhig. Ich habe die Zeit genutzt, um sehr tiefgründig aus dem Fenster zu starren. Beruflich."
            ].randomElement()!
        case .snackDiscovered(let snack):
            return "Heute hat \(userName) herausgefunden, dass \(snack.title) mein Lieblingsessen ist. Hat lange genug gedauert. Aber ich bin nicht nachtragend. Meistens."
        case .miniGame(let score):
            if score >= 15 {
                return "Heute \(score) Sterne gefangen. Ich überlege, das in meinen offiziellen Titel aufzunehmen."
            }
            return "Heute Sterne gefangen mit \(userName). \(score) Stück. Die anderen waren offensichtlich defekt."
        case .achievement(let title):
            return "Neuer Erfolg: \(title). Ich habe bescheiden genickt und innerlich eine kleine Parade veranstaltet."
        case .quirk(let quirkId):
            return Quirks.def(for: quirkId)?.diaryLine
                ?? "Ich habe eine neue Angewohnheit entwickelt. Ich stehe dazu."
        }
    }


    /// Reaktion aufs Füttern mit konkretem Snack.
    static func feedReaction(snack: SnackType, isFavorite: Bool, firstDiscovery: Bool, name: String) -> String {
        if firstDiscovery {
            return "\(name) erstarrt. Das ist ES. \(snack.title) ist offiziell sein Lieblingssnack. Bitte notieren."
        }
        if isFavorite {
            return [
                "\(name) sieht \(snack.title) und vergisst kurz jede Würde.",
                "\(name) isst sein Lieblingsessen mit geschlossenen Augen. Aus Respekt.",
                "\(name) findet, du kennst ihn einfach. Sagt er. Mit vollem Mund."
            ].randomElement()!
        }
        switch snack {
        case .karotte:
            return [
                "\(name) knabbert die Karotte mit der Miene eines Gesundheitsexperten.",
                "\(name) isst die Karotte. Demonstrativ vernünftig."
            ].randomElement()!
        case .kuchen:
            return [
                "\(name) behandelt den Kuchen wie ein Staatsgeschenk.",
                "\(name) hat den Kuchen in Rekordzeit gewürdigt. Sehr gründlich gewürdigt."
            ].randomElement()!
        case .fisch:
            return [
                "\(name) nickt anerkennend. Fisch. Solide Wahl.",
                "\(name) isst den Fisch mit der Ruhe eines Kenners."
            ].randomElement()!
        case .suppe:
            return [
                "\(name) schlürft die Suppe. Laut. Er nennt es Wertschätzung.",
                "\(name) taucht fast komplett in die Suppe ein. Fast."
            ].randomElement()!
        }
    }

    /// Reaktion nach einer Mini-Game-Runde.
    static func miniGameReaction(score: Int, isNewBest: Bool, name: String) -> String {
        if isNewBest && score > 0 {
            return "\(score) Punkte. Neuer Rekord. \(name) verbeugt sich vor imaginärem Publikum."
        }
        switch score {
        case 0:
            return "\(name) hat keinen einzigen Stern gefangen. Er nennt es künstlerische Entscheidung."
        case 1...5:
            return "\(score) Sterne gefangen. \(name) spricht von einer Aufwärmrunde."
        case 6...12:
            return "\(score) Sterne. \(name) ist zufrieden. Fast schon bescheiden. Fast."
        default:
            return "\(score) Sterne. \(name) prüft, ob es dafür einen Pokal gibt. Es sollte."
        }
    }

    /// Reaktion, wenn alle Tagesziele geschafft sind.
    static func questBonusReaction(name: String) -> String {
        [
            "Alle Tagesziele geschafft. \(name) verteilt imaginäre Orden. Einen für dich, drei für sich.",
            "Tagesziele komplett. \(name) hakt die Liste ab, die er angeblich die ganze Zeit geführt hat.",
            "Alles erledigt. \(name) gönnt sich einen Moment stillen Triumphs. Er dauert auffällig lange."
        ].randomElement()!
    }

    // MARK: - Diary-Pools

    private static func checkInDiaryPool(answer: CheckInAnswer, userName: String) -> [String] {
        switch answer {
        case .superTag:
            return [
                "\(userName) hatte einen super Tag. Ich nehme einen kleinen Teil des Verdienstes. Sagen wir 80 Prozent.",
                "Heute war ein guter Tag für \(userName). Ich habe angemessen mitgefeiert. Innerlich. Mit Stil."
            ]
        case .okay:
            return [
                "\(userName) sagt, der Tag war okay. Ich habe zustimmend geblinzelt. Diplomatie ist eine meiner Stärken.",
                "Ein Okay-Tag für \(userName). Ich habe beschlossen, das als soliden Durchschnitt zu werten."
            ]
        case .stressig:
            return [
                "\(userName) sagt, der Tag war stressig. Ich habe mich offiziell zum kleinen Krisenmanager ernannt.",
                "Stressiger Tag bei \(userName). Ich habe extra weich geschaut. Das ist mein Beitrag."
            ]
        case .muede:
            return [
                "\(userName) war heute müde. Ich habe demonstrativ mitgegähnt. Solidarität ist wichtig.",
                "Müder Tag. \(userName) und ich haben uns wortlos auf Ruhe geeinigt. Starkes Team."
            ]
        case .keineAhnung:
            return [
                "\(userName) wusste heute selbst nicht, wie der Tag war. Ich habe weise genickt. Manche Tage sind einfach so.",
                "Unklarer Tag bei \(userName). Ich habe ihn unter 'Sonstiges' abgelegt."
            ]
        }
    }

    private static func interactionDiaryPool(type: InteractionType, name: String, userName: String) -> [String] {
        switch type {
        case .fuettern:
            return [
                "Heute hat \(userName) mich gefüttert. Ich habe so getan, als wäre ich bescheiden. War ich nicht.",
                "Es gab Essen. Ich habe drei Sterne vergeben und einen vierten angedeutet."
            ]
        case .streicheln:
            return [
                "Heute wurde ich gestreichelt. Ich habe geschnurrt, als wäre es das erste Mal. Professionalität.",
                "\(userName) hat mich gestreichelt. Ich habe es zugelassen. Großzügig, wie ich bin."
            ]
        case .spielen:
            return [
                "Heute habe ich gespielt und gewonnen. Gegen wen ist unklar, aber gewonnen.",
                "Spielrunde mit \(userName). Ich habe die Regeln mittendrin verbessert. Man dankt mir später."
            ]
        case .reden:
            return [
                "\(userName) hat heute mit mir geredet. Ich habe an den richtigen Stellen geblinzelt. Wir verstehen uns.",
                "Langes Gespräch mit \(userName). Ich habe hauptsächlich zugehört. Das ist eine unterschätzte Kunst."
            ]
        case .schlafen:
            return [
                "Heute war ein müder Tag. Ich habe beschlossen, sehr tiefgründig aus dem Fenster zu starren. Danach: Schlaf.",
                "Ich habe heute geschlafen. Ausgiebig. Es war eine meiner besten Leistungen."
            ]
        case .checkIn:
            return [
                "\(userName) hat heute eingecheckt. Ich führe Buch. Über alles."
            ]
        }
    }

    // MARK: - Interaktions-Pools

    private static func basePool(for interaction: InteractionType, name: String, userName: String) -> [String] {
        switch interaction {
        case .streicheln:
            return [
                "\(name) schnurrt dramatisch, als hätte er gerade einen Oscar gewonnen.",
                "\(name) lehnt sich in die Hand wie in ein Wellness-Wochenende.",
                "\(name) schließt die Augen. Das hier ist jetzt sein Lebensinhalt.",
                "\(name) macht ein Geräusch, das irgendwo zwischen Schnurren und Applaus liegt.",
                "\(name) speichert diesen Moment offiziell unter Favoriten."
            ]
        case .fuettern:
            return [
                "\(name) tut so, als wäre der Snack ein Michelin-Menü.",
                "\(name) isst würdevoll. Also fast.",
                "\(name) bedankt sich mit einem Blick, der drei Sterne vergibt.",
                "\(name) hat den Snack fachmännisch begutachtet. Und dann inhaliert.",
                "\(name) kaut bedeutungsvoll. Als würde er den Geschmack rezensieren."
            ]
        case .spielen:
            return [
                "\(name) hat gespielt und ist jetzt komplett größenwahnsinnig.",
                "\(name) erklärt sich zum Sieger. Regeln waren nie vereinbart.",
                "\(name) hüpft herum, als hätte er ein Turnier gewonnen. Hat er. In seinem Kopf.",
                "\(name) hat eine neue Spieltechnik erfunden. Sie ist regelwidrig und großartig.",
                "\(name) fordert sofort eine Revanche. Er hat gewonnen, aber trotzdem."
            ]
        case .reden:
            return [
                "\(name) sagt, du wirkst heute nachdenklich. Oder hungrig. Schwer zu sagen.",
                "\(name) hört zu. Mit dem ganzen Körper. Das ist sein Ding.",
                "\(name) nickt an genau den richtigen Stellen. Verdächtig gut.",
                "\(name) hat eine Meinung dazu. Er behält sie für sich, aber man sieht sie.",
                "\(name) findet, \(userName) sollte öfter erzählen. Er sammelt nämlich Material."
            ]
        case .schlafen:
            return [
                "\(name) rollt sich ein und ist innerhalb von Sekunden in einer anderen Dimension.",
                "\(name) schläft. Mit der Ernsthaftigkeit eines Profis.",
                "\(name) murmelt noch etwas von Snacks und ist dann weg.",
                "\(name) hat sich verabschiedet wie vor einer langen Reise. Er schläft nur."
            ]
        case .checkIn:
            return [
                "\(name) hakt den Tag offiziell ab.",
                "\(name) notiert alles. In seinem Kopf. Vermutlich."
            ]
        }
    }

    private static func traitPool(for interaction: InteractionType, trait: String, name: String) -> [String] {
        switch (trait, interaction) {
        case ("frech", .streicheln):
            return [
                "\(name) lässt es zu. Gnädig. Als würde er dir einen Gefallen tun.",
                "\(name) tut gelangweilt. Sein Schnurren verrät ihn komplett."
            ]
        case ("frech", .fuettern):
            return [
                "\(name) inspiziert den Snack erst kritisch. Dann verschwindet er in Rekordzeit.",
                "\(name) fragt sich laut, ob das alles ist. Es war reichlich."
            ]
        case ("frech", .spielen):
            return ["\(name) hat geschummelt. Er nennt es kreative Regelauslegung."]
        case ("frech", .reden):
            return ["\(name) hört zu und hebt an einer Stelle skeptisch die Augenbraue. Er hat keine Augenbrauen."]
        case ("lieb", .streicheln):
            return [
                "\(name) schmilzt ein bisschen. Er würde es abstreiten, aber es ist offensichtlich.",
                "\(name) drückt sich näher. Ohne Kommentar, mit voller Absicht."
            ]
        case ("lieb", .reden):
            return ["\(name) rückt näher. Einfach so. Ohne Kommentar."]
        case ("lieb", .fuettern):
            return ["\(name) bedankt sich mit einem Blick, der Herzen schmelzen könnte. Er weiß das."]
        case ("chaotisch", .spielen):
            return [
                "\(name) hat mitten im Spiel die Regeln geändert. Dreimal.",
                "\(name) ist beim Spielen einmal komplett umgefallen. Es war Teil des Plans, sagt er."
            ]
        case ("chaotisch", .fuettern):
            return ["\(name) hat beim Essen irgendwie Krümel an Stellen verteilt, die physikalisch unerreichbar sind."]
        case ("chaotisch", .streicheln):
            return ["\(name) genießt es. Dann rollt er sich grundlos einmal um die eigene Achse."]
        case ("vertraeumt", .schlafen):
            return ["\(name) träumt vermutlich schon wieder von diesem einen Ort, den nur er kennt."]
        case ("vertraeumt", .reden):
            return ["\(name) schaut kurz ins Leere, kommt zurück und tut, als wäre nichts gewesen."]
        case ("vertraeumt", .streicheln):
            return ["\(name) ist gedanklich woanders. Aber das Schnurren läuft auf Autopilot."]
        case ("anhaenglich", .streicheln):
            return ["\(name) will, dass das nie aufhört. Er sagt es nicht. Er zeigt es."]
        case ("anhaenglich", .reden):
            return ["\(name) hängt an jedem Wort. Wortwörtlich."]
        case ("anhaenglich", .spielen):
            return ["\(name) spielt vor allem, weil du dabei bist. Das Spiel ist Nebensache."]
        default:
            return []
        }
    }

    private static func moodPool(for interaction: InteractionType, mood: Mood, name: String) -> [String] {
        switch (mood, interaction) {
        case (.hungrig, .fuettern):
            return [
                "\(name) tut, als hätte er eine Woche gefastet. Es waren ein paar Stunden.",
                "\(name) hat den Snack begrüßt wie einen alten Freund. Einen essbaren alten Freund."
            ]
        case (.hungrig, .spielen):
            return ["\(name) spielt mit, denkt aber sichtbar an Essen. Multitasking."]
        case (.muede, .spielen):
            return ["\(name) spielt mit. Aber in Zeitlupe. Aus Protest."]
        case (.muede, .streicheln):
            return ["\(name) ist zu müde für Dramatik. Er schnurrt auf Sparflamme. Reicht auch."]
        case (.dramatisch, .streicheln):
            return ["\(name) seufzt theatralisch. Dann genießt er es heimlich."]
        case (.dramatisch, .fuettern):
            return ["\(name) nimmt den Snack entgegen wie eine längst überfällige Entschuldigung."]
        case (.gelangweilt, .spielen):
            return ["\(name) war kurz davor, die Wand zu bewerten. Das hier ist deutlich besser."]
        case (.gelangweilt, .reden):
            return ["\(name) ist dankbar für Programm. Er zeigt es auf seine Art: durch Anwesenheit."]
        case (.gluecklich, .spielen):
            return ["\(name) ist in Bestform. Er hat gerade einen imaginären Pokal entgegengenommen."]
        case (.anhaenglich, .reden):
            return ["\(name) wollte genau das. Genau jetzt. Woher wusstest du das?"]
        default:
            return []
        }
    }

    private static func highLevelPool(for interaction: InteractionType, name: String) -> [String] {
        switch interaction {
        case .streicheln:
            return ["\(name) gewährt eine Audienz. Streicheln inklusive."]
        case .fuettern:
            return ["\(name) lässt den Snack erst probieren. Von sich selbst. Sicherheit geht vor."]
        case .spielen:
            return ["\(name) spielt inzwischen auf Championsniveau. Sagt seine eigene Rangliste."]
        case .reden:
            return ["\(name) hört zu wie ein sehr kleiner, sehr teurer Berater."]
        default:
            return []
        }
    }
}

// MARK: - Hilfstypen

enum CheckInAnswer: String, CaseIterable, Identifiable {
    case superTag = "Super"
    case okay = "Okay"
    case stressig = "Stressig"
    case muede = "Müde"
    case keineAhnung = "Keine Ahnung"

    var id: String { rawValue }
}

enum DiaryEvent {
    case checkIn(CheckInAnswer)
    case interaction(InteractionType)
    case levelUp(Int)
    case neglect
    case snackDiscovered(SnackType)
    case miniGame(Int)
    case achievement(String)
    case quirk(String)
}
