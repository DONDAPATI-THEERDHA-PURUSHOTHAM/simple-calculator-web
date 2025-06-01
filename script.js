// Selectors
const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".buttons button");
const powerBtn = document.getElementById("power");
const clearBtn = document.getElementById("clear");
const backspaceBtn = document.getElementById("backspace");
const resultBtn = document.getElementById("result");
const lastResultSpan = document.getElementById("lastResult");
const historyModal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");
const showHistoryBtn = document.getElementById("showHistory");
const clearHistoryBtn = document.getElementById("clearHistory");
const closeHistoryBtn = document.getElementById("closeHistory");

let isOn = true;
let currentInput = "";
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

// Enable or disable all buttons except power button
function toggleButtons(enabled) {
  buttons.forEach((btn) => {
    if (btn !== powerBtn) {
      btn.disabled = !enabled;
    }
  });
}

// Power toggle handler
function togglePower() {
  isOn = !isOn;
  if (isOn) {
    display.disabled = false;
    powerBtn.textContent = "Power ON";
    toggleButtons(true);
    updateDisplay("");
  } else {
    display.disabled = true;
    powerBtn.textContent = "Power OFF";
    toggleButtons(false);
    updateDisplay("");
  }
}

// Update display and current input
function updateDisplay(value) {
  currentInput = value;
  display.value = currentInput;
}

// Evaluate expression with scientific functions
function evaluateExpression(input) {
  if (!input) return "";

  // Replace sqrt, sin, cos, tan, % with Math functions
  let exp = input
    .replace(/√/g, "Math.sqrt")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/%/g, "*0.01");

  // Convert degrees to radians for trig
  exp = exp.replace(/Math\.sin\(([^)]+)\)/g, (_, val) => `Math.sin((${val})*Math.PI/180)`);
  exp = exp.replace(/Math\.cos\(([^)]+)\)/g, (_, val) => `Math.cos((${val})*Math.PI/180)`);
  exp = exp.replace(/Math\.tan\(([^)]+)\)/g, (_, val) => `Math.tan((${val})*Math.PI/180)`);

  try {
    // eslint-disable-next-line no-eval
    let result = eval(exp);
    if (result === undefined) return "";
    if (typeof result === "number" && !Number.isInteger(result)) {
      result = result.toFixed(6);
    }
    return result.toString();
  } catch {
    return "Error";
  }
}

// Save result to history with date/time
function saveResultToHistory(expression, result) {
  const now = new Date();
  history.push({
    expression,
    result,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  });
  localStorage.setItem("calcHistory", JSON.stringify(history));
  lastResultSpan.textContent = result;
}

// Render history list in modal
function renderHistory() {
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = "<li>No history available.</li>";
    return;
  }
  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `[${item.date} ${item.time}] ${item.expression} = ${item.result}`;
    historyList.appendChild(li);
  });
}

// Initial state: all buttons enabled, display enabled
toggleButtons(true);
display.disabled = false;
powerBtn.textContent = "Power ON";

// Button click handling
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!isOn && button !== powerBtn) return;

    const value = button.textContent;

    if (button === powerBtn) {
      togglePower();
      return;
    }

    if (button === clearBtn) {
      updateDisplay("");
      return;
    }

    if (button === backspaceBtn) {
      updateDisplay(currentInput.slice(0, -1));
      return;
    }

    if (button === resultBtn) {
      const res = evaluateExpression(currentInput);
      if (res !== "Error" && res !== "") {
        saveResultToHistory(currentInput, res);
        updateDisplay(res);
      } else {
        updateDisplay("Error");
      }
      return;
    }

    if (button === showHistoryBtn) {
      renderHistory();
      historyModal.classList.remove("hidden");
      return;
    }

    if (button === clearHistoryBtn) {
      history = [];
      localStorage.removeItem("calcHistory");
      renderHistory();
      lastResultSpan.textContent = "None";
      return;
    }

    // Append button value to input
    updateDisplay(currentInput + value);
  });
});

// Keyboard support
window.addEventListener("keydown", (e) => {
  if (!isOn) return;

  const allowedKeys = "0123456789+-/*.%()";
  const key = e.key;

  if (allowedKeys.includes(key)) {
    updateDisplay(currentInput + key);
  } else if (key === "Enter") {
    e.preventDefault();
    resultBtn.click();
  } else if (key === "Backspace") {
    updateDisplay(currentInput.slice(0, -1));
  } else if (key.toLowerCase() === "c") {
    updateDisplay("");
  }
});

// Close history modal on close button click
closeHistoryBtn.addEventListener("click", () => {
  historyModal.classList.add("hidden");
});
