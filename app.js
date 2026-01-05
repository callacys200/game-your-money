const PASS_SCORE = 3;
const QUESTIONS_PER_MODULE = 5;
const INFO_CARDS_PER_MODULE = 4;
const storageKey = "module_progress_fs_v1";

const modulesData = [
  {
    id: 1,
    title: "Module 1",
    desc: "Basics",
    questions: [
      q("What is 2 + 2?", ["3","4","5","6"], 1),
      q("Which is a fruit?", ["Carrot","Apple","Celery","Onion"], 1),
      q("HTML stands for?", ["HyperText Markup Language","HighText Makeup Language","Home Tool Markup Language","None"], 0),
      q("CSS is used for?", ["Logic","Styling","Database","Hosting"], 1),
      q("JS runs mostly in the…", ["Browser","Microwave","Printer","Calculator"], 0),
    ]
  },
  {
    id: 2,
    title: "Module 2",
    desc: "Intermediate",
    questions: [
      q("LocalStorage saves data in…", ["RAM","Browser","CPU","Monitor"], 1),
      q("Which is NOT a JS datatype?", ["string","boolean","pizza","number"], 2),
      q("HTTP status 404 means…", ["OK","Not Found","Unauthorized","Server Down"], 1),
      q("A function is…", ["A loop","Reusable code block","A style rule","A database"], 1),
      q("DOM stands for…", ["Data Object Model","Document Object Model","Display Output Mode","None"], 1),
    ]
  },
  {
    id: 3,
    title: "Module 3",
    desc: "Advanced",
    questions: [
      q("GET request is mainly for…", ["Deleting","Reading","Writing","Encrypting"], 1),
      q("JSON is…", ["A database","A format","A framework","A browser"], 1),
      q("Which is a JS framework?", ["React","Photoshop","Excel","Chrome"], 0),
      q("API means…", ["App Power Input","Application Programming Interface","Apple Pie Invention","None"], 1),
      q("Promise is used for…", ["Async code","CSS","HTML","Images"], 0),
    ]
  },
  {
    id: 4,
    title: "Module 4",
    desc: "Boss Level",
    questions: [
      q("CORS is related to…", ["Security","Fonts","Pixels","Math"], 0),
      q("Bearer token commonly used in…", ["Auth","CSS","HTML tables","Images"], 0),
      q("POST request is mainly for…", ["Reading","Creating","Caching","Printing"], 1),
      q("Env variables are used to…", ["Hide secrets","Make UI pretty","Create images","Boost FPS"], 0),
      q("A 500 error means…", ["Client issue","Server issue","Not Found","Redirect"], 1),
    ]
  }
];

const infoTopics = [
  { title: "Sleep", text: "Aim for 8–10 hours (teen). Keep the room cool + stop scrolling 30–60 mins before bed." },
  { title: "Food", text: "Energy crash? Try water + protein (yogurt/eggs/chicken/beans) + a fruit." },
  { title: "Hydration", text: "Tired + headache? Drink water first. Most people are dehydrated and don’t realize it." },
  { title: "Study Focus", text: "25 min locked in + 5 min break. Phone far away or your brain is cooked." },
  { title: "Fitness", text: "Start small: push-ups, squats, walking. Consistency > intensity." },
  { title: "Stress", text: "Stress is energy. Put it into a plan, not panic. Write the next 1–2 actions." },
  { title: "Time", text: "Pick 3 important tasks/day. If you do those, you won." },
  { title: "Mind Reset", text: "Breathe in 4, hold 4, out 6. Repeat 5 times. Works weirdly well." },
  { title: "Social Media", text: "Highlights aren’t real life. If scrolling makes you feel worse, it’s algorithm farming." },
  { title: "Confidence", text: "Confidence is proof. Stack small wins daily and it builds automatically." }
];

function q(prompt, choices, answerIndex){ return { prompt, choices, answerIndex }; }

function loadProgress(){
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { unlockedUpTo: 1, bestScores: {} };
  try { return JSON.parse(raw); } catch { return { unlockedUpTo: 1, bestScores: {} }; }
}
function saveProgress(p){ localStorage.setItem(storageKey, JSON.stringify(p)); }

let progress = loadProgress();
let activeModuleId = 1;

const modulesEl = document.getElementById("modules");
const infoView = document.getElementById("infoView");
const quizView = document.getElementById("quizView");
const infoTab = document.getElementById("infoTab");
const quizTab = document.getElementById("quizTab");
const aiTab = document.getElementById("aiTab");
const resetBtn = document.getElementById("resetBtn");

const panelModuleName = document.getElementById("panelModuleName");
const panelSub = document.getElementById("panelSub");

const progressText = document.getElementById("progressText");
const barFill = document.getElementById("barFill");

const shuffleInfoBtn = document.getElementById("shuffleInfoBtn");
const infoCards = document.getElementById("infoCards");

const aiInput = document.getElementById("aiInput");
const aiAskBtn = document.getElementById("aiAskBtn");
const aiAnswer = document.getElementById("aiAnswer");

const healthChip = document.getElementById("healthChip");

init();

async function init(){
  renderModules();
  openModule(activeModuleId);
  setupTabs();
  setupButtons();
  updateOverallProgress();
  await checkHealth();
}

function setupButtons(){
  resetBtn.onclick = () => {
    progress = { unlockedUpTo: 1, bestScores: {} };
    saveProgress(progress);
    renderModules();
    openModule(1);
    updateOverallProgress();
  };

  shuffleInfoBtn.onclick = () => renderInfoCards(activeModuleId);

  aiAskBtn.onclick = askAI;
}

async function checkHealth(){
  try{
    const r = await fetch("/api/health");
    const data = await r.json();
    healthChip.textContent = (data.ok && data.hasKey) ? "🧠 AI: ready" : "🧠 AI: missing key";
  } catch {
    healthChip.textContent = "🧠 AI: server?";
  }
}

function renderModules(){
  modulesEl.innerHTML = "";
  modulesData.forEach(m => {
    const locked = m.id > progress.unlockedUpTo;
    const best = progress.bestScores[m.id] ?? null;

    const btn = document.createElement("button");
    btn.className = "moduleBtn" + (locked ? " locked" : "");
    btn.innerHTML = `
      <div class="badge">
        <span class="${locked ? "pillBad" : "pillGood"}">${locked ? "🔒 Locked" : "✅ Unlocked"}</span>
        <span>Level ${m.id}</span>
        ${best !== null ? `<span>Best: ${best}/5</span>` : ``}
      </div>
      <h2>${m.title}</h2>
      <p class="desc">${m.desc}</p>
    `;

    btn.onclick = () => { if (!locked) openModule(m.id); };
    modulesEl.appendChild(btn);
  });
}

function openModule(id){
  activeModuleId = id;
  const mod = modulesData.find(x => x.id === id);

  panelModuleName.textContent = mod.title;
  panelSub.textContent = `Pass: ${PASS_SCORE}/${QUESTIONS_PER_MODULE} to unlock the next module.`;

  renderInfoCards(id);
  renderQuiz(mod);
  setTab("info");
}

function renderInfoCards(){
  const picked = pickRandom(infoTopics, INFO_CARDS_PER_MODULE);
  infoCards.innerHTML = "";
  picked.forEach(t => {
    const card = document.createElement("div");
    card.className = "infoCard";
    card.innerHTML = `<h3>${t.title}</h3><p>${t.text}</p>`;
    infoCards.appendChild(card);
  });
}

function pickRandom(arr, n){
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function renderQuiz(mod){
  quizView.innerHTML = "";
  const form = document.createElement("form");

  mod.questions.slice(0, QUESTIONS_PER_MODULE).forEach((qq, idx) => {
    const card = document.createElement("div");
    card.className = "q";
    card.innerHTML = `<h3>${idx+1}. ${qq.prompt}</h3>`;

    const choices = document.createElement("div");
    choices.className = "choices";

    qq.choices.forEach((c, cIdx) => {
      const label = document.createElement("label");
      label.className = "choice";
      label.innerHTML = `
        <input type="radio" name="q${idx}" value="${cIdx}" />
        <span>${c}</span>
      `;
      choices.appendChild(label);
    });

    card.appendChild(choices);
    form.appendChild(card);
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "btnPrimary";
  submit.textContent = "Submit Quiz";

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "btnGhost";
  clear.textContent = "Clear Answers";
  clear.onclick = () => form.reset();

  actions.appendChild(submit);
  actions.appendChild(clear);
  form.appendChild(actions);

  const result = document.createElement("div");
  result.className = "result";
  result.textContent = "Answer all 5 questions, then submit.";
  form.appendChild(result);

  form.onsubmit = (e) => {
    e.preventDefault();

    const answers = [];
    for (let i = 0; i < QUESTIONS_PER_MODULE; i++){
      const picked = form.querySelector(`input[name="q${i}"]:checked`);
      answers.push(picked ? Number(picked.value) : null);
    }

    if (answers.includes(null)){
      result.textContent = "Answer all 5 first 😭";
      return;
    }

    let score = 0;
    answers.forEach((a, i) => {
      if (a === mod.questions[i].answerIndex) score++;
    });

    const prevBest = progress.bestScores[mod.id] ?? 0;
    if (score > prevBest) progress.bestScores[mod.id] = score;

    let msg = `You scored ${score}/${QUESTIONS_PER_MODULE}.`;

    if (score >= PASS_SCORE){
      msg += ` ✅ Pass!`;
      if (mod.id === progress.unlockedUpTo && mod.id < modulesData.length){
        progress.unlockedUpTo = mod.id + 1;
        msg += ` Module ${mod.id + 1} unlocked 🔓`;
      }
    } else {
      msg += ` ❌ Need at least ${PASS_SCORE}/${QUESTIONS_PER_MODULE} to unlock next module.`;
    }

    saveProgress(progress);
    renderModules();
    updateOverallProgress();
    result.textContent = msg;
  };

  quizView.appendChild(form);
}

function setupTabs(){
  infoTab.onclick = () => setTab("info");
  quizTab.onclick = () => setTab("quiz");
  aiTab.onclick = () => setTab("ai");
}

function setTab(which){
  [infoTab, quizTab, aiTab].forEach(x => x.classList.remove("active"));
  [infoView, quizView, document.getElementById("aiView")].forEach(x => x.classList.remove("active"));

  if (which === "info"){ infoTab.classList.add("active"); infoView.classList.add("active"); }
  if (which === "quiz"){ quizTab.classList.add("active"); quizView.classList.add("active"); }
  if (which === "ai"){ aiTab.classList.add("active"); document.getElementById("aiView").classList.add("active"); }
}

function updateOverallProgress(){
  const total = modulesData.length;
  const countUnlocked = Math.min(progress.unlockedUpTo, total);
  progressText.textContent = `${countUnlocked}/${total} Unlocked`;
  barFill.style.width = `${Math.round((countUnlocked / total) * 100)}%`;
}

async function askAI(){
  const question = aiInput.value.trim();
  if (!question){
    aiAnswer.textContent = "Type something first 😭";
    return;
  }

  const mod = modulesData.find(m => m.id === activeModuleId);
  aiAnswer.textContent = "Thinking...";

  try {
    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, moduleTitle: mod.title })
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data?.details || data?.error || "Request failed");
    aiAnswer.textContent = data.answer || "No answer returned.";
  } catch (e) {
    aiAnswer.textContent = `Error: ${e.message}`;
  }
}
