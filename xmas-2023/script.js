(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function Cloud(
    size,
    startPos,
    stageSize,
) {
    this.size = size;
    this.startPos = startPos;
    this.stageSize = stageSize;

    this.init = function() {
        this.pos = this.startPos;
        this.vel = {x: 0, y: 0};
        this.active = true;
        this.hit = false;
    }
    
    this.init();

    this.update = function(delta) {
        if (this.pos.x <= -this.size.w) {
            this.vel.x = 0;
            this.active = false;
        } else {
            this.vel.x = -0.3;
        }

        this.pos.x += delta * this.vel.x;
    }
}

module.exports = Cloud;
},{}],2:[function(require,module,exports){
function FatherChristmas(
    size,
    startPos,
    stageSize,
) {
    this.size = size;
    this.startPos = startPos;
    this.stageSize = stageSize;
    this.ascentSpeed = 0.2;
    this.descentSpeed = 0.4;

    this.init = function() {
        this.pos = this.startPos;
        this.vel = {x: 0, y: 0};
        this.ascending = false;
    }
    
    this.init();

    this.startAscending = function() {
        this.ascending = true;
    }

    this.stopAscending = function(e) {
        this.ascending = false;
    }

    this.update = function(delta) {
        if (this.ascending && this.pos.y > this.ascentSpeed) {
            this.vel.y = -this.ascentSpeed;
        } else if (!this.ascending && this.pos.y < (this.stageSize.h + this.descentSpeed)) {
            this.vel.y = this.descentSpeed;
        } else {
            this.vel.y = 0;
        }

        this.pos.y += delta * this.vel.y;
    }

    // Rendering or "draw" handled in main.js
    /*
    this.render = function(ctx) {
        // Boat
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        
        // Line
        if (this.lineLength > 0) {
            this.lineX = this.x + (this.w / 2);
            const lineStartY = this.y + this.h;
            this.lineEndY = lineStartY + this.lineLength;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.moveTo(this.lineX, lineStartY);
            ctx.lineTo(this.lineX, this.lineEndY);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(this.lineX, this.lineEndY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    */
}

module.exports = FatherChristmas;
},{}],3:[function(require,module,exports){
const {getRandomArbitrary, getRandomIntInclusive} = require('./random');
const FatherChristmas = require('./father-christmas');
const Cloud = require('./cloud');

const stageSize = {w: 640, h: 360};

const canvas = document.getElementById('game');

if (canvas.getContext) {
    // Initiation

    const ctx = canvas.getContext('2d');
    ctx.canvas.width = stageSize.w;
    ctx.canvas.height = stageSize.h;

    const fc = new FatherChristmas(
        {w: 80, h: 50},
        {x: 10, y: 10},
        stageSize,
    );

    const cloudsPerSecond = 1;
    const clouds = [];
    const cheerGainPerSecond = 5;
    const cheerLossPerHit = 40;

    let cheerometer, cloudsHit;

    let gameOver = false;
    let timeElapsed = 0;

    // Control & animation

    function keyDown(e) {
        if (e.code === 'Space') {
            fc.startAscending(); 
        }
    }

    function keyUp(e) {
        if (e.code === 'Space') {
            fc.stopAscending();
        }
    }

    function gameOverKeyUp(e) {
        if (e.code === 'Enter') {
            startGame();
        }
    }

    function cloudCollisionCheck() {
        for (cloud of clouds.filter(cloud => cloud.hit === false)) {
            if (
                cloud.pos.x <= (fc.pos.x + fc.size.w)
                && (cloud.pos.x + cloud.size.w) > fc.pos.x
                && cloud.pos.y <= (fc.pos.y + fc.size.h)
                && (cloud.pos.y + cloud.size.h) > fc.pos.y
            ) {
                cloud.hit = true;
                cloudsHit++;
                cheerometer -= cheerLossPerHit;
            }
        }
    }

    function lowAltitudeCheck() {
        if (fc.pos.y >= (stageSize.h - (fc.size.h * 0.75))) {
            cheerometer = 0;
        }
    }

    function update(delta) {
        if (gameOver === false) {
            timeElapsed += delta;
            cheerometer += (cheerGainPerSecond / 1000) * delta;

            cloudCollisionCheck();
            lowAltitudeCheck();

            if (cheerometer < 0) {
                cheerometer = 0;
            } else if (cheerometer > 100) {
                cheerometer = 100;
            }

            //console.log(`cheerometer: ${cheerometer}, hits: ${cloudsHit}`);

            const chanceOfCloud = (cloudsPerSecond / 1000) * delta;
            if (Math.random() < chanceOfCloud) {
                clouds.push(
                    new Cloud(
                        {w: 40, h: 20},
                        {x: stageSize.w, y: getRandomIntInclusive(0, stageSize.h - 20)},
                        stageSize,
                    )
                );
            }

            if (cheerometer <= 0) {
                // game over
                gameOver = true;
                fc.stopAscending();
                stopGame();
            }
        }

        fc.update(delta);
        for (let i = clouds.length-1; i >= 0; i--) {
            if (clouds[i].active === false) {
                clouds.splice(i, 1);
            } else {
                clouds[i].update(delta);
            }
        }
    }

    // Drawing

    const img = {
        'fc': {
            'off': document.getElementById('fc-off'),
            'on': document.getElementById('fc-on'),
            'on-asc': document.getElementById('fc-on-asc')
        },
        'cloud': document.getElementById('cloud'),
    };

    function drawBackground() {
        ctx.beginPath();
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.rect(0, 0, stageSize.w, stageSize.h);
        ctx.fill();
    }

    function drawFatherChristmas() {
        let fcImg;
        if (fc.ascending) {
            fcImg = img['fc']['on-asc'];
        } else {
            fcImg = img['fc']['on'];
        }

        ctx.drawImage(fcImg, fc.pos.x, fc.pos.y, fc.size.w, fc.size.h);
    }

    function drawClouds() {
        for (cloud of clouds.filter(cloud => cloud.hit === false)) {
            ctx.drawImage(img['cloud'], cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h);
        }
    }

    function drawHud() {
        if (gameOver) {
            ctx.font = '30px sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Christmas Cheer Depleted', stageSize.w / 2, (stageSize.h / 2) - 15 - 20);
            ctx.font = '20px sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(`Father Christmas Lasted ${(timeElapsed / 1000).toFixed(0)} Seconds`, stageSize.w / 2, (stageSize.h / 2) - 15);

            //ctx.font = '14px sans-serif';
            //ctx.fillStyle = 'white';
            //ctx.fillText('Press [ENTER] To Try Again', gameWidth / 2, gameHeight - 30);
        } else {
            ctx.font = '20px sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            //ctx.fillText(`Cheer-o-Meter ${(cheerometer).toFixed(0)}`, 10, 20);

            ctx.fillText('Cheer-o-Meter', 10, 20);
            ctx.beginPath();
            const w = cheerometer / 100 * 144;
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.rect(10, 30, w, 20);
            ctx.fill();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();
        drawFatherChristmas();
        drawClouds();
        drawHud();
    }

    // Game control

    // TODO:
    // * remove cloud on hit
    // * game over when cheerometer empty
    // * game over when fc falls to bottom of screen
    // * replace blocks with pictures

    const timeBetweenFrames = 1000 / 60; // 60 fps
    let lastRender = 0;
    let animationFrameReq;

    function startGame() {
        cheerometer = 100;
        cloudsHit = 0;

        window.removeEventListener('keyup', gameOverKeyUp);

        fc.init();

        window.addEventListener('keyup', keyUp);
        window.addEventListener('keydown', keyDown);

        function renderLoop(timestamp) {
            const renderElapsed = timestamp - lastRender;
    
            if (renderElapsed > timeBetweenFrames) {
                update(renderElapsed);
                draw();
                lastRender = timestamp;
            }
            
            animationFrameReq = window.requestAnimationFrame(renderLoop);
        }
    
        renderLoop();
        //animationFrameReq = window.requestAnimationFrame(renderLoop);
    }

    function stopGame() {
        window.removeEventListener('keyup', keyUp);
        window.removeEventListener('keydown', keyDown);
        //clouds.splice(0, clouds.length)

        window.addEventListener('keyup', gameOverKeyUp);

        //cancelAnimationFrame(animationFrameReq);
    }

    startGame();
} else {
    alert('Canvas not supported by this browser');
}
},{"./cloud":1,"./father-christmas":2,"./random":4}],4:[function(require,module,exports){
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
