import { Fragment, ReactNode, useEffect, useState } from "react";
import {
  cloneLetters,
  compareGrids,
  Coords,
  Grid,
  initArray,
  initWords,
  isValidCoord,
  randomCoordPair,
  range5,
  seed,
  swapCells,
} from "./utils";

type State = "play" | "win" | "loose";

function App() {
  const [state, setState] = useState<State>("play");

  const [letters, setLetters] = useState<Grid>(initArray());
  const [reference, setReference] = useState<Grid>(initArray());
  const [selected, setSelected] = useState<Coords | null>(null);
  const [moves, setMoves] = useState<number>(40);

  useEffect(() => {
    seed();
    const init = initWords();
    const init_reference = cloneLetters(init);
    setReference(init_reference);
    for (let i = 0; i < 500; i++) {
      const [c1, c2] = randomCoordPair();
      swapCells(init, c1, c2);
    }
    const init_with_comp = compareGrids(init, init_reference);
    setLetters(init_with_comp);
  }, []);

  function swap(c1: Coords, c2: Coords) {
    setLetters((letters) => {
      const l1 = letters[c1.x][c1.y];
      const l2 = letters[c2.x][c2.y];
      const new_letters = cloneLetters(letters);
      new_letters[c1.x][c1.y] = l2;
      new_letters[c2.x][c2.y] = l1;
      const compared_grid = compareGrids(new_letters, reference);

      let goodpos = 0;
      compared_grid.forEach(row => row.forEach(e => {
        if (e.comp.letterPosGood) {
          goodpos += 1;
        }
      }));
      if (goodpos === 21) {
        setState("win");
      }
      return compared_grid;
    });
  }

  function pick(c: Coords) {
    if (state !== "play") {
      return
    }
    if (!selected) {
      setSelected(c);
    } else if (c.x === selected.x && c.y === selected.y) {
      setSelected(null);
    } else {
      swap(selected, c);
      setMoves((m) => {
        if (m === 1) {
          setState("loose");
          setSelected(null);
        }
        return m - 1;
      });
      setSelected(null);
    }
  }

  let component: ReactNode = null;
  if (state === "loose") {
    component = (
      <div className="text-2xl font-semibold mx-auto mb-4">
        Vous avez perdu!
      </div>
    );
  }

  if (state === "win") {
    component = (
      <div className="text-2xl font-semibold mx-auto mb-4">
        Vous avez gagné!
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-2 flex flex-col justify-center">
      <span className="text-4xl font-semibold mx-auto mb-4">Mauffre</span>
      <div className="grid grid-cols-5 grid-flow-row text-center gap-2 text-4xl font-semibold">
        {range5.map((i) => (
          <Fragment key={i}>
            {range5.map((j) => {
              let classes =
                "h-20 w-full inline-block mx-1 flex items-center justify-items-center rounded-lg";
              const entry = letters[i][j];
              if (isValidCoord({ x: i, y: j })) {
                classes += " border border-4 hover:shadow-2xl";

                if (state === "play") {
                  classes += " cursor-pointer"
                } else {
                  classes += " cursor-not-allowed"
                }

                if (selected && selected.x === i && selected.y === j) {
                  classes += " border-sky-600";
                } else {
                  classes += " border-black";
                }
              }

              if (entry.comp.letterPosGood) {
                classes += " bg-emerald-300";
              } else if (entry.comp.letterGood) {
                classes += " bg-yellow-200";
              }

              return (
                <span
                  onClick={() => pick({ x: i, y: j })}
                  key={j}
                  className={classes}
                >
                  <span className="mx-auto">{entry.letter.toUpperCase()}</span>
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      <span className="text-2xl font-semibold mx-auto my-4">
        {moves} coups restant
      </span>
      {component}
    </div>
  );
}

export default App;
