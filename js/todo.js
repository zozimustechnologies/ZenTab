/**
 * todo.js — task list backed by chrome.storage.local.
 */

const Todo = (() => {
  const form    = document.getElementById("todo-form");
  const input   = document.getElementById("todo-input");
  const inputError = document.getElementById("todo-input-error");
  const listEl  = document.getElementById("todo-list");

  function showError(msg) {
    input.classList.add("input-error");
    inputError.textContent = msg;
    inputError.classList.remove("hidden");
  }

  function clearError() {
    input.classList.remove("input-error");
    inputError.classList.add("hidden");
  }

  let tasks = [];

  function save() {
    Storage.setLocal({ tasks });
  }

  function render() {
    listEl.innerHTML = "";
    tasks.forEach((task, i) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (task.done ? " done" : "");

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = task.done;
      cb.addEventListener("change", () => {
        tasks[i].done = cb.checked;
        li.classList.toggle("done", cb.checked);
        save();
      });

      const span = document.createElement("span");
      span.textContent = task.text;

      const del = document.createElement("button");
      del.className = "todo-delete";
      del.textContent = "✕";
      del.title = "Delete";
      del.addEventListener("click", () => {
        tasks.splice(i, 1);
        save();
        render();
      });

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  async function init() {
    const data = await Storage.getLocal("tasks");
    tasks = Array.isArray(data.tasks) ? data.tasks : [];
    render();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {
        showError("Please enter a task.");
        return;
      }
      clearError();
      tasks.push({ text, done: false });
      input.value = "";
      save();
      render();
      listEl.scrollTop = listEl.scrollHeight;
    });

    input.addEventListener("input", clearError);
  }

  return { init };
})();
