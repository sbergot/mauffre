import { useEffect, useState } from "react";
import { cloneLetters, compareGrids, Coords, Grid, initArray, initWords, isValidCoord, randomCoordPair, range5, swapCells } from "./utils";

function App() {
  const [letters, setLetters] = useState<Grid>(initArray());
  const [reference, setReference] = useState<Grid>(initArray());
  const [selected, setSelected] = useState<Coords | null>(null);

  useEffect(() => {
    const init = initWords();
    const init_reference = cloneLetters(init);
    setReference(init_reference);
    for (let i =0; i<500; i++) {
      const [c1, c2] = randomCoordPair();
      swapCells(init, c1, c2);
    }
    const init_with_comp = compareGrids(init, init_reference);
    setLetters(init_with_comp);
  }, []);

  function swap(c1: Coords, c2: Coords) {
    setLetters(letters => {
      const l1 = letters[c1.x][c1.y];
      const l2 = letters[c2.x][c2.y];
      const new_letters = cloneLetters(letters);
      new_letters[c1.x][c1.y] = l2;
      new_letters[c2.x][c2.y] = l1;
      compareGrids(new_letters, reference);
      return new_letters;
    })
  }

  function pick(c: Coords) {
    if (!selected) {
      setSelected(c);
    } else {
      swap(selected, c);
      setSelected(null);
    }
  }


  return (
    <div className="max-w-xl mx-auto p-2 flex flex-col justify-center">
      <span className="text-4xl font-semibold mx-auto mb-4">Mauffre</span>
      <div className="flex flex-col text-center gap-2 text-4xl font-semibold mx-auto">
        {range5.map((i) => (
          <div key={i} className="flex">
            {range5.map((j) => {
              let classes =
                "w-20 h-20 inline-block mx-1 cursor-pointer flex justify-center items-center rounded-lg";
              const entry = letters[i][j];
              if (isValidCoord({x: i, y: j})) {
                classes += " border border-4";

                if (selected && selected.x === i && selected.y === j) {
                  classes += " border-sky-600";
                } else {
                  classes += " border-black"
                }  
              }

              if (entry.comp.letterPosGood) {
                classes += " bg-emerald-300"
              } else if (entry.comp.letterGood) {
                classes += " bg-yellow-200"
              }

              return (
                <span onClick={() => pick({x: i, y: j})} key={j} className={classes}>
                  <span>{entry.letter.toUpperCase()}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
