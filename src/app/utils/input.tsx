export interface InputState {
	keys: boolean[];
	mouse: {
		left: boolean;
		right: boolean;
		middle: boolean;
		x: number;
		y: number;
	};
}

export const Input: InputState = {
	keys: Array(230).fill(false),
	mouse: {
		left: false,
		right: false,
		middle: false,
		x: 0,
		y: 0,
	},
};

export function setupInput() {
	document.addEventListener("keydown", (event) => {
		Input.keys[event.keyCode] = true;
	});

	document.addEventListener("keyup", (event) => {
		Input.keys[event.keyCode] = false;
	});

	document.addEventListener("mousedown", (event) => {
		if (event.button === 0) Input.mouse.left = true;
		if (event.button === 1) Input.mouse.middle = true;
		if (event.button === 2) Input.mouse.right = true;
	});

	document.addEventListener("mouseup", (event) => {
		if (event.button === 0) Input.mouse.left = false;
		if (event.button === 1) Input.mouse.middle = false;
		if (event.button === 2) Input.mouse.right = false;
	});

	document.addEventListener("mousemove", (event) => {
		Input.mouse.x = event.clientX;
		Input.mouse.y = event.clientY;
	});
}
