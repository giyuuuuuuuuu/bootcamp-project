const taskForm = document.getElementById('todo-form');     
const taskInput = document.getElementById('task-input');   
const taskList = document.getElementById('task-list');     
const taskTemplate = document.getElementById('task-template').content;
const savedJson = localStorage.getItem("myTasks");
const filterButtons = document.querySelectorAll('.filter-btn');
let currentFilter = 'all'
let tasks = savedJson ? JSON.parse(savedJson) : [];

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim(); 
    if (text !== '') {
        const newTask = {
            id: Date.now(),
            title: text,
            completed: false,
        } 
        tasks.push(newTask); 
        taskInput.value = ''; 
        renderTasks();        
    } else {
            // Si el texto está vacío, manda un aviso
            taskInput.placeholder = "Debe introducir una tarea";
            taskInput.style.borderColor = "var(--danger)";
            taskInput.focus();
            renderTasks();
        };
    });

filterButtons.forEach(btn =>{
    btn.addEventListener('click', () =>{
        currentFilter = btn.dataset.filter
        renderTasks();
    });
});

;

// Mejoramos un poco la experiencia del usuario
taskInput.addEventListener('input', () => {
    if (taskInput.value.trim() != ''){
        taskInput.style.borderColor = "#ddd";
        taskInput.placeholder = "Escriba una tarea";
    }
});

function renderTasks() {
    taskList.innerHTML = ''; // Limpiamos la lista para no duplicar todo
    // Recorremos la lista de tareas, y aplicamos el filtro de una vez
    let filteredTasks = tasks.filter(task =>{
        if (currentFilter === 'pending') return !task.completed; // Devuelve las no marcadas como completadas
        if (currentFilter === 'completed') return task.completed;
        return true; // Si ninguna está marcada como completada, dibuja todas las tareas en la lista
    });


    filteredTasks.forEach(task => {
        // Clonamos el contenido del template
        const clone = taskTemplate.cloneNode(true);
        clone.querySelector('.task-text').textContent = task.title;
        
        if (task.completed) {
            clone.querySelector('.task-text').style.textDecoration = 'line-through';
            clone.querySelector('.task-checkbox').checked = true;
        }

        clone.querySelector('.delete-btn').dataset.id = task.id;
        clone.querySelector('.task-checkbox').dataset.id = task.id;
        taskList.appendChild(clone);
    });

    updateStats(); // Cada vez que dibujamos, actualizamos los números
    saveToLocalStorage(); // Llamar a la función para que dibuje en la pantalla los datos actualizados
}

taskList.addEventListener('click', (e) => {
    const id = e.target.dataset.id; 
    if (e.target.classList.contains('delete-btn')) {
        // Si clicó en eliminar: filtramos la lista para quitar esa tarea
        tasks = tasks.filter(task => task.id !== parseInt(id));
        renderTasks();
    }
    if (e.target.classList.contains('task-checkbox')) {
        // Si clicó en el checkbox: buscamos la tarea y cambiamos su estado
        const task = tasks.find(t => t.id === parseInt(id));
        task.completed = !task.completed;
        renderTasks();
    }
    if(!id) return;
});

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
}

function saveToLocalStorage() {  
    // localStorage.setItem guarda ese texto bajo la etiqueta 'myTasks'
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

renderTasks();
