import words from "./mots_5.json";
import seedrandom, { PRNG } from "seedrandom";

let rng: PRNG;

function getSeed(): string {
  let now = new Date();
  return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
}

function seed() {
  rng = seedrandom(getSeed());
}

interface CharComp {
  letterGood: boolean;
  letterPosGood: boolean;
}

interface Entry {
  letter: string;
  comp: CharComp;
}

type Grid = Entry[][];

export type Phase = "play" | "win" | "loose";

export interface Coords {
  x: number;
  y: number;
}

export interface AppState {
  seed: string;
  phase: Phase;
  grid: Grid;
  reference: Grid;
  selected: Coords | null;
  remainingMoves: number;
}

export const range5 = [...Array(5).keys()];

function randomElt<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
  // return arr[random.int(1, arr.length) - 1];
}

const randomWord = () => randomElt(words);

const randomWordFilter = (pred: (s: string) => boolean) => {
  const validWords = words.filter(pred);
  if (validWords.length === 0) {
    return "#####";
  }
  return randomElt(validWords);
};

function initArray(): Grid {
  return range5.map(() =>
    range5.map(() => ({
      letter: "",
      comp: { letterGood: false, letterPosGood: false },
    }))
  );
}

function initWords(): Grid {
  const res = initArray();
  const max_try = 100;
  let try_nbr = 0;

  while (try_nbr < max_try) {
    try_nbr += 1;
    const word = randomWord();
    range5.forEach((i) => {
      res[0][i].letter = word[i];
    });

    const word2 = randomWordFilter((w) => w[0] === word[0]);
    if (word2 === "#####") {
      continue;
    }
    range5.forEach((i) => {
      res[i][0].letter = word2[i];
    });

    const word3 = randomWordFilter((w) => w[0] === word[2]);
    if (word3 === "#####") {
      continue;
    }
    range5.forEach((i) => {
      res[i][2].letter = word3[i];
    });

    const word4 = randomWordFilter((w) => w[0] === word[4]);
    if (word4 === "#####") {
      continue;
    }
    range5.forEach((i) => {
      res[i][4].letter = word4[i];
    });

    const word5 = randomWordFilter(
      (w) => w[0] === word2[2] && w[2] === word3[2] && w[4] === word4[2]
    );
    if (word5 === "#####") {
      continue;
    }
    range5.forEach((i) => {
      res[2][i].letter = word5[i];
    });

    const word6 = randomWordFilter(
      (w) => w[0] === word2[4] && w[2] === word3[4] && w[4] === word4[4]
    );
    if (word6 === "#####") {
      continue;
    }
    range5.forEach((i) => {
      res[4][i].letter = word6[i];
    });

    console.log(`generated grid in ${try_nbr} tries`);
    return res;
  }

  console.log(`could not generate grid in ${try_nbr} tries`);

  return res;
}

export function isValidCoord(c: Coords): boolean {
  return (
    c.x === 0 || c.x === 2 || c.x === 4 || c.y === 0 || c.y === 2 || c.y === 4
  );
}

const allCoords: Coords[] = range5
  .map((i) => range5.map((j) => ({ x: i, y: j })))
  .flat()
  .filter(isValidCoord);

function randomCoordPair(): [Coords, Coords] {
  return [randomElt(allCoords), randomElt(allCoords)];
}

export function cloneLetters(letters: Grid): Grid {
  return letters.map((arr) => arr.map((e) => ({ ...e })));
}

function countLetters(word: Entry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    const letter = word[i].letter;
    if (!(letter in result)) {
      result[letter] = 0;
    }
    result[letter] += 1;
  }
  return result;
}

function compareWords(challenge: Entry[], reference: Entry[]) {
  const count = countLetters(reference);
  for (let i = 0; i < 5; i++) {
    if (challenge[i].letter === reference[i].letter) {
      challenge[i].comp.letterPosGood = true;
      count[reference[i].letter] -= 1;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (challenge[i].comp.letterPosGood) {
      continue;
    }
    if (reference.findIndex((e) => e.letter === challenge[i].letter) >= 0) {
      const letter = challenge[i].letter;
      if (count[letter] > 0) {
        challenge[i].comp.letterGood = true;
        count[letter] -= 1;
      }
    }
  }
}

function getVerticalWord(letters: Grid, y: number): Entry[] {
  return range5.map((i) => letters[y][i]);
}

function getHorizontalWord(letters: Grid, x: number): Entry[] {
  return range5.map((i) => letters[i][x]);
}

export function compareGrids(challenge: Grid, reference: Grid): Grid {
  const result = cloneLetters(challenge);
  result.forEach((row) =>
    row.forEach((entry) => {
      entry.comp = { letterGood: false, letterPosGood: false };
    })
  );
  [0, 2, 4].forEach((x) => {
    compareWords(getVerticalWord(result, x), getVerticalWord(reference, x));
  });
  [0, 2, 4].forEach((y) => {
    compareWords(getHorizontalWord(result, y), getHorizontalWord(reference, y));
  });
  return result;
}

function swapCells(grid: Grid, c1: Coords, c2: Coords) {
  const l1 = grid[c1.x][c1.y];
  const l2 = grid[c2.x][c2.y];
  grid[c1.x][c1.y] = l2;
  grid[c2.x][c2.y] = l1;
}

export function checkWinLooseConditions(state: AppState): Phase {
  let goodpos = 0;
  state.grid.forEach((row) =>
    row.forEach((e) => {
      if (e.comp.letterPosGood) {
        goodpos += 1;
      }
    })
  );
  return goodpos === 21 ? "win" : state.remainingMoves === 0 ? "loose" : "play";
}

export function saveState(state: AppState) {
  localStorage["state"] = JSON.stringify(state);
}

export function loadState(): AppState | null {
  const savedStateJson = localStorage.getItem("state");
  if (savedStateJson === null) {
    return null;
  }
  const savedState = JSON.parse(savedStateJson) as AppState;
  const currentSeed = getSeed();
  if (savedState.seed !== currentSeed) {
    return null;
  }
  return savedState;
}

export function newGrid(): [Grid, Grid] {
  seed();
  const init = initWords();
  const init_reference = cloneLetters(init);
  for (let i = 0; i < 500; i++) {
    const [c1, c2] = randomCoordPair();
    swapCells(init, c1, c2);
  }
  const init_with_comp = compareGrids(init, init_reference);
  return [init_reference, init_with_comp];
}

export function initState(): AppState {
  return {
    seed: getSeed(),
    phase: "play",
    grid: initArray(),
    reference: initArray(),
    selected: null,
    remainingMoves: 25,
  };
}
