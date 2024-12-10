function filterVideos(category) {
    const videos = document.querySelectorAll('.grid-item');
    const mainVideoContainer = document.querySelector('.main-video-container');

    // Mostrar u ocultar los videos en la cuadrícula según la categoría
    videos.forEach(video => {
        const videoCategory = video.getAttribute('data-category');
        if (category === 'All' || videoCategory === category || category === 'Reel') {
            video.style.display = 'block'; // Mostrar video
        } else {
            video.style.display = 'none'; // Ocultar video
        }
    });

    // Mostrar u ocultar el video principal basado en la categoría seleccionada
    if (category === 'Reel' && mainVideoContainer) {
        mainVideoContainer.style.display = 'flex'; // Mostrar el video principal
    } else if (mainVideoContainer) {
        mainVideoContainer.style.display = 'none'; // Ocultar el video principal
    }
}

// Asignar eventos a los enlaces del menú para filtrar videos
document.querySelectorAll('.sections a').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault(); // Evita la acción predeterminada del enlace
        const category = link.textContent.trim(); // Obtiene la categoría del enlace
        filterVideos(category); // Filtra los videos según la categoría
    });
});

// Manejar la interacción con videos (pausar, reproducir, activar controles)
document.querySelectorAll('.grid-item video').forEach(video => {
    video.addEventListener('loadeddata', () => {
        video.currentTime = 1; // Establece el tiempo inicial
    });

    video.addEventListener('mouseenter', () => {
        video.play(); // Reproduce el video al pasar el mouse
    });

    video.addEventListener('mouseleave', () => {
        video.pause(); // Pausa el video al salir el mouse
    });

    video.addEventListener('click', () => {
        video.controls = !video.controls; // Alterna los controles al hacer clic
    });
});

// Mostrar todos los videos por defecto al cargar la página
filterVideos('All');
