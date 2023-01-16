(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function Background(
    gameWidth,
    gameHeight,
    backImg,
    midImg,
    frontImg
) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.backImg = backImg;
    this.midImg = midImg;
    this.frontImg = frontImg;

    this.backW = 1280;
    this.backH = 480;
    this.midW = 1264;
    this.midH = 480;
    this.frontW = 1275;
    this.frontH = 480;

    this.midYMax = 178;
    this.frontYMax = 178;

    this.init = function() {
        this.backX = 0;
        this.midX = 0;
        this.frontX = 0;
        
        this.midY = 178;
        this.frontY = 178;

        this.backXVelocity = 0.004;
        this.midXVelocity = 0.008;
        this.frontXVelocity = 0.04;

        this.midYVelocity = 0;
        this.frontYVelocity = 0;

        this.onPlanet = false;
    }
    
    this.init();

    this.enterPlanet = function() {
        this.midYVelocity = -0.08;
        this.frontYVelocity = -0.08;
    }

    this.exitPlanet = function() {
        this.midYVelocity = 0.08;
        this.frontYVelocity = 0.08;
    }

    this.update = function(delta) {
        this.backX -= delta * this.backXVelocity;
        if (this.backX < -this.backW) {
            this.backX += this.backW;
        }

        this.midX -= delta * this.midXVelocity;
        if (this.midX < -this.midW) {
            this.midX += this.midW;
        }
        
        if (
            this.midYVelocity > 0 && this.midY < this.midYMax
            || this.midYVelocity < 0 && this.midY > 0
        ) {
            this.midY += delta * this.midYVelocity;
        }

        this.frontX -= delta * this.frontXVelocity;
        if (this.frontX < -this.frontW) {
            this.frontX += this.frontW;
        }

        if (
            this.frontYVelocity > 0 && this.frontY < this.frontYMax
            || this.frontYVelocity < 0 && this.frontY > 0
        ) {
            this.frontY += delta * this.frontYVelocity;
        }
    }

    this.render = function(ctx) {
        ctx.drawImage(this.backImg, this.backX, 0, this.backW, this.backH);
        ctx.drawImage(this.backImg, this.backX+this.backW, 0, this.backW, this.backH);
        
        ctx.drawImage(this.midImg, this.midX, this.midY, this.midW, this.midH);
        ctx.drawImage(this.midImg, this.midX+this.midW, this.midY, this.midW, this.midH);
        
        ctx.drawImage(this.frontImg, this.frontX, this.frontY, this.frontW, this.frontH);
        ctx.drawImage(this.frontImg, this.frontX+this.frontW, this.frontY, this.frontW, this.frontH);
    }
}

module.exports = Background;
},{}],2:[function(require,module,exports){
const Background = require('./background');
const Player = require('./player');
const MeteorShower = require('./meteor-shower');

function Game(
    gameWidth,
    gameHeight,
    backBgImg,
    midBgImg,
    frontBgImg,
    rocketImg,
    meteorImg
) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    this.playing = false;

    this.ctx = gameCanvas.getContext('2d');
    this.background = new Background(
        gameWidth,
        gameHeight,
        backBgImg,
        midBgImg,
        frontBgImg
    );
    this.player = new Player(
        gameWidth,
        gameHeight,
        rocketImg
    );
    this.meteorShower = new MeteorShower(
        gameWidth,
        gameHeight,
        meteorImg
    );

    this.phases = [
        {
            time: 2000,
            callback: () => {
                this.meteorShower.start();
            },
            called: false
        },
        {
            time: 10000,
            callback: () => {
                this.meteorShower.setChanceOfMeteorPerCheck(0.15);
            },
            called: false
        },
        {
            time: 20000,
            callback: () => {
                this.meteorShower.setChanceOfMeteorPerCheck(0.16);
            },
            called: false
        },
        {
            time: 25000,
            callback: () => {
                this.meteorShower.setChanceOfMeteorPerCheck(0.17);
            },
            called: false
        },
        {
            time: 25000,
            callback: () => {
                this.meteorShower.stop();
            },
            called: false
        },
        {
            time: 40000,
            callback: () => {
                this.background.enterPlanet();
            },
            called: false
        }
    ];

    //this.textOverlay = new TextOverlay(gameWidth, gameHeight);
    
    this.init = function() {
        this.animationRequest = null;
        this.lastFrameTime = null;

        for (phase of this.phases.filter(phase => phase.called === true)) {
            phase.called = false;
        }
    }

    this.start = function() {
        this.init();
        this.player.init();
        //this.textOverlay.init();

        this.playing = true;
        this.animationRequest = requestAnimationFrame(this.tick.bind(this));

        document.onkeydown = this.player.onKeyDown.bind(this.player);
        document.onkeyup = this.player.onKeyUp.bind(this.player);
    }

    this.stop = function() {
        this.playing = false;
        cancelAnimationFrame(this.animationRequest);

        document.onkeydown = null;
        document.onkeyup = (e) => {
            if (e.key === 'Enter') {
                this.start();
            }
        } 
    }

    this.update = function(delta, time) {
        this.background.update(delta);
        
        let playerHit = this.meteorShower.meteorHitCheck(
            this.player.x,
            this.player.y + (this.player.h * 0.25), // Adjust hit box
            this.player.w,
            this.player.h * 0.5 // Adjust hit box
        );
        this.meteorShower.update(delta, time);

        if (playerHit) {
            this.player.registerHit(25);
        }

        this.player.update(delta);

        for (phase of this.phases.filter(phase => phase.called === false)) {
            if (phase.time < time) {
                phase.callback();
                phase.called = true;
            }
        }

        /*this.textOverlay.crewHunger = this.crewHunger;
        this.textOverlay.fishCaught = this.fishCaught;
        this.textOverlay.timeElapsed += delta;
        this.textOverlay.update();

        if (this.crewHunger >= 100) {
            this.textOverlay.gameOver = true;
            this.textOverlay.update();
            this.textOverlay.render(this.ctx);
            this.stop();
        } else {
            this.textOverlay.gameOver = false;
        }*/
    }

    this.render = function() {
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        this.background.render(this.ctx);
        this.player.render(this.ctx);
        this.meteorShower.render(this.ctx);
        
        //this.textOverlay.render(this.ctx);
    }

    this.tick = function(time) {
        if (!this.playing) {
            return;
        }

        if (this.lastFrameTime != null) {
            const delta = time - this.lastFrameTime;

            this.update(delta, time);
            this.render();
        }

        this.lastFrameTime = time;
        requestAnimationFrame(this.tick.bind(this));
    }
}

module.exports = Game;
},{"./background":1,"./meteor-shower":4,"./player":6}],3:[function(require,module,exports){
const Game = require('./game');

const gameWidth = 860, gameHeight = 480;

const backBgImg = document.getElementById('backBgImg');
const midBgImg = document.getElementById('midBgImg');
const frontBgImg = document.getElementById('frontBgImg');
const rocketImg = document.getElementById('rocket');
const meteorImg = document.getElementById('meteorImg');

const game = new Game(
    gameWidth,
    gameHeight,
    backBgImg,
    midBgImg,
    frontBgImg,
    rocketImg,
    meteorImg
);
game.start();
},{"./game":2}],4:[function(require,module,exports){
const Meteor = require("./meteor");

function MeteorShower(
    gameWidth,
    gameHeight,
    meteorImg
) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.meteorImg = meteorImg;

    this.init = function() {
        this.meteorCheckRate = 100;
        this.chanceOfMeteorPerCheck = 0.05;
        this.meteors = [];
        this.active = false;
    }
    
    this.init();

    this.start = function() {
        this.lastMeteorCheckTime = null;
        this.active = true;
    }

    this.stop = function() {
        this.active = false;
    }

    this.setChanceOfMeteorPerCheck = function(chanceOfMeteorPerCheck) {
        this.chanceOfMeteorPerCheck = chanceOfMeteorPerCheck;
    }

    this.addMeteor = function() {
        const meteor = new Meteor(this.gameWidth, this.gameHeight, this.meteorImg);
        this.meteors.push(meteor);
    }

    this.meteorHitCheck = function(boxX, boxY, boxW, boxH) {
        let hit = false;

        for (meteor of this.meteors.filter(meteor => meteor.hit === false)) {
            if (
                meteor.x < boxX + boxW
                && (meteor.x + meteor.w) > boxX
                && meteor.y < boxY + boxH
                && (meteor.y + meteor.h) > boxY
            ) {
                hit = meteor.hit = true;
            }
        }

        return hit;
    }

    this.update = function(delta, time) {
        if (this.active && time - this.lastMeteorCheckTime >= this.meteorCheckRate) {
            if (Math.random() < this.chanceOfMeteorPerCheck) {
                this.addMeteor();
            }

            this.lastMeteorCheckTime = time;
        }

        for (const meteor of this.meteors) {
            meteor.update(delta);
        }

        this.meteors = this.meteors.filter(meteor => !meteor.gone);
    }

    this.render = function(ctx) {
        for (const meteor of this.meteors) {
            meteor.render(ctx);
        }
    }
}

module.exports = MeteorShower;
},{"./meteor":5}],5:[function(require,module,exports){
const {getRandomArbitrary, getRandomIntInclusive} = require('./random');

function Meteor(
    gameWidth,
    gameHeight,
    meteorImg
) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.meteorImg = meteorImg;

    this.gone = false;
    this.hit = false;

    this.init = function() {
        this.w = this.h = getRandomIntInclusive(20, 80);

        this.x = getRandomIntInclusive(0, (this.gameWidth + this.gameHeight) - this.w);
        this.y = -this.h;

        this.xVelocity = -getRandomArbitrary(0.02, 0.08);
        this.yVelocity = getRandomArbitrary(0.02, 0.08);
    }
    
    this.init();

    this.update = function(delta) {
        this.x += delta * this.xVelocity;
        this.y += delta * this.yVelocity;

        if (this.x <= 0 - this.w || this.y >= this.gameHeight) {
            this.gone = true;
        }
    }

    this.render = function(ctx) {
        if (this.hit) {
            ctx.save();
            ctx.globalAlpha = 0.4;
        }

        ctx.drawImage(this.meteorImg, this.x, this.y, this.w, this.h);

        if (this.hit) {
            ctx.restore();
        }
    }
}

module.exports = Meteor;
},{"./random":7}],6:[function(require,module,exports){
function Player(
    gameWidth,
    gameHeight,
    rocketImg
) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.rocketImg = rocketImg;

    this.w = 80;
    this.h = 52;

    this.init = function() {
        this.hp = 100;
        this.crashing = false;
        this.crashed = false;
        this.crashingTime = null;

        this.x = 280;
        this.y = 236;
        this.rotation = 0;

        this.upPressed = false;
        this.DownPressed = false;
        this.leftPressed = false;
        this.rightPressed = false;

        this.img = this.rocketImg;
        this.xAcceleration = this.yAcceleration = 0;
        this.xVelocity = this.yVelocity = 0;
    }
    
    this.init();

    this.crash = function() {
        this.crashing = true;
        this.crashingTime = 0;
    }

    this.registerHit = function(damage) {
        this.hp -= damage;

        if (this.hp <= 0) {
            this.crash();
        }
    }

    this.onKeyUp = function(e) {
        if (e.key === 'ArrowUp') {
            this.upPressed = false;
        } else if (e.key === 'ArrowDown') {
            this.downPressed = false;
        } else if (e.key === 'ArrowLeft') {
            this.leftPressed = false;
        } else if (e.key === 'ArrowRight') {
            this.rightPressed = false;
        }
    }

    this.onKeyDown = function(e) {
        if (e.key === 'ArrowUp') {
            this.upPressed = true;
        } else if (e.key === 'ArrowDown') {
            this.downPressed = true;
        } else if (e.key === 'ArrowLeft') {
            this.leftPressed = true;
        } else if (e.key === 'ArrowRight') {
            this.rightPressed = true;
        }
    }

    this.update = function(delta) {
        if (this.crashing) {
            this.crashingTime += delta;

            if (!this.crashed) {
                if (this.crashingTime >= 500 && this.rotation < 45) {
                    this.rotation += 1;
                }

                if (this.xVelocity < 0.4) {
                    this.xVelocity += 0.02;
                }
                if (this.yVelocity < 0.4) {
                    this.yVelocity += 0.02;
                }
                this.x += delta * this.xVelocity;
                this.y += delta * this.yVelocity;

                if (this.y - this.w > this.gameHeight) this.crashed = true;
            }
        } else {
            // test only:
            //this.rotation += 10;

            if (this.leftPressed && !this.rightPressed) {
                this.xAcceleration = -0.02;
            } else if (this.rightPressed && !this.leftPressed)  {
                this.xAcceleration = 0.02;
            } else {
                this.xAcceleration = 0;
            }

            if (this.upPressed && !this.downPressed) {
                this.yAcceleration = -0.02;
            } else if (this.downPressed && !this.upPressed)  {
                this.yAcceleration = 0.02;
            } else {
                this.yAcceleration = 0;
            }

            this.xVelocity += this.xAcceleration;
            if (this.xVelocity >= 0.4) {
                this.xVelocity = 0.4;
            } else if (this.xVelocity <= -0.4) {
                this.xVelocity = -0.4;
            }

            this.yVelocity += this.yAcceleration;
            if (this.yVelocity >= 0.4) {
                this.yVelocity = 0.4;
            } else if (this.yVelocity <= -0.4) {
                this.yVelocity = -0.4;
            }

            this.x += delta * this.xVelocity;
            this.y += delta * this.yVelocity;

            if (this.x < 0) this.x = 0;
            if (this.x + this.w > this.gameWidth) this.x = this.gameWidth - this.w;

            if (this.y < -(this.h * 0.25)) this.y = -(this.h * 0.25);
            if (this.y + this.h > this.gameHeight + (this.h * 0.25)) this.y = this.gameHeight - (this.h * 0.75);
        }
    }

    this.render = function(ctx) {
        if (this.rotation !== 0) {
            ctx.save();
            ctx.translate(this.x - this.w, this.y - this.h);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.drawImage(this.img, -this.w/2, -this.h/2, this.w, this.h);
            ctx.restore();
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }
}

module.exports = Player;
},{}],7:[function(require,module,exports){
module.exports = {
    getRandomArbitrary: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    getRandomIntInclusive: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};
},{}]},{},[3]);
