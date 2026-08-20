document.addEventListener("DOMContentLoaded", function () {
    // Función para redimensionar iframe
    function resizeIframe(iframe) {
        const container = iframe.closest(".main-video"); // Seleccionamos solo el contenedor con la clase .main-video
        if (!container) return;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const videoRatio = 16 / 9;

        // Si está en pantalla completa, ocupamos toda la pantalla
        if (container.classList.contains("fullscreen-active")) {
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.transform = "none"; // Desactivar centrado
        } else {
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

    // Forzar un "repaint" del iframe
    function forceIframeRepaint(iframe) {
        iframe.style.visibility = "hidden";
        iframe.offsetHeight; // Forzar un reflow
        iframe.style.visibility = "visible";
    }

    // Inicializar controles de video
    function initializeVideoControls(videoContainer) {
        const iframe = videoContainer.querySelector("iframe");
        if (!iframe) {
            console.warn("No se encontró un iframe en:", videoContainer);
            return;
        }

        const player = new Vimeo.Player(iframe);
        const playButton = videoContainer.querySelector(".play-pause-button");
        const playIcon = playButton?.querySelector(".play-icon");
        const pauseIcon = playButton?.querySelector(".pause-icon");
        const soundButton = videoContainer.querySelector(".sound-button");
        const soundOnIcon = soundButton?.querySelector(".sound-on-icon");
        const soundOffIcon = soundButton?.querySelector(".sound-off-icon");
        const progressContainer = videoContainer.querySelector(".progress-container");
        const progressBar = videoContainer.querySelector(".progress-bar");
        const fullscreenButton = videoContainer.querySelector(".fullscreen-button");

        // Crear un botón de superposición para toda el área del video
        const overlayButton = document.createElement("button");
        overlayButton.classList.add("play-pause-overlay");
        overlayButton.style.position = "absolute";
        overlayButton.style.top = "0";
        overlayButton.style.left = "0";
        overlayButton.style.width = "100%";
        overlayButton.style.height = "100%";
        overlayButton.style.background = "transparent";
        overlayButton.style.border = "none";
        overlayButton.style.cursor = "pointer";
        overlayButton.style.zIndex = "1"; // Asegurar que el botón no bloquee los controles

        // Configuración inicial: video en reproducción y silenciado
        player.ready().then(() => {
            player.setVolume(0); // Iniciar en modo "silenciado"
            soundOnIcon.style.display = "none"; // Ocultar sonido activado
            soundOffIcon.style.display = "block"; // Mostrar sonido desactivado
            playIcon.style.display = "none"; // Ocultar botón de "play"
            pauseIcon.style.display = "block"; // Mostrar botón de "pause"
        });

        // Alternar reproducción/pausa
        function togglePlayPause() {
            player.getPaused().then((paused) => {
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
            player.getVolume().then((volume) => {
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

        // Barra de progreso
        function updateProgressBar(data) {
            if (!progressBar) return;
            const percentage = (data.seconds / data.duration) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        // Buscar en el video al hacer clic en la barra de progreso
        function handleProgressClick(e) {
            const rect = progressContainer.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const percentage = clickPosition / rect.width;

            player.getDuration().then((duration) => {
                player.setCurrentTime(duration * percentage);
            });
        }

        // Alternar pantalla completa
        // iOS Safari no implementa el Fullscreen API en elementos que no sean <video>
        // (requestFullscreen puede no existir, lanzar de forma síncrona, o rechazar la
        // promesa en silencio). Por eso usamos siempre un fallback manual con CSS
        // ("fullscreen-active") en cuanto el método nativo falla por cualquier motivo.
        function enterFallbackFullscreen() {
            videoContainer.classList.add("fullscreen-active");
            // El propio JS fija "position: relative" inline sobre el contenedor,
            // así que un inline style nuevo es la única forma fiable de ganarle a eso.
            videoContainer.style.position = "fixed";
            videoContainer.style.top = "0";
            videoContainer.style.left = "0";
            videoContainer.style.width = "100vw";
            videoContainer.style.height = "100vh";
            videoContainer.style.zIndex = "9999";
            document.body.style.overflow = "hidden";
            resizeIframe(iframe);
        }

        function exitFallbackFullscreen() {
            videoContainer.classList.remove("fullscreen-active");
            videoContainer.style.position = "relative";
            videoContainer.style.top = "";
            videoContainer.style.left = "";
            videoContainer.style.width = "";
            videoContainer.style.height = "";
            videoContainer.style.zIndex = "";
            document.body.style.overflow = "";
            resizeIframe(iframe);
        }

        function toggleFullscreen() {
            if (videoContainer.classList.contains("fullscreen-active")) {
                exitFallbackFullscreen();
                return;
            }

            if (document.fullscreenElement) {
                document.exitFullscreen().catch((err) => {
                    console.error(`Error al salir de pantalla completa: ${err.message}`);
                });
                return;
            }

            // En iOS Safari la promesa de requestFullscreen puede quedarse colgada
            // sin resolverse ni rechazarse nunca, así que además de escuchar el
            // resultado, comprobamos con un timeout si realmente entró en fullscreen.
            let settled = false;
            const fallbackTimer = setTimeout(() => {
                if (!settled && !document.fullscreenElement) {
                    settled = true;
                    enterFallbackFullscreen();
                }
            }, 300);

            try {
                const request = videoContainer.requestFullscreen?.();
                if (!request) {
                    clearTimeout(fallbackTimer);
                    enterFallbackFullscreen();
                    return;
                }
                request
                    .then(() => {
                        settled = true;
                        clearTimeout(fallbackTimer);
                    })
                    .catch(() => {
                        if (settled) return;
                        settled = true;
                        clearTimeout(fallbackTimer);
                        enterFallbackFullscreen();
                    });
            } catch (err) {
                settled = true;
                clearTimeout(fallbackTimer);
                enterFallbackFullscreen();
            }
        }

        // Inicializar redimensionamiento del iframe
        function initializeResize() {
            resizeIframe(iframe);
            forceIframeRepaint(iframe);
            window.addEventListener("resize", () => resizeIframe(iframe));
        }

        // Asociar eventos
        playButton?.addEventListener("click", togglePlayPause);
        soundButton?.addEventListener("click", toggleSound);
        progressContainer?.addEventListener("click", handleProgressClick);
        fullscreenButton?.addEventListener("click", toggleFullscreen);

        // Insertar el botón de superposición
        videoContainer.style.position = "relative";
        videoContainer.appendChild(overlayButton);
        overlayButton.addEventListener("click", togglePlayPause);

        // Inicializar
        initializeResize();
        player.on("timeupdate", updateProgressBar);
    }

    // Inicializar videos en .main-video
    const videoContainers = document.querySelectorAll(".main-video");
    videoContainers.forEach((videoContainer) => {
        initializeVideoControls(videoContainer);
    });
});
