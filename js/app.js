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
// ----- UI state (Milestone 2) -----
// lastFindings: results of the most recent analysis (source of truth)
// activeFilter: which severity is currently shown
let lastFindings = [];
let activeFilter = "All";

const sampleSelect = document.getElementById("sample-select");
const filterBar = document.querySelector(".filter-bar");

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
  // The analyzer returns [] for empty input too — handle empty separately
  if (codeInput.value.trim() === "") {
    lastFindings = [];
    renderFindings();
    const p = document.createElement("p");
    p.className = "results-empty";
    p.textContent = "The editor is empty. Paste some Java code first.";
    resultsPanel.appendChild(p);
    return;
  }

  lastFindings = SentinelAnalyzer.analyze(codeInput.value);
  renderFindings();
}
/**
 * Render the current findings, honoring activeFilter.
 * Called by: runAnalysis (new analysis) and filter buttons (re-filter).
 */
function renderFindings() {
  resultsPanel.innerHTML = "";
  resultsPanel.appendChild(buildSummary(lastFindings));

  const visible = lastFindings.filter(function (f) {
    return activeFilter === "All" || f.severity === activeFilter;
  });

  if (visible.length === 0) {
    const p = document.createElement("p");
    p.className = "results-empty";
    if (lastFindings.length === 0) {
      p.textContent =
        "No issues detected by the current rules. Note: Sentinel performs " +
        "static text analysis — it cannot guarantee your code is correct " +
        "or that it compiles.";
    } else {
      p.textContent = "No " + activeFilter.toLowerCase() +
        "s in this analysis. Try another filter.";
    }
    resultsPanel.appendChild(p);
    return;
  }

  visible.forEach(function (f) {
    resultsPanel.appendChild(buildFindingCard(f));
  });
}

/** Click a filter button -> update state -> re-render. No re-analysis. */
filterBar.addEventListener("click", function (event) {
  const btn = event.target.closest("button[data-filter]");
  if (!btn) return;

  activeFilter = btn.dataset.filter;

  // Move the .active style to the clicked button
  filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
    b.classList.toggle("active", b === btn);
  });

  renderFindings();
});

/** Load the chosen sample into the editor. */
function initSamples() {
  SentinelSamples.forEach(function (sample) {
    const opt = document.createElement("option");
    opt.value = sample.id;
    opt.textContent = sample.label;
    sampleSelect.appendChild(opt);
  });

  sampleSelect.addEventListener("change", function () {
    const chosen = SentinelSamples.find(function (s) {
      return s.id === sampleSelect.value;
    });
    if (chosen) {
      codeInput.value = chosen.code;
      updateStatus();
      resultsPanel.innerHTML =
        '<p class="results-empty">Sample loaded. Press <strong>Analyze Code</strong>.</p>';
    }
    // Reset the dropdown so it reads "Load a sample…" again
    sampleSelect.value = "";
  });
}
initSamples();

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
