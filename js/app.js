// Sentinel Student — Milestone 0
// Responsibilities right now:
//   1. Live line/character count in the editor status line
//   2. Clear button
//   3. Analyze button (honest placeholder — analyzer arrives in Milestone 2)

const codeInput = document.getElementById("code-input");
const statusLine = document.getElementById("editor-status");
const resultsPanel = document.getElementById("results-panel");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");

/** Update the "N lines · M characters" status line. */
function updateStatus() {
  const text = codeInput.value;
  // A trailing newline shouldn't count as an extra line.
  const lines = text.length === 0 ? 0 : text.replace(/\n$/, "").split("\n").length;
  statusLine.textContent = `${lines} lines · ${text.length} characters`;
}

/** Show the honest "analyzer not implemented yet" message. */
/**
 * Run the real analyzer and render findings safely.
 * We never use innerHTML with analysis data — every element
 * is created via createElement and filled with textContent.
 */
function runAnalysis() {
  const code = codeInput.value;
  const findings = SentinelAnalyzer.analyze(code);

  resultsPanel.innerHTML = ""; // clearing our own static template is safe
  resultsPanel.appendChild(buildSummary(findings));

  if (findings.length === 0) {
    const ok = document.createElement("p");
    ok.className = "results-empty";
    ok.textContent =
      "No issues detected by the current rules. Note: Sentinel performs " +
      "static text analysis — it cannot guarantee your code is correct or " +
      "that it compiles.";
    resultsPanel.appendChild(ok);
    return;
  }

  findings.forEach(function (f) {
    resultsPanel.appendChild(buildFindingCard(f));
  });
}

/** "3 findings: 1 error · 1 warning · 1 suggestion" */
function buildSummary(findings) {
  const counts = { Error: 0, Warning: 0, Suggestion: 0 };
  findings.forEach(function (f) { counts[f.severity]++; });

  const p = document.createElement("p");
  p.className = "results-summary";
  p.textContent =
    findings.length + " finding" + (findings.length === 1 ? "" : "s") + ": " +
    counts.Error + " error" + (counts.Error === 1 ? "" : "s") + " · " +
    counts.Warning + " warning" + (counts.Warning === 1 ? "" : "s") + " · " +
    counts.Suggestion + " suggestion" + (counts.Suggestion === 1 ? "" : "s");
  return p;
}

/** One finding = one card with badge, title, explanation, advice. */
function buildFindingCard(f) {
  const card = document.createElement("article");
  card.className = "finding sev-" + f.severity.toLowerCase();

  const head = document.createElement("div");
  head.className = "finding-head";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = f.severity;

  const title = document.createElement("h3");
  title.className = "finding-title";
  title.textContent = f.line ? "Line " + f.line + ": " + f.title : f.title;

  head.appendChild(badge);
  head.appendChild(title);

  const expl = document.createElement("p");
  expl.textContent = f.explanation;

  const why = document.createElement("p");
  why.className = "finding-why";
  why.textContent = "Why it matters: " + f.why;

  const step = document.createElement("p");
  step.className = "finding-step";
  step.textContent = "Next step: " + f.nextStep;

  card.appendChild(head);
  card.appendChild(expl);
  card.appendChild(why);
  card.appendChild(step);
  return card;
}

function clearAll() {
  codeInput.value = "";
  updateStatus();
  resultsPanel.innerHTML = `
    <p class="results-empty">
      No analysis yet. Paste some Java code and press
      <strong>Analyze Code</strong>.
    </p>`;
  codeInput.focus();
}

codeInput.addEventListener("input", updateStatus);
analyzeBtn.addEventListener("click", runAnalysis);
clearBtn.addEventListener("click", clearAll);

// Initialize status on page load.
updateStatus();
