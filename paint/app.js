class Colour {
	constructor(data) {
		this.data = data;
	}

	getData() {
		return this.data;
	}

	getCssColour() {
		return 'rgb(' + this.data[0].toString() + ',' + this.data[1].toString() + ',' + this.data[2].toString() + ')';
	}
}

class ColourPalette {
	constructor() {
		this.colours = {
			white: new Colour([255, 255, 255, 255]),
			grey: new Colour([192, 196, 200, 255]),
			red: new Colour([252, 0, 0, 255]),
			yellow: new Colour([252, 252, 0, 255]),
			green: new Colour([0, 252, 0, 255]),
			cyan: new Colour([0, 252, 252, 255]),
			blue: new Colour([0, 0, 252, 255]),
			magenta: new Colour([252, 0, 252, 255]),
			light_yellow: new Colour([252, 252, 252, 255]),
			light_green: new Colour([0, 252, 252, 255]),
			black: new Colour([0, 0, 0, 255])
		};

		this.selectedColour = this.colours['black'];
	}

	selectColour(name) {
		if (name in this.colours) {
			this.selectedColour = this.colours[name];
		}
	}

	getColours() {
		return this.colours;
	}

	getSelectedColour() {
		return this.selectedColour;
	}
}

class Tool {
	constructor(board) {
		this.board = board;
	}

	activate() {
		this.active = true;
		console.log(this.constructor.name + ' activated');
	}

	deactivate() {
		this.active = false;
		console.log(this.constructor.name + ' deactivated');
	}
}

class PencilTool extends Tool {
	constructor(board, colourPalette) {
		super(board);

		this.colourPalette = colourPalette;

		this.singlePixel = this.board.context.createImageData(1,1);
	}

	activate() {
		super.activate();

		this.onMouseDrawBound = this.onMouseDraw.bind(this);
		this.board.canvas.addEventListener('mouseDraw', this.onMouseDrawBound);
	}

	deactivate() {
		this.board.canvas.removeEventListener('mouseDraw', this.onMouseDrawBound);
		this.onMouseDrawBound = null;

		super.deactivate();
	}

	onMouseDraw(e) {
		const d = this.singlePixel.data;
		const selectedColour = this.colourPalette.getSelectedColour();
		d[0] = selectedColour.getData()[0];
		d[1] = selectedColour.getData()[1];
		d[2] = selectedColour.getData()[2];
		d[3] = selectedColour.getData()[3];
		this.board.context.putImageData(this.singlePixel, e.detail.coords.x, e.detail.coords.y);
	}
}

class BrushTool extends Tool {
	constructor(board, colourPalette) {
		super(board);

		this.colourPalette = colourPalette;
	}

	activate() {
		super.activate();

		this.onMouseDrawBound = this.onMouseDraw.bind(this);
		this.board.canvas.addEventListener('mouseDraw', this.onMouseDrawBound);

		this.onMouseUpBound = this.onMouseUp.bind(this);
		this.board.canvas.addEventListener('mouseUp', this.onMouseUpBound);
	}

	deactivate() {
		this.board.canvas.removeEventListener('mouseDraw', this.onMouseDrawBound);
		this.onMouseDrawBound = null;

		this.board.canvas.removeEventListener('mouseUp', this.onMouseUpBound);
		this.onMouseUpBound = null;

		super.deactivate();
	}

	onMouseDraw(e) {
		const c = this.board.context;

		if (this.prevCoords) {
			c.beginPath();
	        c.moveTo(this.prevCoords.x, this.prevCoords.y);
	        c.lineTo(e.detail.coords.x, e.detail.coords.y);
	        c.strokeStyle = this.colourPalette.getSelectedColour().getCssColour();
	        c.lineWidth = 2;
	        c.stroke();
	        c.closePath();
		}

		this.prevCoords = e.detail.coords;
	}

	onMouseUp(e) {
		this.prevCoords = null;
	}
}

class Board {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.rect = canvas.getBoundingClientRect();

		this.mouseDown = false;

		canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
		canvas.addEventListener('mousedown', (e) => {
			this.mouseDown = true;
		});
		canvas.addEventListener('mouseup', (e) => {
			this.mouseDown = false;
			this.onMouseUp.bind(this);
		});
	}

	onMouseMove(e) {
		if (this.mouseDown) {
			const x = e.clientX - this.rect.left;
			const y = e.clientY - this.rect.top;

			const mouseDrawEvent = new CustomEvent('mouseDraw', {
				detail: {
					coords: {
						x: x,
						y: y
					}
				}	
			});
			this.canvas.dispatchEvent(mouseDrawEvent);
		}
	}

	onMouseUp(e) {
		const x = e.clientX - this.rect.left;
		const y = e.clientY - this.rect.top;

		const mouseUpEvent = new CustomEvent('mouseUp', {
			detail: {
				coords: {
					x: x,
					y: y
				}
			}	
		});
		this.canvas.dispatchEvent(mouseUpEvent);
	}
}

class Paint {
	constructor(canvas) {
		const board = new Board(canvas);
		
		this.colourPalette = new ColourPalette();
		this.tools = {
			pencil: new PencilTool(board, this.colourPalette),
			brush: new BrushTool(board, this.colourPalette)
		};
	}

	getTools() {
		return this.tools;
	}

	selectTool(toolNameToSelect) {
		for (const name in this.tools) {
			if (name === toolNameToSelect) {
				this.tools[name].activate();
			} else {
				this.tools[name].deactivate();
			}
		}
	}

	getColours() {
		return this.colourPalette.getColours();
	}

	selectColour(name) {
		this.colourPalette.selectColour(name);
	}
}

window.addEventListener('load', function(e) {
	// Iniitiate paint app

	const canvas = document.getElementById('board');
	canvas.width = 640;
	canvas.height = 300;

	const paint = new Paint(canvas);

	//paint.selectTool('pencil');
	paint.selectTool('brush');
	paint.selectColour('black');

	// Render colour selection UI

	const colourPaletteContainer = document.getElementById('colour-palette');
	const colours = paint.getColours();
	for (name in colours) {
		const radio = document.createElement('radio');
		radio.setAttribute('name', 'colour');
		radio.setAttribute('value', name);
		radio.style.backgroundColor =  colours[name].getCssColour();
		colourPaletteContainer.appendChild(radio);
		radio.addEventListener('click', (e) => {
			paint.selectColour(e.target.getAttribute('value'));
		});
	}

	// Render tool palette UI

	const toolPaletteContainer = document.getElementById('tool-palette');
	const tools = paint.getTools();
	for (name in tools) {
		const radio = document.createElement('radio');
		radio.setAttribute('name', 'tool');
		radio.setAttribute('value', name);
		radio.setAttribute('class', name);
		radio.innerHTML = name;
		toolPaletteContainer.appendChild(radio);
		radio.addEventListener('click', (e) => {
			paint.selectTool(e.target.getAttribute('value'));
		});
	}
}, false);