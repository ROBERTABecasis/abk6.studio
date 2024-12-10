// Seleccionamos los elementos
const sections = document.querySelector('.sections');
const floatingNav = document.querySelector('.floating-nav');

// Verificamos si los elementos existen antes de trabajar con ellos
if (!sections) {
    console.error('El elemento .sections no fue encontrado en el DOM.');
}

if (!floatingNav) {
    console.error('El elemento .floating-nav no fue encontrado en el DOM.');
}

// Evento de scroll para ajustar la posición de los elementos
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    const isBottom = scrollTop + windowHeight >= scrollHeight - 10; // Detectamos si estamos cerca del final

    // Ajustamos la posición al final del scroll
    if (isBottom) {
        if (sections) sections.style.bottom = '280px';
        if (floatingNav) floatingNav.style.bottom = '280px';
    } else {
        // Restauramos la posición cuando no estamos al final
        if (sections) sections.style.bottom = '20px';
        if (floatingNav) floatingNav.style.bottom = '20px';
    }
});

// Lógica para el contenedor de desplazamiento infinito
const scrollContainer = document.getElementById('scroll-container');
let currentPosition = 0; // Posición actual del contenedor
let isHovering = false;

// Función para duplicar contenido y simular un loop infinito
const duplicateContent = () => {
    const items = Array.from(scrollContainer.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        scrollContainer.appendChild(clone);
    });
};

// Inicializamos el contenido duplicado
duplicateContent();

// Función para iniciar el desplazamiento
const startScroll = () => {
    isHovering = true;

    const scrollStep = () => {
        if (isHovering) {
            currentPosition -= 2; // Velocidad de desplazamiento
            scrollContainer.style.transform = `translateX(${currentPosition}px)`;

            // Reinicio lógico para el loop infinito
            const scrollWidth = scrollContainer.scrollWidth / 2;
            if (Math.abs(currentPosition) >= scrollWidth) {
                currentPosition = 0;
            }

            requestAnimationFrame(scrollStep);
        }
    };

    requestAnimationFrame(scrollStep);
};

// Función para detener el desplazamiento
const stopScroll = () => {
    isHovering = false;
};

// Eventos para hover en el SVG
const svgChain = document.getElementById('svg-chain');
svgChain.addEventListener('mouseenter', startScroll);
svgChain.addEventListener('mouseleave', stopScroll);

// Efecto de "scrolled" en el header cuando se hace scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {  // Activamos el efecto después de 50px
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
});

// Video interactions
document.querySelectorAll('.grid-item video').forEach(video => {
    video.addEventListener('loadeddata', () => {
        video.currentTime = 1;
    });

    video.addEventListener('mouseenter', () => {
        video.play();
    });

    video.addEventListener('mouseleave', () => {
        video.pause();
    });

    video.addEventListener('click', () => {
        video.controls = !video.controls;
    });
});

// Función para hacer scroll hacia arriba
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Para un desplazamiento suave
  });
}
