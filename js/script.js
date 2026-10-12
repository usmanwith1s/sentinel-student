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
function runAnalysis() {
  if (codeInput.value.trim().length === 0) {
    resultsPanel.innerHTML = `
      <p class="results-empty">
        The editor is empty. Paste some Java code first.
      </p>`;
    return;
  }
  resultsPanel.innerHTML = `
    <p>
      Analyzer not implemented yet — that's
      <strong>Milestone 2</strong>.
    </p>
    <p class="results-placeholder-note">
      Nothing here is simulated; the rule-based Java analyzer will be
      wired to this button in the next milestone.
    </p>`;
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
