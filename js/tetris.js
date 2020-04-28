const canvas = document.getElementById("tetris");
const ctxt = canvas.getContext("2d");
const rows = 20;
const columns = 10;
const vacant = "white";
const squareSize = 20;
const scoreElement = document.getElementById("score");
let score = 0;

//create board
let board = [];
for(r = 0; r<rows; r++){
    board[r] = [];
    for(c = 0; c<columns; c++){
        board[r][c] = vacant;
    }
}

function drawBoard(){
    for(r = 0; r<rows; r++){
        for(c = 0; c<columns; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}
drawBoard();

function drawSquare(x, y, color){
    ctxt.fillStyle = color
    ctxt.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
    ctxt.strokeStyle = "black";
    ctxt.strokeRect(x*squareSize, y*squareSize, squareSize, squareSize);
}

//All pieces
const PIECES = [
    [I, "pink"],
    [J, "orange"],
    [L, "red"],
    [O, "violet"],
    [S, "yellow"],
    [T, "blue"],
    [Z, "green"],
]

function generateRandomPiece() {
    let randomNumber = Math.random();
    let pieceNumber = Math.floor(randomNumber * PIECES.length);

    return new Piece(PIECES[pieceNumber][0], PIECES[pieceNumber][1]);
}

let p = generateRandomPiece();

document.addEventListener("keydown", control);
function control(e){
    if(e.keyCode == 37){
        p.moveLeft();
    }else if(e.keyCode == 38){
        p.rotate();
    }else if(e.keyCode == 39){
        p.moveRight();
    }else if(e.keyCode == 40){
        p.moveDown();
    }
}

function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.x = 3;
    this.y = 0;
}

Piece.prototype.fill = function(color){
    for(r=0; r<this.activeTetromino.length; r++){
        for(c=0; c<this.activeTetromino.length; c++){
            if(this.activeTetromino[r][c]){
                drawSquare(this.x+c, this.y+r, color);
            }
        }
    }
}

//Draw piece
Piece.prototype.draw = function(){
    this.fill(this.color);
}

//Undraw piece
Piece.prototype.undraw = function(){
    this.fill(vacant);
}

//Piece moves down
Piece.prototype.moveDown = function(){
    if(!this.checkCollisions(0, 1, this.activeTetromino)){
        this.undraw();
        this.y++;
        this.draw();
    }else{
        this.lock();
        p = generateRandomPiece();
    }
}

//Piece moves right
Piece.prototype.moveRight = function() {
    if(!this.checkCollisions(1, 0, this.activeTetromino)){
        this.undraw();
        this.x++;
        this.draw();
    }
}

//Piece moves left
Piece.prototype.moveLeft = function() {
    if(!this.checkCollisions(-1, 0, this.activeTetromino)){
        this.undraw();
        this.x--;
        this.draw();
    }
}

//Piece rotates
Piece.prototype.rotate = function() {
    let nextPatternNumber = (this.tetrominoN+1) % this.tetromino.length;
    let nextPattern = this.tetromino[nextPatternNumber];
    let kickWall = 0;
    if(this.checkCollisions(0, 0, nextPattern)){
        if(this.x > columns/2){
            kick = -1;
        }else{
            kick = 1;
        }
    }

    if(!this.checkCollisions(0, 0, nextPattern)){
        this.undraw();
        this.x += kickWall;
        this.tetrominoN = nextPatternNumber;
        this.activeTetromino = nextPattern;
        this.draw();
    }
}

//Check collision
Piece.prototype.checkCollisions = function(x, y, piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // conditions
            if(newX < 0 || newX >= columns || newY >= rows){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece alrady in place
            if( board[newY][newX] != vacant){
                return true;
            }
        }
    }
    return false;
}

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < rows; r++){
        let isRowFull = true;
        for( c = 0; c < columns; c++){
            isRowFull = isRowFull && (board[r][c] != vacant);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < columns; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < columns; c++){
                board[0][c] = vacant;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;
}

//Drop pieces every 1 sec
let dropStart = Date.now();
let gameOver = false;
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if(delta>=500){
        p.moveDown();
        dropStart = Date.now();
    }
    if(!gameOver){
        requestAnimationFrame(drop);
    }
}
drop();
