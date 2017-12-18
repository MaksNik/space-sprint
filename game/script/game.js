var game = new Phaser.Game(
    1200,
    700,
    Phaser.AUTO,
    'game',
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
);

let tileSpace;
let ship;
let cursors;
let fireButton;
let asteroids;
let bullets;
let W, S;
let boom;
let fireRate = 100;
let nextFire = 0;
let bulletTime = 0;
let enemies;
let enemiesTotal=50;
let score = 0;
let scoreString = '';
let scoreText;
let stateText;

function preload() {
    game.load.image('space', 'assets/space.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemyship.png');
    game.load.image('bullet', 'assets/bullet.gif');
    game.load.image('stone', 'assets/stone.png');
    game.load.atlas('explode','assets/explode.png','assets/explode.json');
}
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    tileSprite = game.add.tileSprite(0, 0, 1200*30, 700, 'space');
    game.world.setBounds(0, 0, 1200 * 30, 700);

    ship = game.add.sprite(50, game.world.centerY, 'ship');
    ship.anchor.setTo(0.5, 0.5);
    ship.enableBody=true;
    game.physics.enable(ship, Phaser.Physics.ARCADE);
 
    ship.body.collideWorldBounds = true;
    ship.body.fixedRotation = true;
    game.camera.follow(ship);
    game.camera.deadzone = new Phaser.Rectangle(0, 300, 100, 600);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    W = this.input.keyboard.addKey(Phaser.KeyCode.W);
    S = this.input.keyboard.addKey(Phaser.KeyCode.S);

    asteroids = game.add.group();
    game.physics.arcade.enable([asteroids]);
    asteroids.enableBody = true;

    let asteroid;

    for (var i = 0; i < 50; i++) {
        asteroid = asteroids.create(500 + game.world.randomX, game.world.randomY, 'stone');
        asteroid.name = 'asteroid' + i;
        asteroid.enableBody = true;
        asteroid.body.immovable = true;
        asteroid.animations.add('explode');
    }
    

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(300, 'bullet', 0, false);
    bullets.fireRate = 2000;
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    explosions = game.add.group();
    explosions.createMultiple(300, 'explode');
    explosions.forEach(setupTarget, this);

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;

    enemiesTotal = 50;
    enemiesAlive = 20;

    createEnemies(enemies);

    scoreString = 'Score : ';
    scoreText = game.add.text(450, 200, scoreString + score, { font: '84px Arial', fill: '#fff' });
    scoreText.visible = false;
    stateText = game.add.text(600, 400, ' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    scoreText.fixedToCamera = true;
    stateText.fixedToCamera = true;
    
}
function update() {
    

    let distance = game.world.width-ship.body.x;

    if (distance < 800) {
        ship.body.x += 4;
        scoreText.text = scoreString + score;
        scoreText.visible = true;
        stateText.text = " You won! Click to restart";
        stateText.visible = true;
        bullets.kill();
        game.input.onTap.addOnce(restart, this);
    }
    else {
        ship.body.x += 15;
    }

    game.physics.arcade.collide(ship, asteroids, collisionHandler);
    game.physics.arcade.collide(ship, enemies, collisionHandler);
    game.physics.arcade.overlap(bullets, asteroids, bulletHitTarget, null, this);
    game.physics.arcade.overlap(bullets, enemies, bulletHitTarget, null, this);
    
    
    if (cursors.up.isDown || W.isDown) {
        ship.body.y-=7;
    }
    else if (cursors.down.isDown || S.isDown) {
        ship.body.y += 7;
    }

    if (fireButton.isDown) {
       fire();
    }

}

function collisionHandler(ship, collisionTarget) {

    ship.kill();
    collisionTarget.kill();

    let explosion = explosions.getFirstExists(false);
    explosion.animations.add('explode', Phaser.Animation.generateFrameNames('boom', 1, 14), 14, false)
    explosion.reset(collisionTarget.body.x, collisionTarget.body.y);
    explosion.play('explode');

    scoreText.text = scoreString + score;
    scoreText.visible = true;
    stateText.text = " You lost! Click to restart";
    stateText.visible = true;

    fade();
    bullets.kill();
    game.input.onTap.addOnce(restart, this);


}

function setupTarget(target) {
    target.anchor.x = 0.5;
    target.anchor.y = 0.5;
    target.animations.add('explode');
}

function bulletHitTarget(bullet, target) {

    bullet.kill();
    target.kill();

    score += 20;

    let explosion = explosions.getFirstExists(false);
    if (explosion) {
        explosion.animations.add('explode', Phaser.Animation.generateFrameNames('boom', 1, 14), 14, false)
        explosion.reset(target.body.x, target.body.y);
        explosion.play('explode');
    }
}

function fire() {
    if (game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(ship.x + 70, ship.y);
            bullet.body.velocity.x = 2500;
            bullet.lifespan = 650;
            bulletTime = game.time.now + 250;
        }
    }
}

function createEnemies(enemies) {

    for (let i = 0; i < enemiesTotal; i++) {
        let enemy = enemies.create(1000+game.world.randomX, game.world.randomY, 'enemy');
        enemy.anchor.setTo(0.5, 0.5);
        enemy.body.x += 10;
        enemy.body.immovable = false;
        enemy.body.collideWorldBounds = true;
        enemy.body.fixedRotation = true;
    }
}

function render() {
    game.debug.text('Score: ' + score, 32, 32);
}  

function restart() {
    score = 0;
    game.state.restart();
    resetFade();

}

function fade() {
    game.camera.fade(0x000000, 1500);
}

function resetFade() {
    game.camera.resetFX();
}