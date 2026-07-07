# Mimo (Web)

Virtuelles Haustier als Web-App. Vanilla JS/HTML/CSS, keine Dependencies, Speicherung in localStorage.
Portiert vom nativen SwiftUI-Projekt (Repo "mimo") mit allen Systemen: Stimmung, Persönlichkeit,
Erinnerungen, Macken, Quests, Erfolge, Garderobe, zwei Mini-Games, Tagesphasen-Himmel.
v10 Pflege & Langzeit: Hygiene-System mit Dreck und Bade-Rubbel-Modus, Streichel-Geste statt Tippen, Futter-Hüpfer, XP-Kurve bis Level 30, gestreckte Bond-Stufen/Preise/Drops, 10 Langzeit-Erfolge, 30 Fundstücke.
v9 Politur: konsolidiertes Home (Heute-Karte, kombinierte Ziele), konsistentes SVG-Icon-System, Stat-Ring- und Dock-Fixes, Text-Qualitätspass, +5 Gespräche.
v8 Seele: sichtbares Wachstum (Wirbel, Schweif, Ohren), Bond wird sichtbar (Augenglanz, Herz-Wangen, Schimmer), Emotions-Bursts, Traurig-Stimmung, Momente-System mit Erinnerungs-Gesprächen, Kosename, Tagesgruß.
v7 Balancing: Anti-Spam-Budgets, Hunger mit Konsequenz, Premium-Snacks mit XP/Bond-Boni, Belohnungen sichtbar in der Szene, fliegende Snacks mit Kau-Animation.
v6 Tiefe: steigende XP-Kurve bis Level 20+, Beziehungsstufen, Ziel-Meisterschaft mit Reise-Log, Wochenziele, Combo-System.
v5 Welt: Expeditionen mit echter Abwesenheit, Sammelalbum (20 Fundstücke), Atemübung, Dankbarkeits-Glas, Streak-Schutz.
v4 Gespräche: echtes Chat-System, Mimo lernt dich kennen und erinnert sich, Kontext- und Bond-Gespräche.
v3 Gameplay: Sternenstaub-Ökonomie, Shop, tägliches Geschenk, Tageswunsch, Wachstumsstufen, Willkommen-zurück.

## Deployment (GitHub Pages)
1. Alle Dateien in ein Repo hochladen
2. Settings -> Pages -> Branch "main", Ordner "/ (root)" -> Save
3. URL öffnen; auf dem iPhone: Teilen -> "Zum Home-Bildschirm" für Vollbild-App-Feeling

## Design
Display-Font ist Fraunces (Google Fonts, Fallback Georgia). Vier Tagesphasen mit eigenen
Paletten und Szenen: Morgen, Tag (Wolken, Sonne), Abend, Nacht (Indigo, Mond, Sterne, Glühwürmchen).

## Testen ohne Warten
- Level: in app.js in addXP() den Divisor 100 senken (z. B. 20)
- Tagesphasen: dayPhase() temporär eine Phase hart zurückgeben ("night")
- Reset: Profil -> App zurücksetzen
