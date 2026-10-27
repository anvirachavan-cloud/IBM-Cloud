// static/js/app.js — NutriGuide AI frontend logic

const API = {
  plan:  "/api/nutrition-plan",
  query: "/api/query",
};

// ── Utility ────────────────────────────────────────────────────
function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }
function qs(sel)   { return document.querySelector(sel); }
function qsa(sel)  { return document.querySelectorAll(sel); }

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm,  "<h2>$1</h2>")
    .replace(/^# (.+)$/gm,   "<h2>$1</h2>")
    .replace(/^- (.+)$/gm,   "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/---/g, "<hr>")
    .replace(/⚕️/g, "⚕️");
}

// ── Tab switching ──────────────────────────────────────────────
function initTabs() {
  qsa(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const panel = tab.dataset.tab;
      qsa(".tab").forEach(t => t.classList.remove("active"));
      qsa(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      qs(`#${panel}`).classList.add("active");
    });
  });
}

// ── Step indicator ─────────────────────────────────────────────
function setStep(n) {
  qsa(".step").forEach((s, i) => {
    s.classList.remove("active", "done");
    if (i + 1 < n)  s.classList.add("done");
    if (i + 1 === n) s.classList.add("active");
  });
}

// ── Spinner helper ─────────────────────────────────────────────
function showSpinner(container, msg) {
  container.innerHTML = `
    <div class="spinner-wrap">
      <div class="spinner"></div>
      <span>${msg}</span>
    </div>`;
}

// ── Nutrition Plan form ────────────────────────────────────────
function initPlanForm() {
  const form    = qs("#plan-form");
  const resultEl = qs("#plan-result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStep(2);

    const data = {
      name:            qs("#name").value.trim(),
      age:             qs("#age").value.trim(),
      diet_preference: qs("#diet").value,
      medical_history: qs("#medical").value.trim() || "none",
      city:            qs("#city").value.trim(),
      country:         qs("#country").value.trim(),
      goal:            qs("#goal").value.trim() || "maintain a healthy lifestyle",
      activity_level:  qs("#activity").value,
    };

    showSpinner(resultEl, "NutriGuide AI is crafting your personalised plan…");
    qs("#plan-submit").disabled = true;

    try {
      const res  = await fetch(API.plan, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        setStep(3);
        const [planPart, disclaimerPart] = splitDisclaimer(json.plan);
        resultEl.innerHTML = `
          <div class="result-box">${markdownToHtml(planPart)}</div>
          <div class="disclaimer-box">⚕️ ${markdownToHtml(disclaimerPart)}</div>`;
      } else {
        setStep(1);
        resultEl.innerHTML = `<div class="error-box">⚠️ ${json.error}</div>`;
      }
    } catch (err) {
      setStep(1);
      resultEl.innerHTML = `<div class="error-box">⚠️ Network error. Please try again.</div>`;
    } finally {
      qs("#plan-submit").disabled = false;
    }
  });

  qs("#reset-btn").addEventListener("click", () => {
    form.reset();
    resultEl.innerHTML = "";
    setStep(1);
  });
}

function splitDisclaimer(text) {
  const idx = text.indexOf("MEDICAL DISCLAIMER");
  if (idx === -1) return [text, ""];
  const before = text.slice(0, idx - 5).trim();
  const after  = text.slice(idx).trim();
  return [before, after];
}

// ── Chat / Query ───────────────────────────────────────────────
function initChat() {
  const chatWin  = qs("#chat-window");
  const input    = qs("#chat-input");
  const sendBtn  = qs("#chat-send");

  function addMsg(role, html) {
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;
    div.innerHTML = html;
    chatWin.appendChild(div);
    chatWin.scrollTop = chatWin.scrollHeight;
  }

  async function sendMessage() {
    const q = input.value.trim();
    if (!q) return;
    addMsg("user", escapeHtml(q));
    input.value = "";
    sendBtn.disabled = true;

    // Typing indicator
    const typing = document.createElement("div");
    typing.className = "chat-msg bot";
    typing.innerHTML = '<div class="spinner" style="width:18px;height:18px;"></div>';
    chatWin.appendChild(typing);
    chatWin.scrollTop = chatWin.scrollHeight;

    try {
      const res  = await fetch(API.query, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: q }),
      });
      const json = await res.json();
      chatWin.removeChild(typing);

      if (json.success) {
        const [ans, disc] = splitDisclaimer(json.answer);
        addMsg("bot", `
          ${markdownToHtml(ans)}
          ${disc ? `<div class="disclaimer">⚕️ ${disc.slice(0,120)}…</div>` : ""}
        `);
      } else {
        addMsg("bot", `<span style="color:#c0392b;">⚠️ ${escapeHtml(json.error)}</span>`);
      }
    } catch {
      chatWin.removeChild(typing);
      addMsg("bot", `<span style="color:#c0392b;">⚠️ Network error. Please try again.</span>`);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

  // Welcome message
  addMsg("bot", "👋 Hello! I'm <strong>NutriGuide AI</strong>, powered by IBM Granite. Ask me anything about nutrition, diet, or healthy eating!");
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  setStep(1);
  initPlanForm();
  initChat();
});
