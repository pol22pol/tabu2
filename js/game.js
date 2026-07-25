// js/game.js
// Orkiestrator rozgrywki - odpowiednik oryginalnych funkcji
// saveSettingsAndStart / startTurn / nextCard / handlePoint / handleSkip /
// endTurn / endMatch, tylko złożony z mniejszych modułów.
// Zasady gry są IDENTYCZNE jak w oryginalnej wersji.

import { loadConfig, saveConfig } from "./config.js";
import { loadCards, createDeck } from "./cardsService.js";
import { createTeamManager } from "./teamManager.js";
import { createTimer } from "./timer.js";
import { saveMatchToHistory, getHistory, clearHistory as clearHistoryStorage } from "./history.js";
import { showModal } from "./modal.js";
import * as ui from "./ui.js";

let config = loadConfig();
let scores = [];
let currentRound = 1;
let currentRoundScore = 0;
let currentSkipsLeft = 0;
let deck = null;
let teamManager = null;
let timer = null;

export function initSetupView() {
  ui.fillSetupForm(config);
  ui.renderCategoriesList(config.selectedCategories);
}

/** Odpowiednik saveSettings(): waliduje i zapisuje formularz do config. */
function saveSettingsFromForm() {
  const formValues = ui.readSetupForm();
  if (formValues.selectedCategories.length === 0) {
    showModal("BŁĄD", "Wybierz co najmniej jedną kategorię!");
    return false;
  }
  config = { ...config, ...formValues };
  saveConfig(config);
  return true;
}

export async function saveSettingsAndStart() {
  if (!saveSettingsFromForm()) return;

  const availableCards = await loadCards(config.selectedCategories);
  deck = createDeck(availableCards);

  scores = config.teams.map(() => 0);
  currentRound = 1;
  teamManager = createTeamManager(config.teams);
  timer = createTimer({
    onTick: (t) => ui.updateTimerDisplay(t),
    onExpire: () => endTurn(),
  });

  ui.updateScoreboardDisplay(config.teams, scores);
  showTurnPrepView();
}

function showTurnPrepView() {
  ui.showTurnPrepView({
    currentRound,
    totalRounds: config.rounds,
    subTurnNumber: teamManager.subTurnNumber,
    teamCount: teamManager.teamCount,
    activeTeamName: teamManager.currentTeamName,
  });
}

export function startTurn() {
  currentRoundScore = 0;
  currentSkipsLeft = config.skips;

  ui.setupGameViewForTurn({
    activeTeamName: teamManager.currentTeamName,
    currentRound,
    totalRounds: config.rounds,
    roundScore: currentRoundScore,
    skipsLeft: currentSkipsLeft,
    timeLeft: config.time,
  });
  ui.updateSkipsDisplay(currentSkipsLeft);

  nextCard();
  timer.start(config.time);
}

function nextCard() {
  const card = deck.draw();
  ui.renderCard(card);
}

export function handlePoint(points) {
  currentRoundScore += points;
  ui.updateRoundScoreDisplay(currentRoundScore);
  nextCard();
}

export function handleSkip() {
  if (currentSkipsLeft > 0) {
    currentSkipsLeft--;
    ui.updateSkipsDisplay(currentSkipsLeft);
    nextCard();
  }
}

function endTurn() {
  timer.stop();
  const finishedTeamIndex = teamManager.subTurnIndex;
  const finishedTeamName = teamManager.currentTeamName;

  showModal(`KONIEC TURY: ${finishedTeamName}`, `Zdobyte punkty: ${currentRoundScore}`, () => {
    scores[finishedTeamIndex] += currentRoundScore;
    const roundFinished = teamManager.advance();
    if (roundFinished) currentRound++;

    ui.updateScoreboardDisplay(config.teams, scores);

    if (currentRound <= config.rounds) {
      showTurnPrepView();
    } else {
      endMatch();
    }
  });
}

function computeWinnerText() {
  const maxScore = Math.max(...scores);
  const winners = config.teams.filter((_, i) => scores[i] === maxScore);
  if (winners.length > 1) return "REMIS! 🤝";
  return `ZWYCIĘZCA: ${winners[0]}! 🏆`;
}

function endMatch() {
  const winnerText = computeWinnerText();
  ui.showEndView({ teamNames: config.teams, scores, winnerText });
  saveMatchToHistory({ teamNames: config.teams, scores, resultText: winnerText });
}

export function showHistoryView() {
  ui.showView("history-view");
  ui.renderHistory(getHistory());
}

export function clearHistory() {
  showModal("WYCZYŚĆ HISTORIĘ", "Historia meczów została usunięta.", () => {
    clearHistoryStorage();
    showHistoryView();
  });
}

export function showSetupView() {
  ui.showView("setup-view");
}
