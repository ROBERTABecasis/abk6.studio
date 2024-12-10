window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        // Ajusta el valor según cuando quieras que se active el efecto
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const sections = document.querySelector('.sections');
const footer = document.querySelector('.footer');

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