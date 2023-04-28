const canvas = document.querySelector('.tetris-box'); // Получение канваса
const ctx = canvas.getContext('2d');
const scale = 25;

ctx.scale(scale, scale); // Размер ячейки

const tWidth = canvas.width / scale;
const tHeight = canvas.height / scale;

const figures = [
	[
		[1, 1],
		[1, 1]
	], // O
	[
		[0, 2, 0, 0],
		[0, 2, 0, 0],
		[0, 2, 0, 0],
		[0, 2, 0, 0]
	], // I
	[
		[0, 0, 0],
		[0, 3, 3],
		[3, 3, 0]
	], // S
	[
		[0, 0, 0],
		[4, 4, 0],
		[0, 4, 4]
	], // Z
	[
		[5, 0, 0],
		[5, 0, 0],
		[5, 5, 0]
	], // L
	[
		[0, 0, 6],
		[0, 0, 6],
		[0, 6, 6]
	], // J
	[
		[0, 0, 0],
		[7, 7, 7],
		[0, 7, 0]
	] // T
];

const colors = [null, 'blue', 'yellow', 'red', 'green', 'orange', 'skyblue', 'purple'];

const arena = [];

let rand;

const player = {
	pos: { x: 0, y: 0 },
	figure: null,
	color: null
}

rand = Math.floor(Math.random() * figures.length);
player.figure = figures[rand];
player.color = colors[rand + 1];

const drawFigure = (figure, x, y) => {
	for (let i = 0; i < figure.length; i++) {
		for (let j = 0; j < figure[i].length; j++) {
			if (figure[i][j]) {
				ctx.fillRect(x + j, y + i, 1, 1);
			}
		}
	}
}

const drawGrid = (ctx, w, h) => {
	ctx.beginPath();
	for (let i = 1; i <= w - 1; i++) {
		for (let j = 1; j <= h - 1; j++) {
			ctx.moveTo(i, j);
			ctx.arc(i, j, 0.1, 2 * Math.PI, false);
		}
	}
	ctx.strokeStyle = '#9B43A1';
	ctx.fillStyle = '#9B43A1';
	ctx.lineWidth = 0.1;
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

const rotateFigure = (figure, dir) => {
	let newFigure = [];

	for (let i in figure) {
		newFigure.push([]);
	}

	if (dir === 1) {
		for (let i = 0; i < figure.length; i++) {
			for (let j = 0; j < figure[i].length; j++) {
				newFigure[j][figure.length - i - 1] = figure[i][j];
			}
		}
	} else {
		for (let i = 0; i < figure.length; i++) {
			for (let j = 0; j < figure[i].length; j++) {
				newFigure[figure.length - j - 1][i] = figure[i][j];
			}
		}
	}

	return newFigure;
}

const collides = (player, arena) => {
	for (let i = 0; i < player.figure.length; i++) {
		for (let j = 0; j < player.figure[i].length; j++) {
			if (player.figure[i][j] && arena[player.pos.y + i + 1][player.pos.x + j + 1]) {
				return true;
			}
		}
	}

	return false;
}

const mergeArena = (figure, x, y) => {
	for (let i = 0; i < figure.length; i++) {
		for (let j = 0; j < figure[i].length; j++) {
			arena[y + i + 1][x + j + 1] = arena[y + i + 1][x + j + 1] || figure[i][j];
		}
	}
}

const clearBlocks = () => {
	for (let i = 1; i < arena.length - 2; i++) {
		let clear = 1;

		for (let j = 1; j < arena[i].length - 1; j++) {
			if (!arena[i][j]) {
				clear = 0;
			}
		}
		if (clear) {
			let r = Array(tWidth).fill(0);
			r.push(1);
			r.unshift(1);

			arena.splice(i, 1);
			arena.splice(1, 0, r);
		}
	}
}

const drawArena = () => {
	for (let i = 1; i < arena.length - 2; i++) {
		for (let j = 1; j < arena[i].length - 1; j++) {
			if (arena[i][j]) {
				ctx.fillStyle = colors[arena[i][j]];
				ctx.fillRect(j - 1, i - 1, 1, 1);
			}
		}
	}
}

const initArena = () => {
	const r = Array(tWidth + 2).fill(1);
	arena.push(r);

	for (let i = 0; i < tHeight; i++) {
		let row = Array(tWidth).fill(0);
		row.push(1);
		row.unshift(1);
		arena.push(row);
	}

	arena.push(r);
	arena.push(r);
}

let interval = 1000;
let lastTime = 0;
let count = 0;

const update = (time = 0) => {
	const dt = time - lastTime;
	lastTime = time;
	count += dt;

	if (count >= interval) {
		player.pos.y++;
		count = 0;
	}

	if (collides(player, arena)) {
		mergeArena(player.figure, player.pos.x, player.pos.y - 1);
		clearBlocks();

		player.pos.x = 0;
		player.pos.y = 0;

		rand = Math.floor(Math.random() * figures.length);
		player.figure = figures[rand];
		player.color = colors[rand + 1];

		interval = 1000;
	}

	ctx.fillStyle = '#0D1A47';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawGrid(ctx, tWidth, tHeight);

	drawArena();
	ctx.fillStyle = player.color;
	drawFigure(player.figure, player.pos.x, player.pos.y);

	requestAnimationFrame(update);
}

initArena();
update();

document.addEventListener('keydown', e => {
	switch (true) {
		case e.key === 'ArrowLeft':
			player.pos.x--;
			if (collides(player, arena)) {
				player.pos.x++;
			}
			break;

		case e.key === 'ArrowRight':
			player.pos.x++;
			if (collides(player, arena)) {
				player.pos.x--;
			}
			break;

		case e.key === 'ArrowDown':
			player.pos.y++;
			count = 0;
			break;

		case e.key === 'ArrowUp':
			player.figure = rotateFigure(player.figure, 1);
			if (collides(player, arena)) {
				player.figure = rotateFigure(player.figure, -1);
			}
			break;

		case e.key === ' ':
			interval = 1;
			break;
	}
})
