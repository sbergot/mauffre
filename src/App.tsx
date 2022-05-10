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
    if (phase !== "play") {
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

  let component: ReactNode = null;
  if (phase === "loose") {
    component = (
      <div className="text-2xl font-semibold mx-auto mb-4">
        Vous avez perdu!
      </div>
    );
  }

  if (phase === "win") {
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
              const entry = grid[i][j];
              if (isValidCoord({ x: i, y: j })) {
                classes += " border border-4 hover:shadow-2xl";

                if (phase === "play") {
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
      <span className="text-2xl font-semibold mx-auto my-4">
        {remainingMoves} coups restant
      </span>
      {component}
    </div>
  );
}

export default App;
