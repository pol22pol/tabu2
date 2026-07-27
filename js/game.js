// js/game.js
// Orkiestrator rozgrywki - odpowiednik oryginalnych funkcji
// saveSettingsAndStart / startTurn / nextCard / handlePoint / handleSkip /
// endTurn / endMatch, tylko złożony z mniejszych modułów.
// Zasady gry są IDENTYCZNE jak w oryginalnej wersji.

import { loadConfig, saveConfig, MIN_PARTICIPANTS } from "./config.js";
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

// Uczestnicy aktualnie rozgrywanego meczu (ustalani przy starcie, żeby zmiana
// formularza w trakcie meczu niczego nie popsuła). Zasada "runda" jest
// IDENTYCZNA w obu trybach: runda = pełny cykl, w którym każdy uczestnik
// (drużyna albo gracz) ma dokładnie jedną turę; liczba tur w rundzie to po
// prostu liczba uczestników - teamManager już to obsługuje bez zmian.
let activeParticipants = [];

export function initSetupView() {
  ui.fillSetupForm(config);
  ui.renderCategoriesList(config.selectedCategories);
  ui.renderPlayersList(config.players);
  ui.setSelectedMode(config.mode);
  ui.toggleModeFields(config.mode);
}

export function handleModeChange() {
  const mode = ui.getSelectedMode();
  ui.toggleModeFields(mode);
}

export function addPlayerField() {
  const players = ui.getPlayersFromForm();
  players.push(`GRACZ ${players.length + 1}`);
  ui.renderPlayersList(players);
}

export function removePlayerField(index) {
  const players = ui.getPlayersFromForm();
  if (players.length <= MIN_PARTICIPANTS) return;
  players.splice(index, 1);
  ui.renderPlayersList(players);
}

/** Odpowiednik saveSettings(): waliduje i zapisuje formularz do config. */
function saveSettingsFromForm() {
  const formValues = ui.readSetupForm();
  if (formValues.selectedCategories.length === 0) {
    showModal("BŁĄD", "Wybierz co najmniej jedną kategorię!");
    return false;
  }
  const participants = formValues.mode === "solo" ? formValues.players : formValues.teams;
  if (participants.length < MIN_PARTICIPANTS) {
    showModal("BŁĄD", `Potrzeba co najmniej ${MIN_PARTICIPANTS} uczestników!`);
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

  activeParticipants = config.mode === "solo" ? config.players : config.teams;

  scores = activeParticipants.map(() => 0);
  currentRound = 1;
  teamManager = createTeamManager(activeParticipants);
  timer = createTimer({
    onTick: (t) => ui.updateTimerDisplay(t),
    onExpire: () => endTurn(),
  });

  ui.updateScoreboardDisplay(activeParticipants, scores);
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

    ui.updateScoreboardDisplay(activeParticipants, scores);

    if (currentRound <= config.rounds) {
      showTurnPrepView();
    } else {
      endMatch();
    }
  });
}

function computeWinnerText() {
  const maxScore = Math.max(...scores);
  const winners = activeParticipants.filter((_, i) => scores[i] === maxScore);
  if (winners.length > 1) return "REMIS! 🤝";
  return `ZWYCIĘZCA: ${winners[0]}! 🏆`;
}

function endMatch() {
  const winnerText = computeWinnerText();
  ui.showEndView({ teamNames: activeParticipants, scores, winnerText });
  saveMatchToHistory({ teamNames: activeParticipants, scores, resultText: winnerText });
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
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ACTION_LOCK_MS = 350;
const COUNTDOWN_STEP_MS = 700;

export function beginTurnCountdown() {
  ui.showCountdownOverlay();
  let count = 3;
  ui.setCountdownNumber(count);

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      ui.setCountdownNumber(count);
    } else {
      clearInterval(interval);
      ui.setCountdownNumber("START!");
      setTimeout(() => {
        ui.hideCountdownOverlay();
        startTurn();
      }, 500);
    }
  }, COUNTDOWN_STEP_MS);
}
