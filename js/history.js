// js/history.js
// Historia rozegranych meczów w localStorage. Zapis generalizowany na N drużyn
// (przechowuje tablicę "TEAM: PKT" zamiast sztywnych team1/team2).

const STORAGE_KEY_HISTORY = "taboo_history";
const MAX_HISTORY_ENTRIES = 20;

export function saveMatchToHistory({ teamNames, scores, resultText }) {
  try {
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
    if (history.length > MAX_HISTORY_ENTRIES) history.length = MAX_HISTORY_ENTRIES;
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error("Nie udało się zapisać historii meczu:", err);
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Historia w localStorage jest uszkodzona — czyszczę:", err);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (err) {
    console.error("Nie udało się wyczyścić historii:", err);
  }
}
