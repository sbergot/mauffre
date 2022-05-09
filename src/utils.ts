import words from "./mots_5.json";
import seedrandom, { PRNG } from "seedrandom";

let rng: PRNG;

export function seed() {
  let now = new Date();
  let seed_str = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  rng = seedrandom(seed_str);
}

export interface CharComp {
  letterGood: boolean;
  letterPosGood: boolean;
}

export interface Entry {
  letter: string;
  comp: CharComp;
}

export type Grid = Entry[][];

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

export function initArray(): Grid {
  return range5.map(() =>
    range5.map(() => ({
      letter: "",
      comp: { letterGood: false, letterPosGood: false },
    }))
  );
}

export function initWords(): Grid {
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

export interface Coords {
  x: number;
  y: number;
}

export function isValidCoord(c: Coords): boolean {
  return (
    c.x === 0 || c.x === 2 || c.x === 4 || c.y === 0 || c.y === 2 || c.y === 4
  );
}

export const allCoords: Coords[] = range5
  .map((i) => range5.map((j) => ({ x: i, y: j })))
  .flat()
  .filter(isValidCoord);

export function randomCoordPair(): [Coords, Coords] {
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

export function swapCells(grid: Grid, c1: Coords, c2: Coords) {
  const l1 = grid[c1.x][c1.y];
  const l2 = grid[c2.x][c2.y];
  grid[c1.x][c1.y] = l2;
  grid[c2.x][c2.y] = l1;
}
