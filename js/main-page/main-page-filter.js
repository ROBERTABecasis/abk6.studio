document.addEventListener('DOMContentLoaded', () => {
  // Mostrar la categoría "Reel" por defecto al cargar la página y mostrar todos los videos
  filterVideos('Reel', true);

  function filterVideos(category, showAllOnLoad = false) {
    const videos = document.querySelectorAll('.grid-item');
    const mainVideoContainer = document.querySelector('.main-video-container');

    if (category === 'Reel' || showAllOnLoad) {
      // Mostrar todos los videos y el contenedor principal para "Reel"
      videos.forEach(video => {
        video.style.display = 'block';
      });
      mainVideoContainer.style.display = 'flex'; // Mostrar el contenedor principal
    } else {
      // Filtrar videos en función de la categoría
      videos.forEach(video => {
        const videoCategory = video.getAttribute('data-category');
        if (category === 'All' || videoCategory === category) {
          video.style.display = 'block';
        } else {
          video.style.display = 'none';
        }
      });
      mainVideoContainer.style.display = 'none'; // Ocultar el contenedor principal
    }
  }

  // Añadir eventos a los enlaces del menú para cambiar la categoría
  document.querySelectorAll('.sections a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault(); // Evita la acción predeterminada del enlace
      const category = link.getAttribute('data-category'); // Obtiene la categoría del enlace
      filterVideos(category); // Filtra los videos según la categoría
    });
  });

  // Configurar el evento para el enlace "Reel" en el menú superior
  document.querySelector('.menu .right a').addEventListener('click', event => {
    event.preventDefault(); // Evita el comportamiento predeterminado del enlace
    scrollToTop();
    filterVideos('Reel'); // Mostrar todos los videos y el contenedor principal
  });

  // Configurar el evento para el enlace "Work" (All) en el menú central
  document.querySelector('.menu .center a').addEventListener('click', event => {
    event.preventDefault(); // Evita el comportamiento predeterminado del enlace
    filterVideos('All'); // Filtrar todos los videos y ocultar el contenedor principal
  });
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
