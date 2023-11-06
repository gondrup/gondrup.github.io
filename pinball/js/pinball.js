const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events;

const engine = Engine.create();

const tableSize = {x: 300, y: 560};

// Table boundaries

const wallTop = Bodies.rectangle(150, -50, 300, 100, { isStatic: true })
    wallLeft = Bodies.rectangle(-50, 280, 100, 560, { isStatic: true })
    wallRight = Bodies.rectangle(350, 280, 100, 560, { isStatic: true })
    wallBottom = Bodies.rectangle(150, 610, 300, 100, { isStatic: true });

Composite.add(engine.world, [
    wallTop,
    wallLeft,
    wallRight,
    wallBottom,
]);

// Ball

const ball = Bodies.circle(150, 200, 5, {friction: 0});
Body.setVelocity(ball, { x: -2.3, y: 0.2 });
Composite.add(engine.world, [ball]);

// Flippers

function createFlipper (x, y, angle) {
    const bigCircle = Bodies.circle(x, y, 10),
        littleCircle = Bodies.circle(x + 40, y, 5),
        topLine = Bodies.rectangle(x + 20, y - 6, 40, 2, {
            angle: -3,
        }),
        bottomLine = Bodies.rectangle(x + 20, y + 6, 40, 2, {
            angle: 3,
        }),
        flipper = Body.create({
            parts: [bigCircle, littleCircle, topLine, bottomLine],
            isStatic: true,
        });

    Body.setCentre(flipper, {
        x: bigCircle.position.x,
        y: bigCircle.position.y
    });
    Body.rotate(flipper, angle);

    return flipper
}

const leftFlipper = createFlipper(80, 500, 0.2);
const rightFlipper = createFlipper(220, 500, 2.9);
Composite.add(engine.world, [leftFlipper, rightFlipper]);

// Initiate built in renderer

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: tableSize.x,
        height: tableSize.y,
        showAngleIndicator: true,
    },
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Add mouse control

var mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        },
    },
});
Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

// Add keyboard control

let leftFlipperActive = false,
    rightFlipperActive = false;

document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName === '\\') {
        leftFlipperActive = true;
    } else if(keyName === '/') {
        rightFlipperActive = true;
    }
});

document.addEventListener('keyup', (event) => {
    const keyName = event.key;

    if (keyName === '\\') {
        leftFlipperActive = false;
    } else if(keyName === '/') {
        rightFlipperActive = false;
    }
});

Events.on(engine, 'beforeUpdate', function(event) {
    const timeScale = (event.delta || (1000 / 60)) / 1000;

    if (leftFlipperActive) {
        Body.rotate(leftFlipper, -(5 * Math.PI * timeScale), null, true);
    }

    if (rightFlipperActive) {
        Body.rotate(rightFlipper, 5 * Math.PI * timeScale, null, true);
    }
});