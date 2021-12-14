const BOARD_SIZE = 8;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class DataModel {
    constructor(){
        this.board = [ // black: 2, white: 1, legal moves: 0.5
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,2,1,0,0,0],
            [0,0,0,1,2,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];
        this.subscribers = [];
        this.numBlack = 2;
        this.numWhite = 2;
        this.nextPlayer = 2;
        this.switchStatus = true;
        this.mode = 'computer';
        this.legal = true;
        this.isBusy = false;
        this.weight = [
            [500,-25,10,5,5,10,-25,500],
            [-25,-45,1,1,1,1,-45,-25],
            [10,1,3,2,2,3,1,10],
            [5,1,2,1,1,2,1,5],
            [5,1,2,1,1,2,1,5],
            [10,1,3,2,2,3,1,10],
            [-25,-45,1,1,1,1,-45,-25],
            [500,-25,10,5,5,10,-25,500]
        ];
        this.showLegalMoves();
    }
    getComputerMove(){
        let max = -Infinity;
        let computer_i, computer_j;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.isValidMove(i, j, this.nextPlayer)){
                    const score = this.weight[i][j];
                    if (score > max) {
                        computer_i = i;
                        computer_j = j;
                        max = score;
                    }
                }
            }
        }
        return {computer_i: computer_i, computer_j: computer_j};
    }
    setMode(mode){
        this.mode = mode;
    }
    getLegalStatus(){
        return this.legal;
    }
    setSwitchStatus(checked) {
        this.switchStatus = checked;
    }
    setLegal(isLegal){
        this.legal = isLegal;
    }
    resetBoard() {
        this.board = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,2,1,0,0,0],
            [0,0,0,1,2,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];
        this.numBlack = 2;
        this.numWhite = 2;
        this.nextPlayer = 2;
        this.legal = true;
        this.isBusy = false;
        if (this.switchStatus) this.showLegalMoves();
        else this.updateSubsribers();
    }
    subscribeToUpdates(callback) {
        this.subscribers.push(callback);
    }
    updateSubsribers() {
        for (let sub of this.subscribers) {
            sub();
        }
    }
    getRowColByKey(key){
        const j = key % 10 - 1;
        const i = parseInt((key % 100) / 10) - 1;
        return {i: i, j: j}
    }
    placePiece(i, j, code){
        this.board[i][j] = code;
        this.setLegal(true);
    }
    updateNextPlayer(){
        const opponent = this.nextPlayer === 2 ? 1 : 2;
        this.nextPlayer = this.hasLegalMove(opponent) ? opponent : this.nextPlayer;
    }
    async addPiece(key) {
        if (this.isBusy) return;
        this.isBusy = true;
        this.clearLegalMoves();
        const {i, j} = this.getRowColByKey(key);

        if (!this.isValidMove(i, j, this.nextPlayer)){
            this.setLegal(false);
            if (this.switchStatus) this.showLegalMoves();
            this.updateSubsribers();
            this.isBusy = false;
            return;
        }
        this.placePiece(i, j, this.nextPlayer);
        this.updateNumPieces();
        this.updateSubsribers();

        await sleep(500);
        this.flipPieces(i, j);
        this.updateNumPieces();
        this.updateNextPlayer();
        this.updateSubsribers();

        if (!this.checkWin()) {
            if (this.mode === 'computer') {
                this.clearLegalMoves();
                while(this.nextPlayer === 1){
                    const {computer_i, computer_j} = this.getComputerMove();
                    await sleep(1000);
                    this.placePiece(computer_i, computer_j, this.nextPlayer);
                    this.updateNumPieces();
                    this.updateSubsribers();
        
                    await sleep(500);
                    this.flipPieces(computer_i, computer_j);
                    this.updateNumPieces();
                    this.updateNextPlayer();
                }
            }
        }

        if (this.switchStatus) this.showLegalMoves();
        else this.updateSubsribers();
        this.isBusy = false;
    }
    showLegalMoves() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.isValidMove(i, j, this.nextPlayer)) this.board[i][j] = 0.5;
            }
        }
        this.updateSubsribers();
    }
    clearLegalMoves() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.board[i][j] === 0.5) this.board[i][j] = 0;
            }
        }
        this.updateSubsribers();
    }
    getWinner() {
        return this.numBlack > this.numWhite ? 2 : 1;
    }
    checkWin() {
        if (!this.hasLegalMove(1) && !this.hasLegalMove(2)){
            this.isBusy = true;
            return this.getWinner();
        }
        else return 0;
    }
    getNextPlayer() {
        return this.nextPlayer;
    }
    getBoardArray() {
        return this.board;
    }
    updateNumPieces() {
        let countBlack = 0;
        let countWhite = 0;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.board[i][j] === 2) countBlack++;
                else if (this.board[i][j] === 1) countWhite++;
            }
        }
        this.numBlack = countBlack;
        this.numWhite = countWhite;
    }
    getNumPieces(code) {
        return code === 2 ? this.numBlack : this.numWhite;
    }
    hasLegalMove(code) {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.isValidMove(i, j, code)) return true;
            }
        }
        return false
    }
    checkVertically(x1, x2, col, code) { // x1 < x2
        for (let i = x1 + 1; i < x2; i++) {
            if (this.board[i][col] === 0 || this.board[i][col] === 0.5 || this.board[i][col] === code) return false;
        }
        return true;
    }
    checkHorizontally(y1, y2, row, code) { // y1 < y2
        for (let i = y1 + 1; i < y2; i++) {
            if (this.board[row][i] === 0 || this.board[row][i] === 0.5 || this.board[row][i] === code) return false;
        }
        return true;
    }
    checkDiagonallyBottomRight(x1, x2, y1, code) { // x1 < x2
        for (let i = x1 + 1; i < x2; i++) {
            const j = y1 + i - x1;
            if (this.board[i][j] === 0 || this.board[i][j] === 0.5 || this.board[i][j] === code) return false;
        }
        return true;
    }
    checkDiagonallyBottomLeft(x1, x2, y1, code) { // x1 < x2
        for (let i = x1 + 1; i < x2; i++) {
            const j = y1 - i + x1;
            if (this.board[i][j] === 0 || this.board[i][j] === 0.5 || this.board[i][j] === code) return false;
        }
        return true;
    }
    flipVertically(x1, x2, col) {
        for (let i = x1 + 1; i < x2; i++) {
            this.board[i][col] = this.board[x1][col];
        }
    }
    flipHorizontally(y1, y2, row) {
        for (let i = y1 + 1; i < y2; i++) {
            this.board[row][i] = this.board[row][y1];
        }
    }
    flipDiagonallyBottomRight(x1, x2, y1) {
        for (let i = x1 + 1; i < x2; i++) {
            const j = y1 + i - x1;
            this.board[i][j] = this.board[x1][y1];
        }
    }
    flipDiagonallyBottomLeft(x1, x2, y1) {
        for (let i = x1 + 1; i < x2; i++) {
            const j = y1 - i + x1;
            this.board[i][j] = this.board[x1][y1];
        }
    }
    isValidMove(row, col, code) {
        if (this.board[row][col] === 1 || this.board[row][col] === 2) return false;
        // up, down, left, right
        for (let i = row - 2; i >= 0; i--) if (this.board[i][col] === code && this.checkVertically(i, row, col, code)) return true;
        for (let i = row + 2; i < BOARD_SIZE; i++) if (this.board[i][col] === code && this.checkVertically(row, i, col, code)) return true;
        for (let i = col - 2; i >= 0; i--) if (this.board[row][i] === code && this.checkHorizontally(i, col, row, code)) return true;
        for (let i = col + 2; i < BOARD_SIZE; i++) if (this.board[row][i] === code && this.checkHorizontally(col, i, row, code)) return true;
        // upper left
        for (let i = row - 2; i >= 0; i--) {
            const j = col - row + i;
            if (j >=0 && this.board[i][j] === code && this.checkDiagonallyBottomRight(i, row, j, code)) return true;
        }
        // upper right
        for (let i = row - 2; i >= 0; i--) {
            const j = col + row - i;
            if (j < BOARD_SIZE && this.board[i][j] === code && this.checkDiagonallyBottomLeft(i, row, j, code)) return true;
        }
        // bottom left
        for (let i = row + 2; i < BOARD_SIZE; i++) {
            const j = col - i + row;
            if (j >=0 && this.board[i][j] === code && this.checkDiagonallyBottomLeft(row, i, col, code)) return true;
        }
        // bottom right
        for (let i = row + 2; i < BOARD_SIZE; i++) {
            const j = col + i - row;
            if (j < BOARD_SIZE && this.board[i][j] === code && this.checkDiagonallyBottomRight(row, i, col, code)) return true;
        }
        return false;
    }
    flipPieces(row, col) {
        // up, down, left, right
        const code = this.board[row][col];
        for (let i = row - 1; i >= 0; i--) if (this.board[i][col] === code && this.checkVertically(i, row, col, code)) this.flipVertically(i, row, col);
        for (let i = row + 1; i < BOARD_SIZE; i++) if (this.board[i][col] === code && this.checkVertically(row, i, col, code)) this.flipVertically(row, i, col);
        for (let i = col - 1; i >= 0; i--) if (this.board[row][i] === code && this.checkHorizontally(i, col, row, code)) this.flipHorizontally(i, col, row);
        for (let i = col + 1; i < BOARD_SIZE; i++) if (this.board[row][i] === code && this.checkHorizontally(col, i, row, code)) this.flipHorizontally(col, i, row);
        // upper left
        for (let i = row - 1; i >= 0; i--) {
            const j = col - row + i;
            if (j >=0 && this.board[i][j] === code && this.checkDiagonallyBottomRight(i, row, j, code)) this.flipDiagonallyBottomRight(i, row, j);
        }
        // upper right
        for (let i = row - 1; i >= 0; i--) {
            const j = col + row - i;
            if (j < BOARD_SIZE && this.board[i][j] === code && this.checkDiagonallyBottomLeft(i, row, j, code)) this.flipDiagonallyBottomLeft(i, row, j);
        }
        // bottom left
        for (let i = row + 1; i < BOARD_SIZE; i++) {
            const j = col - i + row;
            if (j >=0 && this.board[i][j] === code && this.checkDiagonallyBottomLeft(row, i, col, code)) this.flipDiagonallyBottomLeft(row, i, col);
        }
        // bottom right
        for (let i = row + 1; i < BOARD_SIZE; i++) {
            const j = col + i - row;
            if (j < BOARD_SIZE && this.board[i][j] === code && this.checkDiagonallyBottomRight(row, i, col, code)) this.flipDiagonallyBottomRight(row, i, col);
        }
    }
}
let theDataModel;
export function getDataModel() {
    if(!theDataModel) {
        theDataModel = new DataModel();
    }
    return theDataModel;
}
