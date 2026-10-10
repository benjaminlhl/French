import { WEEKS, TOTAL_DAYS, SCENARIOS, lessonFor, levelFor } from "./curriculum.js";
import { buildSystemPrompt } from "./prompts.js";

// ---------- State ----------
const STORE_KEY = "camille.v1";
const DAY_MS = 86_400_000;

const defaultState = () => ({
  profile: { name: "", native: "", destination: "", field: "", departure: isoDate(Date.now() + 90 * DAY_MS) },
  progress: { lessonDay: 1, completed: {}, streak: { count: 0, last: null }, activity: {} },
  notes: [],
  cards: [],
  chats: {},
  settings: { autoSpeak: false, rate: 0.9, voice: "" },
  onboarded: false,
});

// Progress, notes and flashcards are saved to the viewer's Claude account (db
// capability, private per person) so they follow them across devices. The browser
// keeps a cache, and also the chats, which are a convenience.
const CHATS_KEY = "camille.chats.v1";
let state = loadLocal();
const remote = { main: null, cards: null, written: {}, timer: null, writing: false };

function loadLocal() {
  const s = defaultState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) deepMerge(s, JSON.parse(raw));
    const chats = localStorage.getItem(CHATS_KEY);
    if (chats) s.chats = JSON.parse(chats);
  } catch {}
  return s;
}
const mainDoc = () => {
  const { profile, progress, notes, settings, onboarded } = state;
  return { profile, progress, notes, settings, onboarded };
};
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...mainDoc(), cards: state.cards }));
    localStorage.setItem(CHATS_KEY, JSON.stringify(state.chats));
  } catch {}
  if (remote.main) {
    clearTimeout(remote.timer);
    remote.timer = setTimeout(flushRemote, 1200);
  }
}
async function flushRemote() {
  if (remote.writing) {
    remote.timer = setTimeout(flushRemote, 600);
    return;
  }
  remote.writing = true;
  try {
    for (const [key, ref, body] of [
      ["main", remote.main, mainDoc()],
      ["cards", remote.cards, { list: state.cards }],
    ]) {
      const json = JSON.stringify(body);
      if (remote.written[key] === json) continue;
      await ref.set(JSON.parse(json));
      remote.written[key] = json;
    }
  } catch (e) {
    if (e?.code === "quota_exceeded") toast("⚠️ Storage full: delete some flashcards");
    else if (e?.code === "unavailable") remote.timer = setTimeout(flushRemote, 3000 + Math.random() * 2000);
  } finally {
    remote.writing = false;
  }
}
async function initAccountStorage() {
  try {
    const [db, user] = await Promise.all([window.claude?.use("db"), window.claude?.use("user")]);
    const uid = db && user ? await user.id() : null;
    if (!uid) return false;
    const mainRef = db.doc(`data/users/${uid}/main`);
    const cardsRef = db.doc(`data/users/${uid}/cards`);
    const [m, c] = await Promise.all([mainRef.get(), cardsRef.get()]);
    if (m.exists) {
      const chats = state.chats;
      state = deepMerge(defaultState(), structuredClone(m.data()));
      state.chats = chats;
      state.cards = c.exists && Array.isArray(c.data().list) ? structuredClone(c.data().list) : [];
      remote.written.main = JSON.stringify(mainDoc());
      remote.written.cards = JSON.stringify({ list: state.cards });
    }
    remote.main = mainRef;
    remote.cards = cardsRef;
    save(); // first visit on this account: uploads what this browser had
    return true;
  } catch {
    return false;
  }
}
function deepMerge(base, extra) {
  for (const [k, v] of Object.entries(extra || {})) {
    base[k] = v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])
      ? deepMerge(base[k], v)
      : v;
  }
  return base;
}

function isoDate(ms = Date.now()) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const today = () => isoDate();
function todayActivity() {
  return (state.progress.activity[today()] ||= { lesson: false, cards: 0, practice: false });
}
function markActive(kind) {
  const a = todayActivity();
  if (kind === "cards") a.cards++;
  else if (kind) a[kind] = true;
  const s = state.progress.streak;
  if (s.last !== today()) {
    s.count = s.last === isoDate(Date.now() - DAY_MS) ? s.count + 1 : 1;
    s.last = today();
  }
  save();
}
function daysLeft() {
  if (!state.profile.departure) return null;
  const dep = new Date(state.profile.departure + "T00:00:00");
  return Math.ceil((dep - new Date(today() + "T00:00:00")) / DAY_MS);
}

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

// ---------- Speech (text-to-speech) ----------
let voices = [];
function loadVoices() {
  voices = (window.speechSynthesis?.getVoices() || []).filter((v) => v.lang?.toLowerCase().startsWith("fr"));
  voices.sort((a, b) => score(b) - score(a));
  function score(v) {
    let s = 0;
    if (/fr[-_]FR/i.test(v.lang)) s += 4;
    if (/google|natural|premium|enhanced|neural|amélie|thomas|audrey|aurélie|denise|henri/i.test(v.name)) s += 2;
    if (v.localService) s += 1;
    return s;
  }
  const sel = $("#voice-select");
  if (sel) {
    sel.innerHTML = voices.length
      ? voices.map((v) => `<option value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join("")
      : `<option value="">No French voice found on this device</option>`;
    sel.value = state.settings.voice || voices[0]?.name || "";
  }
}
if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}
function speak(text, rate = state.settings.rate) {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = rate;
  const v = voices.find((x) => x.name === state.settings.voice) || voices[0];
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
// Text to read aloud: drop corrections, notes and gloss translations.
function speakable(text) {
  return text
    .replace(/\[note\][\s\S]*?(\[\/note\]|$)/g, "")
    .replace(/^✏️.*$/gm, "")
    .replace(/\[\[([^\]|]+)\|[^\]]*\]\]/g, "$1")
    .replace(/\[\/?ecoute\]/g, "\n")
    .replace(/[*_~`#>]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .trim();
}

// ---------- Confirm (the artifact viewer blocks window.confirm) ----------
function askConfirm(message, okLabel = "Oui") {
  const dlg = $("#confirm");
  $("#confirm-text").textContent = message;
  $("#confirm-ok").textContent = okLabel;
  dlg.showModal();
  return new Promise((resolve) => {
    dlg.onclose = () => resolve(dlg.returnValue === "ok");
  });
}

// ---------- Tutor text rendering ----------
function inline(s) {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, fr, en) => {
      const saved = hasCard(unesc(fr)) ? " saved" : "";
      return `<span class="gloss${saved}" data-fr="${fr}" data-en="${en}">${fr}</span>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
function unesc(s) {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
}

function renderTutor(raw, streaming = false) {
  let text = raw.replace(/\[note\][\s\S]*?\[\/note\]/g, "");
  if (streaming) {
    // Hide markup that hasn't been closed yet.
    text = text.replace(/\[note\][\s\S]*$/, "").replace(/\[\[[^\]]*\]?$/, "");
  }
  const audios = [];
  text = text.replace(/\[ecoute\]([\s\S]*?)\[\/ecoute\]/g, (_, a) => {
    audios.push(a.trim());
    return `\n@@AUDIO${audios.length - 1}@@\n`;
  });
  if (/\[ecoute\]/.test(text)) text = text.replace(/\[ecoute\][\s\S]*$/, "\n@@PENDING@@\n");

  const lines = esc(text).split("\n");
  let html = "";
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) html += `<p>${para.map(inline).join("<br>")}</p>`;
    para = [];
  };
  const flushList = () => {
    if (list) html += `<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`;
    list = null;
  };
  for (const line of lines) {
    const t = line.trim();
    let m;
    if (!t) {
      flushPara();
      flushList();
    } else if ((m = t.match(/^@@AUDIO(\d+)@@$/))) {
      flushPara();
      flushList();
      const a = audios[+m[1]];
      html += `<div class="ecoute" data-audio="${esc(a)}"><button data-act="play">▶ Écouter</button><button data-act="slow">🐢 Lentement</button><button data-act="reveal">Voir le texte</button><div class="transcript" hidden>${esc(a)}</div></div>`;
    } else if (t === "@@PENDING@@") {
      flushPara();
      flushList();
      html += `<div class="ecoute pending">Préparation de l'audio…</div>`;
    } else if (t.startsWith("✏️")) {
      flushPara();
      flushList();
      html += `<div class="correction">${inline(t)}</div>`;
    } else if (t.startsWith("💡")) {
      flushPara();
      flushList();
      html += `<div class="hint">${inline(t)}</div>`;
    } else if ((m = t.match(/^#{1,4}\s+(.*)/))) {
      flushPara();
      flushList();
      html += `<h4>${inline(m[1])}</h4>`;
    } else if ((m = t.match(/^[-•]\s+(.*)/)) || (m = t.match(/^\d+[.)]\s+(.*)/))) {
      flushPara();
      const tag = /^\d/.test(t) ? "ol" : "ul";
      if (list && list.tag !== tag) flushList();
      list ||= { tag, items: [] };
      list.items.push(m[1]);
    } else {
      flushList();
      para.push(t);
    }
  }
  flushPara();
  flushList();
  return html;
}

function glossesIn(raw) {
  const out = [];
  for (const m of raw.matchAll(/\[\[([^\]|]+)\|([^\]]+)\]\]/g)) out.push({ fr: m[1].trim(), en: m[2].trim() });
  return out;
}
const textOf = (content) =>
  typeof content === "string" ? content : content.filter((b) => b.type === "text").map((b) => b.text).join("");

// ---------- Flashcards (spaced repetition, SM-2 style) ----------
const norm = (s) => s.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
function hasCard(fr) {
  const n = norm(fr);
  return state.cards.some((c) => norm(c.fr) === n);
}
function addCard(fr, en, quiet = false) {
  if (!fr || !en || hasCard(fr)) return false;
  state.cards.push({ id: crypto.randomUUID?.() || String(Math.random()), fr, en, due: Date.now(), interval: 0, ease: 2.5, reps: 0, lapses: 0, created: Date.now() });
  save();
  if (!quiet) toast(`➕ « ${fr} » ajouté à tes cartes`);
  return true;
}
const dueCards = () => state.cards.filter((c) => c.due <= Date.now()).sort((a, b) => a.due - b.due);

// Returns the card's next scheduling fields for grade g (0 again, 1 hard, 2 good, 3 easy).
function schedule(card, g, now = Date.now()) {
  if (g === 0) {
    return { reps: 0, lapses: card.lapses + 1, interval: 0, ease: Math.max(1.3, card.ease - 0.2), due: now + 60_000 };
  }
  let { interval, ease } = card;
  if (g === 1) {
    interval = card.reps === 0 ? 1 : Math.max(1, interval * 1.2);
    ease = Math.max(1.3, ease - 0.15);
  } else if (g === 2) {
    interval = card.reps === 0 ? 1 : card.reps === 1 ? 3 : interval * ease;
  } else {
    interval = card.reps === 0 ? 4 : Math.max(4, interval * ease * 1.3);
    ease += 0.15;
  }
  return { reps: card.reps + 1, lapses: card.lapses, interval, ease, due: now + interval * DAY_MS };
}
function grade(card, g) {
  Object.assign(card, schedule(card, g));
  markActive("cards");
}
function nextIntervalLabel(card, g) {
  if (g === 0) return "1 min";
  const d = Math.round(schedule(card, g).interval);
  return d < 30 ? `${d} j` : `${Math.round(d / 30)} mois`;
}

// ---------- Views ----------
const VIEWS = ["home", "situations", "course", "chat", "cards"];
let currentChatKey = null;

function go(view) {
  if (view !== "chat") {
    replyCtl?.abort();
    speechSynthesis?.cancel();
    currentChatKey = null;
  }
  for (const v of VIEWS) $(`#view-${v}`).hidden = v !== view;
  hidePopover();
  if (view === "home") renderHome();
  if (view === "situations") renderSituations();
  if (view === "course") renderCourse();
  if (view === "cards") renderCards();
  window.scrollTo(0, 0);
}

function renderStats() {
  const dl = daysLeft();
  $("#stat-countdown").textContent = dl == null ? "" : dl > 0 ? `✈️ J-${dl}` : "🇫🇷 En France !";
  const s = state.progress.streak;
  const alive = s.last === today() || s.last === isoDate(Date.now() - DAY_MS);
  $("#stat-streak").textContent = `🔥 ${alive ? s.count : 0}`;
}

function renderHome() {
  renderStats();
  const name = state.profile.name;
  const h = new Date().getHours();
  $("#hello").textContent = `${h >= 18 ? "Bonsoir" : "Bonjour"}${name ? ", " + name : ""} !`;

  const a = todayActivity();
  const due = dueCards().length;
  const cardsDone = a.cards >= 10 || (due === 0 && state.cards.length > 0);
  const l = lessonFor(state.progress.lessonDay);
  const plan = [
    { done: cardsDone, title: "Révise tes cartes", sub: !state.cards.length ? "Paquet vide pour l'instant" : due ? `${due} à revoir · 5 min` : "Rien à revoir · 5 min", go: "cards" },
    { done: a.lesson, title: `Leçon : ${l.t}`, sub: "20 min", lesson: true },
    { done: a.practice, title: "Écoute ou situation", sub: "5 min", go: a.lesson ? "situations" : "listening" },
  ];
  $("#today-plan").innerHTML = plan
    .map((p, i) => `<li data-i="${i}" class="${p.done ? "done" : ""}"><span class="check">${p.done ? "✓" : i + 1}</span><b>${esc(p.title)}</b><small>${esc(p.sub)}</small></li>`)
    .join("");
  $("#today-plan").onclick = (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const p = plan[+li.dataset.i];
    if (p.lesson) startLesson();
    else if (p.go === "listening") startMode("listening");
    else go(p.go);
  };

  $("#lesson-eyebrow").textContent = `Semaine ${l.week} · Jour ${((l.day - 1) % 7) + 1} — ${l.theme}`;
  $("#lesson-title").textContent = l.t;
  $("#lesson-goals").textContent = l.g;
  const done = Object.keys(state.progress.completed).length;
  $("#course-bar").style.width = `${(Math.min(done, TOTAL_DAYS) / TOTAL_DAYS) * 100}%`;
  $("#course-label").textContent = `${done}/${TOTAL_DAYS} leçons · niveau visé : ${levelFor(l.day)}`;
  const inProgress = state.chats.lesson?.context?.lessonDay === l.day && state.chats.lesson.messages.length > 1;
  $("#btn-lesson").textContent = a.lesson && !inProgress ? "Refaire / continuer demain" : inProgress ? "Reprendre la leçon" : "Commencer la leçon";
  $("#tile-cards").textContent = state.cards.length ? `${state.cards.length} mots · ${due} à revoir` : "Spaced repetition";
}

function renderSituations() {
  $("#scenario-grid").innerHTML = SCENARIOS.map(
    (s) => `<button class="tile" data-scenario="${s.id}"><span>${s.emoji}</span><b>${esc(s.title)}</b><small>${esc(s.en)}</small></button>`,
  ).join("");
}

function renderCourse() {
  const cur = state.progress.lessonDay;
  $("#course-list").innerHTML = WEEKS.map((w, wi) => {
    const days = w.days
      .map((d, di) => {
        const n = wi * 7 + di + 1;
        const cls = [state.progress.completed[n] ? "done" : "", n === cur ? "current" : ""].join(" ");
        return `<button class="day ${cls}" data-day="${n}"><span class="n">J${n}</span><span>${d.review ? "⭐ " : ""}${esc(d.t)}</span></button>`;
      })
      .join("");
    return `<div class="week"><h3>Semaine ${wi + 1} · ${esc(w.theme)}</h3>${days}</div>`;
  }).join("");
}

// ---------- Chat ----------
const MODE_INFO = {
  lesson: { title: "Leçon du jour", kickoff: "Bonjour Camille ! Je suis prêt(e) pour la leçon." },
  situation: { title: "Situation", kickoff: "(Commence la scène.)" },
  listening: { title: "🎧 Écoute", kickoff: "Bonjour ! Je veux travailler la compréhension orale." },
  academic: { title: "🎓 Français académique", kickoff: "Bonjour ! Je veux travailler le français pour l'université." },
  free: { title: "💬 Conversation libre", kickoff: "Bonjour Camille !" },
};

function buildContext(mode, extra = {}) {
  return {
    mode,
    profile: { ...state.profile },
    notes: state.notes.slice(-30),
    lessonDay: state.progress.lessonDay,
    daysLeft: daysLeft(),
    wordsKnown: state.cards.length,
    dueWords: dueCards().slice(0, 12).map((c) => `${c.fr} (${c.en})`),
    ...extra,
  };
}

function startLesson() {
  const day = state.progress.lessonDay;
  const existing = state.chats.lesson;
  if (!existing || existing.context.lessonDay !== day) delete state.chats.lesson;
  openChat("lesson", () => buildContext("lesson"));
}
function startMode(mode) {
  openChat(mode, () => buildContext(mode));
}
function startScenario(id) {
  openChat(`situation:${id}`, () => buildContext("situation", { scenarioId: id }));
}

// The context (and so the system prompt) is frozen when a chat starts, which keeps
// the prompt cache warm and the conversation consistent.
function openChat(key, makeContext) {
  if (!state.chats[key]) {
    const mode = key.split(":")[0];
    state.chats[key] = { context: makeContext(), messages: [{ role: "user", content: MODE_INFO[mode].kickoff, hidden: true }], created: Date.now() };
    save();
  }
  currentChatKey = key;
  go("chat");
  const chat = state.chats[key];
  const mode = chat.context.mode;
  if (mode === "lesson") {
    const l = lessonFor(chat.context.lessonDay);
    $("#chat-title").textContent = `Leçon J${l.day} : ${l.t}`;
    $("#chat-sub").textContent = `Semaine ${l.week} · ${l.theme}`;
  } else if (mode === "situation") {
    const s = SCENARIOS.find((x) => x.id === chat.context.scenarioId);
    $("#chat-title").textContent = `${s.emoji} ${s.title}`;
    $("#chat-sub").textContent = s.en;
  } else {
    $("#chat-title").textContent = MODE_INFO[mode].title;
    $("#chat-sub").textContent = "avec Camille";
  }
  $("#btn-finish").hidden = mode !== "lesson";
  $("#btn-autospeak").textContent = state.settings.autoSpeak ? "🔊" : "🔈";
  renderMessages();
  const last = chat.messages[chat.messages.length - 1];
  if (last.role === "user") requestReply();
  else $("#input").focus();
}

function renderMessages() {
  const chat = state.chats[currentChatKey];
  const box = $("#messages");
  box.innerHTML = "";
  chat.messages.forEach((m, i) => {
    if (m.hidden) return;
    box.appendChild(messageEl(m, i));
  });
  box.scrollTop = box.scrollHeight;
}

function messageEl(m, i) {
  const el = document.createElement("div");
  if (m.role === "user") {
    el.className = "msg me";
    el.textContent = m.content;
    return el;
  }
  const raw = textOf(m.content);
  el.className = "msg tutor";
  el.dataset.i = i;
  el.innerHTML = renderTutor(raw) + toolsHtml(raw);
  return el;
}
function toolsHtml(raw) {
  const n = glossesIn(raw).filter((g) => !hasCard(g.fr)).length;
  return `<div class="tools"><button data-act="speak">🔊 Écouter</button>${n ? `<button data-act="addall">➕ ${n} mot${n > 1 ? "s" : ""} aux cartes</button>` : ""}</div>`;
}

// Claude answers on the viewer's own account through the `sample` capability.
const samplePromise = window.claude ? window.claude.use("sample") : Promise.resolve(null);
const MAX_TURNS = 40;
const SAMPLE_ERRORS = {
  not_granted: "Camille needs your permission to use Claude. Reload the page and choose Allow.",
  sampling_disabled: "Claude isn't available on this account right now.",
  rate_limited: "You've reached your Claude usage limit for now. Take a break and come back later. Flashcards still work!",
  session_expired: "Please sign in to claude.ai again.",
  refused: "Camille couldn't answer that one. Try rephrasing.",
  prompt_too_large: "This conversation is too long. Press ↺ to start a new one.",
};
const HIDE_RETRY = new Set(["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"]);

let busy = false;
let replyCtl = null;
async function requestReply() {
  if (busy) return;
  busy = true;
  const key = currentChatKey;
  const chat = state.chats[key];
  const box = $("#messages");
  const el = document.createElement("div");
  el.className = "msg tutor typing";
  el.innerHTML = `<span class="thinking">Camille réfléchit…</span>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  $("#btn-send").disabled = true;

  try {
    const sample = await samplePromise;
    if (!sample) throw { code: "unavailable_here" };
    // Standing instructions go first as a user turn; then the most recent turns.
    let turns = chat.messages.map(({ role, content }) => ({ role, content: textOf(content) || "…" }));
    if (turns.length > MAX_TURNS) {
      turns = turns.slice(-MAX_TURNS);
      while (turns[0].role !== "user") turns.shift();
    }
    const input = [{ role: "user", content: `${buildSystemPrompt(chat.context)}\n\n(The conversation with the student starts below.)` }, ...turns];
    replyCtl = new AbortController();
    const { text } = await sample(input, {
      cache: false,
      signal: replyCtl.signal,
      modelTier: state.settings.richReplies ? "default" : "quick",
      onText: ({ text }) => {
        if (currentChatKey !== key) return;
        el.innerHTML = renderTutor(text, true);
        box.scrollTop = box.scrollHeight;
      },
    });
    chat.messages.push({ role: "assistant", content: text });
    for (const m of text.matchAll(/\[note\]([\s\S]*?)\[\/note\]/g)) {
      const note = m[1].trim();
      if (note && !state.notes.includes(note)) state.notes.push(note);
    }
    state.notes = state.notes.slice(-40);
    save();
    el.classList.remove("typing");
    el.dataset.i = chat.messages.length - 1;
    el.innerHTML = renderTutor(text) + toolsHtml(text);
    if (state.settings.autoSpeak && currentChatKey === key) speak(speakable(text));
  } catch (err) {
    if (err?.code === "cancelled") {
      el.remove();
      return;
    }
    el.className = "msg error";
    el.textContent = "⚠️ " + (err?.code === "unavailable_here"
      ? "Chatting needs this page to be opened in claude.ai (or the Claude app). Flashcards and the programme work anywhere."
      : SAMPLE_ERRORS[err?.code] || "Couldn't reach Claude. Check your connection and try again.");
    if (!HIDE_RETRY.has(err?.code) && err?.code !== "unavailable_here") {
      const retry = document.createElement("button");
      retry.className = "btn small";
      retry.textContent = "Réessayer";
      retry.style.marginLeft = "8px";
      retry.onclick = () => {
        el.remove();
        requestReply();
      };
      el.appendChild(retry);
    }
  } finally {
    busy = false;
    replyCtl = null;
    $("#btn-send").disabled = false;
    box.scrollTop = box.scrollHeight;
  }
}

function sendUser(text) {
  text = text.trim();
  if (!text || busy || !currentChatKey) return;
  const chat = state.chats[currentChatKey];
  chat.messages.push({ role: "user", content: text });
  const mode = chat.context.mode;
  markActive(mode === "lesson" ? null : "practice");
  save();
  $("#messages").appendChild(messageEl(chat.messages[chat.messages.length - 1]));
  requestReply();
}

function finishLesson() {
  const chat = state.chats.lesson;
  const day = chat?.context.lessonDay ?? state.progress.lessonDay;
  state.progress.completed[day] = today();
  if (day === state.progress.lessonDay) state.progress.lessonDay = Math.min(TOTAL_DAYS, day + 1);
  markActive("lesson");
  delete state.chats.lesson;
  save();
  go("home");
  toast(day === TOTAL_DAYS ? "🎉 Programme terminé ! Tu es prêt(e) pour la France !" : "🎉 Bravo ! Leçon terminée. À demain !");
}

// ---------- Flashcard review UI ----------
let reviewCard = null;
let revealed = false;
function renderCards() {
  renderStats();
  const due = dueCards();
  const a = todayActivity();
  $("#cards-summary").textContent = `${state.cards.length} mot${state.cards.length === 1 ? "" : "s"} dans ton paquet · ${due.length} à revoir maintenant · ${a.cards} révisé${a.cards === 1 ? "" : "s"} aujourd'hui`;
  const area = $("#review-area");
  if (!due.length) {
    reviewCard = null;
    area.innerHTML = state.cards.length
      ? `<div class="card empty"><h3>✨ C'est tout pour le moment !</h3><p class="muted">Come back later or learn new words in a lesson.</p></div>`
      : `<div class="card empty"><h3>Ton paquet est vide</h3><p class="muted">Tap the <span class="gloss">underlined words</span> in Camille's messages and press ➕ to collect them here.</p></div>`;
  } else {
    reviewCard = due[0];
    revealed = false;
    // After two successful reviews, sometimes ask in the other direction (English → French).
    reviewCard._reverse = reviewCard.reps >= 2 && Math.random() < 0.5;
    drawCard();
  }
  renderWordList();
}
function drawCard() {
  const c = reviewCard;
  const area = $("#review-area");
  const front = c._reverse ? c.en : c.fr;
  const back = c._reverse ? c.fr : c.en;
  const prompt = c._reverse ? "Dis-le en français (à voix haute !)" : "Qu'est-ce que ça veut dire ?";
  area.innerHTML = `
    <div class="flashcard" id="flashcard">
      <div class="prompt">${prompt}</div>
      <div class="front">${esc(front)}</div>
      ${revealed ? `<div class="answer">${esc(back)}</div>` : ""}
      <button class="btn small" data-act="say">🔊</button>
    </div>
    ${
      revealed
        ? `<div class="grades">
            <button class="again" data-g="0">Encore<small>${nextIntervalLabel(c, 0)}</small></button>
            <button data-g="1">Difficile<small>${nextIntervalLabel(c, 1)}</small></button>
            <button class="good" data-g="2">Bien<small>${nextIntervalLabel(c, 2)}</small></button>
            <button data-g="3">Facile<small>${nextIntervalLabel(c, 3)}</small></button>
          </div>`
        : `<button class="btn primary" style="width:100%;margin-bottom:18px" data-act="flip">Voir la réponse</button>`
    }`;
  if (!c._reverse && !revealed) speak(c.fr);
  if (c._reverse && revealed) speak(c.fr);
}
function renderWordList() {
  const q = norm($("#word-search").value || "");
  const list = state.cards.filter((c) => !q || norm(c.fr).includes(q) || norm(c.en).includes(q)).sort((a, b) => b.created - a.created);
  $("#word-list-summary").textContent = `📚 Tous mes mots (${state.cards.length})`;
  $("#word-list").innerHTML = list
    .map((c) => `<li><button data-say="${esc(c.fr)}" title="Écouter">🔊</button><span><b>${esc(c.fr)}</b> — ${esc(c.en)}</span><button data-del="${c.id}" title="Supprimer">🗑️</button></li>`)
    .join("");
}

// ---------- Gloss popover ----------
function showPopover(target) {
  const fr = unesc(target.dataset.fr);
  const en = unesc(target.dataset.en);
  const pop = $("#popover");
  const saved = hasCard(fr);
  pop.innerHTML = `<div class="fr">${esc(fr)}</div><div class="en">${esc(en)}</div>
    <div class="row"><button class="btn small" data-act="say">🔊</button>
    <button class="btn small ${saved ? "" : "primary"}" data-act="add" ${saved ? "disabled" : ""}>${saved ? "✓ Dans tes cartes" : "➕ Ajouter"}</button></div>`;
  pop.hidden = false;
  pop._target = target;
  pop._word = { fr, en };
  const r = target.getBoundingClientRect();
  const pw = pop.offsetWidth;
  const ph = pop.offsetHeight;
  let left = Math.min(Math.max(8, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 8);
  let top = r.bottom + 8;
  if (top + ph > window.innerHeight - 8) top = r.top - ph - 8;
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  speak(fr);
}
function hidePopover() {
  $("#popover").hidden = true;
}
function refreshGlossMarks() {
  document.querySelectorAll(".gloss[data-fr]").forEach((g) => g.classList.toggle("saved", hasCard(unesc(g.dataset.fr))));
}

// ---------- Settings ----------
function openSettings(first = false) {
  const f = $("#settings-form");
  for (const k of ["name", "native", "destination", "field", "departure"]) f.elements[k].value = state.profile[k] || "";
  f.elements.rate.value = state.settings.rate;
  f.elements.rich.checked = !!state.settings.richReplies;
  loadVoices();
  $("#settings-title").textContent = first ? "Bienvenue ! 👋" : "Réglages";
  $("#settings-intro").hidden = !first;
  $("#data-tools").hidden = first;
  $("#settings").showModal();
}
$("#settings-form").addEventListener("submit", () => {
  const f = $("#settings-form");
  for (const k of ["name", "native", "destination", "field", "departure"]) state.profile[k] = f.elements[k].value.trim();
  state.settings.rate = parseFloat(f.elements.rate.value) || 0.9;
  state.settings.voice = f.elements.voice.value;
  state.settings.richReplies = f.elements.rich.checked;
  state.onboarded = true;
  save();
  renderHome();
});
$("#btn-test-voice").onclick = () => {
  const f = $("#settings-form");
  state.settings.voice = f.elements.voice.value;
  speak("Bonjour ! Je m'appelle Camille. On va bien s'amuser.", parseFloat(f.elements.rate.value));
};
$("#btn-reset").onclick = async () => {
  $("#settings").close();
  if (!(await askConfirm("Delete ALL your progress, flashcards and chats? This cannot be undone.", "Tout effacer"))) return;
  state = defaultState();
  save();
  go("home");
  openSettings(true);
};

// ---------- Events ----------
document.addEventListener("click", (e) => {
  const t = e.target;
  const goBtn = t.closest("[data-go]");
  if (goBtn) return go(goBtn.dataset.go);
  const modeBtn = t.closest("[data-mode]");
  if (modeBtn) return startMode(modeBtn.dataset.mode);
  const sc = t.closest("[data-scenario]");
  if (sc) return startScenario(sc.dataset.scenario);
  const day = t.closest("[data-day]");
  if (day) {
    const n = +day.dataset.day;
    const jump = () => {
      state.progress.lessonDay = n;
      save();
      startLesson();
    };
    if (n > state.progress.lessonDay && !state.progress.completed[n]) {
      askConfirm(`Skip ahead to day ${n}? You can always come back.`, "Aller au jour " + n).then((ok) => ok && jump());
    } else jump();
    return;
  }

  const gloss = t.closest(".gloss[data-fr]");
  const pop = $("#popover");
  if (gloss) return showPopover(gloss);
  if (t.closest("#popover")) {
    const act = t.closest("[data-act]")?.dataset.act;
    if (act === "say") speak(pop._word.fr);
    if (act === "add" && addCard(pop._word.fr, pop._word.en)) {
      refreshGlossMarks();
      showPopover(pop._target);
    }
    return;
  }
  hidePopover();

  const eco = t.closest(".ecoute[data-audio]");
  if (eco) {
    const act = t.closest("[data-act]")?.dataset.act;
    const audio = eco.dataset.audio;
    if (act === "play") speak(audio);
    if (act === "slow") speak(audio, Math.max(0.55, state.settings.rate - 0.25));
    if (act === "reveal") {
      const tr = eco.querySelector(".transcript");
      tr.hidden = !tr.hidden;
      t.textContent = tr.hidden ? "Voir le texte" : "Cacher le texte";
    }
    return;
  }

  const msg = t.closest(".msg.tutor[data-i]");
  const msgAct = t.closest(".tools [data-act]")?.dataset.act;
  if (msg && msgAct && currentChatKey) {
    const raw = textOf(state.chats[currentChatKey].messages[+msg.dataset.i].content);
    if (msgAct === "speak") speak(speakable(raw));
    if (msgAct === "addall") {
      const n = glossesIn(raw).filter((g) => addCard(g.fr, g.en, true)).length;
      toast(`➕ ${n} mot${n > 1 ? "s" : ""} ajouté${n > 1 ? "s" : ""} à tes cartes`);
      t.remove();
      refreshGlossMarks();
    }
    return;
  }

  const chip = t.closest("#chips [data-say]");
  if (chip) return sendUser(chip.dataset.say);

  const say = t.closest("[data-say]");
  if (say) return speak(say.dataset.say);
  const del = t.closest("[data-del]");
  if (del) {
    state.cards = state.cards.filter((c) => c.id !== del.dataset.del);
    save();
    return renderCards();
  }

  if (!$("#view-cards").hidden && reviewCard) {
    const act = t.closest("[data-act]")?.dataset.act;
    if (act === "flip") {
      revealed = true;
      drawCard();
    } else if (act === "say") speak(reviewCard.fr);
    const g = t.closest("[data-g]");
    if (g) {
      delete reviewCard._reverse;
      grade(reviewCard, +g.dataset.g);
      save();
      renderCards();
    }
  }
});

document.addEventListener("keydown", (e) => {
  if ($("#view-cards").hidden || !reviewCard || e.target.matches("input, textarea")) return;
  if (!revealed && (e.key === " " || e.key === "Enter")) {
    e.preventDefault();
    revealed = true;
    drawCard();
  } else if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
    delete reviewCard._reverse;
    grade(reviewCard, +e.key - 1);
    save();
    renderCards();
  }
});

$("#btn-lesson").onclick = startLesson;
$("#btn-settings").onclick = () => openSettings(false);
$("#chat-back").onclick = () => go("home");
$("#btn-finish").onclick = finishLesson;
$("#btn-autospeak").onclick = () => {
  state.settings.autoSpeak = !state.settings.autoSpeak;
  save();
  $("#btn-autospeak").textContent = state.settings.autoSpeak ? "🔊" : "🔈";
  toast(state.settings.autoSpeak ? "Lecture automatique activée" : "Lecture automatique désactivée");
  if (!state.settings.autoSpeak) speechSynthesis?.cancel();
};
$("#btn-restart").onclick = async () => {
  if (!currentChatKey || busy || !(await askConfirm("Start this conversation over?", "Recommencer"))) return;
  const key = currentChatKey;
  delete state.chats[key];
  save();
  if (key === "lesson") startLesson();
  else if (key.startsWith("situation:")) startScenario(key.split(":")[1]);
  else startMode(key);
};

const input = $("#input");
function autosize() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
}
input.addEventListener("input", autosize);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    $("#composer-form").requestSubmit();
  }
});
$("#composer-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (busy) return;
  const v = input.value;
  input.value = "";
  autosize();
  sendUser(v);
});
$("#add-card-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  if (addCard(f.fr.value.trim(), f.en.value.trim())) {
    f.reset();
    renderCards();
  } else toast("Already in your deck");
});
$("#word-search").addEventListener("input", renderWordList);

// ---------- Boot ----------
go("home");
initAccountStorage().then((synced) => {
  $("#sync-status").textContent = synced
    ? "✅ Your progress and flashcards are saved to your Claude account, so they follow you on every device."
    : "Your progress is saved in this browser only.";
  if (!currentChatKey) go(!$("#view-cards").hidden ? "cards" : "home");
  if (!state.onboarded && !$("#settings").open) openSettings(true);
});
