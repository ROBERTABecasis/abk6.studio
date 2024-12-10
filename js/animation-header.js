window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        // Ajusta el valor según cuando quieras que se active el efecto
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});