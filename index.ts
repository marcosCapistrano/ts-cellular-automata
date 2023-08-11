'use strict';
const canvasID = "canvas";
const app = document.getElementById(canvasID) as HTMLCanvasElement;

if (app === null) {
    throw new Error(`Could not find canvas with id '${canvasID}'`);
}

const ctx = app.getContext("2d");
if (ctx === null) {
    throw new Error(`Could not initialize 2d context`);
}

const BOARD_COLS = 32;
const BOARD_ROWS = 32;
const CELL_WIDTH = app.width / BOARD_COLS;
const CELL_HEIGHT = app.height / BOARD_ROWS;

type State = number;
type Board = State[][];
const stateColors = ["#202020", "#FF5050", "#50FF50", "#5050FF"];

function createBoard(): Board {
    const board: Board = [];

    for (let r = 0; r < BOARD_ROWS; r++) {
        board.push(new Array<State>(BOARD_COLS).fill(0));
    }

    return board;
}

let currentBoard: Board = createBoard();
let nextBoard: Board = createBoard();

function countNeighbors(board: Board, nbors: number[], r0: number, c0: number) {
    nbors.fill(0);
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr != 0 || dc != 0) {
                const r = r0 + dr;
                const c = c0 + dc;

                if (0 <= r && r < BOARD_ROWS) {
                    if (0 <= c && c < BOARD_COLS) {
                        nbors[board[r][c]]++;
                    }
                }
            }
        }
    }
}

function computeNextBoard(states: number, current: Board, next: Board) {
    const DEAD = 0;
    const ALIVE = 1;
    const nbors = new Array(states).fill(0);

    for (let r = 0; r < BOARD_ROWS; ++r) {
        for (let c = 0; c < BOARD_COLS; ++c) {
            countNeighbors(current, nbors, r, c);

            switch (current[r][c]) {
                case DEAD:
                    if (nbors[ALIVE] === 3) {
                        next[r][c] = ALIVE;
                    } else {
                        next[r][c] = DEAD;
                    }
                    break;

                case ALIVE:
                    if (nbors[ALIVE] === 2 || nbors[ALIVE] === 3) {
                        next[r][c] = ALIVE;
                    } else {
                        next[r][c] = DEAD;
                    }
                    break;
            }
        }
    }
}

function update() {
    computeNextBoard(2, currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

function render(board: Board) {
    if (ctx === null)
        throw new Error("Context is null inside render");

    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, app.width, app.height);

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const x = c * CELL_WIDTH;
            const y = r * CELL_HEIGHT;

            ctx.fillStyle = stateColors[board[r][c]];
            ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}

app.addEventListener("click", (e) => {
    const col = Math.floor(e.offsetX / CELL_WIDTH);
    const row = Math.floor(e.offsetY / CELL_HEIGHT);

    currentBoard[row][col] = 1;
    render(currentBoard);
});

let delayTime = 5000;
window.addEventListener("keypress", (e) => {
    switch (e.key) {
        case "w":
            if (delayTime > 50)
                delayTime -= 50;
            break;

        case "s":
            delayTime += 250;
    }
})

let lastUpdate = Date.now();
async function start() {
    render(currentBoard);

    while (true) {
        if (Date.now() > lastUpdate + delayTime) {
            update();
            render(currentBoard);
            lastUpdate = Date.now();
        }

        await delay(50);
    }
}

start();

async function delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(() => { }), ms)).then(() => console.log("fired"));
}

console.log("Hello, world!")