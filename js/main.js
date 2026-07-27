// js/main.js
// Punkt wejścia. Podpina funkcje pod window, żeby istniejące atrybuty
// onclick="..." w index.html (identyczne jak w oryginale) dalej działały,
// oraz uruchamia inicjalizację po załadowaniu strony.

import { closeModal } from "./modal.js";
import { adjustValue } from "./ui.js";
import {
  initSetupView,
  saveSettingsAndStart,
  startTurn,
  beginTurnCountdown,   // ← dodaj
  handlePoint,
  handleSkip,
  showHistoryView,
  clearHistory,
  showSetupView,
  handleModeChange,
  addPlayerField,
  removePlayerField,
} from "./game.js";

window.beginTurnCountdown = beginTurnCountdown; // ← dodaj


window.adjustValue = adjustValue;
window.closeModal = closeModal;
window.saveSettingsAndStart = saveSettingsAndStart;
window.startTurn = startTurn;
window.handlePoint = handlePoint;
window.handleSkip = handleSkip;
window.showHistoryView = showHistoryView;
window.clearHistory = clearHistory;
window.showSetupView = showSetupView;
window.handleModeChange = handleModeChange;
window.addPlayerField = addPlayerField;
window.removePlayerField = removePlayerField;

window.addEventListener("DOMContentLoaded", () => {
  initSetupView();
});
