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
  handlePoint,
  handleSkip,
  showHistoryView,
  clearHistory,
  showSetupView,
} from "./game.js";

window.adjustValue = adjustValue;
window.closeModal = closeModal;
window.saveSettingsAndStart = saveSettingsAndStart;
window.startTurn = startTurn;
window.handlePoint = handlePoint;
window.handleSkip = handleSkip;
window.showHistoryView = showHistoryView;
window.clearHistory = clearHistory;
window.showSetupView = showSetupView;

window.addEventListener("DOMContentLoaded", () => {
  initSetupView();
});
