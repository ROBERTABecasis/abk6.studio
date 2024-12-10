const draggables = document.querySelectorAll('.draggable');
        let draggedElement = null;
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        // Mousedown: Inicia el arrastre
        draggables.forEach(element => {
            element.addEventListener('mousedown', (e) => {
                isDragging = true; // Activar el estado de arrastre
                draggedElement = element;
                offsetX = e.clientX - element.offsetLeft;
                offsetY = e.clientY - element.offsetTop;
                element.style.cursor = 'grabbing';
                e.preventDefault(); // Evita que el navegador seleccione texto o imágenes
            });
        });

        // Mousemove: Mueve el elemento si está en arrastre
        document.addEventListener('mousemove', (e) => {
            if (isDragging && draggedElement) {
                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                draggedElement.style.left = `${newX}px`;
                draggedElement.style.top = `${newY}px`;
            }
        });

        // Mouseup: Finaliza el arrastre
        document.addEventListener('mouseup', () => {
            if (draggedElement) {
                draggedElement.style.cursor = 'grab';
                draggedElement = null;
            }
            isDragging = false; // Desactiva el estado de arrastre
        });

        // Asegura que el estado se restablezca incluso si el mouse sale de la ventana
        document.addEventListener('mouseleave', () => {
            if (draggedElement) {
                draggedElement.style.cursor = 'grab';
                draggedElement = null;
            }
            isDragging = false; // Restablece el estado
        });

        