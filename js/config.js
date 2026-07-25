// js/config.js
// Statyczna definicja dostępnych kategorii oraz domyślna konfiguracja gry.
// Dodanie nowej kategorii = dodanie jednego wpisu do CATEGORY_FILES (patrz README).

// Ścieżki takie same jak w oryginale (pliki JSON leżą obok index.html).
export const CATEGORY_FILES = [
  { id: "ogolne",       name: "OGÓLNE",              file: "ogolne.json" },
  { id: "popkultura",   name: "POPKULTURA & FILM",   file: "popkultura.json" },
  { id: "technologia",  name: "TECHNOLOGIA",         file: "technologia.json" },
  { id: "sport",        name: "SPORT",               file: "sport.json" },
  { id: "geografia",    name: "GEOGRAFIA",           file: "geografia.json" },
  { id: "jedzenie",     name: "JEDZENIE & KUCHNIA",  file: "jedzenie.json" },
  { id: "mlodziezowe",  name: "MŁODZIEŻOWE",         file: "mlodziezowe.json" },
  { id: "przyroda",     name: "PRZYRODA",            file: "przyroda.json" },
];

// Domyślna konfiguracja. `teams` to tablica nazw drużyn - dziś zawsze 2,
// ale reszta silnika gry (teamManager, ui) już umie obsłużyć dowolną liczbę >= 2,
// co jest przygotowaniem pod tryb "N drużyn jednoosobowych".
export function getDefaultConfig() {
  return {
    teams: ["DRUŻYNA A", "DRUŻYNA B"],
    rounds: 4,
    time: 60,
    skips: 3,
    selectedCategories: ["ogolne"],
  };
}

const STORAGE_KEY_CONFIG = "taboo_config";

export function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (!raw) return getDefaultConfig();
  try {
    const saved = JSON.parse(raw);
    // Migracja starego formatu {team1, team2} -> {teams: [...]}
    if (!saved.teams && (saved.team1 || saved.team2)) {
      saved.teams = [saved.team1 || "DRUŻYNA A", saved.team2 || "DRUŻYNA B"];
      delete saved.team1;
      delete saved.team2;
    }
    return { ...getDefaultConfig(), ...saved };
  } catch (e) {
    console.error("Nie udało się odczytać zapisanej konfiguracji", e);
    return getDefaultConfig();
  }
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}
