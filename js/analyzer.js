
/**
 * Sentinel Student — Java Rule-Based Analyzer (Milestone 1)
 *
 * Design: every rule is an object with the same shape:
 *   {
 *     id, severity, title,
 *     analyze(lines) -> [finding, ...]
 *   }
 * A finding: { ruleId, severity, line, title, explanation, why, nextStep }
 *
 * The analyzer NEVER runs Java. It scans text deterministically and
 * reports only what it can detect reliably. Guesses are never labeled
 * as confirmed errors.
 */
const SentinelAnalyzer = (function () {
  "use strict";

  /* ------------------------------------------------------------
   * Step A — Strip comments and string contents.
   *
   * Why: if a student writes  // forgot the }
   * that brace is inside a comment — it must NOT count toward
   * balance. Same for braces inside "text". We replace those
   * characters with spaces but KEEP line breaks, so line numbers
   * in findings still match the original code.
   * ------------------------------------------------------------ */
  function stripCommentsAndStrings(lines) {
    let inBlockComment = false;
    let inString = false;      // "..."
    let inCharLiteral = false; // '...'

    return lines.map(function (rawLine) {
      let out = "";
      for (let i = 0; i < rawLine.length; i++) {
        const ch = rawLine[i];
        const next = rawLine[i + 1];

        if (inBlockComment) {
          if (ch === "*" && next === "/") {
            inBlockComment = false;
            out += "  ";       // keep column positions
            i++;
          } else {
            out += ch === "\t" ? "\t" : " ";
          }
          continue;
        }

        if (inString) {
          if (ch === "\\") {   // escaped quote: skip next char
            out += "  ";
            i++;
          } else if (ch === '"') {
            inString = false;
            out += " ";
          } else {
            out += ch === "\t" ? "\t" : " ";
          }
          continue;
        }

        if (inCharLiteral) {
          if (ch === "\\") {
            out += "  ";
            i++;
          } else if (ch === "'") {
            inCharLiteral = false;
            out += " ";
          } else {
            out += " ";
          }
          continue;
        }

        // Not inside anything special:
        if (ch === "/" && next === "/") {
          out += " ".repeat(rawLine.length - i); // rest of line is comment
          break;
        }
        if (ch === "/" && next === "*") {
          inBlockComment = true;
          out += "  ";
          i++;
          continue;
        }
        if (ch === '"')  { inString = true; out += " "; continue; }
        if (ch === "'")  { inCharLiteral = true; out += " "; continue; }

        out += ch;
      }
      return out;
    });
  }

  /* ------------------------------------------------------------
   * Step B — The rules
   * ------------------------------------------------------------ */

  // Rule 1: Empty source
  const emptySourceRule = {
    id: "empty-source",
    severity: "Error",
    analyze: function (lines) {
      if (lines.every(function (l) { return l.trim() === ""; })) {
        return [{
          ruleId: this.id,
          severity: this.severity,
          line: null,
          title: "No Java code found",
          explanation: "The editor is empty (or contains only whitespace).",
          why: "There is nothing for Sentinel to analyze.",
          nextStep: "Paste your Java code into the editor, then run Analyze again."
        }];
      }
      return [];
    }
  };

  // Rule 2: Unbalanced brackets — classic stack algorithm.
  const PAIRS = { ")": "(", "]": "[", "}": "{" };
  const OPENERS = ["(", "[", "{"];

  const bracketBalanceRule = {
    id: "bracket-balance",
    severity: "Error",
    analyze: function (lines) {
      const findings = [];
      const stack = [];
      const cleaned = stripCommentsAndStrings(lines);

      cleaned.forEach(function (line, idx) {
        const lineNo = idx + 1;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (OPENERS.indexOf(ch) !== -1) {
            stack.push({ ch: ch, line: lineNo });
          } else if (ch in PAIRS) {
            const top = stack.pop();
            if (!top || top.ch !== PAIRS[ch]) {
              findings.push({
                ruleId: "bracket-balance",
                severity: "Error",
                line: lineNo,
                title: "Unmatched '" + ch + "'",
                explanation: "This closing bracket has no matching opening bracket.",
                why: "Unbalanced brackets usually mean a missing or extra brace — this is one of the most common causes of Java compiler errors.",
                nextStep: "Check this line and the lines above it. Count opening and closing braces carefully."
              });
            }
          }
        }
      });

      // Anything left on the stack was never closed.
      stack.forEach(function (item) {
        findings.push({
          ruleId: "bracket-balance",
          severity: "Error",
          line: item.line,
          title: "Unclosed '" + item.ch + "'",
          explanation: "This opening bracket is never closed. The matching '" +
            (item.ch === "{" ? "}" : item.ch === "(" ? ")" : "]") +
            "' is missing somewhere after line " + item.line + ".",
          why: "Java requires every opening bracket to have a matching closing bracket.",
          nextStep: "Look near the end of the block that starts here — the closing bracket is probably missing."
        });
      });

      return findings;
    }
  };

  // Rule 3: Debug print statements
  const debugPrintRule = {
    id: "debug-print",
    severity: "Warning",
    analyze: function (lines) {
      const findings = [];
      const cleaned = stripCommentsAndStrings(lines);
      cleaned.forEach(function (line, idx) {
        if (/System\.out\.print(ln)?/.test(line)) {
          findings.push({
            ruleId: "debug-print",
            severity: "Warning",
            line: idx + 1,
            title: "Debug print statement",
            explanation: "Line " + (idx + 1) + " prints to the console. This is fine while developing, but left in submitted code it looks unprofessional.",
            why: "Instructors and code reviewers see leftover prints as unfinished debugging. It can also slow down programs in loops.",
            nextStep: "Remove the print statement before submitting — or keep it if your assignment explicitly requires console output."
          });
        }
      });
      return findings;
    }
  };

  // Rule 4: Very long lines
  const longLineRule = {
    id: "long-line",
    severity: "Suggestion",
    analyze: function (lines) {
      const findings = [];
      lines.forEach(function (line, idx) {
        if (line.length > 100) {
          findings.push({
            ruleId: "long-line",
            severity: "Suggestion",
            line: idx + 1,
            title: "Line is " + line.length + " characters long",
            explanation: "Lines over 100 characters are hard to read, especially on smaller screens or when printed.",
            why: "Readability matters for grading and for your own future self. Breaking code into shorter lines is a professional habit.",
            nextStep: "Consider splitting this line — e.g., break long conditions or method chains across multiple lines."
          });
        }
      });
      return findings;
    }
  };

  const rules = [emptySourceRule, bracketBalanceRule, debugPrintRule, longLineRule];

  /* ------------------------------------------------------------
   * Step C — Public API
   * ------------------------------------------------------------ */
  function analyze(sourceCode) {
    const lines = sourceCode.split("\n");
    const findings = [];

    // Empty check runs FIRST and alone — nothing else makes sense on empty input.
    const emptyFindings = emptySourceRule.analyze(lines);
    if (emptyFindings.length > 0) return emptyFindings;

        // Strip once, share with every rule (avoids repeated work)
    const cleaned = stripCommentsAndStrings(lines);
    rules.forEach(function (rule) {
      if (rule === emptySourceRule) return; // already handled
      findings.push.apply(findings, rule.analyze(lines, cleaned));
    });

    // Sort so Errors appear first, then Warnings, then Suggestions.
    const order = { Error: 0, Warning: 1, Suggestion: 2 };
    findings.sort(function (a, b) {
      return order[a.severity] - order[b.severity];
    });

    return findings;
  }

    return { analyze: analyze, registerRule: registerRule };

  /** Allow other modules (like Syllabus Mode) to add rules. */
  function registerRule(rule) {
    rules.push(rule);
  }
})();

// Make it reachable from app.js
window.SentinelAnalyzer = SentinelAnalyzer;
