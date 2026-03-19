const taskForm = document.getElementById('todo-form');     
const taskInput = document.getElementById('task-input');   
const taskList = document.getElementById('task-list');     
const taskTemplate = document.getElementById('task-template').content; 

let tasks = [];

taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const text = taskInput.value.trim(); 

    if (text !== '') {
        const newTask = {
            id: Date.now(),
            title: text,
            completed: false,
            createdAt: new Date()
        };

        tasks.push(newTask); 
        taskInput.value = ''; 
        renderTasks();        
    }
});

function renderTasks() {
    taskList.innerHTML = ''; // Limpiamos la lista para no duplicar todo

    tasks.forEach(task => {
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
});

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
}
