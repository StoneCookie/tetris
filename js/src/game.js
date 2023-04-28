export default class Game {
	// Количество выдаваемых очков взависимости от количества сломанных линий
	static points = {
		'1': 100,
		'2': 300,
		'3': 500,
		'4': 800
	};

	// Массив фигур
	figures = [
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0]
		], // O
		[
			[0, 0, 0, 0],
			[2, 2, 2, 2],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
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
			[0, 0, 0],
			[5, 5, 5],
			[5, 0, 0]
		], // L
		[
			[0, 0, 0],
			[6, 6, 6],
			[0, 0, 6]
		], // J
		[
			[0, 0, 0],
			[7, 7, 7],
			[0, 7, 0]
		] // T
	];

	constructor(rows, columns) {
		this.rows = rows;
		this.columns = columns;

		this.reset();
	}

	// Вычисление уровня с округлением в меньшую сторону, исходя от количества сломанных линий
	get lvl() {
		return Math.floor(this.lines * .1);
	}

	// Возвращает состояние игрового поля
	getState() {
		const playfield = [...this.playfield];
		const { x, y, blocks } = this.activePiece;

		for (let i = 0; i < this.playfield.length; i++) {
			playfield[i] = [];
			for (let j = 0; j < this.playfield[i].length; j++) {
				playfield[i][j] = this.playfield[i][j];
			}
		}

		for (let i = 0; i < blocks.length; i++) {
			for (let j = 0; j < blocks[i].length; j++) {
				if (blocks[i][j]) {
					playfield[y + i][x + j] = blocks[i][j];
				}
			}
		}

		return {
			score: this.score,
			lvl: this.lvl,
			lines: this.lines,
			nextPiece: this.nextPiece,
			playfield,
			isGameOver: this.topOut
		};
	}

	// Стартовые значения
	reset() {
		this.score = 0;
		this.lines = 0;
		this.topOut = false;
		this.fastInterval = false;
		this.playfield = [...Array(20)].map(_height => Array(10).fill(0));
		this.activePiece = this.createPiece(this.figures);
		this.nextPiece = this.createPiece(this.figures);
	}

	// Создание фигуры
	createPiece(figures) {
		const indexFigure = Math.floor(Math.random() * figures.length);
		const piece = {};

		piece.blocks = figures[indexFigure];
		piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
		piece.y = -1;

		return piece;
	}

	// Подвинуть активную фигуру влево
	movePieceLeft() {
		this.activePiece.x--;

		if (this.hasCollision()) {
			this.activePiece.x++;
		}
	}

	// Подвинуть активную фигуру вправо
	movePieceRight() {
		this.activePiece.x++;

		if (this.hasCollision()) {
			this.activePiece.x--;
		}
	}

	// Подвинуть активную фигуру вниз
	movePieceDown() {
		this.fastInterval = false;

		if (this.topOut) return;

		this.activePiece.y++;

		if (this.hasCollision()) {
			this.activePiece.y--;
			this.lockPiece();
			const clearedLines = this.clearLines();
			this.updateScore(clearedLines);
			this.updatePieces();

			this.fastInterval = true;
		}

		if (this.hasCollision()) {
			this.topOut = true;
		}
	}
	// Повернуть активную фигуру
	rotatePiece() {
		const blocks = this.activePiece.blocks;
		const newBlocks = blocks.map(_ => []);

		for (let i = 0; i < blocks.length; i++) {
			for (let j = 0; j < blocks.length; j++) {
				newBlocks[j][i] = blocks[blocks.length - i - 1][j];
			}
		}

		this.activePiece.blocks = newBlocks;

		if (this.hasCollision()) {
			this.activePiece.blocks = blocks;
		}
	}

	// Проверка было ли столкновение
	hasCollision() {
		const playfield = this.playfield;
		const { x, y, blocks } = this.activePiece;

		for (let i = 0; i < blocks.length; i++) {
			for (let j = 0; j < blocks[i].length; j++) {
				if (
					blocks[i][j] != 0 &&
					((playfield[y + i] === undefined || playfield[y + i][x + j] === undefined) ||
						this.playfield[y + i][x + j])
				) {
					return true;
				}
			}
		}

		return false;
	}

	// Зафиксировать фигуру на игровом поле
	lockPiece() {
		const { x, y, blocks } = this.activePiece;

		for (let i = 0; i < blocks.length; i++) {
			for (let j = 0; j < blocks[i].length; j++) {
				if (blocks[i][j] != 0) {
					this.playfield[y + i][x + j] = blocks[i][j];
				}
			}
		}
	}

	// Очистка заполненых линий
	clearLines() {
		let lines = [];

		for (let i = this.rows - 1; i >= 0; i--) {
			let numberOfBlocks = 0;

			for (let j = 0; j < this.columns; j++) {
				if (this.playfield[i][j]) {
					numberOfBlocks++;
				}
			}

			switch (true) {
				case numberOfBlocks === 0:
					break;
				case numberOfBlocks < this.columns:
					continue;
				case numberOfBlocks === this.columns:
					lines.unshift(i);
					break;
			}
		}

		for (const line of lines) {
			this.playfield = this.playfield.filter((_, index) => index != line);
			this.playfield.unshift(Array(this.columns).fill(0));
		}

		return lines.length;
	}

	// Подсчет очков и линий
	updateScore(clearedLines) {
		if (clearedLines > 0) {
			this.score += Game.points[clearedLines] * (this.lvl + 1);
			this.lines += clearedLines;
		}
	}

	// Генерация новых фигур
	updatePieces() {
		this.activePiece = this.nextPiece;
		this.nextPiece = this.createPiece(this.figures);
	}
}
