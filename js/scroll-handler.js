// Verifica que los elementos .sections y .footer existan
const sections = document.querySelector('.sections');
const footer = document.querySelector('.footer');

if (!sections || !footer) {
    console.error("No se encontraron los elementos .sections o .footer.");
} else {
    window.addEventListener('scroll', () => {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (footerTop <= windowHeight) {
            // Si el footer está visible, ajusta la posición
            sections.style.bottom = '280px';
        } else {
            // Restablece la posición normal
            sections.style.bottom = '20px';
        }
    });
}

// Scroll infinito horizontal
const scrollContainer = document.getElementById('scroll-container');
if (scrollContainer) {
    let currentPosition = 0; // Posición actual del contenedor
    let isHovering = false;

    // Duplicamos los elementos para simular un loop infinito
    const duplicateContent = () => {
        const items = Array.from(scrollContainer.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            scrollContainer.appendChild(clone);
        });
    };

    // Inicializamos el contenido duplicado
    duplicateContent();

    const startScroll = () => {
        isHovering = true;

        const scrollStep = () => {
            if (isHovering) {
                currentPosition -= 2; // Velocidad de desplazamiento
                scrollContainer.style.transform = `translateX(${currentPosition}px)`;

                // Reinicio lógico para loop infinito
                const scrollWidth = scrollContainer.scrollWidth / 2; // Ancho del contenido duplicado
                if (Math.abs(currentPosition) >= scrollWidth) {
                    currentPosition = 0; // Reinicia la posición sin saltos
                }

                requestAnimationFrame(scrollStep);
            }
        };

        requestAnimationFrame(scrollStep);
    };

    const stopScroll = () => {
        isHovering = false;
    };

    // Eventos para hover
    const svgChain = document.getElementById('svg-chain');
    if (svgChain) {
        svgChain.addEventListener('mouseenter', startScroll);
        svgChain.addEventListener('mouseleave', stopScroll);
    } else {
        console.error("No se encontró el elemento #svg-chain.");
    }
}

// Header scroll effect
window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// Video filtering
function filterVideos(category) {
    const videos = document.querySelectorAll('.grid-item');
    if (videos.length === 0) {
        console.error("No se encontraron elementos .grid-item.");
        return;
    }

    videos.forEach(video => {
        const videoCategory = video.getAttribute('data-category');
        if (category === 'All' || videoCategory === category) {
            video.style.display = 'block'; // Show video
        } else {
            video.style.display = 'none'; // Hide video
        }
    });
}
