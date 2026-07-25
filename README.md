# TABU — architektura modułowa

Ten sam program co wcześniej (identyczne zasady i zachowanie), tylko rozbity
z jednego pliku `index.html` (872 linie) na moduły ES (`type="module"`).
Żadnych zewnętrznych bibliotek, żadnego bundlera — działa wprost z pliku
`index.html` otwartego przez lokalny serwer (moduły JS wymagają `http://`,
nie `file://`, np. `npx serve` albo VS Code "Live Server").

## Struktura plików

```
index.html          – tylko znaczniki HTML (widoki + modal)
css/style.css        – wszystkie style (bez zmian względem oryginału)
ogolne.json, ...     – pliki kategorii, jak dotychczas (obok index.html)
js/
  config.js          – lista kategorii + domyślna/zapisana konfiguracja gry
  cardsService.js     – wczytywanie haseł z JSON + logika losowania (talia)
  teamManager.js      – kolejność tur w rundzie (już gotowe pod N drużyn)
  timer.js            – odliczanie czasu tury
  history.js          – historia meczów w localStorage
  modal.js             – generyczny modal komunikatów
  ui.js                – WSZYSTKIE odczyty/zapisy do DOM
  game.js              – "mózg" gry: łączy powyższe moduły, pilnuje reguł
  main.js              – punkt wejścia: podpina onclick z HTML i uruchamia grę
```

Zasada podziału: każdy moduł ma jedną odpowiedzialność i nie zna szczegółów
pozostałych. `game.js` jest jedynym miejscem, które "wie" jak te elementy
składają się w rozgrywkę — dzięki temu zmiana jednej rzeczy (np. sposobu
losowania) nie wymaga dotykania reszty.

## Co odwzorowuje 1:1 oryginał

- Reguły punktacji, pomijania, czasu, zapisu historii i configu — bez zmian.
- Nazwy funkcji wywoływanych z HTML (`saveSettingsAndStart`, `startTurn`,
  `handlePoint`, `handleSkip`, `showHistoryView`, `clearHistory`,
  `showSetupView`, `adjustValue`, `closeModal`) są zachowane, tylko
  przeniesione do modułów i podpięte pod `window` w `main.js`.
- `localStorage` używa tych samych kluczy (`taboo_config`, `taboo_history`),
  ze starym configiem `{team1, team2}` też zadziała — `config.js` migruje go
  automatycznie do `{teams: [...]}`.

## Jedna świadoma zmiana (bez wpływu na dzisiejsze zachowanie)

Tabela wyników (`scores-grid`) jest teraz renderowana dynamicznie w `ui.js`
na podstawie tablicy `config.teams`, zamiast sztywnych ID `team1`/`team2`.
Dla 2 drużyn wygląda i działa identycznie — ale to jest właśnie punkt
zaczepienia pod tryb z większą liczbą drużyn.

## Jak to się ma do Twoich planów na kolejną wersję

**1. Tryb N drużyn jednoosobowych (np. 3 tury na rundę)**
`teamManager.js` już dziś liczy tury po indeksie w `config.teams`, więc
`config.teams = ["Ala", "Bartek", "Czarek"]` powinno zadziałać w rozgrywce
bez zmian w `game.js`. Do zrobienia zostanie tylko UI ekranu ustawień:
zamiast dwóch sztywnych pól `team1-input`/`team2-input` trzeba dodać listę
"dodaj drużynę / usuń drużynę" (dynamiczna lista inputów), analogicznie do
tego, jak `categories-list` jest już renderowana z tablicy.

**2. Nowa logika losowania haseł**
`cardsService.js` ma `createDeck(fullDeck, drawStrategy)` — druga strategia
(np. „nie powtarzaj hasła z ostatnich 2 rund", ważenie trudności, itp.) to
nowa funkcja o sygnaturze `(pool, fullDeck) => {card, remainingPool}`,
podpięta w `game.js` w miejscu `createDeck(availableCards)`. Reszta gry się
nie zmienia.

**3. Nowe kategorie**
Jeden nowy wpis w `CATEGORY_FILES` w `config.js` + plik JSON obok
`index.html` — checkbox na ekranie ustawień pojawi się automatycznie
(`renderCategoriesList` iteruje po tej tablicy).

## Jak uruchomić lokalnie

```bash
npx serve .
# albo dowolny inny statyczny serwer w tym folderze
```
