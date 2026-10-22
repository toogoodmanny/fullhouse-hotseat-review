/* Hotseat landing page v5 (index.html).
   Needs GSAP + ScrollTrigger + lottie (cdnjs) before it, brand/fullhouse.js after it.
   Optional parts (rotating questions, demo video, struck-through call) are skipped when absent. */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const wa = t => "https://wa.me/?text=" + encodeURIComponent(t);
const APP = { quiz: "https://dailyfullhouse.app.link/oldBollywood", memory: "https://dailyfullhouse.app.link/memory", react: "https://dailyfullhouse.app.link/shapeMatch" };

/* ---------- Debug labels + claim tags toggle (draft only) ---------- */
(() => {
  let on = false;
  try { on = localStorage.getItem("fh-dbg") === "on"; } catch (e) {}
  const btn = $("#dbgToggle");
  const apply = () => { document.documentElement.classList.toggle("dbg", on); btn.textContent = on ? "Labels on" : "Labels off"; };
  btn.onclick = () => { on = !on; try { localStorage.setItem("fh-dbg", on ? "on" : "off"); } catch (e) {} apply(); };
  apply();
})();

$("#sibling").href = wa("Mummy-Papa ke liye ek idea: a card that opens a new KBC-style quiz, game or story on their phone every day. Kya unko pasand aayega? https://fullhouse.app");

/* ---------- After you order: one pinned scene, three beats (card loaded, one tap, friends play free) ---------- */
gsap.registerPlugin(ScrollTrigger);
function fitStage() {
  const mobile = innerWidth <= 960;
  const availH = mobile ? innerHeight * .5 : innerHeight * .9, availW = mobile ? innerWidth : innerWidth / 2;
  $("#sStage").style.setProperty("--k", Math.min(1, availH / 600, availW / 440).toFixed(3));
}
fitStage(); addEventListener("resize", fitStage);
// The app's splash (sunburst, objects pop in, ticket logo), played in real time when the card taps the phone.
const splash = gsap.timeline({ paused: true })
  .set(".sp-splash", { autoAlpha: 1 }).set(".sp-game", { autoAlpha: 0 })
  .fromTo(".sp-rays", { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: "power1.out" })
  .fromTo(".sp-o", { autoAlpha: 0, scale: 2.5 }, { autoAlpha: 1, scale: 1, duration: .9, ease: "elastic.out(1, .55)", stagger: .04 }, .25)
  .fromTo(".sp-logo", { autoAlpha: 0, scale: .3 }, { autoAlpha: 1, scale: 1, duration: .8, ease: "elastic.out(1, .5)" }, .6)
  .to(".sp-game", { autoAlpha: 1, duration: .3 }, 1.7);
(() => {
  const sc = $$(".sc"), rail = $$(".rail b"), card = ".hs-card";
  gsap.set(sc[0], { autoAlpha: 1 });
  // no snap: snapping fought the reader's own scroll and pulled them back up
  const st = gsap.timeline({ defaults: { ease: "power2.inOut" },
    scrollTrigger: { trigger: "#story", start: "top top", end: "+=" + (reduced ? 1600 : 2200), pin: true, scrub: reduced ? true : .5 } });
  const beat = (i, at) => st.to(sc[i - 1], { autoAlpha: 0, y: -20, duration: .2 }, at).fromTo(sc[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .25 }, at + .15);
  // one: their login is written onto the card
  st.fromTo(".s-loadcard", { autoAlpha: 0, y: 30, rotate: -4 }, { autoAlpha: 1, y: 0, rotate: -4, duration: .25 }, 0)
    .fromTo(".lc-scan", { xPercent: -120 }, { xPercent: 420, duration: .5, ease: "none" }, .15)
    .fromTo(".s-loadinfo", { autoAlpha: 0 }, { autoAlpha: 1, duration: .15 }, .15)
    .fromTo(".lc-bar i", { scaleX: 0 }, { scaleX: 1, duration: .45, ease: "none" }, .2)
    .fromTo(".s-load", { autoAlpha: 0, scale: .85 }, { autoAlpha: 1, scale: 1, duration: .15, ease: "back.out(2)" }, .66)
    .to(rail[0], { scaleX: 1, duration: 1, ease: "none" }, 0);
  beat(1, 1);
  // two: the phone; the card taps it; the splash plays, then today's quiz
  st.to(".s-loadinfo", { autoAlpha: 0, duration: .15 }, 1)
    .to(".s-loadcard", { autoAlpha: 0, duration: .15 }, 1.05)
    .fromTo(".s-phone", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .3 }, 1.05)
    .fromTo(card, { autoAlpha: 0, x: 300, y: 420, rotate: 10, scale: .7 }, { autoAlpha: 1, x: 150, y: 330, rotate: -12, scale: .7, duration: .3 }, 1.2)
    .fromTo(".rip1", { scale: .3, autoAlpha: .9 }, { scale: 1.7, autoAlpha: 0, duration: .25, stagger: .08, ease: "power1.out", immediateRender: false }, 1.5)
    .call(() => { if (st.scrollTrigger.direction > 0) reduced ? splash.progress(1) : splash.restart(); else { splash.pause(0); gsap.set(".sp-splash", { autoAlpha: 0 }); } }, null, 1.5)
    .to(card, { y: 470, autoAlpha: 0, duration: .25 }, 1.65)
    .to(rail[1], { scaleX: 1, duration: 1, ease: "none" }, 1);
  beat(2, 2);
  // three: friends' phones; the same card taps each one
  st.to(".s-phone", { autoAlpha: 0, scale: .92, duration: .2 }, 2)
    .fromTo(".s-friend", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: .25, stagger: .06 }, 2.05)
    .set(card, { x: -10, y: 420, rotate: -10, scale: .55 }, 2.2);
  [".f1", ".f2", ".f3"].forEach((f, i) => {
    const t = 2.3 + i * .2;
    st.to(card, { autoAlpha: 1, x: [15, 150, 285][i], y: 300, rotate: -10, scale: .55, duration: .1 }, t)
      .to(f + " .fr-lock", { autoAlpha: 0, duration: .06 }, t + .1);
  });
  st.to(card, { y: 470, autoAlpha: 0, duration: .15 }, 2.95)
    .to(rail[2], { scaleX: 1, duration: 1, ease: "none" }, 2)
    .to({}, { duration: .1 }, 3);
})();

/* ---------- Order bar: pinned on every screen after the hero ---------- */
new IntersectionObserver(([e]) => { $("#buybar").classList.toggle("on", !e.isIntersecting); document.documentElement.classList.toggle("past-hero", !e.isIntersecting); }).observe($("#top"));

/* ---------- Sound (the app's own sound effects) ---------- */
let soundOn = true;
const sfx = Object.fromEntries(["optionlock", "correct", "losing", "flip", "on-tap", "complete"].map(n => [n, Object.assign(new Audio(`assets/sfx/${n}.mp3`), { preload: "auto" })]));
const play = n => { if (!soundOn) return; const a = sfx[n]; a.currentTime = 0; a.play().catch(() => {}); };
$("#sound").onclick = e => { soundOn = !soundOn; e.currentTarget.setAttribute("aria-pressed", soundOn); $("#wv").style.display = soundOn ? "" : "none"; };

/* ---------- This week's Hotseat (playable phone) ---------- */
const QUIZ = {
  annas: { q: "In 1950, how many annas made one rupee?", o: ["8", "12", "16", "64"], a: 2 },
  blr: { q: "If you start walking north from Bangalore, which state will you enter first?", o: ["Tamil Nadu", "Telangana", "Andhra Pradesh", "Maharashtra"], a: 2 },
  wc: { q: "In which year did India first win the Cricket World Cup?", o: ["1975", "1983", "1987", "2011"], a: 1 },
  film: { q: "Which of these films released first?", o: ["Sholay", "Bobby", "Mughal-e-Azam", "Anand"], a: 2 },
};
const WEEK = [
  { d: "Mon", t: "Quiz", type: "quiz", key: "annas" },
  { d: "Tue", t: "Game", type: "memory" },
  { d: "Wed", t: "Story", type: "story", prompt: "Tell us about your grandmother's kitchen. What did it smell like?" },
  { d: "Thu", t: "Quiz", type: "quiz", key: "blr" },
  { d: "Fri", t: "Game", type: "react" },
  { d: "Sat", t: "Quiz", type: "quiz", key: "wc" },
  { d: "Sun", t: "Story", type: "story", prompt: "What's the one dish your mother made that nobody else can?" },
];
const todayIdx = (new Date().getDay() + 6) % 7;
let cur = todayIdx, timers = [];
const later = (f, ms) => timers.push(setTimeout(f, ms));
const card = $("#card"), week = $("#week");
let points = 120;
function addPoints(n) {
  const el = $("#points"), from = points; points += n;
  gsap.to({ v: from }, { v: points, duration: .9, ease: "power2.out", onUpdate() { el.textContent = Math.round(this.targets()[0].v); } });
  gsap.fromTo(".pts", { scale: 1 }, { scale: 1.18, yoyo: true, repeat: 1, duration: .18 });
}

WEEK.forEach((w, i) => {
  const b = document.createElement("button");
  b.className = "tk"; b.id = "tk" + i; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "card");
  b.innerHTML = `${i === todayIdx ? '<span class="today-tag">today!</span>' : ""}<b>${w.d}</b><small>${w.t}</small>`;
  b.onclick = () => { play("on-tap"); select(i); };
  week.appendChild(b);
});
week.onkeydown = e => {
  const k = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" }[e.key];
  if (k === undefined) return;
  e.preventDefault(); play("on-tap");
  select(k === "first" ? 0 : k === "last" ? 6 : (cur + k + 7) % 7);
  $$(".tk", week)[cur].focus();
};
$("#prevDay").onclick = () => { play("on-tap"); select((cur + 6) % 7); };
$("#nextDay").onclick = () => { play("on-tap"); select((cur + 1) % 7); };

function select(i, first = false) {
  timers.forEach(clearTimeout); timers = [];
  $("#coins").hidden = true;
  cur = i;
  $$(".tk", week).forEach((b, j) => { b.setAttribute("aria-selected", j === i); b.tabIndex = j === i ? 0 : -1; });
  card.setAttribute("aria-labelledby", "tk" + i);
  const render = () => { const w = WEEK[i]; card.classList.toggle("is-story", w.type === "story"); ({ quiz: quizCard, memory: memCard, react: reactCard, story: storyCard })[w.type](w); };
  if (first || reduced) return render();
  gsap.to(card, { autoAlpha: 0, x: -24, duration: .18, ease: "power2.in", onComplete() { render(); gsap.fromTo(card, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: .32, ease: "power3.out" }); } });
}
const badge = w => w === WEEK[todayIdx] ? "Today" : w.d;

function quizCard(w, flipped = false) {
  timers.forEach(clearTimeout); timers = [];
  const it = QUIZ[flipped ? "film" : w.key];
  card.innerHTML = `
    <div class="c-title"><span>Answer today's quiz</span><i>${badge(w)}</i></div>
    <div class="prog"><span class="done">✓</span><span class="done">✓</span><span>3</span><span>4</span><span>5</span></div>
    <div class="q">${it.q}</div>
    <div class="opts">${it.o.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join("")}</div>
    <div class="toast" id="vd"></div>
    <div class="lls"><p>Life Lines</p><div class="ll"><button id="l50">50-50</button><button id="lfl" ${flipped ? "disabled" : ""}>Flip Question</button><button id="lph">Phone a Friend</button></div></div>`;
  const opts = $$(".opt", card), vd = $("#vd", card);
  const msg = `Fullhouse ka aaj ka sawaal 📞\n\n${it.q}\n${it.o.map((o, k) => "ABCD"[k] + ") " + o).join("\n")}\n\nAapka jawab?\n\nKhelo yahan: ${APP.quiz}`;
  if (!reduced) gsap.from(opts, { y: 14, scale: .94, stagger: .05, duration: .4, ease: "back.out(1.6)", clearProps: "transform" });
  opts.forEach(b => b.onclick = () => {
    $$(".opt, .ll button", card).forEach(x => x.disabled = true);
    b.classList.add("lock"); play("optionlock");
    vd.innerHTML = "<b>Lock kiya jaye?</b> …"; vd.classList.add("show");
    later(() => {
      const k = +b.dataset.k, ok = k === it.a;
      sfx.optionlock.pause();
      b.classList.remove("lock");
      opts.forEach((x, j) => { if (j !== it.a && j !== k) x.classList.add("dim"); });
      opts[it.a].classList.add("right");
      if (ok) {
        play("correct"); coins(); addPoints(10);
        vd.innerHTML = `<b>Sahi jawab! +10 points.</b> Send it to Mummy-Papa and see what they say. <a href="${wa(msg)}" target="_blank" rel="noopener">Send it →</a>`;
      } else {
        b.classList.add("wrong"); play("losing");
        vd.innerHTML = `It's <b>${it.o[it.a]}</b>. No harm done, there's a new one tomorrow. <a href="${wa(msg)}" target="_blank" rel="noopener">Ask Mummy-Papa →</a>`;
      }
    }, 1900);
  });
  $("#l50", card).onclick = e => { play("on-tap"); e.currentTarget.disabled = true;
    [0, 1, 2, 3].filter(k => k !== it.a).sort(() => Math.random() - .5).slice(0, 2).forEach(k => opts[k].classList.add("gone")); };
  $("#lfl", card).onclick = () => { play("flip"); quizCard(w, true); };
  $("#lph", card).onclick = e => { play("on-tap"); e.currentTarget.disabled = true;
    vd.innerHTML = `<b>Phone a friend:</b> ask Mummy-Papa, they usually know. <a href="${wa(msg)}" target="_blank" rel="noopener">Open WhatsApp →</a>`; vd.classList.add("show"); };
}

function memCard(w) {
  const faces = ["radio", "ticket", "ball", "tv"];
  const deck = [...faces, ...faces].sort(() => Math.random() - .5);
  card.innerHTML = `
    <div class="c-title"><span>Memory match</span><i>${w.d}</i></div>
    <p class="verdict" style="margin-top:8px">Find the pairs.</p>
    <div class="mem">${deck.map(f => `<button class="tile" data-f="${f}" aria-label="Face-down tile"><span class="b"><svg viewBox="0 0 24 24"><use href="#star"/></svg></span><span class="f"><img src="assets/${f}.png" alt=""></span></button>`).join("")}</div>
    <div class="verdict" id="vd"></div>`;
  let open = [], moves = 0, done = 0;
  const tiles = $$(".tile", card), vd = $("#vd", card);
  tiles.forEach(t => t.onclick = () => {
    if (open.length === 2 || t.classList.contains("up") || t.classList.contains("done")) return;
    play("flip"); t.classList.add("up"); t.setAttribute("aria-label", t.dataset.f); open.push(t);
    if (open.length < 2) return;
    moves++;
    const [a, b] = open;
    if (a.dataset.f === b.dataset.f) {
      later(() => { a.classList.add("done"); b.classList.add("done"); open = []; done += 2; play("correct");
        if (done === 8) { coins(); addPoints(20); play("complete");
          vd.innerHTML = `<b>Done in ${moves} moves! +20 points.</b> <a href="${wa(`Fullhouse memory game: I did it in ${moves} moves. Aap kitne mein karoge? 😄\nKhelo yahan: ${APP.memory}`)}" target="_blank" rel="noopener">Challenge Papa →</a>`; }
      }, 350);
    } else later(() => { a.classList.remove("up"); b.classList.remove("up"); a.setAttribute("aria-label", "Face-down tile"); b.setAttribute("aria-label", "Face-down tile"); open = []; }, 850);
  });
}

function reactCard(w) {
  card.innerHTML = `
    <div class="c-title"><span>Reaction time</span><i>${w.d}</i></div>
    <p class="verdict" style="margin-top:8px">Tap the diya the moment it lights.</p>
    <button class="diya" id="diya" aria-label="Diya"><svg viewBox="0 0 100 100">
      <path class="flame" d="M50 12c9 13 13 21 13 29a13 13 0 0 1-26 0c0-8 4-16 13-29z" fill="#fff7d6"/>
      <path class="flame" d="M50 26c4 7 6 11 6 15a6 6 0 0 1-12 0c0-4 2-8 6-15z" fill="#ffb12e"/>
      <path d="M12 60h76c-4 15-19 24-38 24S16 75 12 60z" fill="#b85d17"/><ellipse cx="50" cy="60" rx="38" ry="7" fill="#e38b38"/><ellipse cx="50" cy="59" rx="26" ry="4" fill="#7a3b0c"/></svg></button>
    <div class="verdict center" id="vd">Tap the diya to start.</div>`;
  let state = "idle", t0 = 0, best = null;
  const diya = $("#diya", card), vd = $("#vd", card);
  diya.onclick = () => {
    if (state === "idle") { state = "wait"; vd.textContent = "Wait for it…"; play("on-tap");
      later(() => { state = "lit"; diya.classList.add("lit"); t0 = performance.now(); }, 1200 + Math.random() * 2300); }
    else if (state === "wait") { timers.forEach(clearTimeout); state = "idle"; play("losing"); vd.textContent = "Too soon! Tap to try again."; }
    else { const ms = Math.round(performance.now() - t0); best = best === null ? ms : Math.min(best, ms);
      state = "idle"; diya.classList.remove("lit"); play("correct");
      vd.innerHTML = `<b>${ms} ms.</b> Best ${best} ms. Again, or <a href="${wa(`Fullhouse diya game: my best is ${best} ms. Aap try karo! 🪔\nKhelo yahan: ${APP.react}`)}" target="_blank" rel="noopener">dare Mummy →</a>`; }
  };
}

function storyCard(w) {
  // the app's own "Share a Memory" screen (Story Time art cropped from assets/live/prompt-screenshot.webp)
  card.innerHTML = `
    <div class="c-title"><span>Share a Memory</span><i>${w.d}</i></div>
    <img class="st-art" src="assets/live/story-time.webp" alt="Story Time: grandparents and grandchildren together">
    <p class="st-lbl">Question</p>
    <div class="st-q">${w.prompt}</div>
    <div class="center" style="margin-top:auto"><a class="ask-btn-app" href="${wa(`Mummy-Papa, ek sawaal 🧡
${w.prompt}`)}" target="_blank" rel="noopener">Ask them this today</a></div>`;
}

/* Coin burst: the app's own Lottie */
let coinAnim;
function coins() {
  if (reduced || !window.lottie) return;
  if (!coinAnim) { coinAnim = lottie.loadAnimation({ container: $("#coins"), renderer: "svg", loop: false, autoplay: false, path: "assets/coins.json" }); coinAnim.addEventListener("complete", () => $("#coins").hidden = true); }
  $("#coins").hidden = false;
  coinAnim.goToAndPlay(0, true);
}
select(todayIdx, true);

/* ---------- The playable phone fits the screen ---------- */
function fitPhone() {
  const p = $(".play");
  p.style.setProperty("--pz", (innerWidth <= 960 ? Math.min(1, (innerWidth - 64) / 330) : Math.max(.6, Math.min(1, (innerHeight - 140) / 680))).toFixed(3));
}
fitPhone(); addEventListener("resize", fitPhone);

/* ---------- Hero headline: two lines take turns every 10 s, words rise in behind a mask ---------- */
(() => {
  const h = $("#rot"), lines = $$(".rot-l", h);
  lines.forEach(l => { // wrap each word (keeping <em>) in a mask span
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) c.replaceWith(...c.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? document.createTextNode(w) : Object.assign(document.createElement("span"), { className: "w", innerHTML: `<span class="wi">${w}</span>` })));
      else walk(c);
    });
    walk(l);
  });
  if (reduced) return;
  let i = 0, paused = false;
  h.onmouseenter = h.onfocusin = () => paused = true; h.onmouseleave = h.onfocusout = () => paused = false;
  setInterval(() => {
    if (paused || document.hidden) return;
    const out = lines[i], inn = lines[i = (i + 1) % lines.length];
    gsap.killTweensOf($$(".wi", h)); // a backgrounded tab can stack ticks; never let an old tween hide the current line
    gsap.to($$(".wi", out), { yPercent: -110, duration: .45, stagger: .025, ease: "power2.in", onComplete() { if (out !== lines[i]) { out.classList.remove("on"); out.setAttribute("aria-hidden", "true"); } } });
    inn.classList.add("on"); inn.removeAttribute("aria-hidden");
    gsap.fromTo($$(".wi", inn), { yPercent: 110 }, { yPercent: 0, duration: .6, stagger: .035, ease: "power3.out", delay: .3 });
  }, 10000);
})();

/* ---------- Testimonials: real videos, the real voice note, real chat screenshots ----------
   Files live in assets/testimonials/. Until a file exists, its card shows as a marked placeholder. */
const T = "assets/testimonials/";
const REELS = [
  { name: "Punam aunty", sub: "Plays every morning, 10 months", line: "\"Main toh bed tea bhi baad mein peeti hu, pehle yeh game khelti hu.\"", src: T + "punam.mp4", poster: T + "punam.jpg" },
  { name: "Anup Lamba aunty", sub: "83,000 points", line: "\"Mera toh daily routine ka part ban gaya hai.\"", src: T + "anup.mp4", poster: T + "anup.jpg" },
  { name: "Usha Narayan aunty", sub: "Mumbai", line: "\"Mere 20-40 mins kaise chale jaate hai, mujhe pata bhi nahi chalta.\"", src: T + "usha.mp4", poster: T + "usha.jpg" },
];
const SNIPS = [
  { src: T + "usha-chat.webp", h: 450, cap: "Usha aunty, to Anushna", alt: "WhatsApp message from Usha aunty: I am enjoying the quizzes of Fullhouse. Your quizzes also don't stress our mind. Everyday I wait to get the quizzes. Keep it up." },
  { src: T + "suchita-chat.webp", h: 366, cap: "Suchita aunty, bringing a friend", alt: "WhatsApp message from Suchita aunty: Will you please add my friend's name in the Fullhouse group." },
  { src: T + "sharda-chat.webp", h: 333, cap: "Sharda aunty and Kamal ji, in the players' group", alt: "WhatsApp group: Sharda aunty: Every day I play, it's fun and masti. Kamal ji: Yes I too." },
  { src: T + "score-chat.webp", h: 218, cap: "\"My score is 4905\"", alt: "WhatsApp message in Hindi: Yes, we play every day and it's a lot of fun. My score is now 4905." },
  { src: T + "31days-chat.webp", h: 112, cap: "31 days done, \"can I keep playing?\"", alt: "WhatsApp message in Hindi: My 31 days of Fullhouse are complete, can we keep playing?" },
];
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
REELS.forEach(r => {
  const el = document.createElement("figure"); el.className = "reel";
  el.innerHTML = `<div class="reel-box"><button class="reel-v" type="button" aria-label="Play ${r.name}'s video">
      <video src="${r.src}" poster="${r.poster}" playsinline preload="none"></video>
      <span class="reel-play">${PLAY}</span><span class="reel-line">${r.line}</span></button>
      <div class="speed" role="group" aria-label="Playback speed">${[1, 1.5, 2].map(x => `<button type="button" data-x="${x}" aria-pressed="${x === 1}">${x}x</button>`).join("")}</div></div>
    <figcaption><b>${r.name}</b><span>${r.sub}</span></figcaption>`;
  const v = $("video", el), b = $(".reel-v", el);
  const state = on => { el.classList.toggle("playing", on); b.setAttribute("aria-label", `${on ? "Pause" : "Play"} ${r.name}'s video`); };
  b.onclick = () => {
    $$(".reel video").forEach(o => { if (o !== v) o.pause(); });
    if (v.paused) { v.muted = false; v.play().catch(() => {}); } else v.pause();
  };
  v.onplay = () => state(true); v.onpause = v.onended = () => state(false);
  $$(".speed button", el).forEach(sb => sb.onclick = () => {
    v.playbackRate = +sb.dataset.x;
    $$(".speed button", el).forEach(o => o.setAttribute("aria-pressed", o === sb));
  });
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) v.pause(); }).observe(v);
  $("#reels").appendChild(el);
});
SNIPS.forEach((n, k) => {
  const el = document.createElement("figure"); el.className = "snip"; el.style.setProperty("--r", [-1.2, .8, -.5, 1.1, -.9][k % 5] + "deg");
  el.innerHTML = `<img src="${n.src}" alt="${n.alt}" width="600" height="${n.h}" loading="lazy"><figcaption class="fh-note">${n.cap}</figcaption>`;
  $("#snips").appendChild(el);
});

/* ---------- Keep the pinned story in sync with the real layout ----------
   Fonts, screenshots and posters change the page height after load; without a refresh the pin
   starts at a stale position and the page appears to jump. */
const refreshST = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 120); }; })();
addEventListener("load", refreshST);
document.fonts && document.fonts.ready.then(refreshST);
$$("img").forEach(i => { if (!i.complete) i.addEventListener("load", refreshST, { once: true }); });
