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

// Domyślna konfiguracja. `teams` to tablica nazw drużyn (tryb "team", zawsze 2),
// `players` to tablica nazw graczy (tryb "solo", domyślnie 3, jednoosobowi).
// `mode` decyduje, która lista jest aktywna w danym meczu.
// teamManager/ui już umieją obsłużyć dowolną liczbę uczestników >= 2, więc oba
// tryby korzystają z tego samego silnika rozgrywki.
export function getDefaultConfig() {
  return {
    mode: "team", // "team" (drużyny, 1 tura na drużynę w rundzie) | "solo" (gracze, 1 tura = 1 runda)
    teams: ["DRUŻYNA A", "DRUŻYNA B"],
    players: ["GRACZ 1", "GRACZ 2", "GRACZ 3"],
    rounds: 4,
    time: 60,
    skips: 3,
    selectedCategories: ["ogolne"],
  };
}

const STORAGE_KEY_CONFIG = "taboo_config";
export const MIN_PARTICIPANTS = 2;

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
    const merged = { ...getDefaultConfig(), ...saved };
    // Zabezpieczenie na wypadek uszkodzonych/pustych list z localStorage.
    if (!Array.isArray(merged.players) || merged.players.length < MIN_PARTICIPANTS) {
      merged.players = getDefaultConfig().players;
    }
    if (!Array.isArray(merged.teams) || merged.teams.length < MIN_PARTICIPANTS) {
      merged.teams = getDefaultConfig().teams;
    }
    return merged;
  } catch (e) {
    console.error("Nie udało się odczytać zapisanej konfiguracji", e);
    return getDefaultConfig();
  }
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}
