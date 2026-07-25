// js/teamManager.js
// Zarządza kolejnością tur w obrębie rundy. Dziś config.teams.length === 2,
// ale cała logika jest napisana pod dowolną liczbę drużyn (>=2), co jest
// bezpośrednim przygotowaniem pod tryb "3 drużyny jednoosobowe = 3 tury/rundę".
//
// Zasady (identyczne jak w oryginale dla 2 drużyn):
// - w rundzie każda drużyna ma dokładnie jedną turę,
// - po turze ostatniej drużyny w rundzie -> currentRound++,
// - subTurnIndex to indeks w tablicy config.teams (0-based).

export function createTeamManager(teamNames) {
  let subTurnIndex = 0; // 0-based index into teamNames

  return {
    get teamCount() {
      return teamNames.length;
    },
    get subTurnIndex() {
      return subTurnIndex;
    },
    /** 1-based numer tury w rundzie, do wyświetlania (np. "TURA 1/2"). */
    get subTurnNumber() {
      return subTurnIndex + 1;
    },
    get currentTeamName() {
      return teamNames[subTurnIndex];
    },
    reset() {
      subTurnIndex = 0;
    },
    /**
     * Przechodzi do kolejnej tury. Zwraca true, jeśli runda się zakończyła
     * (czyli wywołujący powinien zwiększyć currentRound).
     */
    advance() {
      subTurnIndex++;
      if (subTurnIndex >= teamNames.length) {
        subTurnIndex = 0;
        return true; // koniec rundy
      }
      return false;
    },
  };
}
