const numberOfBars = 16
const barWidth = 30;
const barSpacing = 20;
const maxBarHeight = 300;

let barHeights;

function preload(){
    sound = loadSound('assets/Sweet.mp3');
}
 
function setup() {
    let canvas = createCanvas(numberOfBars * (barWidth + barSpacing), 500, WEBGL);
    canvas.mouseClicked(startStop);

    fft = new p5.FFT();
    fft.bins = numberOfBars;
}
  
function draw() {
    background(0);
    camera(-100, -300, 400, 0, 0, 0);
    orbitControl()

    update();
    drawBars();
}

function update() {
    updateBarHeights();
}

function updateBarHeights() {
    let spectrum = fft.analyze();

    barHeights = [];
    for (let i = 0; i < numberOfBars; i++) {
        barHeights.push(spectrum[i] / 255 * maxBarHeight);
    }
}

function drawBars() {
    let startX = (numberOfBars / 2) * -barWidth - barWidth;

    for (let i = 0; i < numberOfBars; i++) {
        push();
        c = barHeights[i] / maxBarHeight * 255;
        fill(c, 255 - c, 0);
        translate(startX + (i * (barWidth + barSpacing)), 0, 0);
        rotateY(frameCount * 0.01);
        box(barWidth, barHeights[i], barWidth);
        pop();
    }
}

function startStop() {
    if (sound.isPlaying()) {
        sound.pause();
    } else {
        sound.loop();
    }
}