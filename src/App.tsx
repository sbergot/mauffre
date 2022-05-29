import { Fragment, useEffect, useState } from "react";
import {
  AppState,
  checkWinLooseConditions,
  cloneLetters,
  compareGrids,
  Coords,
  initState,
  isValidCoord,
  loadState,
  newGrid,
  Phase,
  range5,
  saveState,
} from "./utils";

function App() {
  const [state, setState] = useState<AppState>(initState());

  const { phase, grid, reference, selected, remainingMoves } = state;

  useEffect(() => {
    const loadedState = loadState();
    if (loadedState !== null) {
      setState(loadedState);
    } else {
      const [init_reference, init_with_comp] = newGrid();
      setState((s) => ({
        ...s,
        reference: init_reference,
        grid: init_with_comp,
      }));
    }
  }, []);

  useEffect(() => saveState(state));

  function setSelected(c: Coords | null) {
    setState((s) => ({ ...s, selected: c }));
  }

  function swap(c1: Coords, c2: Coords) {
    setState((s) => {
      const letters = s.grid;
      const l1 = letters[c1.x][c1.y];
      const l2 = letters[c2.x][c2.y];
      const new_letters = cloneLetters(letters);
      new_letters[c1.x][c1.y] = l2;
      new_letters[c2.x][c2.y] = l1;
      const compared_grid = compareGrids(new_letters, reference);
      return { ...s, grid: compared_grid };
    });
  }

  function pick(c: Coords) {
    if (phase !== "play" || state.grid[c.x][c.y].comp.letterPosGood || !isValidCoord(c)) {
      return;
    }
    if (!selected) {
      setSelected(c);
    } else if (c.x === selected.x && c.y === selected.y) {
      setSelected(null);
    } else {
      swap(selected, c);
      setState((old_state) => {
        const new_state = {
          ...old_state,
          remainingMoves: old_state.remainingMoves - 1,
        };
        new_state.phase = checkWinLooseConditions(new_state);
        new_state.selected =
          new_state.phase === "play" ? old_state.selected : null;
        return new_state;
      });
      setSelected(null);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-2 flex flex-col justify-center gap-4">
      <span className="text-4xl font-semibold mx-auto">Mauffre</span>
      <div className="grid grid-cols-5 grid-flow-row text-center gap-2 text-4xl font-semibold">
        {range5.map((i) => (
          <Fragment key={i}>
            {range5.map((j) => {
              const entry =
                state.phase !== "showAnswer" ? grid[i][j] : reference[i][j];

              let classes =
                "h-20 w-full inline-block mx-1 flex items-center justify-items-center rounded-lg";

              if (isValidCoord({ x: i, y: j })) {
                const comparison = entry.comp;

                classes += " border border-4";

                if (phase === "play" && !comparison.letterPosGood) {
                  classes += " cursor-pointer hover:shadow-2xl";
                } else {
                  classes += " cursor-not-allowed";
                }

                if (selected && selected.x === i && selected.y === j) {
                  classes += " border-sky-600";
                } else {
                  classes += " border-black";
                }

                if (phase === "showAnswer") {
                  classes += " bg-slate-300";
                } else if (entry.comp.letterPosGood) {
                  classes += " bg-emerald-300";
                } else if (entry.comp.letterGood) {
                  classes += " bg-yellow-200";
                }
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
      <EndGameMessage
        phase={phase}
        setPhase={(phase) => setState((s) => ({ ...s, phase }))}
      />
      <span className="text-2xl font-semibold mx-auto">
        {remainingMoves} coups restant
      </span>
      <span className="mx-auto">
        Inspiré de{" "}
        <a className="text-cyan-600 underline" href="https://wafflegame.net/">
          wafflegame.net
        </a>
      </span>
      <span className="mx-auto text-center">
        Liste de mots récupérée depuis{" "}
        <a
          className="block text-cyan-600 underline"
          href="http://www.pallier.org/liste-de-mots-francais.html"
        >
          www.pallier.org/liste-de-mots-francais.html
        </a>
      </span>
    </div>
  );
}

function EndGameMessage({
  phase,
  setPhase,
}: {
  phase: Phase;
  setPhase: (p: Phase) => void;
}) {
  if (phase === "loose") {
    return (
      <>
        <div className="text-2xl font-semibold mx-auto">Vous avez perdu!</div>
        <button
          className="text-xl font-semibold rounded-lg bg-slate-200 mx-auto p-2 border border-4 border-black"
          onClick={() => setPhase("showAnswer")}
        >
          Afficher les réponses
        </button>
      </>
    );
  }

  if (phase === "win") {
    return (
      <div className="text-2xl font-semibold mx-auto">Vous avez gagné!</div>
    );
  }

  return null;
}

export default App;
