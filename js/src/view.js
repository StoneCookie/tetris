export default class View {
	// Цвета фигур
	static colors = {
		'1': ['#FFFFCC', '#FFFF99'], // O done
		'2': ['#CCFFFF', '#99CCFF'], // I done
		'3': ['#CCFFCC', '#CCFF99'], // S
		'4': ['#FFCCCC', '#FF9999'], // Z
		'5': ['#B7D6D5', '#9999FF'], // L
		'6': ['#FFFFCC', '#FFCC99'], // J
		'7': ['#FFCCFF', '#CC99FF'] // T
	}

	constructor(canvasGame, canvasBackground, rows, columns) {
		this.canvasGame = canvasGame; // Канвас с игрой
		this.canvasBackground = canvasBackground; // Канвас с задним фоном
		this.width = window.innerWidth; // Ширина
		this.height = window.innerHeight; // Высота
		this.verticalMargin = this.height * .05; // Отступ сверху и снизу

		this.canvasBackground.width = this.canvasGame.width = this.width; // Ширина канваса с задним фоном и канваса с игрой
		this.canvasBackground.height = this.canvasGame.height = this.height; // Высота канваса с задним фоном и канваса с игрой
		this.ctxGame = this.canvasGame.getContext('2d');
		this.ctxBackground = this.canvasBackground.getContext('2d');

		this.backgroundBorder = 10; // Толщина границы

		this.playfieldWidth = this.width * .25; // Ширина игрового поля
		this.playfieldHeight = this.height * .9; // Высота игрового поля
		this.playfieldX = (this.width - this.playfieldWidth) / 3 + this.backgroundBorder; // Начальная точка канваса с игрой по X с поправкой на толщину границы
		this.playfieldY = this.verticalMargin + this.backgroundBorder; // Начальная точка канваса с игрой по Y с поправкой на толщину границы
		this.playfieldInnerWidth = this.playfieldWidth - this.backgroundBorder * 2; // Внутреняя ширина игрового поля с поправкой на толщину границы
		this.playfieldInnerHeight = this.playfieldHeight - this.backgroundBorder * 2; // Внутреняя высота игрового поля с поправкой на толщину границы

		this.blockWidth = this.playfieldInnerWidth / columns; // Ширина блока
		this.blockHeight = this.playfieldInnerHeight / rows; // Высота блока

		this.panelX = this.width / 2 + 20; // Начальная точка информационной панели по X
		this.panelY = this.playfieldY; // Начальная точка информационной панели по Y
		this.pannelWidth = this.width; // Ширина панели
		this.pannelHeight = this.height; // Высота игрового поля
	}

	// Отрисовка главного экрана
	renderMainScreen(state) {
		this.clearGameScreen();
		this.renderPlayfield(state.playfield);
		this.renderPanel(state);
	}

	// Отрисовка приветственного экрана
	renderStartScreen() {
		this.textParam('white', '2rem', 'Russo One', 'sans-serif', 'center', 'middle');
		this.ctxGame.fillText('Нажмите ENTER чтобы начать игру', this.width / 2, this.height / 2);
	}

	// Отрисовка экрана паузы
	renderPauseScreen() {
		this.ctxGame.fillStyle = '#000000bf';
		this.ctxGame.fillRect(0, 0, this.width, this.height);

		this.textParam('white', '2rem', 'Russo One', 'sans-serif', 'center', 'middle');
		this.ctxGame.fillText('Нажмите ENTER чтобы продолжить', this.width / 2, this.height / 2);
	}

	// Отрисовка экрана проигрыша
	renderEndScreen({ score }) {
		this.clearGameScreen();

		this.textParam('white', '2rem', 'Russo One', 'sans-serif', 'center', 'middle');
		this.ctxGame.fillText('ИГРА ОКОНЧЕНА', this.width / 2, this.height / 2 - 48);
		this.ctxGame.fillText(`Счет: ${score}`, this.width / 2, this.height / 2);
		this.ctxGame.fillText('Нажмите ENTER чтобы начать сначала', this.width / 2, this.height / 2 + 48);
	}

	// Отрисовка заднего фона
	renderBackGround() {
		const startGridX = this.playfieldX + this.blockWidth;
		const finishGridX = startGridX + this.playfieldWidth - (this.blockWidth * 2);
		const startGridY = this.playfieldY + this.blockHeight;
		const finishGridY = startGridY + this.playfieldHeight - (this.blockHeight * 2);

		this.ctxBackground.fillStyle = '#0D1A47'; // Цвет заливки фона
		this.renderRoundRect(this.ctxBackground, this.playfieldWidth, this.verticalMargin, this.playfieldWidth, this.height - (this.verticalMargin * 2), this.playfieldWidth * .05); // Отрисовка закругленной рамки
		this.ctxBackground.fill();

		// Отрисовка сетки
		this.ctxBackground.beginPath();
		for (let i = startGridX; i < finishGridX; i += this.blockWidth) {
			for (let j = startGridY; j < finishGridY; j += this.blockHeight) {
				this.ctxBackground.moveTo(i, j);
				this.ctxBackground.arc(i, j, 3, 2 * Math.PI, false);
			}
		}
		this.ctxBackground.closePath();

		this.ctxBackground.fillStyle = '#4C5DA6'; // Цвет сетки
		this.ctxBackground.fill(); // Заливка сетки

		this.ctxBackground.strokeStyle = '#748CFC'; // Цвет границы
		this.ctxBackground.lineWidth = this.backgroundBorder; // Толщина границы
		this.renderRoundRect(this.ctxBackground, this.playfieldWidth, this.verticalMargin, this.playfieldWidth, this.height - (this.verticalMargin * 2), this.playfieldWidth * .05); // Отрисовка закругленной рамки
		this.ctxBackground.stroke();
		this.renderControlPanel();
	}

	// Отрисовка панели управления
	renderControlPanel() {
		const controlMenuImg = new Image();
		const controlY = this.height - this.verticalMargin - this.backgroundBorder - 244;

		controlMenuImg.src = '../img/control.png';
		controlMenuImg.onload = _ => {
			this.ctxBackground.drawImage(controlMenuImg, this.panelX, controlY, 342, 244);
		};
	}

	// Очистка игрового экрана
	clearGameScreen() {
		this.ctxGame.clearRect(0, 0, this.width, this.height);
	}

	// Очистка заднего фона
	clearBgScreen() {
		this.ctxBackground.clearRect(0, 0, this.width, this.height);
	}

	// Отрисовка игрового поля
	renderPlayfield(playfield) {
		// Генерация текущей фигуры
		for (let i = 0; i < playfield.length; i++) {
			for (let j = 0; j < playfield[i].length; j++) {
				const block = playfield[i][j];

				if (block) {
					this.renderBlock(
						this.playfieldX + (j * this.blockWidth),
						this.playfieldY + (i * this.blockHeight),
						View.colors[block],
						3, // Толщина линии
						'#0D1A47', // Цвет обводки
						this.renderRoundRect(
							this.ctxGame,
							this.playfieldX + (j * this.blockWidth),
							this.playfieldY + (i * this.blockHeight),
							this.blockWidth,
							this.blockHeight,
							this.blockWidth * .35, // Радиус угла
						)
					);
				}
			}
		}
	}

	// Отрисовка информационной панели
	renderPanel({ lvl, score, lines, nextPiece }) {
		this.textParam('white', '1.5rem', 'Russo One', 'sans-serif', 'start', 'top');
		this.ctxGame.fillText(`Счет: ${score}`, this.panelX, this.panelY + 0);
		this.ctxGame.fillText(`Линии: ${lines}`, this.panelX, this.panelY + 40);
		this.ctxGame.fillText(`Уровень: ${lvl}`, this.panelX, this.panelY + 80);
		this.ctxGame.fillText('Следующая фигура:', this.panelX, this.panelY + 200);

		// Генерация следующей фигуры
		for (let i = 0; i < nextPiece.blocks.length; i++) {
			for (let j = 0; j < nextPiece.blocks[i].length; j++) {
				const block = nextPiece.blocks[i][j];

				if (block) {
					this.renderBlock(
						this.panelX + (j * this.blockWidth * .6),
						this.panelY + 230 + (i * this.blockHeight * .6),
						View.colors[block],
						2, // Толщина линии
						'#444E8C', // Цвет обводки

						this.renderRoundRect(
							this.ctxGame,
							this.panelX + (j * this.blockWidth * .6),
							this.panelY + 230 + (i * this.blockHeight * .6),
							this.blockWidth * .6,
							this.blockHeight * .6,
							this.blockWidth * .2, // Радиус угла
						)
					);
				}
			}
		}
	}

	// Генерация блока фигуры
	renderBlock(x, y, color, lineWidth, strokeStyle) {
		const gradient = this.ctxGame.createLinearGradient(x + this.blockWidth, y, x + this.blockWidth, y + this.blockHeight);
		gradient.addColorStop(0, color[0]);
		gradient.addColorStop(.4, color[1]);

		this.ctxGame.fillStyle = gradient;
		this.ctxGame.strokeStyle = strokeStyle;
		this.ctxGame.lineWidth = lineWidth;

		this.ctxGame.fill(); // Закрашиваем квадрат
		this.ctxGame.stroke(); // Закрашиваем квадрат
	}

	renderRoundRect(context, x, y, width, height, radius) {
		// Начинаем рисовать квадрат
		context.beginPath();

		// Начинаем рисовать квадрат с левого верхнего угла с закруглением углов
		context.moveTo(x + radius, y);
		context.lineTo(x + width - radius, y); // Верхняя сторона без закругления
		context.arcTo(x + width, y, x + width, y + radius, radius); // Верхний правый угол
		context.lineTo(x + width, y + height - radius); // Правая сторона без закругления
		context.arcTo(x + width, y + height, x + width - radius, y + height, radius); // Нижний правый угол
		context.lineTo(x + radius, y + height); // Нижняя сторона без закругления
		context.arcTo(x, y + height, x, y + height - radius, radius); // Нижний левый угол
		context.lineTo(x, y + radius); // Левая сторона без закругления
		context.arcTo(x, y, x + radius, y, radius); // Верхний левый угол

		// Заканчиваем рисовать квадрат
		context.closePath();
	}

	textParam(color, size, name, serif, align, baseLine) {
		this.ctxGame.fillStyle = color;
		this.ctxGame.font = `${size} "${name}", ${serif}`;
		this.ctxGame.textAlign = align;
		this.ctxGame.textBaseline = baseLine;
	}
}
