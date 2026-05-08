import { useEffect, useState } from "react";
import "./app.css";

function App() {
  const columnNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const [rowCount, setRowCount] = useState(10);
  const [colCount, setColCount] = useState(10);
  const [cells, setCells] = useState({});
  const [selectedCell, setSelectedCell] = useState("A1");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("spreadsheet-data");
    if (saved) {
      const data = JSON.parse(saved);
      setCells(data.cells || {});
      setRowCount(data.rowCount || 10);
      setColCount(data.colCount || 10);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "spreadsheet-data",
      JSON.stringify({ cells, rowCount, colCount })
    );
  }, [cells, rowCount, colCount]);

  function saveHistory() {
    setHistory([...history, { cells, rowCount, colCount }]);
    setFuture([]);
  }

  function updateCell(cellId, value) {
    saveHistory();
    setCells({
      ...cells,
      [cellId]: value,
    });
  }

  function updateFormulaBar(value) {
    updateCell(selectedCell, value);
  }

  function undo() {
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    setFuture([{ cells, rowCount, colCount }, ...future]);
    setCells(previous.cells);
    setRowCount(previous.rowCount);
    setColCount(previous.colCount);
    setHistory(history.slice(0, -1));
  }

  function redo() {
    if (future.length === 0) return;

    const next = future[0];
    setHistory([...history, { cells, rowCount, colCount }]);
    setCells(next.cells);
    setRowCount(next.rowCount);
    setColCount(next.colCount);
    setFuture(future.slice(1));
  }

  function addRow() {
    saveHistory();
    setRowCount(rowCount + 1);
  }

  function addColumn() {
    if (colCount >= 26) return;
    saveHistory();
    setColCount(colCount + 1);
  }

  function clearSheet() {
    saveHistory();
    setCells({});
  }

  function getCellRaw(cellId) {
    return cells[cellId] || "";
  }

  function getCellDisplay(cellId, visited = []) {
    const raw = getCellRaw(cellId);

    if (!raw.startsWith("=")) {
      return raw;
    }

    if (visited.includes(cellId)) {
      return "#CIRCULAR";
    }

    return evaluateFormula(raw, [...visited, cellId]);
  }

  function evaluateFormula(formula, visited) {
    try {
      let expression = formula.substring(1);

      expression = expression.replace(/[A-Z](\d+)/g, function (cellRef) {
        const col = cellRef.match(/[A-Z]+/)[0];
        const row = Number(cellRef.match(/\d+/)[0]);

        if (!columnNames.slice(0, colCount).includes(col)) {
          throw new Error("Invalid reference");
        }

        if (row < 1 || row > rowCount) {
          throw new Error("Invalid reference");
        }

        const value = getCellDisplay(cellRef, visited);

        if (value === "#CIRCULAR") {
          throw new Error("Circular reference");
        }

        if (value === "#ERROR") {
          throw new Error("Formula error");
        }

        if (value === "" || isNaN(value)) {
          return "0";
        }

        return value;
      });

      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        return "#ERROR";
      }

      const result = Function('"use strict"; return (' + expression + ")")();

      if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
        return "#ERROR";
      }

      return result;
    } catch (error) {
      if (error.message === "Circular reference") {
        return "#CIRCULAR";
      }

      return "#ERROR";
    }
  }

  function inputValue(cellId) {
    if (selectedCell === cellId) {
      return getCellRaw(cellId);
    }

    return getCellDisplay(cellId);
  }

  function isError(cellId) {
    const value = getCellDisplay(cellId);
    return value === "#ERROR" || value === "#CIRCULAR";
  }

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    }

    if (e.ctrlKey && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    }
  }

  return (
    <div className="container" onKeyDown={handleKeyDown}>
      <h1>Spreadsheet Engine</h1>

      <div className="toolbar">
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={clearSheet}>Clear</button>
      </div>

      <div className="formula-bar">
        <span className="cell-name">{selectedCell}</span>
        <span className="fx">fx</span>
        <input
          value={getCellRaw(selectedCell)}
          onChange={(e) => updateFormulaBar(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th></th>
            {columnNames.slice(0, colCount).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <th>{rowIndex + 1}</th>

              {columnNames.slice(0, colCount).map((col) => {
                const cellId = col + (rowIndex + 1);

                return (
                  <td key={cellId}>
                    <input
                      className={
                        selectedCell === cellId
                          ? "selected"
                          : isError(cellId)
                          ? "error"
                          : ""
                      }
                      value={inputValue(cellId)}
                      onFocus={() => setSelectedCell(cellId)}
                      onChange={(e) => updateCell(cellId, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;