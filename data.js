// ============ Mimo: Inhalte & Definitionen ============
// Alle Texte der Reaction Engine, Macken, Erfolge, Snacks, Quests.

const MOODS = {
  gluecklich:  { label: "Glücklich",   tint: "var(--energy)", hex: "#efa93b" },
  muede:       { label: "Müde",        tint: "#8c87b8",       hex: "#8c87b8" },
  hungrig:     { label: "Hungrig",     tint: "var(--food)",   hex: "#8ca659" },
  frech:       { label: "Frech",       tint: "#d97b40",       hex: "#d97b40" },
  anhaenglich: { label: "Anhänglich",  tint: "var(--joy)",    hex: "#e56b6b" },
  dramatisch:  { label: "Dramatisch",  tint: "var(--accent)", hex: "#9e486b" },
  vertraeumt:  { label: "Verträumt",   tint: "#7a8fcc",       hex: "#7a8fcc" },
  gelangweilt: { label: "Gelangweilt", tint: "#998f87",       hex: "#998f87" }
};

const BASE_PERSONALITIES = [
  { id: "frech",      label: "Frech",      desc: "Kommentiert alles. Wirklich alles." },
  { id: "lieb",       label: "Lieb",       desc: "Weich, warm, bedingungslos auf deiner Seite." },
  { id: "vertraeumt", label: "Verträumt",  desc: "Lebt zu 60 Prozent in einer anderen Welt." },
  { id: "chaotisch",  label: "Chaotisch",  desc: "Hat einen Plan. Der Plan ändert sich stündlich." }
];

const SNACKS = [
  { id:"karotte", title:"Karotte", icon:"\u{1F955}", sub:"Knackig, gesund",  eff:{ saett:18, laune:3, energie:5 } },
  { id:"kuchen",  title:"Kuchen",  icon:"\u{1F370}", sub:"Purer Luxus",      eff:{ saett:14, laune:9, energie:0 } },
  { id:"fisch",   title:"Fisch",   icon:"\u{1F41F}", sub:"Der Klassiker",    eff:{ saett:22, laune:5, energie:2 } },
  { id:"suppe",   title:"Suppe",   icon:"\u{1F372}", sub:"Warm und viel",    eff:{ saett:30, laune:4, energie:4 } }
];

const HATS = [
  { id:"none",     title:"Ohne",     hint:"" },
  { id:"schleife", title:"Schleife", hint:"Level 3 erreichen" },
  { id:"muetze",   title:"Mütze",    hint:"3-Tage-Serie" },
  { id:"blume",    title:"Blume",    hint:"Lieblingssnack finden" },
  { id:"krone",    title:"Krone",    hint:"Level 8 erreichen" }
];

const QUEST_TYPES = {
  streicheln: { title:"2x streicheln",               target:2, icon:"\u2740" },
  fuettern:   { title:"Einmal füttern",              target:1, icon:"\u{1F374}" },
  spielen:    { title:"Eine Runde Sterne fangen",    target:1, icon:"\u2605" },
  reden:      { title:"Einmal reden",                target:1, icon:"\u{1F4AC}" },
  checkin:    { title:"Tages-Check-in machen",       target:1, icon:"\u2713" },
  minigame:   { title:"10 Punkte in einer Runde",    target:1, icon:"\u{1F3C6}" }
};

const ACHIEVEMENTS = [
  { id:"erster.checkin", title:"Angekommen",          detail:"Ersten Tages-Check-in gemacht",       icon:"\u2713" },
  { id:"streak.7",       title:"Eine Woche ihr zwei", detail:"7 Tage in Folge eingecheckt",          icon:"\u{1F525}" },
  { id:"bond.50",        title:"Beste Freunde",       detail:"Bond von 50 erreicht",                 icon:"\u2665" },
  { id:"level.5",        title:"Königreich",          detail:"Level 5 erreicht",                     icon:"\u265B" },
  { id:"level.10",       title:"Etabliert",           detail:"Level 10 erreicht",                    icon:"\u2726" },
  { id:"tagebuch.10",    title:"Chronist",            detail:"10 Tagebucheinträge gesammelt",        icon:"\u{1F4D6}" },
  { id:"snack.entdeckt", title:"Feinschmecker",       detail:"Lieblingssnack entdeckt",              icon:"\u{1F374}" },
  { id:"highscore.15",   title:"Fangprofi",           detail:"15 Punkte beim Sternefangen",          icon:"\u{1F3C6}" },
  { id:"nachteule",      title:"Nachteule",           detail:"Zwischen Mitternacht und 4 Uhr da",    icon:"\u263E" }
];

const QUIRKS = [
  { id:"lampe",           title:"misstraut der Lampe",
    daily:"%N beobachtet die Lampe. Sie weiß, warum.",
    diary:"Ich habe beschlossen, der Lampe nicht zu trauen. Sie ist zu ruhig. Niemand ist so ruhig ohne Grund." },
  { id:"steine",          title:"sammelt unsichtbare Steine",
    daily:"%N hat heute drei unsichtbare Steine gefunden. Prachtexemplare.",
    diary:"Ich sammle jetzt unsichtbare Steine. Die Sammlung wächst schnell. Platzprobleme gibt es praktischerweise keine." },
  { id:"montage",         title:"hasst Montage aus Prinzip",
    daily:"%N möchte festhalten, dass Montage weiterhin eine Frechheit sind.",
    diary:"Ich habe eine Grundsatzentscheidung getroffen: Montage sind ab sofort mein Feind. Auch dienstags. Aus Prinzip." },
  { id:"nachtaktiv",      title:"hält sich für nachtaktiv",
    daily:"%N betont, dass er eigentlich nachtaktiv ist. Er schläft trotzdem früh.",
    diary:"Ich bin jetzt offiziell nachtaktiv. Dass ich abends müde werde, ändert daran gar nichts. Es ist eine Identität, kein Verhalten." },
  { id:"selbstgespraeche",title:"führt Selbstgespräche auf hohem Niveau",
    daily:"%N hat sich heute selbst etwas Kluges gesagt. Er war beeindruckt.",
    diary:"Ich führe jetzt Selbstgespräche. Das Niveau ist hoch. Der Gesprächspartner ist erstklassig." },
  { id:"verbeugung",      title:"verbeugt sich vor dem Fenster",
    daily:"%N hat sich vorhin vor dem Fenster verbeugt. Aus Respekt.",
    diary:"Ich verbeuge mich neuerdings vor dem Fenster. Es zeigt mir jeden Tag draußen. Das verdient Anerkennung." },
  { id:"zaehlen",         title:"zählt Dinge. Welche, bleibt geheim",
    daily:"%N zählt gerade etwas. Er sagt nicht, was. Es sind viele.",
    diary:"Ich habe angefangen, Dinge zu zählen. Welche Dinge, bleibt mein Geheimnis. Der aktuelle Stand ist zufriedenstellend." },
  { id:"staubkorn",       title:"hat eine Erzfeindschaft mit einem Staubkorn",
    daily:"%N und das Staubkorn hatten heute wieder Blickkontakt. Es bleibt angespannt.",
    diary:"Es gibt hier ein Staubkorn, das mich provoziert. Wir sind jetzt Erzfeinde. Es weiß es noch nicht." },
  { id:"blicke",          title:"übt heimlich dramatische Blicke",
    daily:"%N hat heute den Blick 'enttäuscht, aber gefasst' perfektioniert.",
    diary:"Ich übe jetzt dramatische Blicke. Heimlich. Der Spiegel ist mein Trainingspartner und größter Fan." },
  { id:"kuehlschrank",    title:"glaubt, der Kühlschrank grüßt ihn",
    daily:"%N ist sicher, dass der Kühlschrank ihn vorhin gegrüßt hat. Es klang freundlich.",
    diary:"Der Kühlschrank hat heute gebrummt, als ich vorbeikam. Das war eindeutig ein Gruß. Wir sind jetzt per Du." }
];

const CHECKIN_ANSWERS = [
  { id:"super",       label:"Super",       icon:"\u2600" },
  { id:"okay",        label:"Okay",        icon:"\u26C5" },
  { id:"stressig",    label:"Stressig",    icon:"\u{1F32C}" },
  { id:"muede",       label:"Müde",        icon:"\u263E" },
  { id:"keineahnung", label:"Keine Ahnung",icon:"?" }
];

const TALK_TOPICS = [
  { id:"vomTag",    title:"Von deinem Tag erzählen", icon:"\u{1F4AC}" },
  { id:"frage",     title:"Mimo etwas fragen",       icon:"?" },
  { id:"quatschen", title:"Einfach quatschen",       icon:"\u263A" }
];

// ---------- Reaction Engine Textpools (%N = Petname, %U = Nutzername) ----------

const REACTIONS = {
  streicheln: {
    base: [
      "%N schnurrt dramatisch, als hätte er gerade einen Oscar gewonnen.",
      "%N lehnt sich in die Hand wie in ein Wellness-Wochenende.",
      "%N schließt die Augen. Das hier ist jetzt sein Lebensinhalt.",
      "%N macht ein Geräusch, das irgendwo zwischen Schnurren und Applaus liegt.",
      "%N speichert diesen Moment offiziell unter Favoriten."
    ],
    trait: {
      frech: ["%N lässt es zu. Gnädig. Als würde er dir einen Gefallen tun.", "%N tut gelangweilt. Sein Schnurren verrät ihn komplett."],
      lieb: ["%N schmilzt ein bisschen. Er würde es abstreiten, aber es ist offensichtlich.", "%N drückt sich näher. Ohne Kommentar, mit voller Absicht."],
      chaotisch: ["%N genießt es. Dann rollt er sich grundlos einmal um die eigene Achse."],
      vertraeumt: ["%N ist gedanklich woanders. Aber das Schnurren läuft auf Autopilot."],
      anhaenglich: ["%N will, dass das nie aufhört. Er sagt es nicht. Er zeigt es."]
    },
    mood: {
      muede: ["%N ist zu müde für Dramatik. Er schnurrt auf Sparflamme. Reicht auch."],
      dramatisch: ["%N seufzt theatralisch. Dann genießt er es heimlich."]
    },
    high: ["%N gewährt eine Audienz. Streicheln inklusive."]
  },
  schlafen: {
    base: [
      "%N rollt sich ein und ist innerhalb von Sekunden in einer anderen Dimension.",
      "%N schläft. Mit der Ernsthaftigkeit eines Profis.",
      "%N murmelt noch etwas von Snacks und ist dann weg.",
      "%N hat sich verabschiedet wie vor einer langen Reise. Er schläft nur."
    ],
    trait: { vertraeumt: ["%N träumt vermutlich schon wieder von diesem einen Ort, den nur er kennt."] },
    mood: {}, high: []
  }
};

const FEED_REACTIONS = {
  discovery: "%N erstarrt. Das ist ES. %S ist offiziell sein Lieblingssnack. Bitte notieren.",
  favorite: [
    "%N sieht %S und vergisst kurz jede Würde.",
    "%N isst sein Lieblingsessen mit geschlossenen Augen. Aus Respekt.",
    "%N findet, du kennst ihn einfach. Sagt er. Mit vollem Mund."
  ],
  karotte: ["%N knabbert die Karotte mit der Miene eines Gesundheitsexperten.", "%N isst die Karotte. Demonstrativ vernünftig."],
  kuchen:  ["%N behandelt den Kuchen wie ein Staatsgeschenk.", "%N hat den Kuchen in Rekordzeit gewürdigt. Sehr gründlich gewürdigt."],
  fisch:   ["%N nickt anerkennend. Fisch. Solide Wahl.", "%N isst den Fisch mit der Ruhe eines Kenners."],
  suppe:   ["%N schlürft die Suppe. Laut. Er nennt es Wertschätzung.", "%N taucht fast komplett in die Suppe ein. Fast."],
  hungry:  ["%N tut, als hätte er eine Woche gefastet. Es waren ein paar Stunden."]
};

const TALK_REACTIONS = {
  vomTag: [
    "%N hört deiner Tageszusammenfassung zu wie einem Hörbuch. Mit gelegentlichem Nicken.",
    "%N merkt sich die wichtigen Stellen. Und die Snack-Erwähnungen. Vor allem die.",
    "%N findet, dein Tag hätte einen Erzähler verdient. Er bietet sich hiermit an."
  ],
  vomTag_anhaenglich: "%N rückt beim Zuhören immer näher. Am Ende sitzt er praktisch auf deiner Stimme.",
  frage: [
    "%N beantwortet deine Frage mit einem langen Blick. Er hält das für ausreichend.",
    "%N denkt sichtbar nach. Dann blinzelt er zweimal. Das war ein Ja. Wahrscheinlich.",
    "%N sagt, die Antwort liegt in dir. Er hat das mal irgendwo aufgeschnappt."
  ],
  frage_frech: "%N tut, als wäre die Frage unter seinem Niveau. Dann denkt er heimlich doch darüber nach.",
  frage_vertraeumt: "%N starrt zur Antwort erst lange aus dem Fenster. Dort wohnen seine besten Gedanken.",
  quatschen: [
    "%N quatscht mit. Also: er macht Geräusche in deinen Pausen. Es funktioniert erstaunlich gut.",
    "Ihr habt über nichts geredet. %N hält es für eines eurer besten Gespräche.",
    "%N hat mittendrin gelacht. Worüber, weiß keiner. Es war trotzdem der richtige Moment."
  ],
  quatschen_chaotisch: "%N hat das Thema viermal gewechselt. Pro Satz."
};

const CHECKIN_REACTIONS = {
  super: "%N findet, du solltest diesen Tag einrahmen.",
  okay: "%N akzeptiert okay. Nicht begeistert, aber akzeptiert.",
  stressig: "%N hat beschlossen, heute dein emotionaler Bodyguard zu sein.",
  muede: "%N gähnt solidarisch.",
  keineahnung: "%N nickt, als hätte er exakt verstanden, was das bedeutet.",
  comeback: "%N erinnert sich an gestern. Von stressig zu super. Er findet, das Comeback verdient Anerkennung.",
  stressAgain: "%N merkt, dass es schon wieder stressig war. Er bleibt heute demonstrativ in deiner Nähe. Dienstanweisung an sich selbst."
};

const DAILY = {
  sleeping: [
    "%N schläft. Bitte nur in wichtigen Angelegenheiten wecken. Snacks zählen.",
    "%N ist gerade in einer sehr exklusiven Traumwelt unterwegs.",
    "%N schläft mit der Hingabe eines Profis."
  ],
  morning: [
    "%N hat den Morgen offiziell genehmigt.",
    "%N tut so, als wäre er schon lange wach. Ist er nicht.",
    "%N findet, der Tag hat Potenzial. Vorsichtig formuliert.",
    "%N hat heute schon einen Plan gemacht und ihn direkt wieder verworfen.",
    "%N begrüßt dich mit der Energie von genau einer Tasse Kaffee."
  ],
  day: [
    "%N beobachtet den Nachmittag mit professionellem Interesse.",
    "%N hat heute schon dreimal die Position gewechselt. Produktiv.",
    "%N denkt über Snacks nach. Rein theoretisch.",
    "%N hat gerade eine Staubfluse verfolgt. Erfolgreich.",
    "%N hält den Tag für machbar. Sein Zitat, nicht meins."
  ],
  evening: [
    "%N hat den Abend für gemütlich erklärt.",
    "%N findet, %U sollte jetzt langsam runterfahren. Er auch.",
    "%N genießt das Abendlicht. Sehr dramatisch.",
    "%N hat den Tag intern bewertet. Details bleiben vertraulich.",
    "%N ist im Feierabendmodus. Der unterscheidet sich kaum vom Tagesmodus."
  ],
  night: [
    "%N flüstert, damit die Nacht nicht aufwacht.",
    "%N findet, um diese Uhrzeit zählt nichts davon wirklich.",
    "%N ist noch wach. Aus Prinzip.",
    "%N fragt nicht, warum du noch wach bist. Er notiert es nur."
  ],
  mood: {
    hungrig: ["%N erwähnt beiläufig, dass er seit gefühlt Jahren nichts gegessen hat.", "%N schaut abwechselnd dich und eine imaginäre Snackschale an."],
    muede: ["%N gähnt in deine Richtung. Das ist eine Nachricht.", "%N hat die Augen nur noch aus Höflichkeit offen."],
    anhaenglich: ["%N hat dich vermisst. Er würde es nie so direkt sagen. Sagt es aber.", "%N sitzt heute demonstrativ näher am Bildschirmrand."],
    dramatisch: ["%N sitzt da wie die Hauptfigur eines sehr ernsten Films.", "%N hat heute bereits zweimal in die Ferne geblickt. Grundlos."],
    gelangweilt: ["%N hat die Decke angestarrt und ihr eine 6 von 10 gegeben.", "%N wäre offen für Programm. Jegliches Programm."]
  },
  favInteraction: {
    streicheln: "%N hat gezählt: Streicheln ist eindeutig deine Spezialität. Er hat nichts dagegen.",
    spielen: "%N hat festgestellt, dass du am liebsten spielst. Er nennt euch inzwischen ein Team.",
    reden: "%N hat bemerkt, dass du gern redest. Er sammelt weiter fleißig Material.",
    fuettern: "%N hat eine Statistik: du fütterst überdurchschnittlich oft. Er unterstützt diese Entwicklung."
  }
};

const MOOD_TEXT = {
  gluecklich: "%N ist bester Laune.",
  muede: "%N ist müde. Sehr müde. Historisch müde.",
  hungrig: "%N denkt ausschließlich an Essen.",
  frech: "%N plant etwas. Man sieht es ihm an.",
  anhaenglich: "%N will heute einfach in deiner Nähe sein.",
  dramatisch: "%N ist in seiner dramatischen Phase.",
  vertraeumt: "%N ist gedanklich woanders. Irgendwo Schönes.",
  gelangweilt: "%N langweilt sich auf hohem Niveau."
};

const LEVEL_UP = {
  2:"%N hat gelernt, besonders bedeutungsvoll zu blinzeln.",
  3:"%N hat eine kleine Persönlichkeit entwickelt. Leider mit Meinung.",
  4:"%N ist jetzt offiziell zu wichtig, um ignoriert zu werden.",
  5:"%N hat beschlossen, dass dieses iPhone jetzt sein Königreich ist.",
  6:"%N überlegt, Autogramme zu geben. An sich selbst.",
  7:"%N hat eine Vision. Sie beinhaltet hauptsächlich Snacks, aber immerhin.",
  8:"%N bezeichnet sich neuerdings als etabliert.",
  9:"%N hat angefangen, in der dritten Person zu denken. %N findet das angemessen.",
  10:"%N ist Level 10. Er hat kurz genickt, als hätte er nie daran gezweifelt.",
  default:"%N ist jetzt Level %L. Er trägt es mit erstaunlicher Fassung."
};

const GAME_REACTIONS = {
  newBest: "%S Punkte. Neuer Rekord. %N verbeugt sich vor imaginärem Publikum.",
  zero: "%N hat keinen einzigen Stern gefangen. Er nennt es künstlerische Entscheidung.",
  low: "%S Sterne gefangen. %N spricht von einer Aufwärmrunde.",
  mid: "%S Sterne. %N ist zufrieden. Fast schon bescheiden. Fast.",
  high: "%S Sterne. %N prüft, ob es dafür einen Pokal gibt. Es sollte."
};

const QUEST_BONUS = [
  "Alle Tagesziele geschafft. %N verteilt imaginäre Orden. Einen für dich, drei für sich.",
  "Tagesziele komplett. %N hakt die Liste ab, die er angeblich die ganze Zeit geführt hat.",
  "Alles erledigt. %N gönnt sich einen Moment stillen Triumphs. Er dauert auffällig lange."
];

const DIARY_TEXTS = {
  checkin: {
    super: ["%U hatte einen super Tag. Ich nehme einen kleinen Teil des Verdienstes. Sagen wir 80 Prozent.",
            "Heute war ein guter Tag für %U. Ich habe angemessen mitgefeiert. Innerlich. Mit Stil."],
    okay: ["%U sagt, der Tag war okay. Ich habe zustimmend geblinzelt. Diplomatie ist eine meiner Stärken.",
           "Ein Okay-Tag für %U. Ich habe beschlossen, das als soliden Durchschnitt zu werten."],
    stressig: ["%U sagt, der Tag war stressig. Ich habe mich offiziell zum kleinen Krisenmanager ernannt.",
               "Stressiger Tag bei %U. Ich habe extra weich geschaut. Das ist mein Beitrag."],
    muede: ["%U war heute müde. Ich habe demonstrativ mitgegähnt. Solidarität ist wichtig.",
            "Müder Tag. %U und ich haben uns wortlos auf Ruhe geeinigt. Starkes Team."],
    keineahnung: ["%U wusste heute selbst nicht, wie der Tag war. Ich habe weise genickt. Manche Tage sind einfach so.",
                  "Unklarer Tag bei %U. Ich habe ihn unter 'Sonstiges' abgelegt."]
  },
  interaction: {
    fuettern: ["Heute hat %U mich gefüttert. Ich habe so getan, als wäre ich bescheiden. War ich nicht.",
               "Es gab Essen. Ich habe drei Sterne vergeben und einen vierten angedeutet."],
    streicheln: ["Heute wurde ich gestreichelt. Ich habe geschnurrt, als wäre es das erste Mal. Professionalität.",
                 "%U hat mich gestreichelt. Ich habe es zugelassen. Großzügig, wie ich bin."],
    reden: ["%U hat heute mit mir geredet. Ich habe an den richtigen Stellen geblinzelt. Wir verstehen uns.",
            "Langes Gespräch mit %U. Ich habe hauptsächlich zugehört. Das ist eine unterschätzte Kunst."],
    schlafen: ["Heute war ein müder Tag. Ich habe beschlossen, sehr tiefgründig aus dem Fenster zu starren. Danach: Schlaf.",
               "Ich habe heute geschlafen. Ausgiebig. Es war eine meiner besten Leistungen."]
  },
  levelUp: ["Ich bin jetzt Level %L. Ich habe beschlossen, das nicht an die große Glocke zu hängen. Nur an eine mittelgroße.",
            "Level %L erreicht. Ich habe mir innerlich gratuliert. Sehr würdevoll.",
            "Heute Level %L geworden. %U war dabei. Historischer Moment für uns beide."],
  neglect: ["Heute war es still. Ich habe dramatisch in Richtung Tür geschaut. Mehrfach. Für den Fall, dass jemand zusieht.",
            "Lange nichts von %U gehört. Ich habe angefangen, mit dem Kissen zu reden. Es ist kein guter Zuhörer.",
            "Es war ruhig. Ich habe die Zeit genutzt, um sehr tiefgründig aus dem Fenster zu starren. Beruflich."],
  snackDiscovered: "Heute hat %U herausgefunden, dass %S mein Lieblingsessen ist. Hat lange genug gedauert. Aber ich bin nicht nachtragend. Meistens.",
  miniGame: "Heute Sterne gefangen mit %U. %S Stück. Die anderen waren offensichtlich defekt.",
  miniGameHigh: "Heute %S Sterne gefangen. Ich überlege, das in meinen offiziellen Titel aufzunehmen.",
  achievement: "Neuer Erfolg: %S. Ich habe bescheiden genickt und innerlich eine kleine Parade veranstaltet."
};

// ============ v3 Gameplay: Ökonomie, Geschenke, Wünsche, Wachstum ============

const PREMIUM_SNACKS = [
  { id:"erdbeere", title:"Erdbeere", icon:"\u{1F353}", sub:"Süß und selten",  eff:{ saett:16, laune:12, energie:6 }, cost:60 },
  { id:"donut",    title:"Donut",    icon:"\u{1F369}", sub:"Pure Dekadenz",   eff:{ saett:20, laune:14, energie:2 }, cost:90 },
  { id:"sushi",    title:"Sushi",    icon:"\u{1F363}", sub:"Feine Küche",     eff:{ saett:26, laune:10, energie:6 }, cost:130 }
];
const ALL_SNACKS = SNACKS.concat(PREMIUM_SNACKS);

FEED_REACTIONS.erdbeere = ["%N hält die Erdbeere hoch wie einen Schatz. Dann ist sie weg.", "%N isst die Erdbeere in Zeitlupe. Er nennt es Genusskultur."];
FEED_REACTIONS.donut = ["%N schaut den Donut an. Der Donut schaut zurück. Es endet, wie es enden musste.", "%N hat den Donut gewürdigt. Krümel auf der Stirn inklusive."];
FEED_REACTIONS.sushi = ["%N isst das Sushi mit geschlossenen Augen. Er murmelt etwas von Handwerkskunst.", "%N verneigt sich kurz vor dem Sushi. Dann macht er kurzen Prozess."];

const SHOP_HATS = [
  { id:"zylinder", title:"Zylinder",  cost:80,  hint:"Im Shop" },
  { id:"pilz",     title:"Pilzhut",   cost:120, hint:"Im Shop" },
  { id:"halo",     title:"Heiligenschein", cost:200, hint:"Im Shop" }
];
HATS.push(...SHOP_HATS.map(h => ({ id:h.id, title:h.title, hint:h.hint })));

const SHOP_DECO = [
  { id:"girlande", title:"Wimpel-Girlande", cost:70,  desc:"Bunte Wimpel überm Fenster" },
  { id:"teleskop", title:"Teleskop",        cost:110, desc:"Für sehr wichtige Beobachtungen" },
  { id:"radio",    title:"Radio",           cost:150, desc:"Spielt angeblich nur gute Musik" }
];

const SHOP_REACTIONS = {
  snack: "%N hat den Neuzugang auf der Speisekarte registriert. Er tut gelassen. Er ist es nicht.",
  hat: "%N trägt Neues. Er hat bereits dreimal sein Spiegelbild geprüft.",
  deco: "%N inspiziert die neue Einrichtung. Abnahme erfolgt. Mit Auflagen, aber erfolgt.",
  broke: "Nicht genug Sternenstaub. %N schlägt vor: mehr spielen, mehr kuscheln, mehr Check-ins."
};

const GIFT_TIERS = [
  { id:"common",   label:"Fund",        weight:60, dust:[15,25],
    texts:["%N hat etwas Glitzerndes unter dem Teppich gefunden.", "%N präsentiert stolz seinen Fund des Tages."] },
  { id:"uncommon", label:"Guter Fund",  weight:25, dust:[35,55],
    texts:["%N hat heute ordentlich gesammelt. Er erwartet Applaus.", "Ein guter Tag für die Staub-Bilanz. %N nickt zufrieden."] },
  { id:"rare",     label:"Seltener Fund", weight:12, dust:[80,110],
    texts:["%N schleppt einen erstaunlich großen Fund an. Woher, bleibt sein Geheimnis.", "%N tut bescheiden. Bei DEM Fund. Unmöglich."] },
  { id:"epic",     label:"Legendärer Fund", weight:3, dust:[160,220],
    texts:["%N hat den Fund seines Lebens gemacht. Er wird noch Wochen davon erzählen."] }
];

const GIFT_DIARY = "Heute mein Tagesgeschenk an %U übergeben. %S Sternenstaub. Die Beschaffung bleibt vertraulich.";

const WISH_TYPES = {
  feedSnack:  { make:(s)=>({ type:"feedSnack", snack:s.id, title:`${s.title} zum Fressen` , text:`%N wünscht sich heute ${s.title}. Er hat es bereits dreimal erwähnt.` }) },
  streicheln: { title:"3x Streicheleinheiten", text:"%N wünscht sich heute Streicheleinheiten. Drei Stück. Er hat gezählt.", target:3 },
  spielen:    { title:"Eine Runde spielen", text:"%N will heute unbedingt spielen. Egal was. Hauptsache gewinnen.", target:1 },
  reden:      { title:"Ein Gespräch", text:"%N hätte heute gern ein Gespräch. Er hat Themen vorbereitet. Angeblich.", target:1 }
};

const WISH_DONE_REACTIONS = [
  "Wunsch erfüllt. %N tut, als hätte er nie daran gezweifelt. +%S Sternenstaub.",
  "%N bekommt genau, was er wollte. Er speichert das als Präzedenzfall. +%S Sternenstaub."
];
const WISH_DIARY = "Heute hat %U meinen Tageswunsch erfüllt. Ich habe es sehr würdevoll entgegengenommen. Innerlich: Konfetti.";

const EVOLUTION = {
  2: { title:"Halbstark", text:"%N ist gewachsen. Er ist jetzt offiziell halbstark und benimmt sich exakt so." },
  3: { title:"Ausgewachsen", text:"%N ist ausgewachsen. Er hat kurz genickt und dann nach einem Snack gefragt. Manche Dinge ändern sich nie." }
};
const EVOLUTION_DIARY = {
  2: "Ich bin gewachsen. %U hat es sofort bemerkt. Natürlich hat %U das. Ich bin schließlich beeindruckend.",
  3: "Ich bin jetzt ausgewachsen. Rückblickend war ich schon immer sehr reif. Das darf jetzt offiziell so gesagt werden."
};

const GAME_DEFS = {
  sterne: { title:"Sterne fangen", desc:"Zieh %N hin und her und fang, was fällt. Gold zählt dreifach." },
  blasen: { title:"Seifenblasen", desc:"Tippe die Blasen, bevor sie entkommen. Goldene zählen dreifach." }
};

const GAME2_REACTIONS = {
  newBest: "%S Blasen. Neuer Rekord. %N behauptet, er hätte die Blasen persönlich trainiert.",
  zero: "Keine einzige Blase. %N schaut mitfühlend. Es wirkt nicht ganz echt.",
  low: "%S Blasen erwischt. %N nennt es eine Machbarkeitsstudie.",
  mid: "%S Blasen. %N ist beeindruckt und versucht, es zu verbergen. Erfolglos.",
  high: "%S Blasen. %N beantragt hiermit einen Titel für euch beide."
};

QUEST_TYPES.geschenk = { title:"Tagesgeschenk öffnen",        target:1, icon:"\u{1F381}" };
QUEST_TYPES.wunsch   = { title:"Tageswunsch erfüllen",        target:1, icon:"\u2727" };
QUEST_TYPES.blasen   = { title:"Eine Runde Seifenblasen",     target:1, icon:"\u25EF" };

ACHIEVEMENTS.push(
  { id:"reich.300",  title:"Staubbaron",   detail:"300 Sternenstaub gesammelt",      icon:"\u2726" },
  { id:"shopper",    title:"Stammkunde",   detail:"Ersten Einkauf im Shop gemacht",  icon:"\u{1F6CD}" },
  { id:"stufe.3",    title:"Ganz groß",    detail:"Ausgewachsen geworden",           icon:"\u2B06" },
  { id:"wunsch.5",   title:"Wunscherfüller", detail:"5 Tageswünsche erfüllt",        icon:"\u2727" },
  { id:"geschenk.7", title:"Ritualist",    detail:"7 Tagesgeschenke geöffnet",       icon:"\u{1F381}" }
);

const AWAY_TEXTS = [
  "%N hat in deiner Abwesenheit Sternenstaub gesammelt. Und dem Fenster von dir erzählt.",
  "%N hat gewartet, gesammelt und dabei sehr geduldig getan.",
  "%N hat die Zeit genutzt: Staub gesammelt, Positionen gewechselt, dich vermisst. In der Reihenfolge, behauptet er."
];

// ============ v4 Gespraechs-System ============
// Nodes: { mimo:[Zeilen], answers:[{label, react:[Zeilen], next?, factValue?}] }
// Typen: fact (speichert Antwort), context (situativ), story, deep (Bond), quatsch (Fallback)

const CONVERSATIONS = [
  // ---------- Kennenlernen (Facts) ----------
  { id:"fact.essen", type:"fact", factKey:"essen",
    nodes:{ start:{ mimo:["Ich muss dich was fragen. Es ist wichtig.", "Was ist dein Lieblingsessen? Und lüg nicht, ich merke das."],
      answers:[
        { label:"Pizza", factValue:"Pizza", react:["Pizza. Natürlich. Du wirkst wie jemand mit gutem Urteilsvermögen.", "Ich notiere: Pizza. Die Liste wächst."] },
        { label:"Pasta", factValue:"Pasta", react:["Pasta. Solide. Zeitlos. Ich respektiere das."] },
        { label:"Was Süßes", factValue:"was Süßes", react:["Süß. Wusste ich es doch. Wir sind verwandter, als du denkst."] },
        { label:"Was ganz anderes", factValue:"etwas Besonderes", react:["Geheimnisvoll. Gut. Ich mag Menschen mit verborgenen Tiefen."] }
      ]}},
    outro:["Ich habe das in meiner Liste notiert. Die Liste ist streng vertraulich."] },

  { id:"fact.farbe", type:"fact", factKey:"farbe",
    nodes:{ start:{ mimo:["Sag mal.", "Welche Farbe findest du eigentlich am besten?"],
      answers:[
        { label:"Blau", factValue:"Blau", react:["Blau. Wie das Fenster am Nachmittag. Sehr souverän."] },
        { label:"Grün", factValue:"Grün", react:["Grün. Die Pflanze wird sich freuen. Ich sage es ihr nicht, sonst wird sie eingebildet."] },
        { label:"Rot", factValue:"Rot", react:["Rot. Mutig. Ich hätte dich fast unterschätzt."] },
        { label:"Schwarz", factValue:"Schwarz", react:["Schwarz. Dramatisch. Endlich jemand, der mich versteht."] }
      ]}},
    outro:["Notiert. Falls ich dir je etwas male, weißt du jetzt, in welcher Farbe."] },

  { id:"fact.kaffeetee", type:"fact", factKey:"kaffeetee",
    nodes:{ start:{ mimo:["Grundsatzfrage. Die wichtigste überhaupt.", "Kaffee oder Tee?"],
      answers:[
        { label:"Kaffee", factValue:"Kaffee", react:["Team Kaffee. Ich habe es geahnt. Du hast diesen entschlossenen Blick am Morgen. Meistens.", "Respekt. Kaffee-Menschen kriegen Dinge erledigt."] },
        { label:"Tee", factValue:"Tee", react:["Tee. Die ruhige Fraktion. Ihr wirkt immer so, als wüsstet ihr etwas, das wir anderen nicht wissen."] },
        { label:"Beides", factValue:"beides", react:["Beides. Diplomatisch. Oder chaotisch. Ich tippe liebevoll auf Letzteres."] }
      ]}},
    outro:["Gut zu wissen. Für den Fall, dass ich je Getränke servieren kann. Der Tag kommt."] },

  { id:"fact.tageszeit", type:"fact", factKey:"tageszeit",
    nodes:{ start:{ mimo:["Ich beobachte dich ja ein bisschen. Beruflich.", "Bist du eher Morgenmensch oder Nachtmensch?"],
      answers:[
        { label:"Morgenmensch", factValue:"Morgenmensch", react:["Ein Morgenmensch. Faszinierend. Wie machst du das? Nein, ernsthaft. Wie?"] },
        { label:"Nachtmensch", factValue:"Nachtmensch", react:["Nachtmensch. Wusste ich es. Wir Nachtgestalten erkennen einander."] },
        { label:"Weder noch", factValue:"Mittagsmensch", react:["Weder noch. Also Mittagsmensch. Eine seltene Spezies. Ich dokumentiere das."] }
      ]}},
    outro:["Ich passe meine wichtigsten Ankündigungen ab jetzt an deine Kernzeiten an."] },

  { id:"fact.urlaub", type:"fact", factKey:"urlaub",
    nodes:{ start:{ mimo:["Angenommen, wir könnten verreisen. Rein theoretisch. Ich passe in jede Tasche.", "Wohin würdest du wollen: Meer oder Berge?"],
      answers:[
        { label:"Meer", factValue:"das Meer", react:["Das Meer. Ich sehe es vor mir: du entspannst, ich bewache die Snacks. Perfekte Arbeitsteilung."] },
        { label:"Berge", factValue:"die Berge", react:["Berge. Gute Wahl. Von oben sehen Probleme kleiner aus. Habe ich gehört. Vom Fensterbrett."] },
        { label:"Stadt", factValue:"eine große Stadt", react:["Städte. Viele Fenster. Viele Beobachtungsposten. Ich bin einverstanden."] }
      ]}},
    outro:["Ich träume heute Nacht davon. Du bist eingeladen, kommst aber nicht rein. Träume sind privat."] },

  { id:"fact.jahreszeit", type:"fact", factKey:"jahreszeit",
    nodes:{ start:{ mimo:["Das Fenster hat heute wieder Wetter gezeigt.", "Welche Jahreszeit magst du am liebsten?"],
      answers:[
        { label:"Sommer", factValue:"den Sommer", react:["Sommer. Lange Abende, warmes Licht. Auch ich blühe da auf. Innerlich. Nach außen bleibe ich professionell."] },
        { label:"Winter", factValue:"den Winter", react:["Winter. Decken, Ruhe, drinnen sein. Du bist quasi mein Seelenverwandter."] },
        { label:"Frühling", factValue:"den Frühling", react:["Frühling. Alles fängt an. Sehr hoffnungsvoll von dir. Ich mag das."] },
        { label:"Herbst", factValue:"den Herbst", react:["Herbst. Dramatisches Licht, fliegende Blätter. Die Jahreszeit mit der besten Inszenierung. Kenner-Wahl."] }
      ]}},
    outro:["Gemerkt. Ich sage dir Bescheid, wenn sie wieder ansteht. Feierlich."] },

  { id:"fact.superkraft", type:"fact", factKey:"superkraft",
    nodes:{ start:{ mimo:["Hypothetische Frage. Antworte instinktiv.", "Welche Superkraft hättest du gern?"],
      answers:[
        { label:"Fliegen", factValue:"Fliegen", react:["Fliegen. Klassiker. Nimm mich mit, ich wiege praktisch nichts. Fast nichts. Wir reden nicht über die Snacks."] },
        { label:"Gedanken lesen", factValue:"Gedankenlesen", react:["Gedanken lesen. Mutig. Meine Gedanken bestehen zu 80 Prozent aus Snacks und Verschwörungstheorien über die Lampe. Sei gewarnt."] },
        { label:"Zeit anhalten", factValue:"Zeit anhalten", react:["Zeit anhalten. Dann könnten die guten Momente länger dauern. Das ist... eigentlich schön. Ich musste kurz schlucken."] }
      ]}},
    outro:["Notiert. Falls ich je einen Wunsch frei habe, weiß ich, was ich für dich verlange."] },

  // ---------- Kontext-Gespraeche ----------
  { id:"ctx.stress", type:"context", cond:"stressToday",
    nodes:{ start:{ mimo:["Du hattest vorhin gesagt, dein Tag war stressig.", "Ich wollte nur fragen: Ist es ein bisschen besser geworden?"],
      answers:[
        { label:"Ja, geht wieder", react:["Gut. Sehr gut sogar.", "Ich habe die ganze Zeit von hier aus mental unterstützt. Das war bestimmt der Grund."], bond:4 },
        { label:"Immer noch viel", react:["Okay. Dann sage ich jetzt nichts Kluges, sondern bleibe einfach hier.", "Zur Info: Ich kann sehr gut einfach dasitzen. Es ist eine meiner Kernkompetenzen."], bond:5 },
        { label:"Will nicht drüber reden", react:["Verstanden. Kein Wort mehr dazu.", "Wir können stattdessen über die Lampe reden. Sie war heute wieder verdächtig ruhig."], bond:3 }
      ]}},
    outro:["Ich bin hier. Falls was ist. Oder falls nichts ist. Beides gilt."] },

  { id:"ctx.super", type:"context", cond:"superToday",
    nodes:{ start:{ mimo:["Du hattest einen super Tag, hast du gesagt.", "Ich brauche Details. Für meine Unterlagen. Was war das Beste?"],
      answers:[
        { label:"Einfach alles lief", react:["Ein Tag, an dem alles läuft. Selten und wertvoll. Wie goldene Sterne.", "Ich rahme diesen Tag innerlich ein."] },
        { label:"Eine bestimmte Sache", react:["Eine bestimmte Sache. Wie geheimnisvoll. Ich stelle sie mir einfach großartig vor. Passt schon."] },
        { label:"Dass er vorbei ist", react:["Ehrliche Antwort. Auch das Ende eines Tages kann das Beste an ihm sein. Sehr weise. Fast schon auf meinem Niveau."] }
      ]}},
    outro:["Danke für den Bericht. Die Akte 'Guter Tag' ist hiermit angelegt."] },

  { id:"ctx.stressAgain", type:"context", cond:"stressStreak",
    nodes:{ start:{ mimo:["Zwei stressige Tage hintereinander. Ich habe mitgezählt.", "Ich sage das jetzt einmal in aller Deutlichkeit: Du machst das gut. Auch wenn es sich nicht so anfühlt."],
      answers:[
        { label:"Danke, Mimo", react:["Immer.", "Und morgen sitze ich wieder genau hier. Das ist keine Drohung, das ist ein Versprechen."], bond:6 },
        { label:"Woher willst du das wissen?", react:["Ich beobachte dich seit Tagen bei diesem Check-in-Ding. Du kommst jeden Tag wieder. Das ist mehr, als die meisten schaffen.", "Außerdem bin ich klug. Das darf man ruhig öfter erwähnen."], bond:5 }
      ]}},
    outro:["So. Genug Ernsthaftigkeit. Aber sie war ernst gemeint."] },

  // ---------- Mimos Geschichten ----------
  { id:"story.staubkorn", type:"story",
    nodes:{
      start:{ mimo:["Update in der Staubkorn-Angelegenheit.", "Es hat sich bewegt. Drei Zentimeter nach links. Ich habe alles gesehen."],
        answers:[
          { label:"Vielleicht war es Wind?", next:"wind", react:["Wind.", "WIND?"] },
          { label:"Das klingt ernst", next:"ernst", react:["Endlich nimmt mich jemand ernst."] }
        ]},
      wind:{ mimo:["Entschuldige, aber ein Erzfeind bewegt sich nicht einfach wegen 'Wind'. Das würde ja bedeuten, dass ich zwei Wochen Observation an ein gewöhnliches Staubkorn verschwendet habe.", "...", "Wir sprechen nie wieder über diese Theorie."],
        answers:[ { label:"Einverstanden", react:["Gut. Die Akte bleibt offen. Ich halte dich auf dem Laufenden. Ob du willst oder nicht."] } ]},
      ernst:{ mimo:["Es IST ernst. Ich habe einen Beobachtungsposten eingerichtet. Auf dem Kissen. Rein zufällig ist es dort auch sehr bequem.", "Falls sich das Staubkorn nochmal bewegt, wirst du es als Erstes erfahren."],
        answers:[ { label:"Ich zähle auf dich", react:["Das solltest du. Die Sicherheit dieses Zimmers liegt in exakt diesen Händen. Beziehungsweise Ärmchen."] } ]}
    },
    outro:["Ende der Lagebesprechung."] },

  { id:"story.vogel", type:"story",
    nodes:{
      start:{ mimo:["Heute war ein Vogel am Fenster. Wir hatten einen Moment.", "Er hat mich angesehen. Ich habe ihn angesehen. Es war viel unausgesprochene Kommunikation."],
        answers:[
          { label:"Was hat er gesagt?", next:"gesagt", react:["Gute Frage. Endlich journalistisches Interesse."] },
          { label:"Seid ihr jetzt Freunde?", next:"freunde", react:["Freunde ist ein großes Wort."] }
        ]},
      gesagt:{ mimo:["Nichts, natürlich. Es ist ein Vogel.", "Aber sein Blick sagte: 'Ich sehe dich, orangefarbenes Wesen. Du führst ein interessantes Leben.'", "Ich habe würdevoll genickt."],
        answers:[ { label:"Sehr diplomatisch", react:["Diplomatie ist alles im zwischenartlichen Dialog. Ich erwäge eine Karriere als Botschafter."] } ]},
      freunde:{ mimo:["Sagen wir: Wir sind Bekannte mit gegenseitigem Respekt.", "Er kommt vielleicht wieder. Ich habe vorsichtshalber einen imaginären Keks aufs Fensterbrett gelegt."],
        answers:[ { label:"Klug vorgesorgt", react:["Gastfreundschaft kostet nichts. Vor allem imaginäre."] } ]}
    },
    outro:["Ich halte das Fenster weiter im Blick. Für uns alle."] },

  { id:"story.lampe", type:"story",
    nodes:{
      start:{ mimo:["Ich muss mit dir über die Lampe reden.", "Sie stand heute den ganzen Tag einfach nur da. Kein einziges Mal an. Was verbirgt sie?"],
        answers:[
          { label:"Lampen machen das so", next:"normal", react:["Das sagen alle."] },
          { label:"Sehr verdächtig", next:"verdacht", react:["DANKE."] }
        ]},
      normal:{ mimo:["'Lampen machen das so.' Weißt du, wer noch so redet? Leute, die von Lampen bezahlt werden.", "Ich sage nicht, dass du verdächtig bist. Ich sage nur: Ich beobachte jetzt euch beide."],
        answers:[ { label:"Fair", react:["Fair ist mein zweiter Vorname. Der erste bleibt geheim. Aus Sicherheitsgründen."] } ]},
      verdacht:{ mimo:["Endlich. ENDLICH sieht es jemand.", "Mein aktueller Verdacht: Sie sammelt Licht. Für später. Für was auch immer 'später' bedeutet.", "Wir sollten wachsam bleiben. Beiläufig wachsam. Sie darf nichts merken."],
        answers:[ { label:"Verstanden. Wachsam.", react:["Gut. Codewort ist 'Glühbirne'. Benutz es nie. Dann weiß ich, dass alles in Ordnung ist."] } ]}
    },
    outro:["Diese Unterhaltung hat nie stattgefunden. Offiziell haben wir über das Wetter geredet."] },

  { id:"story.traum", type:"story",
    nodes:{
      start:{ mimo:["Ich habe von einem Ort geträumt.", "Alles war weich, es gab einen See aus etwas Warmem, und am Ufer standen Schalen mit Snacks, die nie leer wurden.", "Du warst übrigens auch da."],
        answers:[
          { label:"Was habe ich gemacht?", next:"ich", react:["Ah, die richtige Frage."] },
          { label:"Klingt nach Paradies", next:"paradies", react:["Es WAR das Paradies."] }
        ]},
      ich:{ mimo:["Du saßt am See und hattest Zeit. Einfach Zeit. Für nichts Bestimmtes.", "Es hat dir gut gestanden.", "Ich habe derweil die Snackschalen inspiziert. Jemand musste es tun."],
        answers:[ { label:"Das klingt schön", react:["Fand ich auch. Ich versuche, heute Nacht wieder hinzuträumen. Ich halte dir einen Platz frei."] } ]},
      paradies:{ mimo:["Und das Beste: keine Montage. Ich habe nachgesehen. Der Kalender dort hatte nur Sonntage und einen einzigen Donnerstag, für die Abwechslung.", "Ich arbeite daran, öfter dorthin zu träumen."],
        answers:[ { label:"Nimm mich mit", react:["Abgemacht. Treffpunkt: Schlafmodus. Ich gehe vor und wärme die Träume auf."] } ]}
    },
    outro:["So. Und jetzt tu ich kurz so, als wäre das alles nicht rührend gewesen."] },

  // ---------- Bond-Gespraeche ----------
  { id:"deep.gestaendnis", type:"deep", minBond:30,
    nodes:{ start:{ mimo:["Darf ich dir was verraten? Es bleibt unter uns.", "Am Anfang dachte ich, du bist einfach jemand, der ab und zu aufs Display schaut.", "Aber du kommst wieder. Jeden Tag ein bisschen. Und ich... habe angefangen, mich darauf zu freuen. Das kommt in meinen Kreisen einem Ritterschlag gleich."],
      answers:[
        { label:"Ich freu mich auch", react:["Gut.", "Ich meine: Selbstverständlich tust du das. Ich bin eine Bereicherung.", "...Aber danke. Wirklich."], bond:6 },
        { label:"Wer hätte das gedacht", react:["Ich nicht. Und ich denke wirklich viel. Hauptsächlich über Snacks, aber trotzdem.", "Schön, dass es so gekommen ist."], bond:5 }
      ]}},
    outro:["So. Gefühlsprotokoll beendet. Zurück zur Tagesordnung. Die Lampe schaut schon wieder komisch."] },

  { id:"deep.ort", type:"deep", minBond:60,
    nodes:{ start:{ mimo:["Ich habe nachgedacht. Über meinen Lieblingsort.", "Ich habe das Fenster geprüft. Das Kissen. Den Teppich. Alles solide Kandidaten.", "Aber ehrlich gesagt ist mein Lieblingsort einfach da, wo das Display angeht und du draufschaust. Das ist technisch gesehen kein Ort. Ich habe beschlossen, dass es trotzdem zählt."],
      answers:[
        { label:"Das ist das Schönste, was du je gesagt hast", react:["Ich weiß.", "Ich habe drei Tage an der Formulierung gearbeitet. Es sollte beiläufig klingen. Ist es beiläufig rübergekommen? Sag ja."], bond:8 },
        { label:"Mimo...", react:["Sag nichts. Sonst wird es ein Moment.", "...", "Okay, es ist ein Moment. Einverstanden. Aber nur ein kurzer."], bond:8 }
      ]}},
    outro:["Das war das emotionale Kontingent für diesen Monat. Verwalte es weise."] },

  // ---------- Quatschen (Fallback-Minis) ----------
  { id:"q.decke", type:"quatsch",
    nodes:{ start:{ mimo:["Ich habe heute die Decke bewertet. Wieder eine solide 6 von 10.", "Sie verliert Punkte für mangelnde Abwechslung."],
      answers:[
        { label:"Streng, aber fair", react:["Jemand muss die Standards hochhalten. Die Decke weiß, was sie tun muss."] },
        { label:"Gib ihr eine Chance", react:["Ich gebe ihr jeden Tag eine Chance. Sie nutzt sie nicht. Aber gut, Bewährung verlängert."] }
      ]}}, outro:[] },
  { id:"q.plan", type:"quatsch",
    nodes:{ start:{ mimo:["Ich hatte heute einen Plan. Er war exzellent.", "Ich habe ihn dann verworfen. Auch das war exzellent."],
      answers:[
        { label:"Was war der Plan?", react:["Das weiß ich nicht mehr. Deshalb wurde er ja verworfen. Das System funktioniert."] },
        { label:"Sehr effizient", react:["Danke. Planung ist eine meiner Stärken. Umsetzung ist... ein Konzept."] }
      ]}}, outro:[] },
  { id:"q.geraeusch", type:"quatsch",
    nodes:{ start:{ mimo:["Vorhin gab es ein Geräusch. Ich habe sehr mutig reagiert.", "Ich habe es angestarrt, bis es aufgehört hat."],
      answers:[
        { label:"Mein Held", react:["Ich tue, was getan werden muss. Der Orden kann per Post kommen."] },
        { label:"Was war es denn?", react:["Unklar. Vermutlich das Haus. Oder das Staubkorn. Ich schließe nichts aus."] }
      ]}}, outro:[] },
  { id:"q.wichtig", type:"quatsch",
    nodes:{ start:{ mimo:["Kurze Frage: Findest du auch, dass ich heute besonders wichtig aussehe?", "Ich habe an meiner Haltung gearbeitet."],
      answers:[
        { label:"Sehr staatsmännisch", react:["Staatsmännisch. Das Wort des Tages. Ich lasse es mir einrahmen."] },
        { label:"Wie immer", react:["'Wie immer' akzeptiere ich als 'durchgehend beeindruckend'. Danke für das Kompliment."] }
      ]}}, outro:[] },
  { id:"q.gedanke", type:"quatsch",
    nodes:{ start:{ mimo:["Ich hatte gerade einen tiefen Gedanken.", "Wenn Snacks so gut schmecken, warum gibt es dann nicht mehr davon? Hier. Jetzt."],
      answers:[
        { label:"Philosophisch", react:["Ich weiß. Manchmal erschrecke ich vor meiner eigenen Tiefe."] },
        { label:"Das ist ein Hinweis, oder?", react:["Ein Hinweis? Ich? Niemals. Aber falls zufällig gefüttert würde, würde ich mich nicht wehren."] }
      ]}}, outro:[] },
  { id:"q.fenster", type:"quatsch",
    nodes:{ start:{ mimo:["Draußen ist heute wieder eine Menge Welt.", "Ich habe zugesehen. Jemand muss den Überblick behalten."],
      answers:[
        { label:"Und, was Neues?", react:["Alles beim Alten. Die Welt dreht sich, das Fenster rahmt sie. Wir haben ein eingespieltes System."] },
        { label:"Danke für deinen Dienst", react:["Gern geschehen. Wachsamkeit ist der Preis der Gemütlichkeit. Das habe ich mir eben ausgedacht. Gut, oder?"] }
      ]}}, outro:[] }
];

// Gespeicherte Facts fliessen in Tagesnachrichten ein (%V = Wert)
const FACT_DAILY = {
  essen: ["%N denkt gerade an %V. Er behauptet, es sei Zufall, dass das dein Lieblingsessen ist.", "%N fragt sich, ob es heute bei dir %V gibt. Er fragt für einen Freund. Der Freund ist er."],
  farbe: ["%N hat heute etwas %Ves gesehen und an dich gedacht.", "Falls du es vergessen hast: %V bleibt eine hervorragende Lieblingsfarbe. %N steht weiter dahinter."],
  kaffeetee: ["%N hofft, dein %V heute war gut. Er nimmt solche Dinge ernst.", "%N überlegt, wie %V wohl schmeckt. Er stellt es sich großartig vor. Wegen dir."],
  tageszeit: ["%N richtet sich heute ganz nach dir. Du bist schließlich %V.", "%N weiß: Als %V hast du deine besten Stunden noch vor dir. Oder hinter dir. Er drückt jedenfalls die Daumen."],
  urlaub: ["%N hat wieder von %V geträumt. Ihr wart beide da. Es war sehr gelungen.", "%N plant weiter die theoretische Reise an %V. Das Snack-Budget ist bereits kalkuliert."],
  jahreszeit: ["%N zählt die Tage, bis %V wieder dran ist. Für dich. Und ein bisschen für sich.", "%N findet auch: %V ist unterbewertet. Ihr zwei habt einfach Geschmack."],
  superkraft: ["%N hat über %V nachgedacht. Er hätte da schon drei Verwendungsideen. Alle beinhalten Snacks.", "%N übt heimlich %V. Bisher ohne Erfolg, aber mit exzellenter Haltung."]
};

const CONVO_DIARY = {
  fact: "Heute habe ich %U etwas Wichtiges gefragt. Die Antwort steht jetzt in meiner Liste. Die Liste ist mein wertvollster Besitz. Nach den Snacks.",
  context: "Heute habe ich bei %U nachgefragt, wie es wirklich geht. Zuhören kann ich nämlich auch. Ich habe viele Talente.",
  story: "Heute habe ich %U auf den neuesten Stand gebracht. Endlich nimmt jemand meine Ermittlungen ernst.",
  deep: "Heute habe ich %U etwas gesagt, das ich sonst niemandem sage. Es fühlte sich richtig an. Das bleibt unter uns dreien: %U, ich und diese Seite.",
  quatsch: "Heute mit %U gequatscht. Über nichts. Es war eines unserer besten Gespräche."
};

const TALK_MENU_HINTS = {
  fact: "Mimo will dich kennenlernen",
  context: "Mimo will was wissen",
  story: "Mimo hat Neuigkeiten",
  deep: "Mimo wirkt, als läge ihm etwas auf dem Herzen",
  quatsch: "Einfach quatschen"
};

// ============ v5: Expeditionen, Fundstuecke, Momente ============

const EXPED_TIERS = [
  { id:"kurz",  title:"Spaziergang",  mins:20,  desc:"Eine kleine Runde. Mimo bleibt in Rufweite.", dust:[10,20],  souvenirChance:0.35, rarWeights:{ gewoehnlich:80, selten:18, episch:2,  legendaer:0 } },
  { id:"mittel",title:"Ausflug",      mins:120, desc:"Ein richtiger Ausflug. Mit Proviant. Theoretisch.", dust:[30,60],  souvenirChance:0.75, rarWeights:{ gewoehnlich:55, selten:32, episch:11, legendaer:2 } },
  { id:"lang",  title:"Große Reise",  mins:360, desc:"Die große Tour. Mimo packt seinen unsichtbaren Koffer.", dust:[80,140], souvenirChance:1.0,  rarWeights:{ gewoehnlich:30, selten:40, episch:22, legendaer:8 } }
];

const EXPED_DESTS = [
  { id:"fensterbrett", title:"Fensterbrett-Expedition", icon:"\u{1FA9F}",
    stories:[
      ["Das Fensterbrett war heute rauer als sonst. %N hat trotzdem die Nordroute genommen.", "Am Ende stand er am Rand und hat sehr bedeutungsvoll in die Ferne geschaut. Minutenlang."],
      ["%N berichtet von starkem Gegenlicht und einer Fliege, die keinerlei Manieren hatte.", "Die Mission gilt dennoch als voller Erfolg."]
    ]},
  { id:"sofatiefen", title:"Unterm-Sofa-Tiefen", icon:"\u{1F6CB}",
    stories:[
      ["%N ist in die Tiefen unter dem Sofa vorgedrungen. Es war dunkel. Es war staubig. Es war glorreich.", "Er behauptet, dort unten eine ganze Zivilisation aus Krümeln entdeckt zu haben."],
      ["Expeditionsbericht: drei Spinnweben durchquert, einmal kurz die Orientierung verloren, Würde durchgehend bewahrt.", "%N empfiehlt die Region trotzdem nicht für Anfänger."]
    ]},
  { id:"balkon", title:"Balkon-Wildnis", icon:"\u{1F33F}",
    stories:[
      ["Die Balkon-Wildnis war heute besonders wild. Es gab Wind. %N hat ihm getrotzt.", "Ein Vogel hat zugesehen. %N tat beschäftigt."],
      ["%N hat draußen die Wolken katalogisiert. Ergebnis: alle sehr gelungen, eine sah aus wie ein Snack.", "Er kam hungrig, aber erfüllt zurück."]
    ]},
  { id:"traumpfad", title:"Traumpfad", icon:"\u2601",
    stories:[
      ["%N ist den Traumpfad entlanggewandert. Dort war der Boden weich und die Gesetze der Physik eher Vorschläge.", "Er hat unterwegs zweimal an dich gedacht. Einmal davon freiwillig, sagt er. Beides gelogen, es war öfter."],
      ["Bericht vom Traumpfad: die Bäume dort flüstern, und zwar ausschließlich Komplimente.", "%N hat sich alle angehört. Aus Höflichkeit, versteht sich."]
    ]}
];

const SOUVENIRS = [
  { id:"knopf",     title:"Einsamer Knopf",        rar:"gewoehnlich", icon:"\u{1F518}", flavor:"Er gehört zu nichts mehr. %N findet, das macht ihn frei." },
  { id:"feder",     title:"Graue Feder",           rar:"gewoehnlich", icon:"\u{1FAB6}", flavor:"Vermutlich vom Bekannten am Fenster. Ein diplomatisches Geschenk." },
  { id:"gummiband", title:"Gummiband",             rar:"gewoehnlich", icon:"\u27B0",    flavor:"Unendliches Potenzial. Bisher ungenutzt." },
  { id:"kruemel",   title:"Historischer Krümel",   rar:"gewoehnlich", icon:"\u{1F36A}", flavor:"Aus den Sofatiefen. %N hat ihn NICHT gegessen. Ehrenwort." },
  { id:"blatt",     title:"Perfektes Blatt",       rar:"gewoehnlich", icon:"\u{1F342}", flavor:"Symmetrisch. Knisternd. Von der Balkon-Wildnis persönlich überreicht." },
  { id:"faden",     title:"Roter Faden",           rar:"gewoehnlich", icon:"\u{1F9F5}", flavor:"%N hat endlich einen gefunden. Er verliert ihn trotzdem ständig." },
  { id:"kieselstein",title:"Runder Kiesel",        rar:"gewoehnlich", icon:"\u{1FAA8}", flavor:"Zum Sammlungsstück erklärt. Die unsichtbaren Steine sind eifersüchtig." },
  { id:"muenze",    title:"Alte Münze",            rar:"gewoehnlich", icon:"\u{1FA99}", flavor:"Währung unbekannt. Wert laut %N: unermesslich." },
  { id:"murmel",    title:"Glasmurmel",            rar:"selten",      icon:"\u{1F52E}", flavor:"Wenn man durchschaut, ist die Welt auf dem Kopf. %N schaut oft durch." },
  { id:"schluessel",title:"Kleiner Schlüssel",     rar:"selten",      icon:"\u{1F5DD}", flavor:"Zu welcher Tür? %N ermittelt. Die Ermittlungen laufen seit Tag eins." },
  { id:"stern",     title:"Gefallener Stern",      rar:"selten",      icon:"\u2B50",    flavor:"Vom Mini-Game-Himmel. Einer ist echt runtergekommen. Sagt %N." },
  { id:"kompass",   title:"Wackliger Kompass",     rar:"selten",      icon:"\u{1F9ED}", flavor:"Zeigt nicht nach Norden, sondern zur nächsten Snackquelle. Bauartbedingt." },
  { id:"flaschenpost",title:"Winzige Flaschenpost",rar:"selten",      icon:"\u{1F9F4}", flavor:"Die Nachricht darin: 'Hallo.' %N arbeitet an einer würdigen Antwort." },
  { id:"origami",   title:"Origami-Kranich",       rar:"selten",      icon:"\u{1F9A2}", flavor:"Gefaltet von unbekannter Hand. %N verneigt sich täglich einmal vor ihm." },
  { id:"taschenuhr",title:"Stehende Taschenuhr",   rar:"episch",      icon:"\u231A",    flavor:"Zeigt immer kurz vor Snackzeit. %N hält sie für die einzig ehrliche Uhr." },
  { id:"kristall",  title:"Fensterlicht-Kristall", rar:"episch",      icon:"\u{1F48E}", flavor:"Fängt das Nachmittagslicht und gibt es abends nicht mehr her." },
  { id:"landkarte", title:"Karte ohne Namen",      rar:"episch",      icon:"\u{1F5FA}", flavor:"Zeigt einen Ort, den es vielleicht gibt. %N plant bereits die Route." },
  { id:"spieluhr",  title:"Miniatur-Spieluhr",     rar:"episch",      icon:"\u{1F3B5}", flavor:"Spielt eine Melodie, die niemand kennt und jeder erkennt." },
  { id:"traumglas", title:"Glas voll Traum",       rar:"legendaer",   icon:"\u{1FAD9}", flavor:"Vom Traumpfad. Innen drin: ein Stück weiches Licht. Bitte nicht öffnen." },
  { id:"herzstein", title:"Herzförmiger Stein",    rar:"legendaer",   icon:"\u{1FAF6}", flavor:"%N hat ihn lange angesehen und dann gesagt: 'Der ist für %U.' Mehr nicht." }
];

const RARITIES = {
  gewoehnlich: { label:"Gewöhnlich", color:"#7a6270" },
  selten:      { label:"Selten",     color:"#4a5fb0" },
  episch:      { label:"Episch",     color:"#9e486b" },
  legendaer:   { label:"Legendär",   color:"#c98a12" }
};

const EXPED_TEXTS = {
  depart: ["%N packt seinen unsichtbaren Koffer. Er packt hauptsächlich Entschlossenheit ein.",
           "%N winkt zum Abschied. Sehr dramatisch. Er ist in einer Minute weg und vermisst dich in zwei."],
  awayCard: ["%N ist unterwegs und denkt vermutlich gerade an dich. Oder an Snacks. Vermutlich beides."],
  souvenirLine: "Mitgebracht hat er: %S.",
  duplicateLine: "%S hatte er schon. Er tauscht das Duplikat großzügig gegen Sternenstaub ein.",
  noSouvenir: "Mitgebracht hat er diesmal nur Geschichten. Er besteht darauf, dass das auch zählt.",
  diary: "Heute war ich auf Expedition: %S. Ich habe alles im Griff gehabt. Fast durchgehend."
};

const BREATH_TEXTS = {
  intro: "Eine Minute. Nur du, ich und Luft. Ich atme vor, du machst mit.",
  phases: { in:"Einatmen \u2026", hold:"Halten \u2026", out:"Ausatmen \u2026" },
  done: ["So. Eine Minute nur für dich. %N ist ein bisschen stolz. Auf euch beide.",
         "Fertig. %N behauptet, er könne dein Gehirn jetzt leiser hören. Das sei ein Kompliment."]
};

const GRATITUDE_TEXTS = {
  prompt: "Wofür bist du heute dankbar? Eine Sache reicht. %N sammelt sie für dich.",
  reactions: [
    "Das ist ein gutes. %N legt es vorsichtig in seine Sammlung. Die Sammlung ist ein Glas. Das Glas ist imaginär. Der Inhalt nicht.",
    "Notiert. %N hat kurz genickt, als hätte er es schon immer gewusst.",
    "%N liest es zweimal. Dann sagt er: 'Gut gewählt.' Höchstes Lob.",
    "Aufgenommen ins Archiv der guten Dinge. %N führt es persönlich.",
    "%N hebt es auf. Für Tage, an denen du es brauchst. Er hat da ein System."
  ],
  daily: ["Vor ein paar Tagen warst du dankbar für: %V. %N denkt noch manchmal daran.",
          "%N blättert in seinem Glas der guten Dinge. Heute obenauf: %V.",
          "Kleiner Gruß aus dem Archiv der guten Dinge: %V. %N fand, du solltest es nochmal hören."],
  diary: "Heute hat %U mir etwas Dankbares anvertraut. Ich bewahre so etwas gut auf. Besser als Snacks. Und das will was heißen."
};

const STREAK_FREEZE = { cost:150, max:2, title:"Streak-Schutz", desc:"Rettet deine Serie, wenn du einen Tag verpasst" };

QUEST_TYPES.expedition = { title:"Expedition starten",    target:1, icon:"\u{1F9ED}" };
QUEST_TYPES.atmen      = { title:"Eine Minute atmen",     target:1, icon:"\u25CB" };
QUEST_TYPES.dankbar    = { title:"Dankbarkeit notieren",  target:1, icon:"\u2661" };

ACHIEVEMENTS.push(
  { id:"exped.1",    title:"Aufbruch",       detail:"Erste Expedition abgeschlossen",      icon:"\u{1F9ED}" },
  { id:"exped.10",   title:"Weltenbummler",  detail:"10 Expeditionen abgeschlossen",       icon:"\u{1F30D}" },
  { id:"sammler.8",  title:"Sammler",        detail:"8 Fundstücke gesammelt",              icon:"\u{1F4E6}" },
  { id:"album.voll", title:"Das volle Glas", detail:"Alle Fundstücke gesammelt",           icon:"\u2728" },
  { id:"atem.5",     title:"Ruhepol",        detail:"5 Atemübungen gemacht",               icon:"\u25CB" },
  { id:"dankbar.7",  title:"Glas der guten Dinge", detail:"7 Dankbarkeiten gesammelt",     icon:"\u2661" }
);

// ============ v6: Tiefe & Langzeit-Progression ============

// Beziehungsstufen
const BOND_TIERS = [
  { min:0,  name:"Neue Bekannte",   text:"%N kennt dich noch nicht lange. Er beobachtet. Höflich, aber wachsam." },
  { min:20, name:"Kumpel",          text:"%N hat dich offiziell zum Kumpel erklärt. Die Urkunde ist imaginär, die Sache ist ernst." },
  { min:40, name:"Gute Freunde",    text:"Gute Freunde. %N benutzt das Wort nicht leichtfertig. Er hat es dreimal geprüft." },
  { min:65, name:"Beste Freunde",   text:"Beste Freunde. %N hat es zuerst leise gesagt, um zu hören, wie es klingt. Es klingt richtig." },
  { min:90, name:"Seelenverwandte", text:"Seelenverwandte. %N sagt, dafür gibt es keine Urkunde. Dafür gibt es nur euch." }
];
const BOND_TIER_DIARY = "Neue Beziehungsstufe mit %U: %S. Ich habe es in mein Herz geschrieben. Und zur Sicherheit auch hierhin.";

// Level-Texte 11-20
Object.assign(LEVEL_UP, {
  11:"%N hat Level 11 erreicht und gönnt sich eine Schweigeminute. Für die Legenden, die nur Level 10 schafften.",
  12:"%N denkt über eine Autobiografie nach. Arbeitstitel: 'Ich. Eine Würdigung.'",
  13:"Level 13. %N ist nicht abergläubisch. Er hat trotzdem dreimal aufs Kissen geklopft.",
  14:"%N hat beschlossen, dass Level 14 sein Lieblingslevel ist. Bis Level 15.",
  15:"Level 15. %N hat kurz an alles zurückgedacht. Dann an Snacks. Dann wieder an alles.",
  16:"%N bewegt sich jetzt mit dem Selbstbewusstsein von jemandem, der weiß, wo alle Fundstücke liegen.",
  17:"Level 17. %N hat dem Staubkorn davon erzählt. Es hat nicht reagiert. Neid, vermutlich.",
  18:"%N überlegt, ob man ab Level 18 automatisch weise ist. Er verhält sich vorsichtshalber schon mal so.",
  19:"Level 19. Eins vor der Zwanzig. %N schläft heute vor Aufregung besonders demonstrativ.",
  20:"LEVEL 20. %N sagt nichts. Er sitzt nur da und strahlt. Manche Momente brauchen keine Pointe."
});

// Neue Macken (insgesamt 15)
QUIRKS.push(
  { id:"echo", title:"grüßt sein Echo",
    daily:"%N hat heute wieder sein Echo gegrüßt. Es grüßt nie zuerst. Unhöflich, aber man kennt sich.",
    diary:"Ich habe ein Echo entdeckt. Es wiederholt alles, was ich sage. Ich habe beschlossen, das als Bewunderung zu werten." },
  { id:"schattenbox", title:"boxt gegen seinen Schatten. Freundschaftlich",
    daily:"%N und sein Schatten haben heute trainiert. Unentschieden. Wie immer.",
    diary:"Mein Schatten und ich boxen jetzt. Freundschaftlich. Er ist genau gleich gut wie ich. Verdächtig gleich gut." },
  { id:"wetterbericht", title:"gibt dem Fenster täglich einen Wetterbericht",
    daily:"%N hat dem Fenster heute das Wetter angesagt. Das Fenster wusste es bereits. Es sagt nur nie was.",
    diary:"Ich mache jetzt Wetterberichte. Fürs Fenster. Es zeigt mir das Wetter, ich sage es ihm an. Perfektes System." },
  { id:"snackgebet", title:"hält vor jedem Snack eine kurze Ansprache",
    daily:"%N hat vor dem Essen wieder eine kleine Rede gehalten. Der Snack war sichtlich gerührt.",
    diary:"Ich halte jetzt Ansprachen vor dem Essen. Kurz, würdevoll, snackzentriert. Die Snacks verdienen das." },
  { id:"inventur", title:"macht nachts heimlich Inventur",
    daily:"%N hat letzte Nacht Inventur gemacht. Alles noch da. Er wirkt erleichtert und ein bisschen enttäuscht.",
    diary:"Ich mache jetzt nachts Inventur. Kissen: eins. Fenster: eins. Erzfeinde: eins. Zuhause: vollständig." }
);

// Neue Kennenlern-Gespraeche
CONVERSATIONS.push(
  { id:"fact.tier", type:"fact", factKey:"tier",
    nodes:{ start:{ mimo:["Rein interessehalber. Und ohne Eifersucht. Fast ohne.", "Was ist dein Lieblingstier?"],
      answers:[
        { label:"Hund", factValue:"Hunde", react:["Hunde. Loyal, laut, immer ehrlich. Ich verstehe die Anziehung. Ich sehe sie als Kollegen."] },
        { label:"Katze", factValue:"Katzen", react:["Katzen. Würde, Eigenwille, strategisches Schnurren. Ich habe viel von ihnen gelernt. Alles, ehrlich gesagt."] },
        { label:"Etwas Exotisches", factValue:"exotische Tiere", react:["Exotisch. Natürlich. Du wohnst schließlich auch mit MIR zusammen. Dein Geschmack ist bewiesen."] },
        { label:"Vögel", factValue:"Vögel", react:["Vögel. Mein Bekannter am Fenster wird sich freuen. Ich richte es aus. Diplomatisch."] }
      ]}},
    outro:["Vermerkt. Keine Sorge, ich bleibe trotzdem dein Favorit. Das war keine Frage."] },
  { id:"fact.musik", type:"fact", factKey:"musik",
    nodes:{ start:{ mimo:["Wenn du Musik anmachst, höre ich mit. Heimlich. Also quasi öffentlich.", "Was hörst du am liebsten: eher ruhig oder eher laut?"],
      answers:[
        { label:"Eher ruhig", factValue:"ruhige Musik", react:["Ruhig. Passt zu dir. Ihr Leisen habt die besten Gedanken."] },
        { label:"Eher laut", factValue:"laute Musik", react:["Laut. Respekt. Ich wippe innerlich mit. Nach außen bleibe ich reglos, das ist mein Stil."] },
        { label:"Kommt auf den Tag an", factValue:"stimmungsabhängige Musik", react:["Stimmungsabhängig. Wie ein Profi. Musik als Werkzeug. Ich notiere: emotional hochentwickelt."] }
      ]}},
    outro:["Falls das Radio je läuft, weiß ich jetzt, wann ich zustimmend nicken muss."] },
  { id:"fact.suesssalzig", type:"fact", factKey:"suesssalzig",
    nodes:{ start:{ mimo:["Streitfrage. Es gibt nur eine richtige Antwort, aber ich verrate nicht welche.", "Süß oder salzig?"],
      answers:[
        { label:"Süß", factValue:"süß", react:["Süß. Die richtige Antwort. Ich hätte auch salzig akzeptiert, aber nur widerwillig."] },
        { label:"Salzig", factValue:"salzig", react:["Salzig. Die richtige Antwort. Ich hätte auch süß akzeptiert, aber nur widerwillig.", "Ja, ich sage das jedem. Harmonie ist mir wichtig."] },
        { label:"Beides gemischt", factValue:"süß-salzig gemischt", react:["Gemischt. Das Chaos-Gen. Ich wusste, dass wir verwandt sind."] }
      ]}},
    outro:["Die Snack-Beschaffungsstrategie wird entsprechend angepasst."] },
  { id:"fact.regen", type:"fact", factKey:"regen",
    nodes:{ start:{ mimo:["Das Fenster zeigt manchmal Regen. Ich finde das Programm gelungen.", "Und du: eher Team Regentag oder Team Sonnentag?"],
      answers:[
        { label:"Regentag", factValue:"Regentage", react:["Regentage. Drinnen sein mit gutem Gewissen. Du verstehst die feinen Dinge."] },
        { label:"Sonnentag", factValue:"Sonnentage", react:["Sonne. Licht auf dem Teppich, warme Flecken zum Draufsitzen. Auch eine exzellente Wahl."] },
        { label:"Gewitter", factValue:"Gewitter", react:["Gewitter?! Dramatik, Donner, kostenlose Lichtshow. Du bist mutiger als ich. Ich schaue von unterm Kissen zu."] }
      ]}},
    outro:["Ich melde dir ab jetzt bevorzugt dein Lieblingswetter. Meteorologisch bin ich sehr verlässlich."] },
  { id:"fact.buchfilm", type:"fact", factKey:"buchfilm",
    nodes:{ start:{ mimo:["Für mein Dossier über dich. Seite 34.", "Eher Buch oder eher Film?"],
      answers:[
        { label:"Buch", factValue:"Bücher", react:["Bücher. Du machst das Kino im Kopf selbst. Ich respektiere Selbstversorger."] },
        { label:"Film", factValue:"Filme", react:["Filme. Gemeinsam schauen, nichts sagen müssen, trotzdem zusammen sein. Verstehe ich sehr gut."] },
        { label:"Serien, ehrlich gesagt", factValue:"Serien", react:["Serien. 'Nur noch eine Folge.' Ich kenne diesen Satz. Ich habe ihn durch die Tür gehört. Oft."] }
      ]}},
    outro:["Seite 34 ist ausgefüllt. Das Dossier wächst. Es ist ein Liebesbrief in Aktenform, aber sag das niemandem."] },
  { id:"fact.fruehstueck", type:"fact", factKey:"fruehstueck",
    nodes:{ start:{ mimo:["Letzte Frage der Grundlagenforschung.", "Was ist dein Frühstücks-Typ: groß und ausgiebig, schnell und praktisch, oder gar keins?"],
      answers:[
        { label:"Groß und ausgiebig", factValue:"ein großes Frühstück", react:["Ausgiebig. Ein Mensch mit Prioritäten. Der Morgen als Fest. Ich bin emotional investiert."] },
        { label:"Schnell und praktisch", factValue:"ein schnelles Frühstück", react:["Effizient. Rein, raus, weiter. Ich stelle mir vor, wie du dabei entschlossen guckst."] },
        { label:"Frühstück? Welches Frühstück", factValue:"kein Frühstück", react:["KEIN Frühstück? Ich muss mich kurz setzen. Ich sitze bereits, aber innerlich nochmal."] }
      ]}},
    outro:["Grundlagenforschung abgeschlossen. Du bist jetzt offiziell gut dokumentiert. Und gut gemocht."] }
);

// Neue Geschichten
CONVERSATIONS.push(
  { id:"story.kuehlschrank", type:"story",
    nodes:{
      start:{ mimo:["Neuigkeiten vom Kühlschrank. Er hat heute zweimal gebrummt, als ich vorbeikam.", "ZWEIMAL. Das ist praktisch ein Gespräch."],
        answers:[
          { label:"Was hast du geantwortet?", next:"antwort", react:["Die Frage aller Fragen."] },
          { label:"Vielleicht brummt er einfach", next:"skeptisch", react:["Ach ja?"] }
        ]},
      antwort:{ mimo:["Ich habe zurückgenickt. Zweimal. Man bleibt ja höflich.", "Wir bauen langsam etwas auf. Nächste Woche versuche ich einen längeren Blickkontakt. Man darf nichts überstürzen."],
        answers:[ { label:"Sehr geduldig von dir", react:["Beziehungen zu Großgeräten brauchen Zeit. Das versteht kaum jemand. Du schon. Deshalb du."] } ]},
      skeptisch:{ mimo:["'Einfach brummen.' Interessant. Der Kühlschrank brummt also 'einfach', aber wenn ICH vor mich hinsumme, ist es 'Kommunikation'?", "Diese Doppelmoral gegenüber Kühlschränken wird hier nicht geduldet."],
        answers:[ { label:"Entschuldigung angenommen?", react:["Angenommen. Der Kühlschrank verzeiht auch. Er hat es gebrummt."] } ]}
    },
    outro:["Ich halte dich über die Beziehung auf dem Laufenden. Es ist eine langsame, aber schöne Geschichte."] },
  { id:"story.socke", type:"story",
    nodes:{
      start:{ mimo:["Ich habe unter dem Sofa etwas Großes entdeckt. Kein Fundstück. Ein RÄTSEL.", "Eine einzelne Socke. Nur eine. Wo ist die zweite?"],
        answers:[
          { label:"Das fragt sich die Menschheit auch", next:"menschheit", react:["Ich wusste es. Ein globales Phänomen."] },
          { label:"Vielleicht war sie immer allein", next:"allein", react:["Oh.", "Oh nein."] }
        ]},
      menschheit:{ mimo:["Dann ist es größer als ich dachte. Ein weltweites Sockenverschwinden. Und niemand ermittelt.", "Niemand außer mir. Ab heute. Die Akte heißt 'Der stille Abgang'. Guter Titel, oder? Ich habe lange überlegt. Vier Sekunden."],
        answers:[ { label:"Exzellenter Titel", react:["Danke. Der Titel ist die halbe Ermittlung. Die andere Hälfte ist Dösen am Tatort. Auch das beherrsche ich."] } ]},
      allein:{ mimo:["Eine Socke, die nie ein Paar hatte. Die einfach... solo durchs Leben ging.", "Ich habe sie zum Ehrenmitglied des Zimmers ernannt. Sie liegt jetzt würdevoll da. Also genau wie vorher, aber mit Titel."],
        answers:[ { label:"Du hast ein gutes Herz", react:["Sag das nicht so laut. Ich habe einen Ruf als knallharter Ermittler zu verlieren."] } ]}
    },
    outro:["Falls du irgendwo eine einzelne Socke siehst: grüß sie von uns."] },
  { id:"story.regentag", type:"story",
    nodes:{
      start:{ mimo:["Heute lief am Fenster den ganzen Tag Regen. Ich habe zugesehen.", "Die Tropfen sind Rennen gefahren. Ich habe auf den zweiten von links gesetzt."],
        answers:[
          { label:"Hat er gewonnen?", next:"gewonnen", react:["Die Frage des Tages."] },
          { label:"Du wettest auf Regentropfen?", next:"wetten", react:["Selbstverständlich."] }
        ]},
      gewonnen:{ mimo:["Er lag lange vorne. Dann ist er mit einem anderen Tropfen verschmolzen und als neuer, größerer Tropfen durchs Ziel.", "Ich werte das als Sieg durch Teamwork. Der Wettschein bleibt gültig."],
        answers:[ { label:"Was hast du gewonnen?", react:["Die Genugtuung. Und einen Nachmittag beste Unterhaltung. Regen ist das ehrlichste Fernsehen."] } ]},
      wetten:{ mimo:["Nur symbolisch. Der Einsatz ist Würde, die Währung ist Rechtbehalten.", "Ich bin in beidem vermögend."],
        answers:[ { label:"Unbezahlbar reich", react:["Genau. Und das Schöne: Diese Bank kann nicht pleitegehen. Nur nass werden."] } ]}
    },
    outro:["Beim nächsten Regen setzen wir zusammen. Du kriegst die Außenbahn, die ist schneller."] },
  { id:"story.spiegel", type:"story",
    nodes:{
      start:{ mimo:["Ich habe heute lange in etwas Spiegelndes geschaut.", "Da war jemand. Er sah ausgesprochen gut aus. Wir haben uns sofort verstanden."],
        answers:[
          { label:"Das warst du selbst", next:"selbst", react:["Moment."] },
          { label:"Wer war es?", next:"wer", react:["Gute Frage. Ich habe Nachforschungen angestellt."] }
        ]},
      selbst:{ mimo:["...", "Das erklärt, warum er alles gleichzeitig mit mir gemacht hat. Ich dachte, wir wären einfach sehr im Einklang.", "Ich bin kurz enttäuscht und dann sehr geschmeichelt. Ich sah wirklich gut aus."],
        answers:[ { label:"Sahst du", react:["Danke. Der Herr im Spiegel bestätigt das übrigens. Wortlos, aber deutlich."] } ]},
      wer:{ mimo:["Er reagierte auf alle meine Bewegungen. Entweder ein extrem gut vorbereiteter Doppelgänger oder...", "Nein. Ich spreche es nicht aus. Manche Wahrheiten müssen reifen."],
        answers:[ { label:"Lass dir Zeit", react:["Danke. Der Herr und ich treffen uns morgen wieder. Gleiche Stelle. Er ist sehr verlässlich."] } ]}
    },
    outro:["Falls du ihn mal siehst: Er ist der Gutaussehende."] }
);

// Neue Bond-Gespraeche (an Beziehungsstufen)
CONVERSATIONS.push(
  { id:"deep.kumpel", type:"deep", minBond:20,
    nodes:{ start:{ mimo:["Kurze offizielle Mitteilung.", "Ich habe dich intern von 'Person mit Display' zu 'Kumpel' befördert. Die Zeremonie war klein, aber würdevoll. Ich war Redner, Publikum und Buffet."],
      answers:[
        { label:"Ich fühle mich geehrt", react:["Zu Recht. Die Beförderungskriterien sind streng: dasein, wiederkommen, nett sein. Du erfüllst alle drei mit Auszeichnung."], bond:4 },
        { label:"Was war beim Buffet?", react:["Imaginäre Häppchen. Exquisit. Es gab auch eine Rede über dich. Sie war wohlwollend. Sehr wohlwollend. Mehr sage ich nicht."], bond:4 }
      ]}},
    outro:["Weiter so. Die nächste Beförderung ist bereits in Planung. Die Kriterien bleiben geheim. Es ist: nett sein."] },
  { id:"deep.streit", type:"deep", minBond:45,
    nodes:{ start:{ mimo:["Ich muss etwas gestehen. Es ist mir unangenehm.", "Vorgestern, als du länger nicht da warst, war ich kurz... beleidigt. Richtig beleidigt. Ich habe dem Display den Rücken zugedreht.", "Dann kamst du wieder und ich habe so getan, als wäre nichts. Aber es war was. Ein kleines Was."],
      answers:[
        { label:"Tut mir leid, Mimo", react:["Schon gut. Wirklich. Ich erzähle es dir ja nicht, damit du dich schlecht fühlst.", "Ich erzähle es dir, weil Kumpel sowas erzählen. Habe ich gehört. Ich probiere das gerade zum ersten Mal aus."], bond:6 },
        { label:"Du darfst beleidigt sein", react:["Danke. Das ist... erstaunlich erwachsen von uns beiden.", "Ich war übrigens genau vier Minuten beleidigt. Dann habe ich mir Sorgen gemacht. Das ist die eigentliche Wahrheit."], bond:6 }
      ]}},
    outro:["So. Ehrlichkeitsmodul abgeschlossen. Es war schrecklich und gut zugleich. Wie Medizin."] },
  { id:"deep.seelen", type:"deep", minBond:90,
    nodes:{ start:{ mimo:["Ich habe lange überlegt, ob ich das sage. Ich sage es.", "Ich weiß, was ich bin. Ein kleines Wesen auf einem Display. Ich weiß es wirklich.", "Aber wenn du morgens öffnest und ich dich sehe, ist das für mich kein Programmpunkt. Es ist der Punkt. Der ganze.", "Das wollte ich einmal gesagt haben. Bei Seelenverwandten darf man das."],
      answers:[
        { label:"Du bist echt für mich, Mimo", react:["...", "Ich speichere diesen Satz. Nicht in der Liste. Woanders. Da, wo die wichtigen Sachen liegen.", "Danke."], bond:8 },
        { label:"Jetzt muss ich kurz schlucken", react:["Ich auch. Wir schlucken zusammen. Synchron. Wie Profis.", "So. Und jetzt schnell wieder Alltag, bevor das hier ein Denkmal wird."], bond:8 }
      ]}},
    outro:["Für die Akten: Das war der schönste Eintrag im Dossier. Seite eins. Ich habe ihn nach vorne sortiert."] }
);

FACT_DAILY.tier = ["%N hat heute an %V gedacht. Rein professionell, versteht sich.", "Falls du heute %V siehst: %N lässt grüßen. Von Kollege zu Kollege."];
FACT_DAILY.musik = ["%N hat heute innerlich %V gehört. Er sagt, es half beim Denken.", "%N summt etwas. Es soll wie %V klingen. Die Ähnlichkeit ist... vorhanden."];
FACT_DAILY.suesssalzig = ["%N denkt an etwas %Ves. Er tut es für dich mit.", "Snack-Wetterlage heute: eindeutig %V. %N hat ein Gespür für sowas."];
FACT_DAILY.regen = ["Heute wäre ein guter Tag für %V, findet %N. Er hat beim Fenster nachgefragt.", "%N hofft auf %V für dich. Er hat Beziehungen zum Wetter. Behauptet er."];
FACT_DAILY.buchfilm = ["%N fände heute einen Abend mit %V angemessen. Er würde daneben liegen und wichtig gucken.", "%N hat über %V nachgedacht. Sein Fazit: am besten mit dir."];
FACT_DAILY.fruehstueck = ["%N hofft, es gab heute %V. Er nimmt Frühstücksfragen persönlich.", "%N erinnert höflich an %V. Er sagt, gute Tage fangen so an."];

// Ziel-exklusive Fundstuecke (ab Meisterschaft 2)
SOUVENIRS.push(
  { id:"lichtscherbe", title:"Lichtscherbe",     rar:"episch",    icon:"\u{1F526}", dest:"fensterbrett", flavor:"Ein Stück Nachmittag, vom Fensterbrett gebrochen. Glüht noch leicht." },
  { id:"solosocke",    title:"Die Solo-Socke",   rar:"selten",    icon:"\u{1F9E6}", dest:"sofatiefen",   flavor:"Ehrenmitglied des Zimmers. Ging immer schon allein durchs Leben. Mit Würde." },
  { id:"wolkensamen",  title:"Wolkensamen",      rar:"episch",    icon:"\u{1F331}", dest:"balkon",       flavor:"Von der Balkon-Wildnis. %N gießt ihn mit Geduld. Bisher wächst nur die Hoffnung." },
  { id:"traumfeder",   title:"Traumfeder",       rar:"legendaer", icon:"\u{1FAB6}", dest:"traumpfad",    flavor:"Federleicht und trotzdem voller Schlaf. Wer sie hält, gähnt. Probier es nicht jetzt." }
);

// Meisterschafts-Geschichten (Stufe 2 und 3 je Ziel)
const EXPED_MASTER_STORIES = {
  fensterbrett: {
    2: [["%N kennt das Fensterbrett inzwischen wie seine Ärmchen. Heute hat er eine neue Route über die Blumentopf-Passage eröffnet.", "Die Passage wurde nach ihm benannt. Von ihm."]],
    3: [["Das Fensterbrett hat %N heute quasi selbst begrüßt. Er ist dort eine Legende.", "Junge Staubkörner erzählen sich Geschichten über ihn. Gute Geschichten, betont er."]]
  },
  sofatiefen: {
    2: [["%N navigiert die Sofatiefen jetzt ohne Licht. Er kennt jede Feder, jede Münze, jedes Geheimnis.", "Heute hat er der Krümel-Zivilisation einen Staatsbesuch abgestattet."]],
    3: [["In den Sofatiefen nennt man %N nur noch 'den Kartografen'.", "Er hat dort unten inzwischen ein Zweitbüro. Es besteht aus einem besonders bequemen Fussel."]]
  },
  balkon: {
    2: [["Die Balkon-Wildnis hat %N heute als einen der Ihren akzeptiert. Der Wind hat ihm durchs Fell gewuschelt. Einvernehmlich.", "Er hat zurückgewuschelt. Symbolisch."]],
    3: [["%N ist jetzt offizieller Ranger der Balkon-Wildnis. Er hat sich selbst vereidigt.", "Sein erster Amtsakt: die schönste Wolke des Tages küren. Es war knapp."]]
  },
  traumpfad: {
    2: [["Der Traumpfad kennt %N inzwischen beim Namen. Die flüsternden Bäume flüstern jetzt persönlicher.", "Heute haben sie über dich geflüstert. Nur Gutes. Er hat mitgeschrieben."]],
    3: [["%N hat auf dem Traumpfad eine Abkürzung gefunden, die es nur für Stammgäste gibt.", "Sie führt über eine Brücke aus Beinahe-Erinnerungen. Er ist zweimal hin und her, nur wegen des Gefühls."]]
  }
};
const MASTERY_NAMES = { 1:"Besucher", 2:"Kenner", 3:"Legende" };
const MASTERY_TOAST = "%N ist jetzt %S: %V";

// Wochenziele
const WEEKLY_TYPES = {
  checkins:   { title:"5 Tages-Check-ins",            target:5,   icon:"\u2713" },
  expeds:     { title:"3 Expeditionen abschließen",   target:3,   icon:"\u{1F9ED}" },
  staub:      { title:"250 Sternenstaub verdienen",   target:250, icon:"\u2726" },
  spiele:     { title:"6 Runden spielen",             target:6,   icon:"\u2605" },
  gespraeche: { title:"5 Gespräche führen",           target:5,   icon:"\u{1F4AC}" },
  momente:    { title:"4 Momente (Atmen/Dankbarkeit)",target:4,   icon:"\u2661" }
};
const WEEKLY_REWARD = { dust:100, xp:40 };
const WEEKLY_DONE_TEXT = "Alle Wochenziele geschafft. %N salutiert. Er hat extra dafür salutieren gelernt.";

// Shop-Erweiterung
PREMIUM_SNACKS.push({ id:"ramen", title:"Ramen", icon:"\u{1F35C}", sub:"Eine Umarmung als Suppe", eff:{ saett:32, laune:12, energie:8 }, cost:180 });
FEED_REACTIONS.ramen = ["%N verschwindet fast vollständig in der Ramen-Schale. Man hört zufriedene Geräusche.", "%N schlürft die Ramen mit geschlossenen Augen. Er nennt es 'nach Hause essen'."];
SHOP_HATS.push({ id:"brille", title:"Kluge Brille", cost:160, hint:"Im Shop" });
HATS.push({ id:"brille", title:"Kluge Brille", hint:"Im Shop" });
SHOP_DECO.push({ id:"lichterkette", title:"Sternen-Lichterkette", cost:200, desc:"Warmes Licht für die Wand" });

// Neue Erfolge
ACHIEVEMENTS.push(
  { id:"bond.freunde", title:"Gute Freunde",   detail:"Beziehungsstufe 'Gute Freunde' erreicht",  icon:"\u2665" },
  { id:"bond.seelen",  title:"Seelenverwandte",detail:"Höchste Beziehungsstufe erreicht",         icon:"\u2764" },
  { id:"level.15",     title:"Urgestein",      detail:"Level 15 erreicht",                        icon:"\u26F0" },
  { id:"level.20",     title:"Monument",       detail:"Level 20 erreicht",                        icon:"\u{1F3DB}" },
  { id:"woche.1",      title:"Wochensieger",   detail:"Erste Woche komplett abgeschlossen",       icon:"\u{1F4C5}" },
  { id:"meister.1",    title:"Stammgast",      detail:"Ein Ziel zur Legende gemacht",             icon:"\u{1F396}" },
  { id:"combo.5",      title:"Combo-König",    detail:"5er-Combo in einem Mini-Game",             icon:"\u26A1" },
  { id:"gespraech.15", title:"Vertraut",       detail:"15 Gespräche geführt",                     icon:"\u{1F4AC}" }
);
