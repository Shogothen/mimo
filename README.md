# Mimo

Virtuelles Haustier fürs iPhone. SwiftUI, MVVM, komplett lokal, keine Dependencies.

## Starten

1. ZIP entpacken
2. `Mimo.xcodeproj` doppelklicken (Xcode 16 oder neuer)
3. Simulator wählen (z. B. iPhone 16) und Cmd+R

Deployment Target: iOS 17.0. App-Icon und AccentColor sind im Asset-Katalog enthalten.

## Fallback (falls das Projekt nicht öffnet, z. B. älteres Xcode)

1. Xcode: File > New > Project > iOS > App, Name "Mimo", Interface SwiftUI
2. Im neuen Projekt `ContentView.swift` und `MimoApp.swift` löschen
3. Den Inhalt des Ordners `Mimo/` aus diesem ZIP (Models, Services, ViewModels, Views, Assets.xcassets, MimoApp.swift) per Drag & Drop ins Projekt ziehen, "Copy items if needed" + Target Mimo anhaken
4. Cmd+R

## Features

- Onboarding: Nutzername, Petname, 4 Grundpersönlichkeiten
- 8 Stimmungen aus Energie, Laune, Sättigung, Vernachlässigung, Tageszeit, Persönlichkeit
- Persönlichkeitsachsen entwickeln sich durch Interaktionen (sichtbar im Profil)
- Reaction Engine mit über 120 Textvarianten (Basis + Trait + Mood + High-Level-Pools)
- Tages-Check-in mit Streak (Flame-Chip auf dem Homescreen, Meilenstein-Texte alle 5 Tage)
- Tagebuch mit automatischen Einträgen (Check-in, Interaktionen, Level-Ups, Vernachlässigung), jeweils mit Varianten
- Level-System (100 XP pro Level), eigene Texte bis Level 10
- Schlaf-Zustand: geschlossene Augen, schwebende z z z, langsameres Atmen, Aufwecken per Tap, automatisches Aufwachen bei voller Energie
- Pet blinzelt alle paar Sekunden, Atem-Animation, Wangen
- Room mit Tag/Nacht-Modus (ab 21 Uhr) und Level-Unlocks (Kissen, Pflanze, Lampe, Sternenfenster)
- Lokale Notifications als Opt-in im Profil (täglicher 18-Uhr-Reminder)
- Persistenz als Codable-JSON mit defensivem Decoding: Spielstände überleben zukünftige Model-Erweiterungen
- Reset im Profil


## UI (v3)

- Lebendiger Himmel als Signatur: der App-Hintergrund folgt der echten Tageszeit (Morgengold, Tagblau, Abendrosa, Nachtlila), inklusive des Fensters im Room und des Check-in-Sheets
- Pet-Körper ist jetzt ein organisch wabernder Blob (custom Shape mit animierter Phase), mit Glanzlicht, Bodenschatten und Squish-Effekt bei jedem Tap
- Glückliches Pet hüpft sanft, müdes atmet langsamer
- Sprechblase mit Schwanz, federt herein und verschwindet nach 5 Sekunden von selbst
- Schwebendes Custom-Dock statt Standard-TabBar, Indikator gleitet zwischen Tabs (matchedGeometryEffect)
- Stats als Ringe statt Balken-Cards, farbcodiert (Energie, Laune, Sättigung, Bond)
- Interaktions-Buttons mit Gradient-Icon-Kreisen und weichem Eindrücken beim Tippen
- Level-Up mit Konfetti (Canvas + TimelineView)
- Tagebuch als Zeitstrahl mit stimmungsfarbenen Markern
- Profil als Steckbrief mit Mini-Pet und farbigen Persönlichkeitsbalken
- SF Rounded als durchgängige Typo, Beeren-Akzent statt Standard-Terracotta
- App-Icon im gleichen Look (Abendhimmel, Glühen, Glanzlicht)

## Spielsysteme (v4)

- Mini-Game "Sterne fangen": Mimo per Drag steuern, 30 Sekunden, goldene Sterne zählen dreifach; Score gibt XP (bis 25), Highscore wird gespeichert
- Fütter-System: vier Snacks mit unterschiedlichen Effekten; jedes Pet hat einen zufälligen, versteckten Lieblingssnack, der beim ersten Treffer entdeckt wird (Bonus, Diary-Eintrag, Erfolg)
- Tagesziele: drei zufällige Quests pro Tag mit Fortschritt, alle geschafft = +20 XP Bonus
- Erfolge: 9 Achievements (inkl. Nachteule zwischen 0 und 4 Uhr), Toast-Banner beim Freischalten, Grid im Profil
- Garderobe: vier freischaltbare Hüte (Schleife, Mütze, Blume, Krone), Mimo trägt sie auf allen Screens; Auswahl im Room

## Erinnerungen und Macken (v5)

- Memory-System: Mimo zählt Interaktionen und merkt sich die letzten 7 Check-in-Antworten. Die Reaction Engine referenziert das aktiv: Comeback-Erkennung (gestern stressig, heute super), Zuwendung bei wiederholtem Stress, Beziehungsdauer ("Tag X von euch beiden"), Lieblingsinteraktion des Nutzers
- Macken-System: alle zwei Level entwickelt Mimo eine von 10 Macken (misstraut der Lampe, sammelt unsichtbare Steine, Erzfeindschaft mit einem Staubkorn, ...). Macken tauchen doppelt gewichtet in Tagesnachrichten auf, erzeugen einen Diary-Eintrag bei Entstehung und sind im Profil gelistet
- Reden ausgebaut: drei Gesprächsthemen (vom Tag erzählen, Mimo fragen, einfach quatschen) mit eigenen, persönlichkeitsgefärbten Antwort-Pools
- Wochenrückblick im Tagebuch: farbige Punkte der letzten Check-ins plus ein Statistik-Satz von Mimo
- Dezente System-Sounds (keine Assets): Tick beim Sternefangen, Fanfare beim Level-Up, Akkord bei Erfolgen

## Design-Pass (v6)

- Typografisches Konzept: New York Serif als Display (Pet-Name, Screen-Titel, Level-Momente, Tagebuchtexte) gegen SF Rounded als Body — das Tagebuch liest sich jetzt wie ein Tagebuch
- Lebendiger Himmel Stufe 2: schwebende Lichtpartikel auf jedem Screen (tagsüber Lichtpollen, nachts pulsierende Glühwürmchen), Canvas + TimelineView
- Home als Szene statt Screen: Mimo steht auf einem zweistufigen Hügel in Phasenfarbe, dahinter eine Aura in der aktuellen Stimmungsfarbe (Mood ambient sichtbar, weich animiert)
- Cards von flachem Weiß zu "Papier": vertikaler Verlauf, Lichtkante oben, getönter Rand, farbiger Schatten
- Editoriale Sektions-Labels (Versalien, Letterspacing, Akzentstrich) statt fetter Zwischenüberschriften
- Interaktions-Buttons als Squishy-Toys: Gradient, Lichtkante oben, getönter Schatten
- Room: Bilderrahmen mit Mini-Selbstportrait, weiche Vignette für Tiefe, nachts gedimmt
- Weicher Fade beim Tab-Wechsel

## Build ohne Mac (GitHub Actions)

Das Repo enthält einen Workflow unter `.github/workflows/build.yml`. Bei jedem Push baut ein macOS-Runner die App für den iOS-Simulator (ohne Signing) und zeigt Compiler-Fehler im Actions-Tab. Öffentliches Repo: kostenlos und unbegrenzt. Privates Repo: verbraucht Freiminuten, macOS zählt dabei 10-fach.

Ablauf: Repo anlegen, alle Dateien aus diesem ZIP hochladen (inklusive des versteckten Ordners `.github`), dann unter Actions den Lauf beobachten. Grüner Haken = kompiliert. Roter Kreuz = Job anklicken, Build-Schritt aufklappen, rote Fehlerzeilen kopieren.

## Testen ohne Warten

- Check-in geht 1x pro Kalendertag
- Level-Ups: alle 100 XP; für schnelles Testen in `PetLogicService.addXP` den Divisor senken
- Decay simulieren: in `PetLogicService.applyDecay` den Stundenwert künstlich erhöhen
- Tagesphasen testen: Mac-Systemzeit ändern oder in `DayPhase.current` temporär eine Phase hart zurückgeben
