// Same pixel-art player as the Vimeo case studies (main-page-reel), but driving local <video> files.
// Markup: .post-player > video + .progress-container + .play-pause-button + .fullscreen-button
// The clips have no audio track, so there is no sound button.
document.addEventListener("DOMContentLoaded", function () {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".post-player").forEach(function (box) {
        var video = box.querySelector("video");
        if (!video) return;

        var playButton = box.querySelector(".play-pause-button");
        var playIcon = playButton && playButton.querySelector(".play-icon");
        var pauseIcon = playButton && playButton.querySelector(".pause-icon");
        var progressContainer = box.querySelector(".progress-container");
        var progressBar = box.querySelector(".progress-bar");
        var fullscreenButton = box.querySelector(".fullscreen-button");

        function play() {
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
        }

        function syncIcons() {
            if (!playIcon || !pauseIcon) return;
            playIcon.style.display = video.paused ? "block" : "none";
            pauseIcon.style.display = video.paused ? "none" : "block";
        }

        function togglePlayPause() {
            if (video.paused) {
                box.dataset.userPaused = "";
                play();
            } else {
                box.dataset.userPaused = "1";
                video.pause();
            }
        }

        function toggleFullscreen() {
            if (box.requestFullscreen) box.requestFullscreen().catch(function () {});
            else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
        }

        // Click anywhere on the video toggles play/pause, like the Vimeo version
        var overlay = document.createElement("button");
        overlay.className = "play-pause-overlay";
        overlay.setAttribute("aria-label", "Play or pause the video");
        overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;background:transparent;border:none;cursor:pointer;z-index:1";
        box.appendChild(overlay);

        overlay.addEventListener("click", togglePlayPause);
        if (playButton) playButton.addEventListener("click", togglePlayPause);
        if (fullscreenButton) fullscreenButton.addEventListener("click", toggleFullscreen);
        if (progressContainer) {
            progressContainer.addEventListener("click", function (e) {
                var rect = progressContainer.getBoundingClientRect();
                if (video.duration) video.currentTime = video.duration * ((e.clientX - rect.left) / rect.width);
            });
        }

        video.addEventListener("play", syncIcons);
        video.addEventListener("pause", syncIcons);
        video.addEventListener("timeupdate", function () {
            if (progressBar && video.duration) progressBar.style.width = (video.currentTime / video.duration * 100) + "%";
        });

        video.muted = true;
        syncIcons();
        if (reducedMotion) return;

        // Already on screen at load: start now rather than waiting for the observer's first callback
        var rect = box.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) play();

        // Loops only play while on screen, and stay paused if the visitor paused them
        if (!("IntersectionObserver" in window)) { play(); return; }
        new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) video.pause();
                else if (!box.dataset.userPaused) play();
            });
        }, { threshold: 0.35 }).observe(box);
    });
});
