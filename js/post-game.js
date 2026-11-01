// Swaps the first video for the real game, in the same square. Nothing of the game loads until the
// visitor asks for it, and closing it removes it completely so it stops using the GPU and the music.
document.addEventListener("DOMContentLoaded", function () {
    var box = document.querySelector(".post-hero");
    var open = document.querySelector(".is-play-game");
    var close = document.querySelector(".is-close-game");
    var help = document.querySelector(".is-game-help");
    if (!box || !open || !close || !help) return;

    var video = box.querySelector("video");
    var sounds = document.querySelectorAll(".is-sound");
    var frame = null;
    var seen = null;
    var musicWasOn = false;

    // The game's own music and sound buttons are hidden in the square; these drive them from outside
    function gameButton(id) {
        try { return frame.contentDocument.getElementById(id); } catch (e) { return null; }
    }

    function syncSounds() {
        sounds.forEach(function (b) {
            var target = gameButton(b.dataset.target);
            if (!target) return;
            var on = target.getAttribute("aria-pressed") === "true";
            b.textContent = b.dataset.label + (on ? " on" : " off");
            b.setAttribute("aria-pressed", String(on));
        });
    }

    sounds.forEach(function (b) {
        b.addEventListener("click", function () {
            var target = gameButton(b.dataset.target);
            if (target) target.click();
            syncSounds();
            if (frame) frame.focus();
        });
    });

    function gameMusic() {
        try { return frame.contentDocument.getElementById("music"); } catch (e) { return null; }
    }

    // Scrolling away pauses the climb and its music; coming back restores the music
    function pauseGame() {
        try {
            frame.contentWindow.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
        } catch (e) {}
    }

    function onSeen(entries) {
        var music = gameMusic();
        if (!entries[0].isIntersecting) {
            musicWasOn = !!music && !music.paused;
            if (music) music.pause();
            pauseGame();
        } else if (music && musicWasOn) {
            var p = music.play();
            if (p && p.catch) p.catch(function () {});
        }
    }

    open.addEventListener("click", function () {
        box.dataset.userPaused = "1";
        video.pause();
        box.classList.add("is-playing");

        frame = document.createElement("iframe");
        frame.src = open.dataset.game;
        frame.title = "Infinite Stairs, playable";
        frame.allow = "autoplay; fullscreen";
        frame.addEventListener("load", function () { syncSounds(); frame.focus(); });
        box.appendChild(frame);
        frame.focus();

        help.hidden = false;
        if ("IntersectionObserver" in window) {
            seen = new IntersectionObserver(onSeen, { threshold: 0.2 });
            seen.observe(box);
        }
    });

    close.addEventListener("click", function () {
        if (seen) seen.disconnect();
        seen = null;
        if (frame) frame.remove();
        frame = null;
        help.hidden = true;
        box.classList.remove("is-playing");
        box.dataset.userPaused = "";
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        open.focus();
    });
});
