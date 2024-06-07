const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    speed: 0,
    rotation: 0,
    lives: 3,
};

let bullets = [];
let asteroids = [];
let score = 0; // Añadir variable de puntuación

function drawShip(x, y, angle) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 15 * Math.cos(angle), y - 15 * Math.sin(angle));
    ctx.lineTo(
        x - 15 * Math.cos(angle - Math.PI / 6),
        y + 15 * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x - 15 * Math.cos(angle + Math.PI / 6),
        y + 15 * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Lives: " + ship.lives, 10, 10);
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, canvas.width - 10, 10); // Añadir puntuación
}

function drawBullet(bullet) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
    ctx.fill();
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.x += bullet.speed * Math.cos(bullet.angle);
        bullet.y -= bullet.speed * Math.sin(bullet.angle);
        // Eliminar proyectiles fuera de la pantalla
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(i, 1);
        } else {
            drawBullet(bullet);
        }
    }
}

function drawAsteroid(asteroid) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
    ctx.stroke();
}

function createAsteroid() {
    let radius = Math.random() * 20 + 10;
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let speed = Math.random() * 1.5 + 0.5;
    let angle = Math.random() * Math.PI * 2;
    asteroids.push({ x, y, radius, speed, angle });
}

function generateAsteroids(num) {
    for (let i = 0; i < num; i++) {
        createAsteroid();
    }
}

function updateAsteroids() {
    for (let asteroid of asteroids) {
        asteroid.x += asteroid.speed * Math.cos(asteroid.angle);
        asteroid.y += asteroid.speed * Math.sin(asteroid.angle);
        // Bucle de la pantalla
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
        if (asteroid.y > canvas.height) asteroid.y = 0;

        // Detectar colisión con la nave
        let dx = asteroid.x - ship.x;
        let dy = asteroid.y - ship.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < asteroid.radius + 15) {
            // 15 es el tamaño aproximado de la nave
            // Eliminar asteroide
            asteroids.splice(asteroids.indexOf(asteroid), 1);

            // Reducir vida de la nave
            ship.lives--;

            // Si se acaban las vidas, mostrar mensaje de game over
            if (ship.lives === 0) {
                console.log("GAME OVER");
                if (confirm("Do you want to restart?")) {
                    // Reiniciar el juego
                    ship.lives = 3;
                    score = 0; // Reiniciar puntuación
                    bullets = [];
                    asteroids = [];
                    location.reload();
                } else {
                    // Eliminar asteroides y centrar la nave apuntando hacia arriba
                    asteroids = [];
                    ship.x = canvas.width / 2;
                    ship.y = canvas.height / 2;
                    ship.angle = 0;
                }
            }
        }

        drawAsteroid(asteroid);
    }
}

function detectCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        let asteroid = asteroids[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            let dx = bullet.x - asteroid.x;
            let dy = bullet.y - asteroid.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < asteroid.radius) {
                // Eliminar asteroide y proyectil
                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                score += 10; // Incrementar puntuación
                break;
            }
        }
    }
}

function detectShipCollisions() {
    for (let asteroid of asteroids) {
        let dx = asteroid.x - ship.x;
        let dy = asteroid.y - ship.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < asteroid.radius + 15) {
            // 15 es el tamaño aproximado de la nave
            // Colisión detectada
            console.log("¡Colisión!");
            // Aquí puedes manejar lo que sucede cuando hay una colisión
            return true;
        }
    }
    return false;
}

function update() {
    // Borrar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Dibujar las vidas
    drawLives();
    // Dibujar la puntuación
    drawScore();
    // Rotar la nave
    ship.angle += ship.rotation;
    // Mover la nave
    ship.x += ship.speed * Math.cos(ship.angle);
    ship.y -= ship.speed * Math.sin(ship.angle);
    // Dibuja la nave
    drawShip(ship.x, ship.y, ship.angle);
    // Actualizar y dibujar proyectiles
    updateBullets();
    // Actualizar y dibujar asteroides
    updateAsteroids();
    // Detectar colisiones entre proyectiles y asteroides
    detectCollisions();
    // Detectar colisiones entre la nave y asteroides
    if (detectShipCollisions()) {
        // Manejo de colisión, por ejemplo, reiniciar el juego
        console.log("¡Juego terminado!");
        return;
    }
    // Bucle de la pantalla
    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;
    requestAnimationFrame(update);
}

function keyDown(event) {
    switch (event.keyCode) {
        case 37: // Flecha izquierda
            ship.rotation = -0.1;
            break;
        case 39: // Flecha derecha
            ship.rotation = 0.1;
            break;
        case 38: // Flecha arriba
            ship.speed = 2;
            break;
        case 32: // Barra espaciadora
            bullets.push({
                x: ship.x,
                y: ship.y,
                angle: ship.angle,
                speed: 5,
            });
            break;
    }
}

function keyUp(event) {
    switch (event.keyCode) {
        case 37: // Flecha izquierda
        case 39: // Flecha derecha
            ship.rotation = 0;
            break;
        case 38: // Flecha arriba
            ship.speed = 0;
            break;
    }
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Generar algunos asteroides al inicio
generateAsteroids(10);
update();
