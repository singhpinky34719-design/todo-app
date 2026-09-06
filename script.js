const taskInput = document.getElementById("taskInput");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");
const themeToggle = document.getElementById("themeToggle");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const todayDate = document.getElementById("todayDate");

let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];
let currentFilter = "all";

// Today's date
todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

// Save tasks
function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

// Update counters
function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalTasks.textContent = tasks.length;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}

// Format date
function formatDate(date) {
    if (!date) return "";

    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Display tasks
function displayTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("div");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkButton = document.createElement("button");
        checkButton.className = "task-check";
        checkButton.textContent = task.completed ? "✓" : "";

        checkButton.onclick = function () {
            task.completed = !task.completed;
            saveTasks();
            displayTasks();
        };

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.text;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priorityBadge = document.createElement("span");
        priorityBadge.className = `priority ${task.priority}`;
        priorityBadge.textContent = task.priority;

        meta.appendChild(priorityBadge);

        if (task.dueDate) {
            const dateBadge = document.createElement("span");
            dateBadge.className = "due-date";
            dateBadge.textContent = `📅 ${formatDate(task.dueDate)}`;
            meta.appendChild(dateBadge);
        }

        content.appendChild(title);
        content.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn";
        editButton.textContent = "Edit";

        editButton.onclick = function () {
            const newText = prompt("Edit your task:", task.text);

            if (newText !== null && newText.trim() !== "") {
                task.text = newText.trim();
                saveTasks();
                displayTasks();
            }
        };

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete";
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function () {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            displayTasks();
        };

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        li.appendChild(checkButton);
        li.appendChild(content);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    emptyState.classList.toggle("show", filteredTasks.length === 0);
    updateStats();
}

// Add task
function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority.value,
        dueDate: dueDate.value
    };

    tasks.push(newTask);

    saveTasks();
    displayTasks();

    taskInput.value = "";
    dueDate.value = "";
    priority.value = "medium";
}

// Add button
addTaskBtn.addEventListener("click", addTask);

// Enter key
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// Search
searchInput.addEventListener("input", displayTasks);

// Filters
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
        currentFilter = this.dataset.filter;

        displayTasks();
    });
});

// Clear all
clearAllBtn.addEventListener("click", function () {
    if (tasks.length === 0) {
        alert("There are no tasks to clear!");
        return;
    }

    if (confirm("Are you sure you want to delete all tasks?")) {
        tasks = [];
        saveTasks();
        displayTasks();
    }
});

// Dark / Light mode
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "🌙" : "☀️";

    localStorage.setItem("taskflow_theme", isLight ? "light" : "dark");
});

// Load saved theme
const savedTheme = localStorage.getItem("taskflow_theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙";
}

// Initial display
displayTasks();