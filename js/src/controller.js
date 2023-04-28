export default class Controller {
	constructor(game, view) {
		this.game = game;
		this.view = view;
		this.intervalId = null;
		this.isPlaying = false;

		// Чтобы метод не потерял связь с объектом привяжем его с помощью bind
		document.addEventListener('keydown', this.handleKeyDown.bind(this));
		document.addEventListener('keyup', this.handleKeyUp.bind(this));

		// Отрисовка приветственного экрана при загрузке страницы
		this.view.renderStartScreen();
	}

	// Обновляет игру и представление
	update() {
		this.game.movePieceDown();

		if (this.game.fastInterval) {
			this.killTimer();
			this.startTimer();
		}

		this.updateView();
	}

	// Запуск игры
	play() {
		this.isPlaying = true;
		this.view.renderBackGround();
		this.startTimer();
		this.updateView();
	}

	// Остановка игры
	pause() {
		this.isPlaying = false;
		this.killTimer();
		this.updateView();
	}

	// Сброс игры
	reset() {
		this.game.reset();
		this.killTimer();
		this.play();
	}

	// Обновление представления
	updateView() {
		const state = this.game.getState();

		switch (true) {
			case state.isGameOver: // Если проигрыш
				this.view.clearBgScreen(); // Удаление фона
				this.view.renderEndScreen(state); // Показ экрана проигрыша
				this.killTimer(); // Удаление таймера
				break;

			case !this.isPlaying: // Если не в игре
				this.view.renderPauseScreen(); // Показ экрана паузы
				break;

			case this.isPlaying: // Если в игре
				this.view.renderMainScreen(state); // Показ главного экрана
		}
	}

	// Таймер который приводит игру в действие
	startTimer(speed = 1000 - this.game.getState().lvl * 100) {
		// Если интервал еще не задан, то создаем
		if (!this.intervalId) {
			this.intervalId = setInterval(_ => {
				this.update();
			}, speed > 0 ? speed : 100); // Если скорость больше нуля, то используем ее иначе 100
		}
	}

	// Удаление таймера
	killTimer() {
		if (this.intervalId) { // Если переменная не пустая
			clearInterval(this.intervalId); // Удалить интервал
			this.intervalId = null; // Обнулить переменную
		}
	}

	// Событие по нажатию клавишы
	handleKeyDown(e) {
		switch (true) {
			case e.key === 'ArrowLeft' && this.isPlaying: // Если нажата стрелка влево
				this.game.movePieceLeft(); // Сдвинуть фигуру влево
				this.updateView(); // Обновить представление
				break;

			case e.key === 'ArrowRight' && this.isPlaying: // Если нажата стрелка вправо
				this.game.movePieceRight(); // Сдвинуть фигуру вправо
				this.updateView(); // Обновить представление
				break;

			case e.key === 'ArrowDown' && this.isPlaying: // Если нажата стрелка вниз
				this.killTimer(); // Удалить стандартный таймер
				this.game.movePieceDown(); // Сдвинуть фигуру вниз
				this.updateView(); // Обновить представление
				break;

			case e.key === 'ArrowUp' && this.isPlaying: // Если нажата стрелка вверх
				this.game.rotatePiece(); // Повернуть фигуру
				this.updateView(); // Обновить представление
				break;

			case e.key === ' ' && this.isPlaying: // Если нажат пробел
				this.killTimer(); // Удалить стандартный таймер
				this.startTimer(1); // Назначить таймер с интервалом 1 для моментального падения фигуры
				break;

			case e.key === 'Enter': // Если нажат Enter
				const state = this.game.getState(); // Получаем состояние игрового поля

				switch (true) {
					case state.isGameOver: // Если игра закончена
						this.reset(); // Обнулить значения
						break;

					case this.isPlaying: // Если в игре
						this.pause(); // Поставить на паузу
						break;

					case !this.isPlaying: // Если не в игре
						this.play(); // Начать игру
						break;
				}
				break;
		}
	}

	// Событие по отпусканию клавишы
	handleKeyUp(e) {
		if (e.key == 'ArrowDown' && this.isPlaying) { // Если отпускается стрелка вниз и мы в игре
			this.startTimer(); // Запустить стандартный таймер
		}
	}
}
