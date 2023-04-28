import Game from "./src/game.js";
import View from "./src/view.js";
import Controller from "./src/controller.js";

const canvasGame = document.querySelector('.canvas-game');
const canvasBackground = document.querySelector('.canvas-bg');

const game = new Game(20, 10);
const view = new View(canvasBackground, canvasGame, 20, 10);
new Controller(game, view);
