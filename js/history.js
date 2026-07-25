// js/history.js
// Historia rozegranych meczów w localStorage. Zapis generalizowany na N drużyn
// (przechowuje tablicę "TEAM: PKT" zamiast sztywnych team1/team2).

const STORAGE_KEY_HISTORY = "taboo_history";
const MAX_HISTORY_ENTRIES = 20;

export function saveMatchToHistory({ teamNames, scores, resultText }) {
  const history = getHistory();
  const matchData = {
    date:
      new Date().toLocaleDateString("pl-PL") +
      " " +
      new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    teams: teamNames.map((name, i) => `${name}: ${scores[i]} PKT`),
    result: resultText,
  };
  history.unshift(matchData);
  if (history.length > MAX_HISTORY_ENTRIES) history.pop();
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]");
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY_HISTORY);
}
