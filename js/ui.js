// js/ui.js
// Wszystkie odczyty/zapisy do DOM są tutaj - reszta aplikacji nie dotyka
// document.* bezpośrednio (poza main.js, który tylko podłącza zdarzenia).
//
// Tabela wyników (scoreboard) jest renderowana dynamicznie na podstawie
// listy drużyn, więc automatycznie obsłuży 2, 3 lub więcej drużyn w kolejnej
// wersji - dziś przy 2 drużynach wygląda identycznie jak wcześniej.

import { CATEGORY_FILES, MIN_PARTICIPANTS } from "./config.js";

export function hideAllViews() {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
}

export function showView(viewId) {
  hideAllViews();
  document.getElementById(viewId).classList.remove("hidden");
}

export function renderCard(card) {
  document.getElementById("main-word").innerText = card.word.toUpperCase();
  document.getElementById("taboo-list").innerHTML = card.taboo
    .map((item) => `<li>${item.toUpperCase()}</li>`)
    .join("");

  const cardEl = document.querySelector("#game-view .game-card");
  cardEl.classList.remove("card-flip");
  void cardEl.offsetWidth;
  cardEl.classList.add("card-flip");
}


export function getSelectedCategoryIds() {
  const checkboxes = document.querySelectorAll('#categories-list input[type="checkbox"]:checked');
  return Array.from(checkboxes).map((cb) => cb.value);
}

export function fillSetupForm(config) {
  document.getElementById("team1-input").value = config.teams[0] || "DRUŻYNA A";
  document.getElementById("team2-input").value = config.teams[1] || "DRUŻYNA B";
  document.getElementById("rounds-input").value = config.rounds;
  document.getElementById("time-input").value = config.time;
  document.getElementById("skips-input").value = config.skips;
}

export function readSetupForm() {
  return {
    mode: getSelectedMode(),
    teams: [
      (document.getElementById("team1-input").value || "DRUŻYNA A").toUpperCase(),
      (document.getElementById("team2-input").value || "DRUŻYNA B").toUpperCase(),
    ],
    players: getPlayersFromForm(),
    rounds: parseInt(document.getElementById("rounds-input").value) || 4,
    time: parseInt(document.getElementById("time-input").value) || 60,
    skips: parseInt(document.getElementById("skips-input").value) || 0,
    selectedCategories: getSelectedCategoryIds(),
  };
}

/** Tryb gry: "team" (drużynowy) lub "solo" (indywidualny, 1 tura = 1 runda). */
export function getSelectedMode() {
  const checked = document.querySelector('input[name="mode"]:checked');
  return checked ? checked.value : "team";
}

export function setSelectedMode(mode) {
  const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
  if (radio) radio.checked = true;
}

/** Pokazuje pola drużyn albo listę graczy, zależnie od wybranego trybu. */
export function toggleModeFields(mode) {
  const teamFields = document.getElementById("team-fields");
  const playersFields = document.getElementById("players-fields");
  if (mode === "solo") {
    teamFields.classList.add("hidden");
    playersFields.classList.remove("hidden");
  } else {
    teamFields.classList.remove("hidden");
    playersFields.classList.add("hidden");
  }
}

/** Renderuje dynamiczną listę pól "gracz" z przyciskiem usuwania każdego wiersza. */
export function renderPlayersList(players) {
  const container = document.getElementById("players-list");
  container.innerHTML = players
    .map(
      (name, i) => `
        <div class="player-row">
          <input type="text" class="player-input" value="${name}">
          <button type="button" class="player-remove-btn" onclick="removePlayerField(${i})" ${
        players.length <= MIN_PARTICIPANTS ? "disabled" : ""
      }>✕</button>
        </div>
      `
    )
    .join("");
}

export function getPlayersFromForm() {
  return Array.from(document.querySelectorAll(".player-input")).map(
    (input, i) => (input.value || `GRACZ ${i + 1}`).toUpperCase()
  );
}

export function adjustValue(inputId, delta, min, max) {
  const input = document.getElementById(inputId);
  let val = parseInt(input.value) || 0;
  val += delta;
  if (val < min) val = min;
  if (val > max) val = max;
  input.value = val;
}

/** Renderuje siatkę "drużyna / punkty" w dowolnym kontenerze, dla dowolnej liczby drużyn. */
function renderTeamScoreGrid(containerId, teamNames, scores) {
  const container = document.getElementById(containerId);
  container.style.gridTemplateColumns = `repeat(${teamNames.length}, 1fr)`;
  container.innerHTML = teamNames
    .map(
      (name, i) => `
        <div class="team-box">
          <div class="name">${name}</div>
          <div class="pts">${scores[i]}</div>
        </div>
      `
    )
    .join("");
}

export function updateScoreboardDisplay(teamNames, scores) {
  renderTeamScoreGrid("scoreboard-teams", teamNames, scores);
}

export function renderEndScoreboard(teamNames, scores) {
  renderTeamScoreGrid("end-scoreboard-teams", teamNames, scores);
}

export function showTurnPrepView({ currentRound, totalRounds, subTurnNumber, teamCount, activeTeamName }) {
  showView("turn-view");
  document.getElementById(
    "turn-indicator"
  ).innerText = `RUNDA ${currentRound} Z ${totalRounds} (TURA ${subTurnNumber}/${teamCount})`;
  document.getElementById("turn-title").innerText = `PRZYGOTUJ SIĘ: ${activeTeamName}`;
  document.getElementById(
    "turn-desc"
  ).innerText = `Przekażcie telefon osobie opisującej: ${activeTeamName}.`;
}

export function setupGameViewForTurn({ activeTeamName, currentRound, totalRounds, roundScore, skipsLeft, timeLeft }) {
  document.getElementById("current-team-label").innerText = activeTeamName;
  document.getElementById("turn-stat").innerText = `${currentRound}/${totalRounds}`;
  document.getElementById("current-score").innerText = roundScore;
  document.getElementById("skips-left-hud").innerText = skipsLeft;
  document.getElementById("timer").innerText = timeLeft + "s";
  showView("game-view");
}

export function updateTimerDisplay(timeLeft) {
  document.getElementById("timer").innerText = timeLeft + "s";
}

export function updateRoundScoreDisplay(roundScore) {
  document.getElementById("current-score").innerText = roundScore;
}

export function updateSkipsDisplay(skipsLeft) {
  document.getElementById("skips-left-hud").innerText = skipsLeft;
  const skipBtn = document.getElementById("skip-btn");
  if (skipsLeft <= 0) {
    skipBtn.style.opacity = "0.3";
    skipBtn.style.pointerEvents = "none";
  } else {
    skipBtn.style.opacity = "1";
    skipBtn.style.pointerEvents = "auto";
  }
}

export function showEndView({ teamNames, scores, winnerText }) {
  showView("end-view");
  renderEndScoreboard(teamNames, scores);
  document.getElementById("winner-label").innerText = winnerText;
}

export function renderHistory(history) {
  const container = document.getElementById("history-container");
  if (history.length === 0) {
    container.innerHTML =
      "<div style='text-align:center; color: var(--text-muted); padding:20px; font-size:0.9rem;'>BRAK HISTORII MECZÓW</div>";
    return;
  }
  container.innerHTML = history
    .map(
      (m) => `
        <div class="history-item">
          <div>
            <div style="font-size:0.9rem; font-weight:800;">${m.teams.join(" vs ")}</div>
            <div style="font-size:0.8rem; color: var(--primary); font-weight:700; margin-top:2px;">${m.result}</div>
          </div>
          <div style="font-size:0.75rem; color: var(--text-muted); font-weight:600;">${m.date}</div>
        </div>
      `
    )
    .join("");
}
export function showCountdownOverlay() {
  document.getElementById("countdown-overlay").classList.remove("hidden");
}

export function hideCountdownOverlay() {
  document.getElementById("countdown-overlay").classList.add("hidden");
}

export function setCountdownNumber(text) {
  const el = document.getElementById("countdown-number");
  el.innerText = text;
  el.style.animation = "none";
  void el.offsetWidth; // wymusza reflow, żeby animacja odpaliła się od nowa
  el.style.animation = "";
}

export function setActionsLocked(locked) {
  const grid = document.querySelector(".action-grid");
  grid.classList.toggle("actions-locked", locked);
}
export function renderCategoriesList(selectedCategoryIds) {
  const container = document.getElementById("categories-list");
  container.innerHTML = CATEGORY_FILES.map(
    (cat) => `
      <label class="checkbox-item">
        <input type="checkbox" value="${cat.id}" ${selectedCategoryIds.includes(cat.id) ? "checked" : ""}>
        ${cat.name}
      </label>
    `
  ).join("");
}
