document.addEventListener("DOMContentLoaded", function () {
    const iframe = document.querySelector("iframe");
    const player = new Vimeo.Player(iframe);

    const playButton = document.querySelector("#playPauseButton");
    const playIcon = document.querySelector("#playIcon");
    const pauseIcon = document.querySelector("#pauseIcon");
    const fullscreenButton = document.querySelector("#fullscreenButton");
    const soundButton = document.querySelector("#soundButton");
    const soundOnIcon = soundButton?.querySelector("svg:first-child");
    const soundOffIcon = soundButton?.querySelector("svg:last-child");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");

    let isFullscreen = false; // Estado para controlar el modo de pantalla completa

    // Función para alternar pantalla completa
    function toggleFullscreen() {
        const container = document.querySelector(".main-video");

        if (!isFullscreen) {
            container.requestFullscreen().catch(err => {
                console.error(`Error al entrar en pantalla completa: ${err.message}`);
            });
            isFullscreen = true;
            container.classList.add("fullscreen-active"); // Agregar clase para el modo de pantalla completa
        } else {
            document.exitFullscreen().catch(err => {
                console.error(`Error al salir de pantalla completa: ${err.message}`);
            });
            isFullscreen = false;
            container.classList.remove("fullscreen-active"); // Quitar clase al salir del modo pantalla completa
        }

        resizeIframe(); // Asegurarse de que el iframe se ajuste correctamente en cada estado
    }

    // Función para manejar la salida de pantalla completa al presionar Escape
    function handleFullscreenChange() {
        if (!document.fullscreenElement) {
            isFullscreen = false;
            const container = document.querySelector(".main-video");
            container.classList.remove("fullscreen-active");
            resizeIframe();
        }
    }

    // Asegúrate de que el iframe se ajuste correctamente al contenedor
    function resizeIframe() {
        const container = document.querySelector(".main-video");
        if (!container) return;

        if (isFullscreen) {
            // Configuración para el modo de pantalla completa
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.transform = "none"; // Desactiva el centrado
        } else {
            // Configuración para el modo normal
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const videoRatio = 16 / 9; // Relación de aspecto estándar de los videos
            const containerRatio = containerWidth / containerHeight;

            if (containerRatio > videoRatio) {
                iframe.style.width = `${containerWidth}px`;
                iframe.style.height = `${containerWidth / videoRatio}px`;
            } else {
                iframe.style.width = `${containerHeight * videoRatio}px`;
                iframe.style.height = `${containerHeight}px`;
            }

            iframe.style.position = "absolute";
            iframe.style.top = "50%";
            iframe.style.left = "50%";
            iframe.style.transform = "translate(-50%, -50%)";
        }
    }

    // Inicializa el tamaño del iframe
    function initializeResize() {
        player.ready().then(() => {
            resizeIframe();

            // Establece el estado inicial en "reproduciendo"
            playIcon.style.display = "none";
            pauseIcon.style.display = "block";

            // Silencia el video inicialmente
            player.setVolume(0);
            soundOnIcon.style.display = "none";
            soundOffIcon.style.display = "block";
        });

        // Redimensionar al cambiar el tamaño de la ventana
        window.addEventListener("resize", resizeIframe);
    }

    // Alternar reproducción/pausa
    function togglePlayPause() {
        player.getPaused().then(paused => {
            if (paused) {
                player.play();
                playIcon.style.display = "none";
                pauseIcon.style.display = "block";
            } else {
                player.pause();
                playIcon.style.display = "block";
                pauseIcon.style.display = "none";
            }
        });
    }

    // Alternar sonido
    function toggleSound() {
        player.getVolume().then(volume => {
            if (volume > 0) {
                player.setVolume(0);
                soundOnIcon.style.display = "none";
                soundOffIcon.style.display = "block";
            } else {
                player.setVolume(1);
                soundOffIcon.style.display = "none";
                soundOnIcon.style.display = "block";
            }
        });
    }

    // Actualizar barra de progreso
    function updateProgressBar(data) {
        const percentage = (data.seconds / data.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    // Manejar clics en la barra de progreso
    function handleProgressClick(e) {
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;

        player.getDuration().then(duration => {
            player.setCurrentTime(duration * percentage);
        });
    }

    // Asignar eventos
    function initializeControls() {
        playButton?.addEventListener("click", togglePlayPause);
        soundButton?.addEventListener("click", toggleSound);
        fullscreenButton?.addEventListener("click", toggleFullscreen);

        // Evento para actualizar la barra de progreso
        player.on("timeupdate", updateProgressBar);

        // Evento para manejar clics en la barra de progreso
        progressContainer?.addEventListener("click", handleProgressClick);

        // Evento para manejar el cambio de estado de pantalla completa
        document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    // Inicializar
    initializeResize();
    initializeControls();
});
