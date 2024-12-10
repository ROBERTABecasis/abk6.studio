let circles = [];
const numCircles = 35;
const circleRadius = 100;
let gravity;
let draggingCircle = null;
let marginActive = true;
let marginDuration = 5000; // 5 segundos
let startTime;

// Bandera para habilitar o deshabilitar el canvas
let isCanvasActive = false;

// Monitorear el estado del icon-toggle
const toggleCheckbox = document.querySelector(".icon-toggle input.checkbox");
toggleCheckbox.addEventListener("change", (event) => {
    isCanvasActive = event.target.checked; // Cambia la bandera según el estado del checkbox
    if (isCanvasActive) {
        loop(); // Reactivar el loop de dibujo si está activo
    } else {
        noLoop(); // Pausar el loop si está inactivo
    }
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    gravity = createVector(0, 5);

    for (let i = 0; i < numCircles; i++) {
        let validPosition = false;
        let newCircle;

        while (!validPosition) {
            newCircle = new Circle(random(width), random(height / 2), circleRadius);
            validPosition = true;

            for (let circle of circles) {
                if (newCircle.checkCollision(circle)) {
                    validPosition = false;
                    break;
                }
            }
        }
        circles.push(newCircle);
    }

    startTime = millis();
    noLoop(); // Pausar el canvas inicialmente hasta que se active el toggle
}

function draw() {
    if (!isCanvasActive) return; // Solo se dibuja si está activo

    clear(); // Limpia el lienzo y deja el fondo transparente

    if (millis() - startTime > marginDuration) {
        marginActive = false;
    }

    for (let circle of circles) {
        if (circle !== draggingCircle) {
            circle.applyForce(gravity);
        }
        circle.update();
        circle.edges();
        circle.display();

        for (let other of circles) {
            if (circle !== other) {
                circle.checkCollision(other);
            }
        }
    }
}

function mousePressed() {
    if (!isCanvasActive) return; // No permitir interacción si está inactivo
    for (let circle of circles) {
        if (circle.contains(mouseX, mouseY)) {
            draggingCircle = circle;
            draggingCircle.vel.set(0);
            break;
        }
    }
}

function mouseDragged() {
    if (!isCanvasActive || !draggingCircle) return;
    let mouseVel = createVector(mouseX, mouseY).sub(draggingCircle.pos);
    draggingCircle.vel.set(mouseVel.x / 4, mouseVel.y / 5);
    draggingCircle.pos.set(mouseX, mouseY);
}

function mouseReleased() {
    if (!isCanvasActive) return;
    draggingCircle = null;
}

class Circle {
    constructor(x, y, r) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.r = r;

        // Seleccionar uno de los SVG aleatoriamente
        const randomSVG = random(svgShapes);

        // Crear el elemento del SVG y añadirlo al DOM
        this.svgElement = createDiv(randomSVG);
    }

    applyForce(force) {
        let f = p5.Vector.div(force, this.r);
        this.acc.add(f);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    edges() {
        if (this.pos.y + this.r >= height) {
            this.pos.y = height - this.r;
            this.vel.y *= -0.8; // Rebote vertical
            this.vel.x *= 0.8; // Fricción horizontal
        } else if (this.pos.y - this.r < 0) {
            this.pos.y = this.r;
            this.vel.y *= -0.8;
        }

        if (marginActive) {
            if (this.pos.x + this.r > width) {
                this.pos.x = width - this.r;
                this.vel.x *= -0.8;
            } else if (this.pos.x - this.r < 0) {
                this.pos.x = this.r;
                this.vel.x *= -0.8;
            }
        }
    }

    display() {
        this.svgElement.position(this.pos.x - this.r, this.pos.y - this.r);
    }

    contains(x, y) {
        let d = dist(x, y, this.pos.x, this.pos.y);
        return d < this.r;
    }

    checkCollision(other) {
        let distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        let minDist = this.r + other.r;

        if (distance < minDist) {
            let forceDir = p5.Vector.sub(this.pos, other.pos).normalize();
            let overlap = minDist - distance;

            this.pos.add(forceDir.copy().mult(overlap * 0.5));
            other.pos.sub(forceDir.copy().mult(overlap * 0.5));

            let relativeVelocity = p5.Vector.sub(this.vel, other.vel);
            let speed = relativeVelocity.dot(forceDir);

            if (speed < 0) {
                let impulse = forceDir.mult(speed * -0.5);
                this.vel.add(impulse);
                other.vel.sub(impulse);

                this.vel.mult(0.98);
                other.vel.mult(0.98);
            }
        }
    }
}
