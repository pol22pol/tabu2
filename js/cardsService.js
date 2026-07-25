// js/cardsService.js
// Odpowiada za: wczytywanie haseł z wybranych kategorii oraz logikę losowania.
// Logika losowania jest wydzielona jako "strategia" (funkcja drawCard), żeby
// w kolejnej wersji można było podmienić algorytm (np. bez powtórzeń w N ostatnich
// rundach, ważenie wg trudności, itp.) bez ruszania reszty gry.

import { CATEGORY_FILES } from "./config.js";

/** Wczytuje wszystkie hasła dla podanych id kategorii. */
export async function loadCards(selectedCategoryIds) {
  const all = [];
  for (const catId of selectedCategoryIds) {
    const catObj = CATEGORY_FILES.find((c) => c.id === catId);
    if (!catObj) continue;
    try {
      const res = await fetch(catObj.file);
      const cards = await res.json();
      all.push(...cards);
    } catch (e) {
      console.error("Błąd ładowania pliku: " + catObj.file, e);
    }
  }
  return all;
}

/**
 * Domyślna strategia losowania: pełna pula, losowy indeks, bez powtórzeń
 * dopóki pula się nie wyczerpie (identycznie jak w oryginalnej wersji).
 * Zwraca { card, remainingPool }.
 */
export function defaultDrawStrategy(pool, fullDeck) {
  let currentPool = pool;
  if (currentPool.length === 0) {
    currentPool = [...fullDeck];
  }
  const randomIndex = Math.floor(Math.random() * currentPool.length);
  const card = currentPool[randomIndex];
  const remainingPool = currentPool.slice(0, randomIndex).concat(currentPool.slice(randomIndex + 1));
  return { card, remainingPool };
}

/**
 * Fabryka "talii": trzyma pełen zestaw haseł (fullDeck) i aktualną pulę (pool),
 * i wystawia draw() zgodny z wybraną strategią. Podmiana strategii w przyszłości
 * to jedna linijka w miejscu tworzenia decka (np. w game.js).
 */
export function createDeck(fullDeck, drawStrategy = defaultDrawStrategy) {
  let pool = [...fullDeck];
  return {
    draw() {
      const { card, remainingPool } = drawStrategy(pool, fullDeck);
      pool = remainingPool;
      return card;
    },
    reset() {
      pool = [...fullDeck];
    },
  };
}
