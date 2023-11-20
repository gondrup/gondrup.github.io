const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events;

let score  = 0;

// Util functions

function toDegrees(radians) {
    return radians * (180/Math.PI);
}

function toRadians(degrees) {
    return degrees * (Math.PI/180);
}

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

// Table static walls

const wall1 = Bodies.rectangle(295, 280, 10, 560, {
        isStatic: true,
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall2 = Bodies.rectangle(5, 280, 10, 560, {
        isStatic: true,
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall3 = Bodies.rectangle(150, 5, 300, 10, {
        isStatic: true,
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall4 = Bodies.rectangle(13, 10, 150, 100, {
        isStatic: true,
        angle: -toRadians(33.75),
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall5 = Bodies.rectangle(223, 10, 250, 100, {
        isStatic: true,
        angle: toRadians(33.75),
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall6 = Bodies.rectangle(263, 400, 10, 400, {
        isStatic: true,
        chamfer: {radius: 5 },
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall7 = Bodies.rectangle(32, 478, 10, 50, {
        isStatic: true,
        angle: toRadians(120),
        chamfer: {radius: 5 },
        render: {
            fillStyle: '#c3e33e',
        },
    }),
    wall8 = Bodies.rectangle(236, 478, 10, 50, {
        isStatic: true,
        angle: -toRadians(120),
        chamfer: {radius: 5 },
        render: {
            fillStyle: '#c3e33e',
        },
    })

Composite.add(engine.world, [
    wall1,
    wall2,
    wall3,
    wall4,
    wall5,
    wall6,
    wall7,
    wall8,
]);

// Ball

const ball = Bodies.circle(150, 200, 10, {
    label: 'ball',
    friction: 0,
    render: {
        fillStyle: '#fff',
    },
});
Body.setVelocity(ball, { x: -2.3, y: 0.2 });
Composite.add(engine.world, [ball]);

// Flippers

function createFlipper(x, y, angleInDegrees, direction) {
    const bigCircle = Bodies.circle(x, y, 10, {
            render: {
                fillStyle: '#0cf',
            },
        }),
        littleCircle = Bodies.circle(x + 40, y, 5, {
            render: {
				fillStyle: '#0cf',
			},
        }),
        topLine = Bodies.rectangle(x + 20, y - 6, 40, 2, {
            angle: toRadians(-172),
            render: {
				fillStyle: '#0cf',
			},
        }),
        bottomLine = Bodies.rectangle(x + 20, y + 6, 40, 2, {
            angle: toRadians(172),
            render: {
				fillStyle: '#0cf',
			},
        });

    let collisionBlock = null;

    if (direction === 'left') {
        collisionBlock = Bodies.rectangle(x + 16, y + 12, 54, 40, {
            angle: toRadians(8),
            chamfer: {radius: 5 },
            render: {
				opacity: 0,
			},
        });
    } else {
        collisionBlock = Bodies.rectangle(x + 16, y - 12, 54, 40, {
            angle: toRadians(-8),
            chamfer: {radius: 5 },
            render: {
				opacity: 0,
			},
        });
    }

    const flipper = Body.create({
        parts: [bigCircle, littleCircle, topLine, bottomLine, collisionBlock],
        isStatic: true,
    });

    Body.setCentre(flipper, {
        x: bigCircle.position.x,
        y: bigCircle.position.y
    });
    Body.rotate(flipper, toRadians(angleInDegrees));

    return flipper
}

const leftFlipper = createFlipper(60, 500, 30, 'left');
const rightFlipper = createFlipper(208, 500, 150, 'right');
Composite.add(engine.world, [leftFlipper, rightFlipper]);

// Bumpers

function createBumper(x, y) {
    const circle = Bodies.circle(x, y, 20, {
        label: 'bumper',
        render: {
            fillStyle: '#e64980',
        },
        isStatic: true,
    })
    
    return circle;
}

Composite.add(engine.world, [
    createBumper(80, 180),
    createBumper(198, 180),
    createBumper(138, 260),
]);

// Initiate built in renderer

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: tableSize.x,
        height: tableSize.y,
        wireframes: false,
        //showAngleIndicator: true,
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

// TODO:
// - Add plunger and alley for the ball to be plunged onto the table
// - Add gutter, just respawn ball at plunger
// - Add some bunpers
// - Add scoring

Events.on(engine, 'beforeUpdate', function(event) {
    const timeScale = (event.delta || (1000 / 60)) / 1000;
    const flipRotationAmount = toRadians(60);
    const settleRotationAmount = toRadians(5);

    if (leftFlipperActive) {
        if (Math.round(toDegrees(leftFlipper.angle - flipRotationAmount)) >= -30) {
            Body.rotate(leftFlipper, -flipRotationAmount, null, true);
        } else if (Math.round(toDegrees(leftFlipper.angle) > -30)) {
            Body.setAngle(leftFlipper, toRadians(-30));
        }
    } else {
        if (Math.round(toDegrees(leftFlipper.angle + settleRotationAmount)) <= 30) {
            Body.rotate(leftFlipper, settleRotationAmount, null, true);
        }
    }

    if (rightFlipperActive) {
        if (Math.round(toDegrees(rightFlipper.angle + flipRotationAmount)) <= 210) {
            Body.rotate(rightFlipper, flipRotationAmount, null, true);
        } else if (Math.round(toDegrees(rightFlipper.angle) < 210)) {
            Body.setAngle(rightFlipper, toRadians(210));
        }
    } else {
        if (Math.round(toDegrees(rightFlipper.angle - settleRotationAmount)) >= 150) {
            Body.rotate(rightFlipper, -settleRotationAmount, null, true);
        }
    }

    if (ball.position.x > 258) {
        Matter.Body.setVelocity(ball, { x: 0, y: -10 });
    }

    if (ball.position.x < 258 && ball.position.y > 548) {
        Matter.Body.setPosition(ball, { x: 269, y: 545 });
    }
});

Events.on(engine, 'collisionStart', function(event) {
    let pairs = event.pairs;
    pairs.forEach(function(pair) {
        if (pair.bodyB.label === 'ball') {
            switch (pair.bodyA.label) {
                case 'bumper':
                    currentScore += 10;

                    // flash color
                    pair.bodyA.render.fillStyle = '#fff';
                    setTimeout(function() {
                        pair.bodyA.render.fillStyle = '#e64980';
                    }, 100);

                    break;
            }
        }
    });
});