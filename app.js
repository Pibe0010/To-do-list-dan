const form = document.querySelector("#formulario");
const titleForm = document.querySelector("#titulo-form");
const addTask = document.querySelector(".tareas");
const totalTask = document.querySelector("#total");
const completedTask = document.querySelector("#completadas");
const subTaskCompleted = document.querySelector("#subTaskCompleted");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let sorTableinstance;

(() => {
  form.addEventListener("submit", validatedForm);
  addTask.addEventListener("click", deleteTask);
  addTask.addEventListener("click", completeTask);
  AllTask();
})();

function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function validatedForm(e) {
  e.preventDefault();

  const newTask = document.querySelector("#tarea").value;

  if (!newTask.trim()) {
    titleForm.textContent = "No escribiste nada";
    setTimeout(() => {
      titleForm.textContent = "Nueva Tarea";
    }, 2000);
    return;
  }

  const objTask = {
    id: Date.now(),
    task: newTask,
    status: false,
    subtasks: [],
  };

  tasks = [...tasks, objTask];
  saveToLocalStorage();
  form.reset();
  AllTask();
}

function AllTask() {
  addTask.innerHTML = "";

  if (tasks.length === 0) {
    const message = document.createElement("h5");
    message.textContent = "No hay tareas";
    addTask.appendChild(message);
    totalTask.textContent = "Total: 0";
    completedTask.textContent = "Completadas: 0";
    return;
  }

  tasks.forEach((item) => {
    const itemTask = document.createElement("div");
    itemTask.classList.add("item-tarea");

    itemTask.innerHTML = `
      <div class="container">
        <div class="content-task">
          <span class="date">${new Date().toLocaleDateString()}</span>
          <p class="${item.status ? "completa" : ""}">${item.task}</p>
          <div class="btn-container">
            <img class="toggle-subtasks" data-id="${
              item.id
            }" src="./img/keyboard_arrow_down_24dp_999999_FILL0_wght400_GRAD0_opsz24.svg" />
            <img class="add-subtask" data-id="${
              item.id
            }" src="./img/add_circle_24dp_999999_FILL0_wght400_GRAD0_opsz24.svg"/>
            <img class="completada" data-id="${
              item.id
            }" src="./img/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"/>
            <img class="eliminar" data-id="${
              item.id
            }" src="./img/delete_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"/>
          </div>
          <div class="modal-overlay" style="display: none;">
            <div class="subtask-form" data-id="${item.id}" >
                <span class="subtask-title"> Nueva subtarea</span>
                <input type="text" placeholder="Escribe tu subtarea" class="input-subtask" />
                <button class="save-subtask button">Guardar</button>
                <img class="save-close" src="./img/close_24dp_999999_FILL0_wght400_GRAD0_opsz24.svg" />
            </div>
          </div>
        </div>
        <div class="subtasks-container" data-id="${
          item.id
        }" style="display: none;">
        </div>
      </div>
    `;

    const toggleBtn = itemTask.querySelector(".toggle-subtasks");
    const addBtn = itemTask.querySelector(".add-subtask");
    const saveBtn = itemTask.querySelector(".save-subtask");
    const subtaskForm = itemTask.querySelector(".subtask-form");
    const inputSub = itemTask.querySelector(".input-subtask");
    const subtaskContainer = itemTask.querySelector(".subtasks-container");
    const close = itemTask.querySelector(".save-close");
    const modalOverlay = itemTask.querySelector(".modal-overlay");

    subtaskForm.addEventListener("click", () => {
      if (sorTableinstance) sorTableinstance.option("disabled", true);
    });

    close.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      if (sorTableinstance) sorTableinstance.option("disabled", false);
    });

    toggleBtn.addEventListener("click", () => {
      subtaskContainer.style.display =
        subtaskContainer.style.display === "none" ? "block" : "none";
      renderSubtasks(item, subtaskContainer);
    });

    addBtn.addEventListener("click", () => {
      modalOverlay.style.display = "flex";
      inputSub.value = "";

      if (sorTableinstance) sorTableinstance.option("disabled", true);
    });

    saveBtn.addEventListener("click", () => {
      const text = inputSub.value.trim();
      if (!text) return;

      item.subtasks.push({ text, status: false });
      saveToLocalStorage();
      inputSub.value = "";
      renderSubtasks(item, subtaskContainer);
    });

    addTask.appendChild(itemTask);
  });

  totalTask.textContent = `Total: ${tasks.length}`;
  completedTask.textContent = `Completadas: ${
    tasks.filter((t) => t.status).length
  }`;

  enableDragAndDrop();
}

function renderSubtasks(task, container) {
  container.innerHTML = "";

  task.subtasks.forEach((sub, index) => {
    const div = document.createElement("div");
    div.className = "subtask";

    const p = document.createElement("p");
    p.textContent = sub.text;
    p.className = sub.status ? "completa" : "";
    p.style.cursor = "pointer";

    p.addEventListener("click", () => {
      sub.status = !sub.status;
      saveToLocalStorage();
      renderSubtasks(task, container);
    });

    // Crear contenedor de botones
    const btnGroup = document.createElement("div");
    btnGroup.className = "subtask-btns";

    const editBtn = document.createElement("img");
    editBtn.className = "btn-edit";
    editBtn.src = "./img/edit_note_24dp_999999_FILL0_wght400_GRAD0_opsz24.svg";
    editBtn.style.cursor = "pointer";
    editBtn.title = "Editar";

    editBtn.addEventListener("click", () => {
      // Buscar el modal y elementos relacionados desde el DOM
      const parentTaskDiv = container.closest(".container");
      const modalOverlay = parentTaskDiv.querySelector(".modal-overlay");
      const inputSub = modalOverlay.querySelector(".input-subtask");
      const saveBtn = modalOverlay.querySelector(".save-subtask");

      modalOverlay.style.display = "flex";
      inputSub.value = sub.text;
      saveBtn.textContent = "Actualizar";

      // Clonar y reemplazar botón para evitar múltiples listeners
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

      newSaveBtn.addEventListener("click", () => {
        const newText = inputSub.value.trim();
        if (!newText) return;

        sub.text = newText;
        saveToLocalStorage();
        renderSubtasks(task, container);
        modalOverlay.style.display = "none";
        newSaveBtn.textContent = "Guardar";
      });
    });

    const deleteBtn = document.createElement("img");
    deleteBtn.className = "btn-delete";
    deleteBtn.src = "./img/delete_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.title = "Eliminar";

    deleteBtn.addEventListener("click", () => {
      task.subtasks.splice(index, 1);
      saveToLocalStorage();
      renderSubtasks(task, container);
    });

    const subDate = document.createElement("span");
    subDate.textContent = new Date().toLocaleDateString();
    subDate.className = "subtask-date";

    // Agregar botones al grupo
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    // Agregar contenido a la subtarea
    div.appendChild(subDate);
    div.appendChild(p);
    div.appendChild(btnGroup);

    container.appendChild(div);
  });
}

function deleteTask(e) {
  if (e.target.classList.contains("eliminar")) {
    const id = Number(e.target.dataset.id);
    tasks = tasks.filter((item) => item.id !== id);
    saveToLocalStorage();
    AllTask();
  }
}

function completeTask(e) {
  if (e.target.classList.contains("completada")) {
    const id = Number(e.target.dataset.id);
    const task = tasks.find((item) => item.id === id);
    task.status = !task.status;
    saveToLocalStorage();
    AllTask();
  }
}

function enableDragAndDrop() {
  if (sorTableinstance) sorTableinstance.destroy();

  sorTableinstance = new Sortable(addTask, {
    animation: 200,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    filter: ".completa",
    onMove: (e) => !e.related.querySelector("p").classList.contains("completa"),
    onEnd: () => {
      const newTasks = [];
      const taskElements = addTask.querySelectorAll(".item-tarea p");

      taskElements.forEach((p) => {
        const text = p.textContent;
        const match = tasks.find((t) => t.task === text);
        if (match) newTasks.push(match);
      });

      tasks = newTasks;
      saveToLocalStorage();
    },
  });
}
