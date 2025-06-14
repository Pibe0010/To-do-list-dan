const form = document.querySelector("#formulario");
const titleForm = document.querySelector("#titulo-form");
const addTask = document.querySelector(".tareas");
const totalTask = document.querySelector("#total");
const completedTask = document.querySelector("#completadas");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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
    <div class="content-task">
      <span class="date">${new Date().toLocaleDateString()}</span>
      <p class="${item.status ? "completa" : ""}">${item.task} </p>
    <div class="botones">
      <img class="eliminar" data-id="${
        item.id
      }" src="./img/delete_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"/>
      <img class="completada" data-id="${
        item.id
      }" src="./img/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"/>
    </div>
    </div>
    `;

    addTask.appendChild(itemTask);
  });

  const total = tasks.length;
  totalTask.textContent = `Total: ${total}`;

  const completed = tasks.filter((item) => item.status === true).length;
  completedTask.textContent = `Completadas: ${completed}`;

  enableDragAndDrop();
}

function enableDragAndDrop() {
  new Sortable(addTask, {
    animation: 200,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    filter: ".completa",
    onMove: function (e) {
      return !e.related.querySelector("p").classList.contains("completa");
    },
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
