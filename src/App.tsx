import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
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
    if (phase !== "play" || state.grid[c.x][c.y].comp.letterPosGood) {
      return;
    }
    if (!selected) {
      setSelected(c);
    } else if (c.x === selected.x && c.y === selected.y) {
      setSelected(null);
    } else {
      swap(selected, c);
      setState((s) => {
        const new_phase = checkWinLooseConditions(s);
        const new_selected = new_phase === "play" ? s.selected : null;
        return {
          ...s,
          phase: new_phase,
          selected: new_selected,
          remainingMoves: s.remainingMoves - 1,
        };
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
              let classes =
                "h-20 w-full inline-block mx-1 flex items-center justify-items-center rounded-lg";
              const entry = grid[i][j];
              if (isValidCoord({ x: i, y: j })) {
                classes += " border border-4 hover:shadow-2xl";

                if (phase === "play" && !entry.comp.letterPosGood) {
                  classes += " cursor-pointer";
                } else {
                  classes += " cursor-not-allowed";
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
      <EndGameMessage phase={phase} />
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

function EndGameMessage(props: { phase: Phase }) {
  if (props.phase === "loose") {
    return (
      <div className="text-2xl font-semibold mx-auto">Vous avez perdu!</div>
    );
  }

  if (props.phase === "win") {
    return (
      <div className="text-2xl font-semibold mx-auto">Vous avez gagné!</div>
    );
  }

  return null;
}

export default App;
