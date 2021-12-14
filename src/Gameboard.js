import { useState, useEffect } from "react";
import Switch from "react-switch";
import { getDataModel } from "./DataModel";
import { getLeaderboard } from "./LeaderData";
import Tile from "./Tile"
import PopUp from "./PopUp";
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';

const BOARD_SIZE = 8;

function Gameboard() {
    const dataModel = getDataModel();
    const leaderboard = getLeaderboard();
    const boardArray = dataModel.getBoardArray();
    
    const [visible, setVisible] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState('Black');
    const [numBlack, setNumBlack] = useState(2);
    const [numWhite, setNumWhite] = useState(2);
    const [switchStatus, setSwitchStatus] = useState(true);
    const [isLegal, setLegal] = useState(true);
    const [mode, setMode] = useState('computer'); // mode: 'multiplayer', 'computer'

    function getBoardFromArray(boardArray) {
        let board = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                board.push(<Tile number={i+j+2} key={(i+1)*10+(j+1)} piece={boardArray[i][j]} 
                                onPress={async ()=>{
                                    await dataModel.addPiece((i+1)*10+(j+1));
                                    if(dataModel.checkWin()) setVisible(true);
                                }}
                            />);
            }
        }
        return board;
    }
    const [board, setBoard] = useState(getBoardFromArray(boardArray));


    useEffect(()=>{
        dataModel.subscribeToUpdates(()=>{
            setBoard(getBoardFromArray(dataModel.getBoardArray()));
            setNumBlack(dataModel.getNumPieces(2));
            setNumWhite(dataModel.getNumPieces(1));
            setLegal(dataModel.getLegalStatus());
            if(dataModel.getNextPlayer() === 2) setCurrentPlayer('Black');
            else if(dataModel.getNextPlayer() === 1) setCurrentPlayer('White');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleClose(){
        setVisible(false);
    }

    function handleSwitch(checked){
        setSwitchStatus(checked);
        dataModel.setSwitchStatus(checked);
        if(checked) dataModel.showLegalMoves();
        else dataModel.clearLegalMoves();
    }

    function handleNewGame() {
        dataModel.resetBoard(switchStatus);
        dataModel.setMode('computer');
        setMode('computer');
    }
    function handleMultiplayer() {
        dataModel.resetBoard(switchStatus);
        dataModel.setMode('multiplayer');
        setMode('multiplayer');
    }
    return <div id="chessboard">
        <h1>REVERSI</h1>
        <div className="control">
            <div className="menu">
                <button type="button" className="btn btn-outline-dark" onClick={handleNewGame}><span className="btn-text">New Game</span></button>
                <button type="button" className="btn btn-outline-dark" onClick={handleMultiplayer}><span className="btn-text">Multiplayer</span></button>
                <div className="switch">
                    <div><span className="btn-text">Show legal moves</span></div>
                    <Switch onChange={handleSwitch} checked={switchStatus} onColor={"#292C6D"} boxShadow={"0 0 0.3em #292C6D"}
                    uncheckedIcon={false} checkedIcon={false} activeBoxShadow={null}/>
                </div>
            </div>
        </div>

        <div id="score-board">
            <div className="piece piece-black" >{numBlack}</div>
            <div className="info-box">
                <p id="turn">{mode === 'multiplayer' ? `${currentPlayer}'s turn` : (currentPlayer === 'Black' ? 'Your turn' : 'Not your turn')}</p>
                <p id='warning'>{isLegal ? '' : 'Sorry, this square is not a valid move.'}</p>
            </div>
            <div className="piece piece-white">{numWhite}</div>
        </div>
        {visible ? <PopUp mode={mode} winner={dataModel.getWinner()} score={Math.max(numBlack, numWhite)} 
            onClose={handleClose} onSubmit={(playerName, score) => leaderboard.addItem(playerName, score)} onStart={()=>{
                if (mode === 'computer') handleNewGame();
                else if (mode === 'multiplayer') handleMultiplayer();
                handleClose();
        }}/> : null}
        <div id="board-container">
            <div id="board">
                {board}
            </div>
        </div>
    </div>;
}
export default Gameboard;