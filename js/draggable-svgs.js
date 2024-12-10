const draggables = document.querySelectorAll('.draggable');
let draggedElement = null;
let isDragging = false;
let offsetX = 0, offsetY = 0;

// Función para iniciar el arrastre
const startDrag = (e, element) => {
    isDragging = true;
    draggedElement = element;

    const rect = element.getBoundingClientRect();
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    element.style.cursor = 'grabbing';
    e.preventDefault(); // Evita el scroll u otros comportamientos predeterminados
};

// Función para mover el elemento
const moveDrag = (e) => {
    if (isDragging && draggedElement) {
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const newX = clientX - offsetX;
        const newY = clientY - offsetY;

        draggedElement.style.left = `${newX}px`;
        draggedElement.style.top = `${newY}px`;
    }
};

// Función para finalizar el arrastre
const endDrag = () => {
    if (draggedElement) {
        draggedElement.style.cursor = 'grab';
        draggedElement = null;
    }
    isDragging = false;
};

// Asignar eventos a cada elemento draggable
draggables.forEach((element) => {
    element.addEventListener('mousedown', (e) => startDrag(e, element));
    element.addEventListener('touchstart', (e) => startDrag(e, element), { passive: false }); // `passive: false`

    // Opcional: Estilo inicial de cursor
    element.style.cursor = 'grab';
});

// Eventos globales para mover y finalizar arrastre
document.addEventListener('mousemove', moveDrag);
document.addEventListener('touchmove', moveDrag, { passive: false }); // `passive: false`

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

// Asegurar que el estado se restablezca si el puntero sale de la ventana
document.addEventListener('mouseleave', endDrag);
document.addEventListener('touchcancel', endDrag);
