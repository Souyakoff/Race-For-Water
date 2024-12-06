const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables globales
let goutte = { x: 50, y: 200, width: 40, height: 60, dy: 0 };
let obstacles = [];
let points = [];
let projectiles = [];  // Tableau pour les projectiles
let score = 0;
let gameOver = false;

// Charger l'image GIF de la goutte
const goutteGif = new Image();
goutteGif.src = '../assets/img/pixel/plongeur.gif'; // Remplacez par le chemin correct de votre GIF

// Vérifier si l'image GIF est chargée avant de lancer le jeu
goutteGif.onload = function () {
    // L'image est maintenant chargée, lancez le jeu
    updateGame();
};

// Charger l'image de l'obstacle
const obstacleImage = new Image();
obstacleImage.src = '../assets/img/pixel/pollution.png'; // Chemin de l'image (assurez-vous que le fichier existe)

// Génération d'obstacles (pollution) et d'éléments vitaux
function generateItems() {
    if (Math.random() < 0.03) {
        // Obstacle
        obstacles.push({
            x: canvas.width,
            y: Math.random() * canvas.height,
            width: 30, // Largeur de l'image
            height: 30, // Hauteur de l'image
            image: obstacleImage, // Utilisation de l'image pour l'obstacle
        });
    }
    if (Math.random() < 0.03) {
        // Élément vital
        points.push({
            x: canvas.width,
            y: Math.random() * canvas.height,
            width: 15,
            height: 15,
            color: "gold",
        });
    }
}

// Tirer un projectile
function fireProjectile() {
    // Créer un projectile qui part de la position de la goutte
    projectiles.push({
        x: goutte.x + goutte.width, // Position initiale du projectile à droite de la goutte
        y: goutte.y + goutte.height / 2, // Position verticale centrée par rapport à la goutte
        dy: 0, // Pas de déplacement vertical
        dx: 5 // Vitesse du projectile (déplacement horizontal vers la gauche)
    });
}

// Dessiner un élément (avec une image pour les obstacles)
function drawItem(item) {
    if (item.image) {
        // Dessiner l'image pour les obstacles
        ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
    } else if (item === goutte) {
        // Dessiner l'image GIF pour la goutte
        ctx.drawImage(goutteGif, item.x, item.y, item.width, item.height);
    } else if (item.color) {
        // Dessiner un rectangle pour les éléments vitaux
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.width, item.height);
    } else if (item === "projectile") {
        // Dessiner un projectile (petit cercle)
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Contrôle de la goutte d'eau
function controlGoutte(e) {
    if (e.code === "ArrowUp") goutte.dy = -5;
    if (e.code === "ArrowDown") goutte.dy = 5;
    if (e.code === "Space") {
        // Tirer un projectile
        projectiles.push({
            x: goutte.x + goutte.width,  // Départ du projectile juste à droite de la goutte
            y: goutte.y + goutte.height / 2,  // Aligner verticalement au centre de la goutte
            dx: 5  // Vitesse de déplacement du projectile
        });
    }
}

function stopGoutte(e) {
    if (e.code === "ArrowUp" || e.code === "ArrowDown") goutte.dy = 0;
}

// Mise à jour du jeu
function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Déplacement de la goutte
    goutte.y += goutte.dy;
    goutte.y = Math.max(0, Math.min(canvas.height - goutte.height, goutte.y));
    drawItem(goutte);

    // Déplacement des obstacles et points
    obstacles.forEach((obs, index) => {
        obs.x -= 3;
        drawItem(obs);

        // Collision avec la goutte
        if (
            goutte.x < obs.x + obs.width &&
            goutte.x + goutte.width > obs.x &&
            goutte.y < obs.y + obs.height &&
            goutte.height + goutte.y > obs.y
        ) {
            gameOver = true;
            displayGameOver(); // Appel de la fonction de game over
        }

        // Suppression des obstacles hors écran
        if (obs.x + obs.width < 0) obstacles.splice(index, 1);
    });

    points.forEach((pt, index) => {
        pt.x -= 3;
        drawItem(pt);

        // Collision avec les points vitaux
        if (
            goutte.x < pt.x + pt.width &&
            goutte.x + goutte.width > pt.x &&
            goutte.y < pt.y + pt.height &&
            goutte.height + goutte.y > pt.y
        ) {
            score += 10;
            points.splice(index, 1);
        }

        // Suppression des points hors écran
        if (pt.x + pt.width < 0) points.splice(index, 1);
    });

    // Déplacement des projectiles
    projectiles.forEach((proj, index) => {
        proj.x += proj.dx;  // Avancer le projectile
        drawItem(proj);

        // Vérifier la collision entre les projectiles et les obstacles
        obstacles.forEach((obs, obsIndex) => {
            if (
                proj.x < obs.x + obs.width &&
                proj.x + 5 > obs.x &&
                proj.y < obs.y + obs.height &&
                proj.y + 5 > obs.y
            ) {
                // Collision détectée : supprimer l'obstacle et le projectile
                obstacles.splice(obsIndex, 1);
                projectiles.splice(index, 1);
            }
        });

        // Supprimer les projectiles hors écran
        if (proj.x > canvas.width) projectiles.splice(index, 1);
    });

    // Score
    ctx.fillStyle = "white";
    ctx.font = "20px Press Start 2P";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Génération d'éléments
    generateItems();

    // Animation
    requestAnimationFrame(updateGame);
}

// Fonction de game over
function displayGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.location.href = "game_over.html"; // Remplace par l'URL de la page cible

}


// Redémarrer le jeu
function restartGame(e) {
    if (e.code === "KeyR") {
        gameOver = false;
        score = 0;
        obstacles = [];
        points = [];
        projectiles = [];
        goutte.y = 200;
        updateGame();
}
}
// Lancement du jeu
document.addEventListener("keydown", controlGoutte);
document.addEventListener("keyup", stopGoutte);
document.addEventListener("keydown", restartGame);  // Ajouter l'écouteur pour le redémarrage
