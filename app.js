// ============ Mimo Web ============
// State + Engine + Pet-Rendering + UI + Mini-Game. Keine Dependencies.

"use strict";

// roundRect-Polyfill (aeltere Safari-Versionen)
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    this.moveTo(x + r, y); this.lineTo(x + w - r, y); this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r); this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h); this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r); this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const yesterdayKey = () => todayKey(new Date(Date.now() - 864e5));
const twoDaysAgoKey = () => todayKey(new Date(Date.now() - 2 * 864e5));
const fmt = (tpl, ctx) => tpl
  .replaceAll("%N", ctx.N ?? "").replaceAll("%U", ctx.U ?? "")
  .replaceAll("%S", ctx.S ?? "").replaceAll("%L", ctx.L ?? "")
  .replaceAll("%V", ctx.V ?? "");

function dayPhase(d = new Date()) {
  const h = d.getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

// ---------- State ----------
const STORAGE_KEY = "mimo_state_v1";

function defaultState() {
  return {
    onboarded: false,
    userName: "",
    createdAt: Date.now(),
    pet: {
      name: "Mimo", base: "frech",
      stats: { energie: 80, laune: 70, saettigung: 70, bond: 10, xp: 0, level: 1 },
      pers: { frech: 20, lieb: 20, chaotisch: 20, vertraeumt: 20, anhaenglich: 20 },
      lastInteraction: Date.now(), lastUpdate: Date.now(),
      lastCheckInDay: null, streak: 0, sleeping: false,
      favSnack: pick(SNACKS).id, favDiscovered: false,
      bestScore: 0, hat: "none",
      dust: 40, dustEarned: 40,
      memory: { checkinCounts: {}, interCounts: {}, recent: [], quirks: [] }
    },
    diary: [],
    quests: null,           // { dayKey, list:[{type,progress}], bonus }
    achievements: [],
    hats: ["none"],
    best: { sterne: 0, blasen: 0 },
    ownedSnacks: [], ownedDeco: [], purchases: 0,
    lastGiftDay: null, giftsOpened: 0,
    wish: null, wishesDone: 0,
    lastSeen: 0, evoSeen: 1,
    talkFacts: {}, convoSeen: {}, lastFactDay: null, convosDone: 0,
    expedition: null, expeditionsDone: 0, souvenirs: [],
    gratitude: [], lastGratitudeDay: null, lastBreathDay: null, breathsDone: 0,
    streakFreezes: 0,
    bondTierSeen: 0, destVisits: {}, weekly: null, weeklyDone: 0
  };
}

function deepMerge(base, extra) {
  for (const k of Object.keys(extra || {})) {
    if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k])
        && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      deepMerge(base[k], extra[k]);
    } else {
      base[k] = extra[k];
    }
  }
  return base;
}

let state = defaultState();
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) state = deepMerge(defaultState(), JSON.parse(raw));
} catch (e) { /* korrupter Spielstand -> frisch starten */ }

// Migration aelterer Spielstaende
if (state.best.sterne === 0 && state.pet.bestScore > 0) state.best.sterne = state.pet.bestScore;
// Neue XP-Kurve: bestehendes Level bleibt mindestens erhalten
state.pet.stats.level = Math.max(state.pet.stats.level, (function () {
  let lvl = 1, sum = 0;
  while (state.pet.stats.xp >= sum + 100 + (lvl - 1) * 30) { sum += 100 + (lvl - 1) * 30; lvl++; }
  return lvl;
})());

function save() {
  state.lastSeen = Date.now();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ---------- Engine: Sternenstaub ----------
let _dustHookBusy = false;
function earnDust(n) {
  if (n <= 0) return;
  state.pet.dust += n;
  state.pet.dustEarned += n;
  if (!_dustHookBusy && state.onboarded) {
    _dustHookBusy = true;
    try { weeklyProgress("staub", n); } catch (e) {}
    _dustHookBusy = false;
  }
  const chips = [$("#dustAmount"), $("#dustAmountShop")];
  for (const el of chips) if (el) {
    el.textContent = state.pet.dust;
    const chip = el.closest(".chip");
    if (chip) { chip.classList.remove("dust-pop"); void chip.offsetWidth; chip.classList.add("dust-pop"); }
  }
}
function spendDust(n) {
  if (state.pet.dust < n) return false;
  state.pet.dust -= n;
  return true;
}

// ---------- Engine: Wachstumsstufen ----------
function bondTier() {
  const b = state.pet.stats.bond;
  let t = 0;
  for (let i = 0; i < BOND_TIERS.length; i++) if (b >= BOND_TIERS[i].min) t = i;
  return t;
}

let pendingBondTier = null;
function checkBondTier() {
  const t = bondTier();
  if (t > (state.bondTierSeen || 0)) {
    state.bondTierSeen = t;
    pendingBondTier = t;
    state.diary.unshift({ date: Date.now(), mood: "anhaenglich", text: fmt(BOND_TIER_DIARY, ctx({ S: BOND_TIERS[t].name })) });
  }
}

function maybeShowBondTier() {
  if (pendingBondTier === null) return;
  if (!$("#levelupOverlay").classList.contains("hidden")) return; // wartet bis Level-Up zu ist
  const t = pendingBondTier; pendingBondTier = null;
  showCelebration(BOND_TIERS[t].name, fmt(BOND_TIERS[t].text, ctx()));
  playSound("level");
}

function petStage() {
  const l = state.pet.stats.level;
  return l >= 8 ? 3 : l >= 4 ? 2 : 1;
}
const STAGE_NAMES = { 1: "Knirps", 2: "Halbstark", 3: "Ausgewachsen" };

// ---------- Engine: Mood, Decay, XP ----------
function dominantTrait() {
  const p = state.pet.pers;
  return Object.keys(p).reduce((a, b) => (p[a] >= p[b] ? a : b));
}

function computeMood() {
  const p = state.pet, s = p.stats;
  const h = new Date().getHours();
  const hrs = (Date.now() - p.lastInteraction) / 36e5;
  if (p.sleeping) return "vertraeumt";
  if (s.energie < 25) return "muede";
  if (s.saettigung < 30) return "hungrig";
  if (hrs > 12) return p.pers.anhaenglich >= p.pers.frech ? "anhaenglich" : "dramatisch";
  if (s.laune > 75 && s.energie > 50) return "gluecklich";
  if (s.laune < 40) return "gelangweilt";
  if (h >= 21 || h < 6) return "vertraeumt";
  const t = dominantTrait();
  if (t === "frech") return "frech";
  if (t === "vertraeumt") return "vertraeumt";
  if (t === "anhaenglich") return "anhaenglich";
  return "gluecklich";
}

function applyDecay() {
  const p = state.pet, s = p.stats;
  if (state.expedition) { p.lastUpdate = Date.now(); return; } // unterwegs: kein Verfall
  const hrs = (Date.now() - p.lastUpdate) / 36e5;
  if (hrs < 0.05) return;
  s.energie += p.sleeping ? hrs * 6 : -hrs * 1.5;
  s.saettigung -= hrs * 2.5;
  s.laune -= hrs * 1.2;
  s.energie = Math.max(s.energie, 10);
  s.saettigung = Math.max(s.saettigung, 10);
  s.laune = Math.max(s.laune, 15);
  clampStats();
  if (p.sleeping && s.energie >= 95) p.sleeping = false;
  const hrsInter = (Date.now() - p.lastInteraction) / 36e5;
  if (hrsInter > 24) { bump("frech", 1); bump("anhaenglich", 1); }
  p.lastUpdate = Date.now();
}

function clampStats() {
  const s = state.pet.stats;
  s.energie = clamp(s.energie, 0, 100); s.laune = clamp(s.laune, 0, 100);
  s.saettigung = clamp(s.saettigung, 0, 100); s.bond = clamp(s.bond, 0, 100);
}
function bump(trait, amt) { state.pet.pers[trait] = clamp(state.pet.pers[trait] + amt, 0, 100); }

// Level n -> n+1 kostet 100 + (n-1)*30 XP; Gesamtbedarf steigt quadratisch
function xpForNext(level) { return 100 + (level - 1) * 30; }
function xpThreshold(level) { // Gesamt-XP, um dieses Level zu ERREICHEN
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpForNext(l);
  return sum;
}
function levelFromXP(xp) {
  let level = 1;
  while (xp >= xpThreshold(level + 1)) level++;
  return level;
}
function addXP(amount) {
  const s = state.pet.stats;
  s.xp += amount;
  const newLevel = levelFromXP(s.xp);
  if (newLevel > s.level) { s.level = newLevel; return newLevel; }
  return null;
}

let pendingEvo = null;
function handleLevelUp(level) {
  if (!level) return;
  const msg = fmt(LEVEL_UP[level] || LEVEL_UP.default, ctx({ L: level }));
  addDiary("levelUp", { L: level });
  if (level % 2 === 0) grantQuirk();
  earnDust(20);
  const stage = petStage();
  if (stage > (state.evoSeen || 1)) {
    state.evoSeen = stage;
    pendingEvo = stage;
    state.diary.unshift({ date: Date.now(), mood: "gluecklich", text: fmt(EVOLUTION_DIARY[stage], ctx()) });
  }
  playSound("level");
  showLevelUp(level, msg);
}

function grantQuirk() {
  const owned = state.pet.memory.quirks;
  const candidates = QUIRKS.filter(q => !owned.includes(q.id));
  if (!candidates.length) return;
  const q = pick(candidates);
  owned.push(q.id);
  state.diary.unshift({ date: Date.now(), mood: computeMood(), text: q.diary });
}

const ctx = (extra = {}) => ({ N: state.pet.name, U: state.userName, ...extra });

// ---------- Engine: Diary, Reactions ----------
function addDiary(kind, extra = {}) {
  let text = "";
  const c = ctx(extra);
  if (kind === "checkin") text = fmt(pick(DIARY_TEXTS.checkin[extra.answer]), c);
  else if (kind === "interaction") text = fmt(pick(DIARY_TEXTS.interaction[extra.type]), c);
  else if (kind === "levelUp") text = fmt(pick(DIARY_TEXTS.levelUp), c);
  else if (kind === "neglect") text = fmt(pick(DIARY_TEXTS.neglect), c);
  else if (kind === "snack") text = fmt(DIARY_TEXTS.snackDiscovered, c);
  else if (kind === "game") text = fmt(extra.high ? DIARY_TEXTS.miniGameHigh : DIARY_TEXTS.miniGame, c);
  else if (kind === "achievement") text = fmt(DIARY_TEXTS.achievement, c);
  state.diary.unshift({ date: Date.now(), mood: computeMood(), text });
}

let speechTimer = null;
function showReaction(text) {
  const b = $("#speechBubble");
  $("#speechText").textContent = text;
  b.classList.remove("hidden");
  b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => b.classList.add("hidden"), 5000);
}

function genericReaction(type) {
  const def = REACTIONS[type];
  const mood = computeMood(), trait = dominantTrait();
  let pool = [...def.base];
  if (def.trait[trait]) pool = pool.concat(def.trait[trait]);
  if (def.mood[mood]) pool = pool.concat(def.mood[mood]);
  if (state.pet.stats.level >= 4 && def.high.length) pool = pool.concat(def.high);
  return fmt(pick(pool), ctx());
}

function dailyMessage() {
  const p = state.pet;
  if (p.sleeping) return fmt(pick(DAILY.sleeping), ctx());
  let pool = [...DAILY[dayPhase()]];
  const mood = computeMood();
  if (DAILY.mood[mood]) pool = pool.concat(DAILY.mood[mood]);
  if (p.streak >= 3) pool.push(`%N zählt mit: ${p.streak} Tage in Folge eingecheckt. Er tut unbeeindruckt. Ist er nicht.`);
  const days = Math.max(1, Math.floor((Date.now() - state.createdAt) / 864e5) + 1);
  if (days >= 7) pool.push(`Tag ${days} von euch beiden. %N führt keine Liste. Offiziell.`);
  const fav = favoriteInteraction();
  if (fav && DAILY.favInteraction[fav]) pool.push(DAILY.favInteraction[fav]);
  const quirkLines = p.memory.quirks.map(id => QUIRKS.find(q => q.id === id)?.daily).filter(Boolean);
  pool = pool.concat(quirkLines, quirkLines); // Macken doppelt gewichtet
  for (const key of Object.keys(state.talkFacts)) {
    const tpls = FACT_DAILY[key];
    if (tpls) pool.push(fmt(pick(tpls), ctx({ V: state.talkFacts[key] })));
  }
  const oldGrat = state.gratitude.filter(g => Date.now() - g.d > 2 * 864e5);
  if (oldGrat.length) pool.push(fmt(pick(GRATITUDE_TEXTS.daily), ctx({ V: pick(oldGrat).text })));
  return fmt(pick(pool), ctx());
}

function favoriteInteraction() {
  const counts = state.pet.memory.interCounts;
  let best = null, n = 4;
  for (const k of Object.keys(counts)) if (counts[k] > n) { n = counts[k]; best = k; }
  return best;
}

// ---------- Engine: Interaktionen ----------
const EFFECTS = {
  streicheln: { laune: 8, bond: 2, trait: "lieb", xp: 5 },
  reden:      { laune: 6, bond: 3, trait: "anhaenglich", xp: 6 },
  schlafen:   { energie: 25, trait: "vertraeumt", xp: 3 }
};

function recordInteraction(type) {
  const m = state.pet.memory.interCounts;
  m[type] = (m[type] || 0) + 1;
}

function interact(type) {
  if (blockIfAway()) return;
  applyDecay();
  const p = state.pet;
  p.sleeping = type === "schlafen";
  const e = EFFECTS[type];
  p.stats.energie += e.energie || 0; p.stats.laune += e.laune || 0; p.stats.bond += e.bond || 0;
  if (e.trait) bump(e.trait, 1.5);
  clampStats();
  p.lastInteraction = Date.now(); p.lastUpdate = Date.now();
  recordInteraction(type);
  showReaction(genericReaction(type));
  if (Math.random() < 0.25) addDiary("interaction", { type });
  earnDust(2);
  if (type === "streicheln") wishBump("streicheln");
  handleLevelUp(addXP(e.xp));
  if (type === "streicheln") questProgress("streicheln");
  if (type === "reden") questProgress("reden");
  const h = new Date().getHours();
  if (h >= 0 && h < 4) unlockAchievement("nachteule");
  checkUnlocks(); save(); renderAll();
}

function wakeUp() {
  state.pet.sleeping = false;
  showReaction(fmt("%N blinzelt. Er tut so, als wäre er längst wach gewesen.", ctx()));
  save(); renderAll();
}

function feed(snackId) {
  if (blockIfAway()) return;
  applyDecay();
  const p = state.pet;
  p.sleeping = false;
  const snack = ALL_SNACKS.find(s => s.id === snackId);
  const isFav = snackId === p.favSnack;
  const discovery = isFav && !p.favDiscovered;
  p.stats.saettigung += snack.eff.saett;
  p.stats.laune += snack.eff.laune + (isFav ? 8 : 0);
  p.stats.energie += snack.eff.energie;
  if (isFav) p.stats.bond += 2;
  clampStats();
  p.lastInteraction = Date.now(); p.lastUpdate = Date.now();
  recordInteraction("fuettern");

  let text;
  if (discovery) {
    p.favDiscovered = true;
    text = fmt(FEED_REACTIONS.discovery, ctx({ S: snack.title }));
    addDiary("snack", { S: snack.title });
    playSound("success");
  } else if (isFav) {
    text = fmt(pick(FEED_REACTIONS.favorite), ctx({ S: snack.title }));
  } else if (computeMood() === "hungrig") {
    text = fmt(pick(FEED_REACTIONS[snackId].concat(FEED_REACTIONS.hungry)), ctx());
  } else {
    text = fmt(pick(FEED_REACTIONS[snackId]), ctx());
  }
  showReaction(text);
  if (Math.random() < 0.25) addDiary("interaction", { type: "fuettern" });
  earnDust(2);
  wishBump("feedSnack", snackId);
  handleLevelUp(addXP(5));
  questProgress("fuettern");
  checkUnlocks(); save(); renderAll();
}

function talk(topicId) {
  applyDecay();
  const p = state.pet;
  p.sleeping = false;
  p.stats.laune += 6; p.stats.bond += 3; bump("anhaenglich", 1.5); clampStats();
  p.lastInteraction = Date.now(); p.lastUpdate = Date.now();
  recordInteraction("reden");
  const trait = dominantTrait();
  let pool = [...TALK_REACTIONS[topicId]];
  const special = TALK_REACTIONS[`${topicId}_${trait}`];
  if (special) pool.push(special);
  showReaction(fmt(pick(pool), ctx()));
  if (Math.random() < 0.25) addDiary("interaction", { type: "reden" });
  earnDust(3);
  wishBump("reden");
  handleLevelUp(addXP(6));
  questProgress("reden");
  checkUnlocks(); save(); renderAll();
}

function doCheckIn(answerId) {
  const p = state.pet;
  if (p.lastCheckInDay === todayKey()) return;
  applyDecay();
  if (p.lastCheckInDay === yesterdayKey()) p.streak += 1;
  else if (p.lastCheckInDay === twoDaysAgoKey() && state.streakFreezes > 0) {
    state.streakFreezes--;
    p.streak += 1;
    showToast({ icon: "\u2744", title: "Streak-Schutz eingesetzt", detail: `Deine Serie lebt weiter: ${p.streak + 0} Tage. Verbleibend: ${state.streakFreezes}` });
  }
  else p.streak = 1;
  p.lastCheckInDay = todayKey();
  const m = p.memory;
  m.checkinCounts[answerId] = (m.checkinCounts[answerId] || 0) + 1;
  m.recent.unshift(answerId); m.recent = m.recent.slice(0, 7);
  recordInteraction("checkin");
  p.stats.bond += 5; p.stats.laune += 5; clampStats();
  p.lastInteraction = Date.now(); p.lastUpdate = Date.now();

  let text;
  if (answerId === "super" && m.recent[1] === "stressig") text = CHECKIN_REACTIONS.comeback;
  else if (answerId === "stressig" && m.recent[1] === "stressig") text = CHECKIN_REACTIONS.stressAgain;
  else {
    text = CHECKIN_REACTIONS[answerId];
    if (p.streak > 1 && p.streak % 5 === 0) text += ` Und: ${p.streak} Tage in Folge. %N führt Buch.`;
  }
  showReaction(fmt(text, ctx()));
  addDiary("checkin", { answer: answerId });
  playSound("success");
  earnDust(Math.min(15 + p.streak * 2, 35));
  weeklyProgress("checkins");
  handleLevelUp(addXP(15));
  questProgress("checkin");
  checkUnlocks(); save(); renderAll();
}

function finishMiniGame(score, mode = "sterne") {
  applyDecay();
  const p = state.pet;
  p.sleeping = false;
  p.stats.laune += 14; p.stats.energie -= 10; p.stats.bond += 2;
  bump("chaotisch", 1.5); clampStats();
  p.lastInteraction = Date.now(); p.lastUpdate = Date.now();
  recordInteraction("spielen");
  const isBest = score > (state.best[mode] || 0);
  if (isBest) state.best[mode] = score;
  if (mode === "sterne") p.bestScore = state.best.sterne; // Legacy-Feld mitziehen

  const pool = mode === "blasen" ? GAME2_REACTIONS : GAME_REACTIONS;
  let text;
  if (isBest && score > 0) text = pool.newBest;
  else if (score === 0) text = pool.zero;
  else if (score <= 5) text = pool.low;
  else if (score <= 12) text = pool.mid;
  else text = pool.high;
  showReaction(fmt(text, ctx({ S: score })));
  if (Math.random() < 0.34 || score >= 15) addDiary("game", { S: score, high: score >= 15 });
  earnDust(Math.min(score, 30));
  weeklyProgress("spiele");
  wishBump("spielen");
  handleLevelUp(addXP(Math.min(8 + Math.floor(score / 2), 25)));
  questProgress("spielen");
  if (mode === "blasen") questProgress("blasen");
  if (score >= 10) questProgress("minigame");
  checkUnlocks(); save(); renderAll();
  return isBest;
}

// ---------- Engine: Tageswunsch ----------
function ensureWish() {
  if (state.wish?.dayKey === todayKey()) return;
  const options = ["streicheln", "spielen", "reden", "feedSnack", "feedSnack"];
  const kind = pick(options);
  if (kind === "feedSnack") {
    const owned = SNACKS.concat(PREMIUM_SNACKS.filter(s => state.ownedSnacks.includes(s.id)));
    const s = pick(owned);
    const w = WISH_TYPES.feedSnack.make(s);
    state.wish = { dayKey: todayKey(), type: "feedSnack", snack: s.id, title: w.title, text: w.text, target: 1, progress: 0, done: false };
  } else {
    const def = WISH_TYPES[kind];
    state.wish = { dayKey: todayKey(), type: kind, title: def.title, text: def.text, target: def.target, progress: 0, done: false };
  }
}

function wishBump(kind, snackId) {
  ensureWish();
  const w = state.wish;
  if (!w || w.done) return;
  if (w.type !== kind) return;
  if (kind === "feedSnack" && w.snack !== snackId) return;
  w.progress++;
  if (w.progress >= w.target) {
    w.done = true;
    state.wishesDone++;
    state.pet.stats.bond = clamp(state.pet.stats.bond + 3, 0, 100);
    earnDust(30);
    showReaction(fmt(pick(WISH_DONE_REACTIONS), ctx({ S: 30 })));
    state.diary.unshift({ date: Date.now(), mood: "gluecklich", text: fmt(WISH_DIARY, ctx()) });
    playSound("success");
    questProgress("wunsch");
  }
}

// ---------- Engine: Gespraeche ----------
function convoCond(cond) {
  const m = state.pet.memory, today = state.pet.lastCheckInDay === todayKey();
  if (cond === "stressToday") return today && m.recent[0] === "stressig" && m.recent[1] !== "stressig";
  if (cond === "superToday") return today && m.recent[0] === "super";
  if (cond === "stressStreak") return today && m.recent[0] === "stressig" && m.recent[1] === "stressig";
  return false;
}

function availableConversations() {
  const menu = [];
  const seenToday = (id) => state.convoSeen[id] === todayKey();
  // Kontext hat Vorrang (stressStreak vor stress)
  for (const id of ["ctx.stressAgain", "ctx.stress", "ctx.super"]) {
    const conv = CONVERSATIONS.find(x => x.id === id);
    if (conv && convoCond(conv.cond) && !seenToday(id)) { menu.push(conv); break; }
  }
  // Bond-Gespraeche (einmalig)
  const deeps = CONVERSATIONS.filter(x => x.type === "deep").sort((a, b) => a.minBond - b.minBond);
  for (const conv of deeps) {
    if (state.pet.stats.bond >= conv.minBond && !state.convoSeen[conv.id]) { menu.push(conv); break; }
  }
  // Kennenlernen: max eins pro Tag, das naechste unbeantwortete
  if (state.lastFactDay !== todayKey()) {
    const nextFact = CONVERSATIONS.find(x => x.type === "fact" && !state.talkFacts[x.factKey]);
    if (nextFact) menu.push(nextFact);
  }
  // Geschichte: alle 2 Tage eine, am laengsten nicht gehoerte zuerst
  const stories = CONVERSATIONS.filter(x => x.type === "story");
  const fresh = stories.filter(s => {
    const last = state.convoSeen[s.id];
    return !last || (Date.now() - new Date(last).getTime()) / 864e5 >= 2;
  }).sort((a, b) => (state.convoSeen[a.id] || "0").localeCompare(state.convoSeen[b.id] || "0"));
  if (fresh.length) menu.push(fresh[0]);
  // Quatschen immer
  menu.push(pick(CONVERSATIONS.filter(x => x.type === "quatsch")));
  return menu.slice(0, 4);
}

function talkHasNews() {
  return availableConversations().some(c => c.type !== "quatsch");
}

const chat = { conv: null, busy: false, bondExtra: 0, finished: false };

function startConversation(conv) {
  if (blockIfAway()) { closeSheets(); return; }
  chat.conv = conv; chat.busy = false; chat.bondExtra = 0; chat.finished = false;
  $("#chatName").textContent = state.pet.name;
  $("#chatStatus").textContent = "tippt gleich los";
  $("#chatScroll").innerHTML = "";
  $("#chatAnswers").innerHTML = "";
  const av = $("#chatAvatar"); av.innerHTML = "";
  const mini = createPet(av, 56, { static: true });
  mini.update("anhaenglich", false, state.pet.hat);
  openSheet("sheet-chat");
  playNode("start");
}

function chatScrollDown() {
  const sc = $("#chatScroll");
  sc.scrollTop = sc.scrollHeight;
}

function addMsg(cls, text) {
  const el = document.createElement("div");
  el.className = "msg " + cls;
  el.textContent = text;
  $("#chatScroll").appendChild(el);
  chatScrollDown();
  return el;
}

function pushMimoLines(lines, done) {
  chat.busy = true;
  $("#chatStatus").textContent = "tippt …";
  let i = 0;
  const next = () => {
    if (i >= lines.length) {
      chat.busy = false;
      $("#chatStatus").textContent = "wartet auf dich";
      done && done();
      return;
    }
    const line = fmt(lines[i], ctx());
    const typing = addMsg("msg-mimo msg-typing", "");
    typing.innerHTML = "<i></i><i></i><i></i>";
    setTimeout(() => {
      typing.classList.remove("msg-typing");
      typing.innerHTML = "";
      typing.textContent = line;
      chatScrollDown();
      i++;
      setTimeout(next, 260);
    }, Math.min(420 + line.length * 9, 1400));
  };
  next();
}

function showAnswers(answers) {
  $("#chatAnswers").innerHTML = "";
  for (const a of answers) {
    const b = document.createElement("button");
    b.textContent = a.label;
    b.onclick = () => {
      if (chat.busy) return;
      $("#chatAnswers").innerHTML = "";
      addMsg("msg-user", a.label);
      if (a.factValue && chat.conv.factKey) {
        state.talkFacts[chat.conv.factKey] = a.factValue;
        state.lastFactDay = todayKey();
      }
      if (a.bond) chat.bondExtra += a.bond;
      pushMimoLines(a.react || [], () => {
        if (a.next) playNode(a.next);
        else finishConvo();
      });
    };
    $("#chatAnswers").appendChild(b);
  }
  chatScrollDown();
}

function playNode(key) {
  const node = chat.conv.nodes[key];
  pushMimoLines(node.mimo, () => showAnswers(node.answers));
}

function finishConvo() {
  const conv = chat.conv;
  const outro = conv.outro && conv.outro.length ? conv.outro : [];
  pushMimoLines(outro, () => {
    if (!chat.finished) {
      chat.finished = true;
      const quatsch = conv.type === "quatsch";
      applyDecay();
      const p = state.pet;
      p.sleeping = false;
      p.stats.laune = clamp(p.stats.laune + 6, 0, 100);
      p.stats.bond = clamp(p.stats.bond + (quatsch ? 2 : 4) + chat.bondExtra, 0, 100);
      bump("anhaenglich", 1.5);
      p.lastInteraction = Date.now(); p.lastUpdate = Date.now();
      recordInteraction("reden");
      state.convoSeen[conv.id] = todayKey();
      state.convosDone++;
      weeklyProgress("gespraeche");
      const dust = quatsch ? 2 : 4;
      earnDust(dust);
      wishBump("reden");
      const diaryChance = { fact: 1, deep: 1, context: 0.6, story: 0.5, quatsch: 0.2 }[conv.type] || 0.3;
      if (Math.random() < diaryChance)
        state.diary.unshift({ date: Date.now(), mood: computeMood(), text: fmt(CONVO_DIARY[conv.type], ctx()) });
      const rw = document.createElement("div");
      rw.className = "msg-reward";
      rw.innerHTML = `<span class="chip chip-small">+${quatsch ? 4 : 8} XP</span><span class="chip chip-dust chip-small">+${dust} Staub</span><span class="chip chip-small" style="color:#e56b6b;background:#e56b6b22">Bond +${(quatsch ? 2 : 4) + chat.bondExtra}</span>`;
      $("#chatScroll").appendChild(rw);
      chatScrollDown();
      handleLevelUp(addXP(quatsch ? 4 : 8));
      questProgress("reden");
      checkUnlocks(); save();
    }
    const end = document.createElement("button");
    end.className = "chat-end";
    end.textContent = "Fertig";
    end.onclick = () => { closeSheets(); renderAll(); };
    $("#chatAnswers").innerHTML = "";
    $("#chatAnswers").appendChild(end);
  });
}

// ---------- Engine: Expeditionen ----------
function expeditionActive() { return !!state.expedition; }

function blockIfAway() {
  if (!expeditionActive()) return false;
  showReaction(fmt("%N ist gerade auf Expedition. Er kommt wieder. Mit Geschichten.", ctx()));
  return true;
}

function startExpedition(tierId) {
  if (expeditionActive()) return;
  const tier = EXPED_TIERS.find(t => t.id === tierId);
  const dest = pick(EXPED_DESTS);
  applyDecay();
  state.pet.sleeping = false;
  state.expedition = { tier: tier.id, dest: dest.id, start: Date.now(), end: Date.now() + tier.mins * 60000 };
  showReaction(fmt(pick(EXPED_TEXTS.depart), ctx()));
  questProgress("expedition");
  save(); renderAll();
}

function destMastery(destId) {
  const v = state.destVisits[destId] || 0;
  return v >= 6 ? 3 : v >= 3 ? 2 : v >= 1 ? 1 : 0;
}

function rollSouvenir(tier, destId) {
  if (Math.random() > tier.souvenirChance) return null;
  const w = tier.rarWeights;
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * total, rar = "gewoehnlich";
  for (const key of Object.keys(w)) { r -= w[key]; if (r <= 0) { rar = key; break; } }
  const mastery = destMastery(destId);
  let pool = SOUVENIRS.filter(s => s.rar === rar && (!s.dest || (s.dest === destId && mastery >= 2)));
  // Kenner-Bonus: exklusives Stueck bevorzugen, solange es fehlt
  const excl = pool.find(s => s.dest === destId && !state.souvenirs.includes(s.id));
  if (excl && Math.random() < 0.5) return excl;
  if (!pool.length) pool = SOUVENIRS.filter(s => s.rar === rar && !s.dest);
  return pick(pool);
}

let pendingReturn = null;
function checkExpeditionReturn() {
  const ex = state.expedition;
  if (!ex || Date.now() < ex.end) return;
  const tier = EXPED_TIERS.find(t => t.id === ex.tier);
  const dest = EXPED_DESTS.find(d => d.id === ex.dest);
  const masteryBefore = destMastery(dest.id);
  state.destVisits[dest.id] = (state.destVisits[dest.id] || 0) + 1;
  const mastery = destMastery(dest.id);
  if (mastery > masteryBefore && mastery >= 2)
    showToast({ icon: "\u{1F396}", title: `${dest.title}: ${MASTERY_NAMES[mastery]}`, detail: fmt(MASTERY_TOAST, ctx({ S: MASTERY_NAMES[mastery], V: dest.title })) });
  const masteryDustBonus = 1 + (mastery - 1) * 0.15; // Kenner +15%, Legende +30%
  const dust = Math.round((tier.dust[0] + Math.floor(Math.random() * (tier.dust[1] - tier.dust[0] + 1))) * masteryDustBonus);
  const souvenir = rollSouvenir(tier, dest.id);
  let souvenirNew = false, bonusDust = 0;
  if (souvenir) {
    if (state.souvenirs.includes(souvenir.id)) bonusDust = Math.ceil(dust / 2);
    else { state.souvenirs.push(souvenir.id); souvenirNew = true; }
  }
  state.expedition = null;
  state.expeditionsDone++;
  weeklyProgress("expeds");
  earnDust(dust + bonusDust);
  state.pet.stats.laune = clamp(state.pet.stats.laune + 10, 0, 100);
  state.pet.stats.bond = clamp(state.pet.stats.bond + 3, 0, 100);
  state.pet.lastInteraction = Date.now(); state.pet.lastUpdate = Date.now();
  handleLevelUp(addXP(tier.id === "lang" ? 20 : tier.id === "mittel" ? 12 : 6));
  state.diary.unshift({ date: Date.now(), mood: "gluecklich", text: fmt(EXPED_TEXTS.diary, ctx({ S: dest.title })) });
  let storyPool = [...dest.stories];
  const ms = EXPED_MASTER_STORIES[dest.id] || {};
  if (mastery >= 2 && ms[2]) storyPool = storyPool.concat(ms[2], ms[2]);
  if (mastery >= 3 && ms[3]) storyPool = storyPool.concat(ms[3], ms[3]);
  pendingReturn = { story: pick(storyPool).map(l => fmt(l, ctx())).join(" "), dust: dust + bonusDust, souvenir, souvenirNew, bonusDust };
  pendingAway = null; // Rueckkehr-Overlay ersetzt Willkommen-zurueck
  checkUnlocks(); save();
}

function showReturn() {
  if (!pendingReturn) return;
  const r = pendingReturn; pendingReturn = null;
  $("#returnStory").textContent = r.story;
  const mount = $("#returnPetMount"); mount.innerHTML = "";
  createPet(mount, 100, { static: true }).update("gluecklich", false, state.pet.hat);
  let loot = `<div class="loot-row"><span class="loot-icon">\u2726</span><span><strong>Sternenstaub</strong><small>Reisekasse</small></span><span class="chip chip-dust chip-small">+${r.dust}</span></div>`;
  if (r.souvenir) {
    const rar = RARITIES[r.souvenir.rar];
    loot += `<div class="loot-row"><span class="loot-icon">${r.souvenir.icon}</span>
      <span><strong>${r.souvenir.title}</strong><small>${r.souvenirNew ? fmt(r.souvenir.flavor, ctx()) : "Duplikat \u2013 in Staub getauscht"}</small></span>
      <span class="chip chip-small" style="color:${rar.color};background:${rar.color}22">${rar.label}</span></div>`;
  } else {
    loot += `<div class="loot-row"><span class="loot-icon">\uD83D\uDCAC</span><span><strong>Nur Geschichten</strong><small>${fmt(EXPED_TEXTS.noSouvenir, ctx())}</small></span></div>`;
  }
  $("#returnLoot").innerHTML = loot;
  $("#returnOverlay").classList.remove("hidden");
  if (r.souvenirNew && (r.souvenir.rar === "episch" || r.souvenir.rar === "legendaer")) {
    confettiRun = true; runConfetti($("#returnConfetti"));
  }
  playSound("level");
}

// ---------- Engine: Momente (Atmen, Dankbarkeit) ----------
const breath = { timer: null, cycle: 0, phase: 0 };
const BREATH_PLAN = [["in", 4000], ["hold", 2000], ["out", 4000]];

function startBreath() {
  $("#breathOverlay").classList.remove("hidden");
  const mount = $("#breathPetMount"); mount.innerHTML = "";
  createPet(mount, 120, { static: true }).update("vertraeumt", false, "none");
  breath.cycle = 0; breath.phase = -1;
  $("#breathPhase").textContent = fmt(BREATH_TEXTS.intro, ctx());
  $("#breathCount").textContent = "";
  clearTimeout(breath.timer);
  breath.timer = setTimeout(breathStep, 2400);
}

function breathStep() {
  breath.phase++;
  if (breath.phase >= BREATH_PLAN.length) { breath.phase = 0; breath.cycle++; }
  if (breath.cycle >= 6) { finishBreath(); return; }
  const [ph, ms] = BREATH_PLAN[breath.phase];
  $("#breathRing").className = "breath-ring " + ph;
  $("#breathPhase").textContent = BREATH_TEXTS.phases[ph];
  $("#breathCount").textContent = `Runde ${breath.cycle + 1} von 6`;
  breath.timer = setTimeout(breathStep, ms);
}

function finishBreath(skipped) {
  clearTimeout(breath.timer);
  $("#breathOverlay").classList.add("hidden");
  if (skipped && breath.cycle < 3) { renderAll(); return; } // zu frueh abgebrochen: keine Belohnung
  applyDecay();
  state.pet.stats.laune = clamp(state.pet.stats.laune + 8, 0, 100);
  state.pet.stats.bond = clamp(state.pet.stats.bond + 2, 0, 100);
  if (state.lastBreathDay !== todayKey()) { earnDust(5); state.lastBreathDay = todayKey(); }
  state.breathsDone++;
  weeklyProgress("momente");
  showReaction(fmt(pick(BREATH_TEXTS.done), ctx()));
  questProgress("atmen");
  checkUnlocks(); save(); renderAll();
}

function saveGratitude(text) {
  state.gratitude.unshift({ d: Date.now(), text });
  state.gratitude = state.gratitude.slice(0, 40);
  applyDecay();
  state.pet.stats.bond = clamp(state.pet.stats.bond + 3, 0, 100);
  state.pet.stats.laune = clamp(state.pet.stats.laune + 5, 0, 100);
  if (state.lastGratitudeDay !== todayKey()) { earnDust(8); state.lastGratitudeDay = todayKey(); }
  weeklyProgress("momente");
  showReaction(fmt(pick(GRATITUDE_TEXTS.reactions), ctx()));
  if (Math.random() < 0.5) state.diary.unshift({ date: Date.now(), mood: "anhaenglich", text: fmt(GRATITUDE_TEXTS.diary, ctx()) });
  questProgress("dankbar");
  playSound("success");
  checkUnlocks(); save(); renderAll();
}

// ---------- Engine: Wochenziele ----------
function weekKey(d = new Date()) {
  const day = (d.getDay() + 6) % 7; // Montag = 0
  return todayKey(new Date(d.getTime() - day * 864e5));
}

function ensureWeekly() {
  if (state.weekly?.weekKey === weekKey()) return;
  const types = Object.keys(WEEKLY_TYPES).sort(() => Math.random() - 0.5).slice(0, 3);
  state.weekly = { weekKey: weekKey(), list: types.map(t => ({ type: t, progress: 0 })), done: false };
}

function weeklyProgress(type, amount = 1) {
  ensureWeekly();
  const wq = state.weekly;
  if (wq.done) return;
  let changed = false;
  for (const item of wq.list) {
    if (item.type === type && item.progress < WEEKLY_TYPES[type].target) {
      item.progress = Math.min(item.progress + amount, WEEKLY_TYPES[type].target);
      changed = true;
    }
  }
  if (!changed) return;
  if (wq.list.every(i => i.progress >= WEEKLY_TYPES[i.type].target)) {
    wq.done = true;
    state.weeklyDone++;
    earnDust(WEEKLY_REWARD.dust);
    showReaction(fmt(WEEKLY_DONE_TEXT, ctx()));
    playSound("level");
    handleLevelUp(addXP(WEEKLY_REWARD.xp));
    checkUnlocks();
  }
}

// ---------- Engine: Tagesgeschenk ----------
function giftAvailable() { return state.lastGiftDay !== todayKey(); }

function rollGift() {
  let tiers = GIFT_TIERS.map(t => ({ ...t }));
  if (state.pet.streak >= 3) { // Streak verschiebt die Chancen leicht nach oben
    tiers.find(t => t.id === "common").weight -= 6;
    tiers.find(t => t.id === "rare").weight += 4;
    tiers.find(t => t.id === "epic").weight += 2;
  }
  const total = tiers.reduce((a, t) => a + t.weight, 0);
  let r = Math.random() * total;
  for (const t of tiers) { r -= t.weight; if (r <= 0) return t; }
  return tiers[0];
}

function openGiftReward() {
  const tier = rollGift();
  const amount = tier.dust[0] + Math.floor(Math.random() * (tier.dust[1] - tier.dust[0] + 1));
  state.lastGiftDay = todayKey();
  state.giftsOpened++;
  earnDust(amount);
  if (Math.random() < 0.4) state.diary.unshift({ date: Date.now(), mood: computeMood(), text: fmt(GIFT_DIARY, ctx({ S: amount })) });
  questProgress("geschenk");
  checkUnlocks(); save();
  return { tier, amount };
}

// ---------- Engine: Shop ----------
function buyItem(kind, id) {
  let item, applied;
  if (kind === "freeze") {
    if (state.streakFreezes >= STREAK_FREEZE.max) return;
    if (!spendDust(STREAK_FREEZE.cost)) {
      showToast({ icon: "\u2726", title: "Zu wenig Sternenstaub", detail: fmt(SHOP_REACTIONS.broke, ctx()) });
      return;
    }
    state.streakFreezes++;
    state.purchases++;
    playSound("success");
    showToast({ icon: "\u2744", title: "Streak-Schutz gekauft", detail: "Wird automatisch eingesetzt, wenn du einen Tag verpasst." });
    checkUnlocks(); save(); renderAll();
    return;
  }
  if (kind === "snack") {
    item = PREMIUM_SNACKS.find(s => s.id === id);
    if (state.ownedSnacks.includes(id)) return;
    applied = () => state.ownedSnacks.push(id);
  } else if (kind === "hat") {
    item = SHOP_HATS.find(h => h.id === id);
    if (state.hats.includes(id)) return;
    applied = () => state.hats.push(id);
  } else {
    item = SHOP_DECO.find(d => d.id === id);
    if (state.ownedDeco.includes(id)) return;
    applied = () => state.ownedDeco.push(id);
  }
  if (!item) return;
  if (!spendDust(item.cost)) {
    showToast({ icon: "✦", title: "Zu wenig Sternenstaub", detail: fmt(SHOP_REACTIONS.broke, ctx()) });
    return;
  }
  applied();
  state.purchases++;
  playSound("success");
  showToast({ icon: "✓", title: `${item.title} gekauft`, detail: fmt(SHOP_REACTIONS[kind], ctx()) });
  checkUnlocks(); save(); renderAll();
}

// ---------- Engine: Quests, Erfolge, Hüte ----------
function ensureQuests() {
  if (state.quests?.dayKey === todayKey()) return;
  const types = Object.keys(QUEST_TYPES).sort(() => Math.random() - 0.5).slice(0, 3);
  state.quests = { dayKey: todayKey(), list: types.map(t => ({ type: t, progress: 0 })), bonus: false };
}

function questProgress(type) {
  ensureQuests();
  const q = state.quests;
  let changed = false;
  for (const item of q.list) {
    if (item.type === type && item.progress < QUEST_TYPES[type].target) {
      item.progress++;
      changed = true;
      if (item.progress >= QUEST_TYPES[type].target) earnDust(10);
    }
  }
  if (!changed) return;
  const allDone = q.list.every(i => i.progress >= QUEST_TYPES[i.type].target);
  if (allDone && !q.bonus) {
    q.bonus = true;
    earnDust(25);
    handleLevelUp(addXP(20));
    showReaction(fmt(pick(QUEST_BONUS), ctx()));
    playSound("success");
  }
}

function unlockAchievement(id) {
  if (state.achievements.includes(id)) return;
  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (!def) return;
  state.achievements.push(id);
  addDiary("achievement", { S: def.title });
  showToast({ icon: def.icon, title: "Erfolg: " + def.title, detail: def.detail });
  playSound("success");
}

function checkUnlocks() {
  const p = state.pet;
  const cond = {
    "erster.checkin": p.lastCheckInDay !== null,
    "streak.7": p.streak >= 7,
    "bond.50": p.stats.bond >= 50,
    "level.5": p.stats.level >= 5,
    "level.10": p.stats.level >= 10,
    "tagebuch.10": state.diary.length >= 10,
    "snack.entdeckt": p.favDiscovered,
    "highscore.15": (state.best.sterne || 0) >= 15,
    "reich.300": p.dustEarned >= 300,
    "shopper": state.purchases >= 1,
    "stufe.3": petStage() >= 3,
    "wunsch.5": state.wishesDone >= 5,
    "geschenk.7": state.giftsOpened >= 7,
    "exped.1": state.expeditionsDone >= 1,
    "exped.10": state.expeditionsDone >= 10,
    "sammler.8": state.souvenirs.length >= 8,
    "album.voll": state.souvenirs.length >= SOUVENIRS.length,
    "atem.5": state.breathsDone >= 5,
    "dankbar.7": state.gratitude.length >= 7,
    "bond.freunde": bondTier() >= 2,
    "bond.seelen": bondTier() >= 4,
    "level.15": p.stats.level >= 15,
    "level.20": p.stats.level >= 20,
    "woche.1": state.weeklyDone >= 1,
    "meister.1": Object.values(state.destVisits).some(v => v >= 6),
    "gespraech.15": state.convosDone >= 15
  };
  for (const id of Object.keys(cond)) if (cond[id]) unlockAchievement(id);
  checkBondTier();
  const hatCond = {
    schleife: p.stats.level >= 3, muetze: p.streak >= 3,
    blume: p.favDiscovered, krone: p.stats.level >= 8
  };
  for (const id of Object.keys(hatCond))
    if (hatCond[id] && !state.hats.includes(id)) state.hats.push(id);
}

// ---------- Sound (WebAudio, dezent) ----------
let audioCtx = null;
function playSound(kind) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === "catch" ? [[880, 0.06]] :
                  kind === "level" ? [[523, 0.1], [784, 0.14]] : [[659, 0.09], [880, 0.12]];
    let t = audioCtx.currentTime;
    for (const [f, d] of notes) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = f; o.type = "sine";
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + d); t += d * 0.7;
    }
  } catch (e) {}
}

// ---------- Pet-Rendering (SVG) ----------
const petInstances = [];

function createPet(mount, size, opts = {}) {
  const uid = "p" + Math.random().toString(36).slice(2, 8);
  mount.innerHTML = `
  <svg class="pet" width="${size}" height="${size * 0.96}" viewBox="0 0 260 250">
    <defs>
      <radialGradient id="gb${uid}" cx="0.38" cy="0.26" r="0.95">
        <stop offset="0" stop-color="#ffdfae"/><stop offset="0.55" stop-color="#fdbb80"/><stop offset="1" stop-color="#ef8d5c"/>
      </radialGradient>
      <linearGradient id="gy${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff3d9"/><stop offset="1" stop-color="#ffdcae"/>
      </linearGradient>
      <filter id="soft${uid}" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="9"/>
      </filter>
    </defs>
    <ellipse class="shadow" cx="130" cy="234" rx="68" ry="11" fill="#3a2434" opacity="0.18"/>
    <g class="stagewrap"><g class="breath"><g class="squishwrap"><g class="hop">
      <g class="earswrap"><g class="earL" transform="rotate(-6 84 66)">
        <ellipse cx="84" cy="58" rx="21" ry="28" fill="#f79a67"/>
        <ellipse cx="84" cy="62" rx="11" ry="16" fill="#ef7a52"/>
      </g>
      <g class="earR" transform="rotate(6 176 66)">
        <ellipse cx="176" cy="58" rx="21" ry="28" fill="#f79a67"/>
        <ellipse cx="176" cy="62" rx="11" ry="16" fill="#ef7a52"/>
      </g></g>
      <ellipse class="armL" cx="42" cy="152" rx="15" ry="22" fill="#f9a873"/>
      <ellipse class="armR" cx="218" cy="152" rx="15" ry="22" fill="#f9a873"/>
      <path class="blob" fill="url(#gb${uid})" d=""/>
      <ellipse cx="130" cy="182" rx="80" ry="44" fill="#e2703f" opacity="0.26" filter="url(#soft${uid})"/>
      <ellipse cx="130" cy="160" rx="50" ry="37" fill="url(#gy${uid})" opacity="0.95"/>
      <ellipse cx="98" cy="68" rx="44" ry="19" fill="#ffffff" opacity="0.5" transform="rotate(-19 98 68)"/>
      <ellipse cx="102" cy="212" rx="15" ry="9" fill="#ef8d5c"/>
      <ellipse cx="158" cy="212" rx="15" ry="9" fill="#ef8d5c"/>
      <ellipse cx="72" cy="146" rx="15" ry="10" fill="#ff8b76" opacity="0.6"/>
      <ellipse cx="188" cy="146" rx="15" ry="10" fill="#ff8b76" opacity="0.6"/>
      <g class="spots hidden">
        <ellipse cx="70" cy="92" rx="10" ry="7" fill="#ef8d5c" opacity="0.55" transform="rotate(-18 70 92)"/>
        <ellipse cx="196" cy="86" rx="8" ry="6" fill="#ef8d5c" opacity="0.5" transform="rotate(14 196 86)"/>
      </g>
      <g class="eyes">
        <g class="eye-normal">
          <ellipse cx="98" cy="112" rx="11.5" ry="13.5" fill="#3a2531"/>
          <circle cx="94" cy="106" r="4.6" fill="#fff"/><circle cx="102" cy="117" r="2.1" fill="#fff" opacity="0.8"/>
          <ellipse cx="162" cy="112" rx="11.5" ry="13.5" fill="#3a2531"/>
          <circle cx="158" cy="106" r="4.6" fill="#fff"/><circle cx="166" cy="117" r="2.1" fill="#fff" opacity="0.8"/>
        </g>
        <g class="eye-big hidden">
          <ellipse cx="98" cy="112" rx="14" ry="16" fill="#3a2531"/>
          <circle cx="93" cy="105" r="5.6" fill="#fff"/><circle cx="103" cy="118" r="2.5" fill="#fff" opacity="0.8"/>
          <ellipse cx="162" cy="112" rx="14" ry="16" fill="#3a2531"/>
          <circle cx="157" cy="105" r="5.6" fill="#fff"/><circle cx="167" cy="118" r="2.5" fill="#fff" opacity="0.8"/>
        </g>
        <g class="eye-lid hidden">
          <rect x="86" y="108" width="26" height="9" rx="4.5" fill="#3a2531"/>
          <rect x="148" y="108" width="26" height="9" rx="4.5" fill="#3a2531"/>
        </g>
        <g class="eye-sly hidden">
          <rect x="86" y="106" width="25" height="12" rx="6" fill="#3a2531" transform="rotate(-11 98 112)"/>
          <rect x="149" y="106" width="25" height="12" rx="6" fill="#3a2531" transform="rotate(-11 161 112)"/>
        </g>
        <g class="eye-closed hidden">
          <path d="M 86 112 Q 98 121 110 112" stroke="#3a2531" stroke-width="5.5" fill="none" stroke-linecap="round"/>
          <path d="M 150 112 Q 162 121 174 112" stroke="#3a2531" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        </g>
      </g>
      <g class="mouths">
        <path class="m-smile" d="M 112 142 Q 130 158 148 142" stroke="#6e3a3e" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path class="m-small hidden" d="M 118 144 Q 130 153 142 144" stroke="#6e3a3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <g class="m-open hidden">
          <path d="M 113 141 Q 130 166 147 141 Q 130 149 113 141 Z" fill="#6e3a3e"/>
          <ellipse cx="130" cy="152" rx="8" ry="4.6" fill="#ff8b76"/>
        </g>
        <rect class="m-flat hidden" x="117" y="143" width="26" height="5" rx="2.5" fill="#6e3a3e"/>
        <circle class="m-sleep hidden" cx="130" cy="146" r="5" fill="#6e3a3e" opacity="0.85"/>
      </g>
      <g class="hats">
        <g class="hat-schleife hidden" transform="translate(176 32) rotate(14)">
          <ellipse cx="-15" cy="0" rx="17" ry="10.5" fill="#b0507a" transform="rotate(-28)"/>
          <ellipse cx="15" cy="0" rx="17" ry="10.5" fill="#b0507a" transform="rotate(28)"/>
          <circle cx="0" cy="0" r="7" fill="#8a3a5f"/>
        </g>
        <g class="hat-muetze hidden">
          <path d="M 88 40 Q 130 -12 172 40 L 172 46 L 88 46 Z" fill="#b0507a"/>
          <rect x="84" y="42" width="92" height="12" rx="6" fill="#8a3a5f"/>
          <circle cx="130" cy="-2" r="9" fill="#fffdf6"/>
        </g>
        <g class="hat-blume hidden" transform="translate(84 26)">
          <ellipse cx="0" cy="-11" rx="7" ry="11" fill="#fffdf6"/>
          <ellipse cx="0" cy="-11" rx="7" ry="11" fill="#fffdf6" transform="rotate(72)"/>
          <ellipse cx="0" cy="-11" rx="7" ry="11" fill="#fffdf6" transform="rotate(144)"/>
          <ellipse cx="0" cy="-11" rx="7" ry="11" fill="#fffdf6" transform="rotate(216)"/>
          <ellipse cx="0" cy="-11" rx="7" ry="11" fill="#fffdf6" transform="rotate(288)"/>
          <circle r="7" fill="#f2c237"/>
        </g>
        <g class="hat-krone hidden">
          <path d="M 98 40 L 98 14 L 113 27 L 124 5 L 136 24 L 148 5 L 160 27 L 175 14 L 175 40 Z"
                fill="#f5c542" stroke="#d19a1e" stroke-width="2"/>
          <circle cx="112" cy="33" r="2.6" fill="#e05a5a"/><circle cx="136" cy="31" r="2.6" fill="#4f86d9"/>
          <circle cx="160" cy="33" r="2.6" fill="#5aa85e"/>
        </g>
        <g class="hat-zylinder hidden" transform="rotate(5 130 34)">
          <rect x="92" y="30" width="76" height="9" rx="4.5" fill="#3a2531"/>
          <rect x="105" y="-16" width="50" height="48" rx="7" fill="#4a3140"/>
          <rect x="105" y="19" width="50" height="10" fill="#b0507a"/>
        </g>
        <g class="hat-pilz hidden">
          <path d="M 86 38 Q 130 -16 174 38 Q 130 46 86 38 Z" fill="#d94f4f"/>
          <ellipse cx="130" cy="38" rx="44" ry="7" fill="#c23c3c"/>
          <circle cx="108" cy="16" r="6.5" fill="#fffdf6"/><circle cx="140" cy="6" r="5" fill="#fffdf6"/>
          <circle cx="156" cy="24" r="5.6" fill="#fffdf6"/><circle cx="122" cy="30" r="4" fill="#fffdf6"/>
        </g>
        <g class="hat-brille hidden">
          <circle cx="98" cy="112" r="17" fill="none" stroke="#4a3140" stroke-width="4"/>
          <circle cx="162" cy="112" r="17" fill="none" stroke="#4a3140" stroke-width="4"/>
          <path d="M 115 110 Q 130 103 145 110" fill="none" stroke="#4a3140" stroke-width="4" stroke-linecap="round"/>
          <line x1="81" y1="108" x2="66" y2="100" stroke="#4a3140" stroke-width="4" stroke-linecap="round"/>
          <line x1="179" y1="108" x2="194" y2="100" stroke="#4a3140" stroke-width="4" stroke-linecap="round"/>
        </g>
        <g class="hat-halo hidden">
          <ellipse cx="130" cy="2" rx="34" ry="9" fill="none" stroke="#ffe08a" stroke-width="8" opacity="0.55"/>
          <ellipse cx="130" cy="2" rx="34" ry="9" fill="none" stroke="#f2c237" stroke-width="5"/>
        </g>
      </g>
    </g></g></g></g>
    <text class="zzz hidden" x="194" y="44" font-size="26">z z z</text>
  </svg>`;

  const svg = mount.querySelector("svg");
  const inst = {
    svg, blob: svg.querySelector(".blob"),
    phase: Math.random() * 6.28,
    animated: !opts.static,
    blinking: false,
    mood: "gluecklich", sleeping: false,
    update(mood, sleeping, hat) {
      this.mood = mood; this.sleeping = sleeping;
      svg.classList.toggle("sleeping", sleeping);
      svg.classList.toggle("happy", mood === "gluecklich" && !sleeping);
      svg.querySelector(".zzz").classList.toggle("hidden", !sleeping);
      const eyes = { normal: 0, big: 0, lid: 0, sly: 0, closed: 0 };
      const mouth = { smile: 0, small: 0, open: 0, flat: 0, sleep: 0 };
      if (sleeping || this.blinking) { eyes.closed = 1; }
      else if (mood === "muede" || mood === "vertraeumt") eyes.lid = 1;
      else if (mood === "frech") eyes.sly = 1;
      else if (mood === "dramatisch") eyes.big = 1;
      else eyes.normal = 1;
      if (sleeping) mouth.sleep = 1;
      else if (mood === "gluecklich" || mood === "anhaenglich") mouth.smile = 1;
      else if (mood === "hungrig" || mood === "dramatisch") mouth.open = 1;
      else if (mood === "muede" || mood === "gelangweilt") mouth.flat = 1;
      else mouth.small = 1;
      for (const k of Object.keys(eyes)) svg.querySelector(`.eye-${k}`).classList.toggle("hidden", !eyes[k]);
      for (const k of Object.keys(mouth)) svg.querySelector(`.m-${k}`).classList.toggle("hidden", !mouth[k]);
      for (const h of HATS) {
        if (h.id === "none") continue;
        const el = svg.querySelector(`.hat-${h.id}`);
        if (el) el.classList.toggle("hidden", h.id !== hat);
      }
      const up = (mood === "gluecklich" && !sleeping);
      svg.querySelector(".armL").setAttribute("transform", up ? "rotate(-32 42 168)" : "rotate(12 42 168)");
      svg.querySelector(".armR").setAttribute("transform", up ? "rotate(32 218 168)" : "rotate(-12 218 168)");
    },
    squish() {
      svg.classList.add("squish");
      setTimeout(() => svg.classList.remove("squish"), 180);
    },
    stage: 0, eyeScale: 1,
    applyEyes(shiftX) {
      svg.querySelector(".eyes").setAttribute("transform",
        `translate(${130 + shiftX} 112) scale(${this.eyeScale}) translate(-130 -112)`);
    },
    setStage(stage) {
      if (stage === this.stage) return;
      this.stage = stage;
      const cfg = {
        1: { body: 0.84, eyes: 1.16, ears: 0.88, spots: false },
        2: { body: 1.0,  eyes: 1.0,  ears: 1.0,  spots: false },
        3: { body: 1.1,  eyes: 0.94, ears: 1.06, spots: true }
      }[stage] || { body: 1, eyes: 1, ears: 1, spots: false };
      svg.querySelector(".stagewrap").setAttribute("transform",
        `translate(130 234) scale(${cfg.body}) translate(-130 -234)`);
      this.eyeScale = cfg.eyes;
      this.applyEyes(0);
      svg.querySelector(".earswrap").setAttribute("transform",
        `translate(130 58) scale(${cfg.ears}) translate(-130 -58)`);
      svg.querySelector(".spots").classList.toggle("hidden", !cfg.spots);
    }
  };
  inst.blob.setAttribute("d", blobPath(130, 128, 92, 86, inst.phase));
  inst.setStage(opts.stage || petStage());
  if (inst.animated) {
    // Blinzeln
    setInterval(() => {
      if (inst.sleeping) return;
      inst.blinking = true; inst.update(inst.mood, inst.sleeping, currentHat());
      setTimeout(() => { inst.blinking = false; inst.update(inst.mood, inst.sleeping, currentHat()); }, 150);
    }, 3400 + Math.random() * 900);
    // Blick wandert
    setInterval(() => {
      if (inst.sleeping) return;
      inst.applyEyes(pick([-5, 5, -4, 4]));
      setTimeout(() => inst.applyEyes(0), 1100);
    }, 4600 + Math.random() * 2200);
  }
  if (!opts.static) petInstances.push(inst);
  return inst;
}

// Herzchen beim Streicheln
function spawnHearts(mount, count = 4) {
  const w = mount.querySelector("svg")?.clientWidth || 200;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    h.className = "heart-fly";
    h.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21 C4.5 15 2.8 10.8 5 7.8 6.8 5.2 10.4 5.4 12 8 c1.6-2.6 5.2-2.8 7-0.2 2.2 3 0.5 7.2-7 13.2 z"/></svg>';
    h.style.left = (w * 0.18 + Math.random() * w * 0.64) + "px";
    h.style.top = (10 + Math.random() * 30) + "px";
    h.style.animationDelay = (i * 0.09) + "s";
    mount.appendChild(h);
    setTimeout(() => h.remove(), 1400 + i * 90);
  }
}

function currentHat() { return state.pet.hat; }

function blobPath(cx, cy, rx, ry, phase, wob = 0.035) {
  const n = 36, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + wob * Math.sin(3 * a + phase) + wob * 0.6 * Math.cos(2 * a - 1.4 * phase);
    pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], m = mid(p, pts[(i + 1) % n]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + " Z";
}

// Gemeinsamer Wobble-Loop
let lastFrame = performance.now();
function petLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.1); lastFrame = now;
  for (const inst of petInstances) {
    if (!inst.animated) continue;
    inst.phase += dt * 0.9;
    inst.blob.setAttribute("d", blobPath(130, 128, 92, 84, inst.phase));
  }
  requestAnimationFrame(petLoop);
}
requestAnimationFrame(petLoop);

// ---------- Partikel-Hintergrund ----------
(function particles() {
  const cv = $("#particles"), cx2 = cv.getContext("2d");
  const motes = Array.from({ length: 16 }, () => ({
    x: Math.random(), y: Math.random(), s: 2.5 + Math.random() * 3,
    sp: 0.008 + Math.random() * 0.012, sw: 6 + Math.random() * 12,
    sws: 0.3 + Math.random() * 0.4, po: Math.random() * 6
  }));
  function resize() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  addEventListener("resize", resize); resize();
  const start = performance.now();
  (function draw(now) {
    const t = (now - start) / 1000;
    cx2.clearRect(0, 0, cv.width, cv.height);
    const night = dayPhase() === "night";
    cx2.fillStyle = night ? "#f8f2b0" : "#ffffff";
    for (const m of motes) {
      let y = m.y - (t * m.sp) % 1.2; if (y < -0.05) y += 1.2;
      const x = m.x + Math.sin(t * m.sws) * (m.sw / innerWidth);
      const pulse = (Math.sin(t * 0.8 + m.po) + 1) / 2;
      cx2.globalAlpha = night ? 0.25 + pulse * 0.55 : 0.12 + pulse * 0.25;
      cx2.beginPath();
      cx2.arc(x * cv.width, y * cv.height, m.s * devicePixelRatio, 0, 7);
      cx2.fill();
    }
    cx2.globalAlpha = 1;
    requestAnimationFrame(draw);
  })(start);
})();

// ---------- UI: Rendering ----------
let homePet, roomPet, profilePet, obPet;
let currentDaily = "";

function renderAll() {
  const p = state.pet, mood = computeMood();
  document.body.className = "phase-" + dayPhase();

  // Home
  $("#petNameTitle").textContent = p.name;
  $("#levelChip").textContent = `Level ${p.stats.level} · ${STAGE_NAMES[petStage()]}`;
  $("#dustAmount").textContent = p.dust;
  const shopDust = $("#dustAmountShop"); if (shopDust) shopDust.textContent = p.dust;
  $("#streakChip").classList.toggle("hidden", p.streak < 2);
  $("#streakChip").innerHTML = `&#128293; ${p.streak} Tage`;
  const lvlBase = xpThreshold(p.stats.level);
  setRing($("#xpRing"), (p.stats.xp - lvlBase) / xpForNext(p.stats.level), 18);
  $("#moodAura").style.background = MOODS[mood].hex;
  const stage = petStage();
  for (const inst of [homePet, roomPet, profilePet]) inst?.setStage(stage);
  homePet?.update(mood, p.sleeping, p.hat);
  $("#wakeHint").classList.toggle("hidden", !p.sleeping);

  // Tagesgeschenk
  $("#giftCard").classList.toggle("hidden", !giftAvailable());

  // Expedition
  const ex = state.expedition;
  $("#expedIdle").classList.toggle("hidden", !!ex);
  $("#expedActive").classList.toggle("hidden", !ex);
  $("#expedTimer").classList.toggle("hidden", !ex);
  $("#petMount").style.display = ex ? "none" : "";
  $("#awayStage").classList.toggle("hidden", !ex);
  if (ex) {
    const dest = EXPED_DESTS.find(d => d.id === ex.dest);
    $("#expedIcon").textContent = dest.icon;
    $("#expedDest").textContent = dest.title;
    $("#expedAwayText").textContent = fmt(pick(EXPED_TEXTS.awayCard), ctx());
    $("#awayStageIcon").textContent = dest.icon;
    $("#awayStageText").textContent = fmt("%N ist unterwegs: " + dest.title, ctx());
    updateExpedProgress();
  } else {
    $("#expedIdleText").textContent = fmt("%N steht bereit. Der unsichtbare Koffer ist immer gepackt.", ctx());
  }

  // Rituale
  $("#ritualBreath").classList.toggle("done", state.lastBreathDay === todayKey());
  $("#ritualGratitude").classList.toggle("done", state.lastGratitudeDay === todayKey());

  // Reden-Badge bei Neuigkeiten
  const talkOrb = $('.action[data-action="talk"] .orb');
  let badge = talkOrb.querySelector(".action-badge");
  if (talkHasNews()) {
    if (!badge) { badge = document.createElement("span"); badge.className = "action-badge"; talkOrb.appendChild(badge); }
  } else if (badge) badge.remove();

  // Tageswunsch
  ensureWish();
  const w = state.wish;
  $("#wishCard").classList.toggle("done", w.done);
  $("#wishText").textContent = w.done ? "Erfüllt. " + fmt("%N ist sehr zufrieden mit dir.", ctx()) : fmt(w.text, ctx());
  $("#wishReward").textContent = w.done ? "Erledigt" : "+30 Staub";
  $("#wishProgress").innerHTML = w.target > 1
    ? Array.from({ length: w.target }, (_, i) => `<span class="wp-dot ${i < w.progress ? "on" : ""}"></span>`).join("")
    : "";
  $("#moodChip").textContent = MOODS[mood].label;
  $("#moodChip").style.color = MOODS[mood].hex;
  $("#moodChip").style.background = MOODS[mood].hex + "22";
  $("#moodText").textContent = fmt(MOOD_TEXT[mood], ctx());
  $("#dailyMsg").textContent = currentDaily;
  for (const key of ["energie", "laune", "saettigung", "bond"])
    setRing($(`.stat-ring[data-stat="${key}"] .ring-fg`), p.stats[key] / 100, 21);

  // Wochenziele
  ensureWeekly();
  const wq = state.weekly;
  $("#weeklyChip").textContent = wq.done ? "Geschafft" : `+${WEEKLY_REWARD.dust} Staub`;
  $("#weeklyList").innerHTML = wq.list.map(item => {
    const def = WEEKLY_TYPES[item.type], done = item.progress >= def.target;
    return `<div class="quest-row ${done ? "done" : ""}">
      <span class="q-icon">${done ? "\u2713" : def.icon}</span>${def.title}
      <span class="q-progress">${Math.min(item.progress, def.target)}/${def.target}</span></div>`;
  }).join("");

  // Quests
  ensureQuests();
  const q = state.quests;
  const allDone = q.list.every(i => i.progress >= QUEST_TYPES[i.type].target);
  $("#questBonusChip").textContent = allDone ? "Geschafft" : "+20 XP Bonus";
  $("#questList").innerHTML = q.list.map(item => {
    const def = QUEST_TYPES[item.type], done = item.progress >= def.target;
    return `<div class="quest-row ${done ? "done" : ""}">
      <span class="q-icon">${done ? "\u2713" : def.icon}</span>${def.title}
      ${def.target > 1 ? `<span class="q-progress">${item.progress}/${def.target}</span>` : ""}</div>`;
  }).join("");
  $("#checkinBtn").classList.toggle("done", p.lastCheckInDay === todayKey());

  renderRoom(mood); renderDiary(); renderProfile(mood);
}

function setRing(el, frac, r) {
  const c = 2 * Math.PI * r;
  el.style.strokeDasharray = c;
  el.style.strokeDashoffset = c * (1 - clamp(frac, 0, 1));
}

function renderRoom(mood) {
  const p = state.pet, lvl = p.stats.level, night = dayPhase() === "night";
  $("#roomTitle").textContent = `${p.name}s Zuhause`;
  $(".win-sun").classList.toggle("hidden", night);
  $(".win-moon").classList.toggle("hidden", !night);
  $(".win-stars").classList.toggle("hidden", !night);
  $("#decoKissen").classList.toggle("hidden", lvl < 2);
  $("#decoPflanze").classList.toggle("hidden", lvl < 3);
  $("#decoLampe").classList.toggle("hidden", lvl < 4);
  $("#decoStarwin").classList.toggle("hidden", lvl < 5);
  $("#decoUhr").classList.toggle("hidden", lvl < 6);
  $("#decoBuecher").classList.toggle("hidden", lvl < 8);
  $("#decoMobile").classList.toggle("hidden", lvl < 10);
  $("#decoLichterkette").classList.toggle("hidden", !state.ownedDeco.includes("lichterkette"));
  $("#decoGirlande").classList.toggle("hidden", !state.ownedDeco.includes("girlande"));
  $("#decoTeleskop").classList.toggle("hidden", !state.ownedDeco.includes("teleskop"));
  $("#decoRadio").classList.toggle("hidden", !state.ownedDeco.includes("radio"));
  roomPet?.update(mood, p.sleeping, p.hat);

  $("#wardrobe").innerHTML = HATS.map(h => {
    const unlocked = state.hats.includes(h.id), eq = p.hat === h.id;
    let inner = h.id === "none" ? "\u2205" : (unlocked ? `<span class="mini-mount" data-hat="${h.id}"></span>` : "\u{1F512}");
    const shopHat = SHOP_HATS.find(sh => sh.id === h.id);
    const hint = shopHat ? `Shop: ${shopHat.cost} Staub` : h.hint;
    return `<button class="hat-item ${eq ? "equipped" : ""} ${unlocked ? "" : "locked"}" data-hat="${h.id}" ${unlocked ? "" : "disabled"}>
      <span class="hat-circle">${inner}</span><label>${h.title}</label>
      ${unlocked ? "" : `<span class="hint">${hint}</span>`}</button>`;
  }).join("");
  $$("#wardrobe .mini-mount").forEach(m => {
    const mini = createPet(m, 46, { static: true });
    mini.animated = false;
    mini.update("gluecklich", false, m.dataset.hat);
  });
  $$("#wardrobe .hat-item").forEach(btn => btn.onclick = () => {
    if (!state.hats.includes(btn.dataset.hat)) return;
    state.pet.hat = btn.dataset.hat; save(); renderAll();
  });

  const unlocks = [["Kissen", 2], ["Pflanze", 3], ["Lampe", 4], ["Sternenfenster", 5], ["Wanduhr", 6], ["Bücherstapel", 8], ["Sternen-Mobile", 10]];
  $("#unlockList").innerHTML = unlocks.map(([name, req]) => {
    const ok = lvl >= req;
    return `<div class="unlock-row ${ok ? "" : "locked"}">
      <span class="u-icon">${ok ? "\u2713" : "\u{1F512}"}</span>${name}
      ${ok ? "" : `<span class="chip chip-small">Level ${req}</span>`}</div>`;
  }).join("");

  renderShop();
}

const DUST_ICO = '<svg viewBox="0 0 24 24" class="dust-ico"><path d="M12 2.8 l2.5 5.6 6.1 0.6 -4.6 4.1 1.3 6 -5.3-3.1 -5.3 3.1 1.3-6 -4.6-4.1 6.1-0.6 z"/></svg>';

function renderShop() {
  const rows = [];
  const row = (kind, id, emoji, title, sub, cost, owned) => rows.push(
    `<div class="shop-row">
      <span class="shop-emoji">${emoji}</span>
      <span class="shop-info"><strong>${title}</strong><small>${sub}</small></span>
      ${owned
        ? '<span class="shop-buy owned">Gekauft</span>'
        : `<button class="shop-buy" data-kind="${kind}" data-id="${id}" ${state.pet.dust < cost ? "disabled" : ""}>${DUST_ICO}${cost}</button>`}
    </div>`);
  for (const s of PREMIUM_SNACKS) row("snack", s.id, s.icon, s.title, s.sub + " · Snack", s.cost, state.ownedSnacks.includes(s.id));
  for (const h of SHOP_HATS) row("hat", h.id, "\u{1F3A9}", h.title, "Garderobe", h.cost, state.hats.includes(h.id));
  for (const d of SHOP_DECO) row("deco", d.id, "\u{1F6CB}", d.title, d.desc, d.cost, state.ownedDeco.includes(d.id));
  rows.push(`<div class="shop-row">
    <span class="shop-emoji">\u2744</span>
    <span class="shop-info"><strong>${STREAK_FREEZE.title}${state.streakFreezes ? ` (${state.streakFreezes})` : ""}</strong><small>${STREAK_FREEZE.desc}</small></span>
    ${state.streakFreezes >= STREAK_FREEZE.max
      ? '<span class="shop-buy owned">Max.</span>'
      : `<button class="shop-buy" data-kind="freeze" data-id="freeze" ${state.pet.dust < STREAK_FREEZE.cost ? "disabled" : ""}>${DUST_ICO}${STREAK_FREEZE.cost}</button>`}
  </div>`);
  $("#shopList").innerHTML = rows.join("");
  $$("#shopList .shop-buy[data-kind]").forEach(b => b.onclick = () => buyItem(b.dataset.kind, b.dataset.id));
}

const DOT_COLORS = { super: "#efa93b", okay: "#8ca659", stressig: "#9e486b", muede: "#8c87b8", keineahnung: "#998f87" };

function renderDiary() {
  const p = state.pet;
  $("#diaryTitle").textContent = `${p.name}s Tagebuch`;
  const recent = p.memory.recent;
  $("#weekCard").classList.toggle("hidden", recent.length === 0);
  if (recent.length) {
    $("#weekDots").innerHTML = [...recent].reverse().map(id =>
      `<span class="wd"><i style="background:${DOT_COLORS[id]}"></i><small>${(CHECKIN_ANSWERS.find(a => a.id === id)?.label || "").slice(0, 2)}</small></span>`).join("");
    const counts = {};
    recent.forEach(id => counts[id] = (counts[id] || 0) + 1);
    const parts = CHECKIN_ANSWERS.filter(a => counts[a.id]).map(a => `${counts[a.id]}x ${a.label.toLowerCase()}`);
    $("#weekSummary").textContent = fmt(`Die letzten ${recent.length} Check-ins: ${parts.join(", ")}. %N führt Statistik. Rein zufällig.`, ctx());
  }
  const empty = state.diary.length === 0;
  $("#diaryEmpty").classList.toggle("hidden", !empty);
  $("#diaryList").classList.toggle("hidden", empty);
  if (empty) $("#diaryEmptyText").textContent = `Noch keine Einträge.\n${p.name} sammelt noch Material.`;
  $("#diaryList").innerHTML = state.diary.map((e, i) => {
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
      + ", " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const m = MOODS[e.mood] || MOODS.gluecklich;
    return `<div class="entry">
      <div class="marker"><i style="background:${m.hex}"></i>${i < state.diary.length - 1 ? "<span></span>" : ""}</div>
      <div class="card"><div class="e-head"><span>${dateStr}</span>
        <span class="chip chip-small" style="color:${m.hex};background:${m.hex}22">${m.label}</span></div>
        <p class="e-text">${e.text}</p></div></div>`;
  }).join("");
}

const PERS_COLORS = { frech: "#d97b40", lieb: "#e56b6b", chaotisch: "#efa93b", vertraeumt: "#7a8fcc", anhaenglich: "#9e486b" };
const PERS_LABELS = { frech: "Frech", lieb: "Lieb", chaotisch: "Chaotisch", vertraeumt: "Verträumt", anhaenglich: "Anhänglich" };

function renderProfile(mood) {
  const p = state.pet;
  profilePet?.update(mood, p.sleeping, p.hat);
  $("#profileName").textContent = p.name;
  $("#profileSub").textContent = `wohnt bei ${state.userName}`;
  const baseLabel = BASE_PERSONALITIES.find(b => b.id === p.base)?.label || "";
  $("#profileChips").innerHTML =
    `<span class="chip">\u2726 Level ${p.stats.level}</span>` +
    `<span class="chip" style="color:#e56b6b;background:#e56b6b22">${baseLabel}</span>` +
    (p.streak >= 2 ? `<span class="chip chip-flame">\u{1F525} ${p.streak} Tage</span>` : "");
  $("#tileBond").textContent = Math.round(p.stats.bond);
  $("#tileXp").textContent = p.stats.xp;
  $("#tileDiary").textContent = state.diary.length;
  $("#tileBest").textContent = Math.max(state.best.sterne || 0, state.best.blasen || 0);
  $("#persBars").innerHTML = Object.keys(p.pers).map(k =>
    `<div class="pers-bar"><div class="p-head"><span>${PERS_LABELS[k]}</span><span>${Math.round(p.pers[k])}</span></div>
     <div class="p-track"><div class="p-fill" style="width:${p.pers[k]}%;background:${PERS_COLORS[k]}"></div></div></div>`).join("");
  const quirks = p.memory.quirks.map(id => QUIRKS.find(q => q.id === id)).filter(Boolean);
  $("#quirkCount").textContent = `${quirks.length}/${QUIRKS.length}`;
  $("#quirkList").innerHTML = quirks.length
    ? quirks.map(q => `<div class="quirk-row"><em>\u2726</em>${p.name} ${q.title}</div>`).join("")
    : `<p class="muted small">${p.name} hat noch keine Macken entwickelt. Das ändert sich mit jedem zweiten Level. Garantiert.</p>`;
  $("#souvCount").textContent = `${state.souvenirs.length}/${SOUVENIRS.length}`;
  $("#souvGrid").innerHTML = SOUVENIRS.map(s => {
    const owned = state.souvenirs.includes(s.id);
    return `<button class="souv ${owned ? "" : "locked"} r-${s.rar}" data-souv="${s.id}" ${owned ? "" : "disabled"}>${s.icon}</button>`;
  }).join("");
  $$("#souvGrid .souv:not(.locked)").forEach(b => b.onclick = () => {
    const s = SOUVENIRS.find(x => x.id === b.dataset.souv);
    const det = $("#souvDetail");
    det.classList.remove("hidden");
    det.innerHTML = `<strong>${s.title}</strong> \u00b7 <span style="color:${RARITIES[s.rar].color}">${RARITIES[s.rar].label}</span><br>${fmt(s.flavor, ctx())}`;
  });

  $("#achCount").textContent = `${state.achievements.length}/${ACHIEVEMENTS.length}`;
  $("#achGrid").innerHTML = ACHIEVEMENTS.map(a => {
    const ok = state.achievements.includes(a.id);
    return `<div class="ach ${ok ? "" : "locked"}"><span class="a-icon">${ok ? a.icon : "\u{1F512}"}</span><label>${ok ? a.title : "???"}</label></div>`;
  }).join("");
}

function updateExpedProgress() {
  const ex = state.expedition;
  if (!ex) return;
  const total = ex.end - ex.start;
  const done = clamp((Date.now() - ex.start) / total, 0, 1);
  $("#expedFill").style.width = (done * 100) + "%";
  const left = Math.max(0, ex.end - Date.now());
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  $("#expedTimer").textContent = m >= 60 ? `${Math.floor(m / 60)} Std ${m % 60} Min` : m > 0 ? `${m} Min` : `${s} Sek`;
}
setInterval(() => {
  if (!state.expedition) return;
  updateExpedProgress();
  if (Date.now() >= state.expedition.end) { checkExpeditionReturn(); renderAll(); showReturn(); }
}, 1000);

// ---------- UI: Toast + Level-Up ----------
let toastTimer = null;
function showToast(def) {
  $("#toastIcon").textContent = def.icon;
  $("#toastTitle").textContent = def.title;
  $("#toastDetail").textContent = def.detail;
  const t = $("#toast");
  t.classList.remove("hidden");
  t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 3500);
}

let confettiRun = false;
function showLevelUp(level, msg) {
  showCelebration("Level " + level, msg);
}

function showCelebration(title, msg, stage) {
  $("#levelupTitle").textContent = title;
  $("#levelupText").textContent = msg;
  $("#levelupOverlay").classList.remove("hidden");
  const mount = $("#levelupPetMount");
  mount.innerHTML = "";
  const pet = createPet(mount, 110, { static: true, stage: stage || petStage() });
  pet.update("gluecklich", false, state.pet.hat);
  runConfetti();
}

function showEvolution(stage) {
  const evo = EVOLUTION[stage];
  showCelebration(evo.title + "!", fmt(evo.text, ctx()), stage);
  playSound("level");
}

// ---------- Geschenk-Overlay ----------
function openGiftOverlay() {
  if (!giftAvailable()) return;
  $("#giftOverlay").classList.remove("hidden");
  $("#giftStage").classList.remove("hidden");
  $("#giftReveal").classList.add("hidden");
}

function revealGift() {
  const { tier, amount } = openGiftReward();
  $("#giftStage").classList.add("hidden");
  $("#giftReveal").classList.remove("hidden");
  const chip = $("#giftRarity");
  chip.textContent = tier.label;
  chip.className = "chip rarity-" + tier.id;
  $("#giftAmount").textContent = "+" + amount;
  $("#giftFlavor").textContent = fmt(pick(tier.texts), ctx());
  playSound(tier.id === "rare" || tier.id === "epic" ? "level" : "success");
  if (tier.id === "rare" || tier.id === "epic") { confettiRun = true; runConfetti($("#giftConfetti")); }
}

function closeGiftOverlay() {
  confettiRun = false;
  $("#giftOverlay").classList.add("hidden");
  renderAll();
}

// ---------- Willkommen zurueck ----------
let pendingAway = null;
function checkAway() {
  if (!state.onboarded || !state.lastSeen) return;
  const hrs = (Date.now() - state.lastSeen) / 36e5;
  if (hrs < 3) return;
  pendingAway = { dust: Math.min(Math.floor(hrs * 2), 40), text: fmt(pick(AWAY_TEXTS), ctx()) };
}

function showAway() {
  if (!pendingAway) return;
  $("#awayText").textContent = pendingAway.text;
  $("#awayDust").textContent = "+" + pendingAway.dust;
  const mount = $("#awayPetMount");
  mount.innerHTML = "";
  const pet = createPet(mount, 100, { static: true });
  pet.update("anhaenglich", false, state.pet.hat);
  $("#awayOverlay").classList.remove("hidden");
}
function runConfetti(cv = $("#confetti")) {
  const c2 = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ["#9e486b", "#efa93b", "#e56b6b", "#8ca659", "#fcbd87", "#7a8fcc"];
  const parts = Array.from({ length: 42 }, () => ({
    x: Math.random(), delay: Math.random() * 0.7, c: pick(colors),
    s: 6 + Math.random() * 5, sp: 0.55 + Math.random() * 0.45,
    sw: 8 + Math.random() * 18, spin: 1.5 + Math.random() * 2.5
  }));
  confettiRun = true;
  const start = performance.now();
  (function draw(now) {
    if (!confettiRun) return;
    const t = (now - start) / 1000;
    c2.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      const time = t - p.delay;
      if (time < 0) continue;
      const y = time * p.sp * cv.height * 0.45 - 20;
      if (y > cv.height + 20) continue;
      const x = p.x * cv.width + Math.sin(time * 3) * p.sw;
      c2.save(); c2.translate(x, y); c2.rotate(time * p.spin);
      c2.fillStyle = p.c;
      c2.beginPath();
      c2.roundRect(-p.s / 2, -p.s * 0.3, p.s, p.s * 0.6, 2);
      c2.fill(); c2.restore();
    }
    requestAnimationFrame(draw);
  })(start);
}

// ---------- UI: Sheets ----------
function openSheet(id) {
  $("#sheetBackdrop").classList.remove("hidden");
  $("#" + id).classList.remove("hidden");
}
function closeSheets() {
  $("#sheetBackdrop").classList.add("hidden");
  $$(".sheet").forEach(s => s.classList.add("hidden"));
}
$("#sheetBackdrop").addEventListener("click", closeSheets);

function buildSheets() {
  $("#checkinSub").textContent = fmt("%N hört zu. Angeblich neutral.", ctx());
  $("#checkinOptions").innerHTML = CHECKIN_ANSWERS.map(a =>
    `<button data-answer="${a.id}"><em>${a.icon}</em>${a.label}</button>`).join("");
  $$("#checkinOptions button").forEach(b => b.onclick = () => { closeSheets(); doCheckIn(b.dataset.answer); });

  $("#feedSub").textContent = state.pet.favDiscovered
    ? `Lieblingssnack: ${SNACKS.find(s => s.id === state.pet.favSnack).title}`
    : fmt("%N hat einen geheimen Lieblingssnack.", ctx());
  const feedSnacks = SNACKS.concat(PREMIUM_SNACKS.filter(s => state.ownedSnacks.includes(s.id)));
  $("#feedGrid").innerHTML = feedSnacks.map(s => {
    const fav = state.pet.favDiscovered && s.id === state.pet.favSnack;
    return `<button data-snack="${s.id}">${fav ? '<span class="fav">\u2665</span>' : ""}
      <em>${s.icon}</em><strong>${s.title}</strong><small>${s.sub}</small></button>`;
  }).join("");
  $$("#feedGrid button").forEach(b => b.onclick = () => { closeSheets(); feed(b.dataset.snack); });

  $("#gamesSub").textContent = fmt("%N ist bereits in Position.", ctx());
  $("#gamesOptions").innerHTML = Object.keys(GAME_DEFS).map(m => {
    const best = state.best[m] || 0;
    return `<button data-mode="${m}"><em>${m === "sterne" ? "\u2605" : "\u25EF"}</em>${GAME_DEFS[m].title}
      ${best ? `<span class="q-progress" style="margin-left:auto">Rekord ${best}</span>` : ""}</button>`;
  }).join("");
  $$("#gamesOptions button").forEach(b => b.onclick = () => { closeSheets(); openGame(b.dataset.mode); });

  $("#expedSub").textContent = fmt("%N verspricht, unterwegs an dich zu denken. Mindestens zweimal.", ctx());
  $("#expedOptions").innerHTML = EXPED_TIERS.map(t => {
    const dur = t.mins >= 60 ? `${t.mins / 60} Std` : `${t.mins} Min`;
    return `<button data-tier="${t.id}"><em>\u{1F9ED}</em><span>${t.title}<span class="talk-option-hint">${t.desc}</span></span>
      <span class="q-progress" style="margin-left:auto">${dur}</span></button>`;
  }).join("");
  $$("#expedOptions button").forEach(b => b.onclick = () => { closeSheets(); startExpedition(b.dataset.tier); });
  $("#expedLog").innerHTML = EXPED_DESTS.map(d => {
    const v = state.destVisits[d.id] || 0, m = destMastery(d.id);
    const next = m >= 3 ? "" : ` \u00b7 noch ${(m >= 2 ? 6 : m >= 1 ? 3 : 1) - v} bis ${MASTERY_NAMES[m + 1] || "Besucher"}`;
    return `<div class="log-row"><span class="log-icon">${d.icon}</span>
      <span class="log-info"><strong>${d.title}</strong><small>${v}x besucht${next}</small></span>
      <span class="chip chip-small" style="${m >= 3 ? "color:#c98a12;background:#c98a1222" : ""}">${m ? MASTERY_NAMES[m] : "Neu"}</span></div>`;
  }).join("");

  $("#gratPrompt").textContent = fmt(GRATITUDE_TEXTS.prompt, ctx());
  const recent = state.gratitude.slice(0, 3);
  $("#gratRecent").classList.toggle("hidden", recent.length === 0);
  $("#gratRecent").innerHTML = recent.map(g =>
    `<div>${new Date(g.d).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} \u00b7 ${g.text}</div>`).join("");

  $("#talkSub").textContent = fmt("%N hat Zeit. %N hat immer Zeit.", ctx());
  const menu = availableConversations();
  const ICONS = { fact: "?", context: "\u2665", story: "\u2726", deep: "\u2727", quatsch: "\u263A" };
  $("#talkOptions").innerHTML = menu.map((cv, i) =>
    `<button data-idx="${i}"><em>${ICONS[cv.type]}</em><span>${TALK_MENU_HINTS[cv.type]}
      ${cv.type === "fact" || cv.type === "deep" || cv.type === "context" ? "" : ""}</span>
      ${cv.type !== "quatsch" ? '<span class="talk-new"></span>' : ""}</button>`).join("");
  $$("#talkOptions button").forEach(b => b.onclick = () => {
    closeSheets();
    startConversation(menu[+b.dataset.idx]);
  });
}

// ---------- Mini-Game ----------
const game = {
  mode: "sterne",
  running: false, items: [], pops: [], floats: [], petX: 0.5, score: 0, timeLeft: 30,
  spawnAcc: 0, lastTick: 0, t: 0, submitted: false, raf: null,
  combo: 0, comboLast: 0, comboBest: 0
};

// Combo: Treffer innerhalb des Fensters bauen die Serie auf; ab 3 gilt x2
function registerCatch(now, windowMs) {
  if (now - game.comboLast < windowMs) game.combo++;
  else game.combo = 1;
  game.comboLast = now;
  game.comboBest = Math.max(game.comboBest, game.combo);
  return game.combo >= 3 ? 2 : 1;
}

function addFloat(x, y, text, color) {
  game.floats.push({ x, y, t: 0, text, color: color || "#9e486b" });
}

function openGame(mode = "sterne") {
  if (blockIfAway()) { closeSheets(); return; }
  game.mode = mode;
  $("#gameOverlay").classList.remove("hidden");
  $("#gameReady").classList.remove("hidden");
  $("#gameFinished").classList.add("hidden");
  $("#gameReady .serif").textContent = GAME_DEFS[mode].title;
  const extra = mode === "sterne" ? " Schnelle Fänge bauen Combos auf. Sternschnuppen bringen 5." : " Schnelle Treffer bauen Combos auf. Finger weg von Stachelblasen.";
  $("#gameIntro").textContent = fmt(GAME_DEFS[mode].desc, ctx()) + extra + " 30 Sekunden.";
  const best = state.best[mode] || 0;
  $("#gameBestChip").classList.toggle("hidden", best === 0);
  $("#gameBestChip").textContent = `\u{1F3C6} Rekord: ${best}`;
  const cv = $("#gameCanvas");
  cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
  drawGame();
}

function startGame() {
  Object.assign(game, { running: true, items: [], pops: [], floats: [], petX: 0.5, score: 0, timeLeft: 30, spawnAcc: 0, t: 0, submitted: false, lastTick: performance.now(), combo: 0, comboLast: 0, comboBest: 0 });
  $("#gameReady").classList.add("hidden");
  $("#gameFinished").classList.add("hidden");
  $("#gameScore").textContent = "0";
  cancelAnimationFrame(game.raf);
  game.raf = requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  const dt = Math.min((now - game.lastTick) / 1000, 0.1);
  game.lastTick = now;
  if (game.running) {
    game.timeLeft -= dt;
    $("#gameTime").textContent = Math.max(0, Math.ceil(game.timeLeft));
    if (game.timeLeft <= 0) { endGame(); return; }
    game.t += dt;
    game.spawnAcc += dt;
    if (game.mode === "sterne") {
      const interval = Math.max(0.45, 0.9 - (30 - game.timeLeft) * 0.012);
      if (game.spawnAcc >= interval) {
        game.spawnAcc = 0;
        const shoot = Math.random() < 0.06;
        game.items.push({
          x: 0.08 + Math.random() * 0.84, y: -0.05,
          sp: (0.28 + Math.random() * 0.14) * (shoot ? 2.4 : 1),
          gold: !shoot && Math.random() < 0.1, shoot, rot: Math.random() * 6
        });
      }
      let caughtAny = false;
      game.items = game.items.filter(it => {
        it.y += it.sp * dt;
        if (it.y >= 0.755 && it.y <= 0.845 && Math.abs(it.x - game.petX) < 0.11) {
          const mult = registerCatch(now, 1500);
          const value = (it.shoot ? 5 : it.gold ? 3 : 1) * mult;
          game.score += value;
          addFloat(it.x, 0.74, (mult > 1 ? `Combo x2! +${value}` : `+${value}`), it.shoot ? "#e56b6b" : it.gold ? "#c98a12" : "#9e486b");
          caughtAny = true;
          return false;
        }
        return it.y <= 1.1;
      });
      if (caughtAny) {
        $("#gameScore").textContent = game.score;
        playSound("catch");
        if (navigator.vibrate) navigator.vibrate(10);
      }
    } else {
      const interval = Math.max(0.4, 0.75 - (30 - game.timeLeft) * 0.008);
      if (game.spawnAcc >= interval) {
        game.spawnAcc = 0;
        const spike = Math.random() < 0.11;
        game.items.push({ x: 0.12 + Math.random() * 0.76, y: 1.08, sp: 0.13 + Math.random() * 0.1,
          r: 20 + Math.random() * 14, gold: !spike && Math.random() < 0.08, spike, wob: Math.random() * 6, dx: 0 });
      }
      game.items = game.items.filter(it => { it.y -= it.sp * dt; return it.y > -0.1; });
    }
    game.pops = game.pops.filter(p => (p.t += dt) < 0.4);
    game.floats = game.floats.filter(f => (f.t += dt) < 0.9);
  }
  drawGame();
  game.raf = requestAnimationFrame(gameLoop);
}

function drawGame() {
  const cv = $("#gameCanvas"), c2 = cv.getContext("2d");
  const W = cv.width, H = cv.height, dpr = devicePixelRatio;
  c2.clearRect(0, 0, W, H);
  // Pop-Ringe
  for (const p of game.pops) {
    c2.globalAlpha = 1 - p.t / 0.4;
    c2.strokeStyle = p.gold ? "#efa93b" : "#ffffff";
    c2.lineWidth = 3 * dpr;
    c2.beginPath(); c2.arc(p.x * W, p.y * H, (p.r + p.t * 90) * dpr, 0, 7); c2.stroke();
    c2.globalAlpha = 1;
  }
  // Score-Floats
  for (const f of game.floats) {
    c2.globalAlpha = Math.max(0, 1 - f.t / 0.9);
    c2.fillStyle = f.color;
    c2.font = `bold ${15 * dpr}px -apple-system, sans-serif`;
    c2.textAlign = "center";
    c2.fillText(f.text, f.x * W, (f.y - f.t * 0.06) * H);
    c2.globalAlpha = 1;
  }
  if (game.mode === "blasen") {
    for (const it of game.items) {
      it.dx = it.x + Math.sin(game.t * 1.8 + it.wob) * 0.035;
      const x = it.dx * W, y = it.y * H, r = it.r * dpr;
      if (it.spike) {
        c2.fillStyle = "rgba(70,50,70,.5)";
        c2.strokeStyle = "rgba(50,32,50,.9)";
        c2.lineWidth = 2.2 * dpr;
        c2.beginPath(); c2.arc(x, y, r, 0, 7); c2.fill(); c2.stroke();
        c2.strokeStyle = "rgba(50,32,50,.9)"; c2.lineWidth = 2.6 * dpr;
        for (let a = 0; a < 8; a++) {
          const ang = a / 8 * Math.PI * 2 + game.t;
          c2.beginPath();
          c2.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
          c2.lineTo(x + Math.cos(ang) * (r + 7 * dpr), y + Math.sin(ang) * (r + 7 * dpr));
          c2.stroke();
        }
        continue;
      }
      c2.fillStyle = it.gold ? "rgba(242,194,55,.32)" : "rgba(255,255,255,.22)";
      c2.strokeStyle = it.gold ? "rgba(217,150,20,.85)" : "rgba(255,255,255,.8)";
      c2.lineWidth = 2.2 * dpr;
      c2.beginPath(); c2.arc(x, y, r, 0, 7); c2.fill(); c2.stroke();
      c2.strokeStyle = "rgba(255,255,255,.9)"; c2.lineWidth = 2.6 * dpr;
      c2.beginPath(); c2.arc(x - r * 0.28, y - r * 0.28, r * 0.5, Math.PI * 1.05, Math.PI * 1.5); c2.stroke();
    }
    return;
  }
  // Sterne
  for (const it of game.items) {
    drawStar(c2, it.x * W, it.y * H, (it.gold ? 17 : 13) * dpr, it.gold ? "#efa93b" : "#ffd94d", it.rot + it.y * 4);
  }
  // Pet (vereinfachter Blob)
  const px = game.petX * W, py = 0.8 * H, r = 44 * dpr;
  c2.fillStyle = "rgba(66,48,58,.14)";
  c2.beginPath(); c2.ellipse(px, py + r * 0.95, r * 0.8, r * 0.16, 0, 0, 7); c2.fill();
  const grad = c2.createLinearGradient(0, py - r, 0, py + r);
  grad.addColorStop(0, "#fdbb80"); grad.addColorStop(1, "#ef8d5c");
  c2.fillStyle = "#f79a67";
  c2.beginPath(); c2.ellipse(px - r * 0.58, py - r * 0.82, r * 0.2, r * 0.28, 0, 0, 7); c2.fill();
  c2.beginPath(); c2.ellipse(px + r * 0.58, py - r * 0.82, r * 0.2, r * 0.28, 0, 0, 7); c2.fill();
  c2.fillStyle = grad;
  c2.beginPath(); c2.ellipse(px, py, r, r * 0.92, 0, 0, 7); c2.fill();
  c2.fillStyle = "#3a2531";
  c2.beginPath(); c2.arc(px - r * 0.33, py - r * 0.2, r * 0.11, 0, 7); c2.fill();
  c2.beginPath(); c2.arc(px + r * 0.33, py - r * 0.2, r * 0.11, 0, 7); c2.fill();
  c2.strokeStyle = "#6e3a3e"; c2.lineWidth = 4 * dpr; c2.lineCap = "round";
  c2.beginPath(); c2.moveTo(px - r * 0.18, py + r * 0.12);
  c2.quadraticCurveTo(px, py + r * 0.3, px + r * 0.18, py + r * 0.12); c2.stroke();
}

function drawStar(c2, x, y, r, color, rot) {
  c2.save(); c2.translate(x, y); c2.rotate(rot);
  c2.fillStyle = color;
  c2.shadowColor = "rgba(255,220,120,.6)"; c2.shadowBlur = 8;
  c2.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    c2[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c2.closePath(); c2.fill(); c2.restore();
}

function endGame() {
  game.running = false;
  if (game.comboBest >= 5) unlockAchievement("combo.5");
  submitGame();
  $("#gameFinalScore").textContent = `${game.score} ${game.mode === "blasen" ? "Blasen" : "Sterne"}`;
  const isBest = game.score >= (state.best[game.mode] || 0) && game.score > 0;
  $("#gameNewBest").classList.toggle("hidden", !isBest);
  $("#gameBestText").textContent = isBest ? "" : `Rekord: ${state.best[game.mode] || 0}`;
  $("#gameFinished").classList.remove("hidden");
  drawGame();
}

function submitGame() {
  if (game.submitted) return;
  game.submitted = true;
  finishMiniGame(game.score, game.mode);
}

function bindGameInput() {
  const cv = $("#gameCanvas");
  const move = (clientX) => {
    if (!game.running || game.mode !== "sterne") return;
    game.petX = clamp(clientX / innerWidth, 0.08, 0.92);
  };
  const tap = (clientX, clientY) => {
    if (!game.running || game.mode !== "blasen") return;
    const tx = clientX / innerWidth, ty = clientY / innerHeight;
    let hit = null, hd = 1;
    for (const it of game.items) {
      const rr = (it.r * 1.5) / Math.min(innerWidth, innerHeight);
      const d = Math.hypot((it.dx || it.x) - tx, it.y - ty);
      if (d < rr && d < hd) { hit = it; hd = d; }
    }
    if (hit) {
      game.items.splice(game.items.indexOf(hit), 1);
      game.pops.push({ x: hit.dx || hit.x, y: hit.y, r: hit.r, t: 0, gold: hit.gold, spike: hit.spike });
      if (hit.spike) {
        game.combo = 0;
        game.score = Math.max(0, game.score - 3);
        addFloat(hit.dx || hit.x, hit.y, "-3", "#c03a3a");
        if (navigator.vibrate) navigator.vibrate(60);
      } else {
        const mult = registerCatch(performance.now(), 1200);
        const value = (hit.gold ? 3 : 1) * mult;
        game.score += value;
        addFloat(hit.dx || hit.x, hit.y, (mult > 1 ? `Combo x2! +${value}` : `+${value}`), hit.gold ? "#c98a12" : "#9e486b");
        playSound("catch");
        if (navigator.vibrate) navigator.vibrate(10);
      }
      $("#gameScore").textContent = game.score;
    }
  };
  cv.addEventListener("pointerdown", e => { move(e.clientX); tap(e.clientX, e.clientY); });
  cv.addEventListener("pointermove", e => { if (e.buttons || e.pointerType === "touch") move(e.clientX); });
  cv.addEventListener("touchmove", e => { e.preventDefault(); move(e.touches[0].clientX); }, { passive: false });
}

// ---------- Onboarding ----------
let obStep = 0, obBase = "frech";
function renderOnboarding() {
  $$(".ob-progress .dot").forEach((d, i) => d.classList.toggle("active", i <= obStep));
  $$(".ob-step").forEach(s => s.classList.toggle("hidden", +s.dataset.step !== obStep));
  $("#obBack").classList.toggle("hidden", obStep === 0);
  $("#obNext").textContent = obStep < 2 ? "Weiter" : "Los geht's";
  $("#obNext").disabled = obStep === 0 && !$("#obUserName").value.trim();
  if (obStep === 2) {
    const pn = $("#obPetName").value.trim() || "Mimo";
    $("#obPersTitle").textContent = `Welcher Typ soll ${pn} sein?`;
    $("#obPersList").innerHTML = BASE_PERSONALITIES.map(b =>
      `<button class="pers-option ${b.id === obBase ? "selected" : ""}" data-id="${b.id}">
        <span><strong>${b.label}</strong><small>${b.desc}</small></span><span class="radio"></span></button>`).join("");
    $$(".pers-option").forEach(btn => btn.onclick = () => { obBase = btn.dataset.id; renderOnboarding(); });
  }
  obPet?.update(obStep === 2 ? "frech" : "gluecklich", false, "none");
}

function completeOnboarding() {
  state.userName = $("#obUserName").value.trim();
  state.pet.name = $("#obPetName").value.trim() || "Mimo";
  state.pet.base = obBase;
  state.pet.pers = { frech: 20, lieb: 20, chaotisch: 20, vertraeumt: 20, anhaenglich: 20 };
  state.pet.pers[obBase] = 45;
  state.createdAt = Date.now();
  state.onboarded = true;
  save();
  $("#onboarding").classList.add("hidden");
  bootApp();
}

// ---------- Navigation + Init ----------
function switchTab(tab) {
  $$("main.screen").forEach(s => s.classList.add("hidden"));
  $("#screen-" + tab).classList.remove("hidden");
  $$("#dock button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  const idx = ["home", "room", "diary", "profile"].indexOf(tab);
  $("#dockPill").style.left = `calc(6px + ${idx} * (25% - 3px))`;
  window.scrollTo(0, 0);
}

function timeTick() {
  document.body.className = "phase-" + dayPhase();
  checkExpeditionReturn();
  const hrs = (Date.now() - state.pet.lastInteraction) / 36e5;
  applyDecay();
  if (hrs > 36 && state.onboarded && !state._neglectNoted) {
    addDiary("neglect"); state._neglectNoted = true;
  }
  if (hrs < 36) state._neglectNoted = false;
  currentDaily = dailyMessage();
  ensureQuests();
  save(); renderAll();
}

function bootApp() {
  checkAway();
  checkExpeditionReturn();
  $("#dock").classList.remove("hidden");
  homePet = createPet($("#petMount"), 210);
  roomPet = createPet($("#roomPetMount"), 135);
  profilePet = createPet($("#profilePetMount"), 115);
  createPet($("#diaryPetMount"), 110).update("vertraeumt", false, "none");
  $("#petMount").addEventListener("click", () => {
    homePet.squish();
    if (state.pet.sleeping) { wakeUp(); }
    else { spawnHearts($("#petMount")); interact("streicheln"); }
  });
  buildSheets();
  timeTick();
  switchTab("home");
  showAway();
  showReturn();
  setInterval(timeTick, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { timeTick(); showReturn(); } });
}

// ---------- Events ----------
document.addEventListener("DOMContentLoaded", () => {
  $$("#dock button").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  $$(".action").forEach(btn => btn.addEventListener("click", () => {
    const a = btn.dataset.action;
    if (a === "streicheln") { homePet?.squish(); spawnHearts($("#petMount")); interact(a); }
    else if (a === "schlafen") { homePet?.squish(); interact(a); }
    else if (a === "feed") { buildSheets(); openSheet("sheet-feed"); }
    else if (a === "talk") { buildSheets(); openSheet("sheet-talk"); }
    else if (a === "checkin") { buildSheets(); openSheet("sheet-checkin"); }
    else if (a === "game") { buildSheets(); openSheet("sheet-games"); }
  }));

  $("#chatClose").addEventListener("click", () => { closeSheets(); renderAll(); });
  $("#expedOpen").addEventListener("click", () => { buildSheets(); openSheet("sheet-exped"); });
  $("#ritualBreath").addEventListener("click", startBreath);
  $("#breathSkip").addEventListener("click", () => finishBreath(true));
  $("#ritualGratitude").addEventListener("click", () => {
    buildSheets();
    $("#gratInput").value = "";
    $("#gratSave").disabled = true;
    openSheet("sheet-gratitude");
  });
  $("#gratInput").addEventListener("input", () => { $("#gratSave").disabled = !$("#gratInput").value.trim(); });
  $("#gratSave").addEventListener("click", () => {
    const text = $("#gratInput").value.trim();
    if (!text) return;
    closeSheets();
    saveGratitude(text);
  });
  $("#returnClose").addEventListener("click", () => {
    confettiRun = false;
    $("#returnOverlay").classList.add("hidden");
    renderAll();
  });
  $("#giftCard").addEventListener("click", openGiftOverlay);
  $("#giftBig").addEventListener("click", revealGift);
  $("#giftClose").addEventListener("click", closeGiftOverlay);
  $("#awayClose").addEventListener("click", () => {
    if (pendingAway) { earnDust(pendingAway.dust); pendingAway = null; save(); }
    $("#awayOverlay").classList.add("hidden");
    renderAll();
  });

  $("#levelupClose").addEventListener("click", () => {
    confettiRun = false;
    $("#levelupOverlay").classList.add("hidden");
    if (pendingEvo) { const s = pendingEvo; pendingEvo = null; setTimeout(() => showEvolution(s), 250); }
    else setTimeout(maybeShowBondTier, 250);
    renderAll();
  });

  $("#gameStart").addEventListener("click", startGame);
  $("#gameAgain").addEventListener("click", startGame);
  $("#gameDone").addEventListener("click", () => { cancelAnimationFrame(game.raf); $("#gameOverlay").classList.add("hidden"); });
  $("#gameClose").addEventListener("click", () => {
    if (game.running) { game.running = false; submitGame(); }
    cancelAnimationFrame(game.raf);
    $("#gameOverlay").classList.add("hidden");
  });
  bindGameInput();

  $("#resetBtn").addEventListener("click", () => {
    if (confirm(`${state.pet.name} und alle Daten werden gelöscht. Das Onboarding startet neu.`)) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });

  // Onboarding
  if (!state.onboarded) {
    $("#onboarding").classList.remove("hidden");
    obPet = createPet($("#obPetMount"), 150);
    obPet.update("gluecklich", false, "none");
    $("#obUserName").addEventListener("input", renderOnboarding);
    $("#obNext").addEventListener("click", () => {
      if (obStep < 2) { obStep++; renderOnboarding(); } else completeOnboarding();
    });
    $("#obBack").addEventListener("click", () => { obStep--; renderOnboarding(); });
    renderOnboarding();
  } else {
    bootApp();
  }
});
