import { useState } from "react";
import "./app.css";

function App() {
  const rows = 10;
  const cols = 10;
  const columnLabels = "ABCDEFGHIJ".split("");

  const [cells, setCells] = useState({});
  const [activeCell, setActiveCell] = useState(null);

  function handleChange(cellId, value) {
    setCells({
      ...cells,
      [cellId]: value,
    });
  }

  function getCellValue(cellId, visited = []) {
    const raw = cells[cellId] || "";

    if (raw.startsWith("=")) {
      if (visited.includes(cellId)) {
        return "#CIRCULAR";
      }

      return evaluateFormula(raw, [...visited, cellId]);
    }

    return raw;
  }

  function evaluateFormula(formula, visited) {
    try {
      let expression = formula.substring(1);

      expression = expression.replace(/[A-J](10|[1-9])/g, function (cellRef) {
        const value = getCellValue(cellRef, visited);

        if (value === "#CIRCULAR") {
          throw new Error("Circular reference");
        }

        if (value === "" || isNaN(value)) {
          return "0";
        }

        return value;
      });

      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        return "#ERROR";
      }

      return Function('"use strict"; return (' + expression + ")")();
    } catch (error) {
      if (error.message === "Circular reference") {
        return "#CIRCULAR";
      }

      return "#ERROR";
    }
  }

  function displayValue(cellId) {
    if (activeCell === cellId) {
      return cells[cellId] || "";
    }

    return getCellValue(cellId);
  }

  return (
    <div className="container">
      <h1>Spreadsheet Engine</h1>

      <table>
        <thead>
          <tr>
            <th></th>
            {columnLabels.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <th>{rowIndex + 1}</th>

              {Array.from({ length: cols }, (_, colIndex) => {
                const cellId = columnLabels[colIndex] + (rowIndex + 1);

                return (
                  <td key={cellId}>
                    <input
  type="text"
  value={displayValue(cellId)}
  className={
    displayValue(cellId) === "#ERROR" || displayValue(cellId) === "#CIRCULAR"
      ? "error"
      : ""
  }
  onFocus={() => setActiveCell(cellId)}
  onBlur={() => setActiveCell(null)}
  onChange={(e) => handleChange(cellId, e.target.value)}
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