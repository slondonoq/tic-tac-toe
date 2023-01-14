import logo from '../assets/img/logo.svg';
import Cross from './utils/Cross';
import Circle from './utils/Circle';
import Button from './utils/Button';
import home from '../assets/img/home.svg';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import WinModal from './WinModal';

const Board = ({ voidGame }) => {
    
    const [gameInfo, setGameInfo] = useState();
    const [isGameOver, setIsGameOver] = useState(false);
    const [turn, setTurn] = useState('X');
    const [boards, setBoards] = useState();
    const [winner, setWinner] = useState();

    useEffect(() => {

        if(!gameInfo) {
            const storageData = JSON.parse(localStorage.getItem('game'));
            setGameInfo(storageData);
            setIsGameOver(!storageData.gameOngoing)
            setTurn(storageData.currentTurn);
            
            // Generate possible boards with scores
            const generated = generateBoards(storageData.board, storageData.currentTurn);
            setBoards(generated);
        }


    }, [gameInfo]);

    // Use effect executed when turn changes for CPU plays
    useEffect(() => {
        if (gameInfo?.players?.CPU && gameInfo.players.CPU === turn) {
            // Only try after boards state is done and game is ongoing
            if(boards && !isGameOver) {
                // Add class to board to prevent pointer events
                const board = document.getElementById('game_board');
                board.classList.add('game-end')
                const currentKey = generateKey(gameInfo.board);
                // Manual fix for specific move (I know, shameful :c)
                const chosenMove = currentKey === '--X-O--X-' 
                    ? {
                        board: [
                            ['-', '-', 'X'],
                            ['-', 'O', '-'],
                            ['-', 'X', 'O'],
                        ],
                        score: 0
                    }
                    : currentKey === 'X---O--X-'
                        ? {
                            board: [
                                ['X', '-', '-'],
                                ['-', 'O', '-'],
                                ['O', 'X', '-'],
                            ],
                            score: 0
                        }
                        :choose_CPU_move();
                if (chosenMove.board.length > 0) {
                    const newGameInfo = {...gameInfo}
                    newGameInfo.board = chosenMove.board;
                    setGameInfo(newGameInfo)
                    // If move made was winner move
                    if(chosenMove.score === 1 || emptyCells(chosenMove.board) === 0) {
                        const crossWin = 1;
                        const {score, stroke} = boards[generateKey(chosenMove.board)];
                        newGameInfo.score[chosenMove.score === 1 ? turn : 'draws'] += chosenMove.score;
                        newGameInfo.gameOngoing = false;

                        if(chosenMove.score === 1){board.classList.add(stroke)};
                        board.classList.add(score === crossWin ? 'cross-winner' : 'circle-winner')
                        setWinner(chosenMove.score === 1 ? getScorePlayer(turn): null);
                        // Time modal to give animation time to do it's thing
                        setTimeout(() => {
                            setIsGameOver(true);
                            localStorage.setItem('game', JSON.stringify(newGameInfo));
                            setGameInfo(newGameInfo);
                        }, chosenMove.score === 1 ? 1000: 100);
                    }
                    else {
                        setTurn(gameInfo.players.CPU === 'X' ? 'O': 'X');
                        board.classList.remove('game-end')
                    }
                }
            }
        }
    }, [turn, gameInfo, boards]);


    // Function that chooses the best move for the CPU
    const choose_CPU_move = () => {
        let score = 0;
        let maxAvg = -200000000;
        let maxBoard = [];
        // Setting scores multiplier as comparison point is 'X'
        const scoreMult = turn === 'X' ? 1 : -1;

        const nextPossibleMoves = nextMoves(gameInfo.board, turn);
        // If there are no possible moves next, end the game
        if (nextPossibleMoves.length === 0) {
            setIsGameOver(true);
            const newGameInfo = {...gameInfo};
            gameInfo.score.draws += 1;
            setGameInfo(newGameInfo);
            localStorage.setItem('game', JSON.stringify(newGameInfo))
        }
        else {
            nextPossibleMoves.forEach(possibleMove => {
                const boardKey = generateKey(possibleMove);
                // Adjust avg score depending on mark
                const board = boards[boardKey];
                // Check if value is in boards
                if(board) {
                    let avg = scoreMult*(board?.avgScore);
                    const immediateScore = scoreMult*(board?.score);

                    // If move's immediate score is 1, void the avg
                    if(immediateScore === 1) {
                        avg = 100;
                    }
                    else {
                        // Use current avg as basis and check next possible user moves,
                        // if user can win more times, make that avg worse
                        const nextUser = nextMoves(possibleMove, turn === 'X' ? 'O': 'X');
                        const userWins = nextUser.reduce((wins, board) => {
                            const moveScore = (boards[generateKey(board)].score)*scoreMult;
                            return wins + (moveScore === -1);
                        }, 0);

                        if (userWins) {
                            avg = avg - 10*userWins;
                        }
                    }
                    if(avg > maxAvg) {
                        maxAvg = avg;
                        maxBoard = possibleMove;
                        score = immediateScore;
                    }
                }
            });
        }
        
        return {board: maxBoard, score: score};
    }

    // Helper function that recursively returns avg score and adds it to possible move in the provided boards object
    const averageScore = (board, boardsObj) => {
        const boardKey = generateKey(board);

        // If avg has already been calculated, just return
        if(boardsObj[boardKey].avgScore) {
            return {
                avgScore: boardsObj[boardKey].avgScore,
                boardsObj
            };
        }

        // If key has no children, return score
        if(boardsObj[boardKey].nextBoards.length === 0) {
            boardsObj[boardKey].avgScore = boardsObj[boardKey].score;
            // Assigning more weight to wins and losses to avoid them when there are
            // lots of possible boards with no winning moves in between
            return {
                avgScore: boardsObj[boardKey].score < 0 ? boardsObj[boardKey].score*6 : boardsObj[boardKey].score*4,
                boardsObj
            };
        }

        // If key has possible next moves, average them recursively
        const summation = boardsObj[boardKey].nextBoards.reduce((sum, child) => {
            const currentAvg = averageScore(child, boardsObj);
            boardsObj = currentAvg.boardsObj;
            return sum + currentAvg.avgScore;
        }, 0);

        const avg = summation/boardsObj[boardKey].nextBoards.length
        boardsObj[boardKey].avgScore = avg;

        return {
            avgScore: avg,
            boardsObj
        };
    }

    // Function that generates all possible boards from a starting board and initial mark
    // saves needed info in given boards object and returns avg score
    const generateBoards = (board, mark) => {

        let boards = {};
        let lastRound = [board];
        let currentMark = mark;
        while (lastRound.length > 0) {
            let newRound = [];
            lastRound.forEach(generatedBoard => {
                const boardKey = generateKey(generatedBoard);
                // Only iterate if key is not in object
                if(!boards[boardKey]) {
                    const {score, stroke} = moveScore(generatedBoard);
                    let nextBoards = [];
                    //Only generate possible moves if no player wins with current board
                    if(!score) {
                        nextBoards = nextMoves(generatedBoard, currentMark);
                        newRound = newRound.concat(nextBoards);
                    }
                    boards[boardKey] = {
                        score,
                        nextBoards,
                        stroke
                    }
                }
            });
            lastRound = newRound;
            currentMark = currentMark === 'X' ? 'O' : 'X';
        }

        const boardsAvg = averageScore(board, boards);
        boards = boardsAvg.boardsObj;

        return boards;
    }

    // Helper function that return all possible movements on the given board with the selected mark
    const nextMoves = (board, mark) => {
        const moves = [];

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if(cell === '-') {
                    const possibleMove = clone2DArr(board);
                    possibleMove[rowIndex][colIndex] = mark;
                    moves.push(possibleMove);
                }
            })
        });

        return moves;
    }

    // Little helper function that returns the amount of empty spaces a board has
    const emptyCells = (board) => {
        const empty_cells =  board.reduce((empty, row) => {
            return empty + (row[0] === '-') + (row[1] === '-') + (row[2] === '-');
        }, 0);

        return empty_cells;
    }

    // Little helper function that clones a 2D array
    const clone2DArr = (board) => {
        return board.map(row => [...row]);
    }

    // Little function to concatenate board cells from left to right to use as keys
    // in memoization the following way: row0col0...row0col2row1col0...row2col2
    const generateKey = (board) => {
        const key = board.reduce((partialKey, row) => {
            return partialKey + row[0] + row[1] + row[2];
        }, '');

        return key;
    }

    // Little function that returns an empty board
    const getEmptyBoard = () => {
        return[
            ['-', '-', '-'],
            ['-', '-', '-'],
            ['-', '-', '-']
        ];
    }


    // Little function to get texts to show in score and in modal
    const getScorePlayer = (mark, short) => {
        // Starting assuming gamemode is vs CPU
        // and discarding possibilities
        if(mark === gameInfo?.players?.playerOne && gameInfo?.players?.CPU) {
            return 'You';
        }

        if(gameInfo?.players?.CPU) {
            return 'CPU';
        }

        // If the conditionals below are evaluated, gamemode
        // is player vs player
        if(mark === gameInfo?.players?.playerOne) {
            return short ? 'P1': 'Player One';
        }

        return short ? 'P2': 'Player Two';
    }

    const Continue = () => {
        // resetting board classes
        const board = document.getElementById('game_board');
        board.className = 'board__grid';

        let newGame = JSON.parse(localStorage.getItem('game'));
        newGame.board = getEmptyBoard();
        newGame.gameOngoing = true;
        localStorage.setItem('game', JSON.stringify(newGame));
        setGameInfo(newGame);
        setIsGameOver(false);
        setTurn('X');
        setWinner(null);
    }

    const checkHorizontal = (board) => {
        // Using reduce to check every row, the initial value is set to 0
        // and then operated with each row evaluation, row: -1 means no winner row
        const crossWin = 1;
        const circleWin = -1;
        const horizontalWin = board.reduce((info, row, rowIndex) => {
            const rowEval = (row[0] === row[1]) && (row[1] === row[2]) && (row[0] !== '-');

            return {
                score: rowEval 
                    ? row[0] === 'X' 
                        ? crossWin
                        : circleWin
                    : info.score,
                row: rowEval ? rowIndex : info.row
            };
        }, {score:0, row: -1});

        return horizontalWin;
    }

    const checkVertical = (board) => {
        // Strategy here is to transpose array and then
        // use the horizontal check function
        const transposed = board.reduce((newArr, row) => {
            return [
                newArr[0].concat([row[0]]),
                newArr[1].concat([row[1]]),
                newArr[2].concat([row[2]])
            ];
        }, [[],[],[]]);

        return checkHorizontal(transposed);
    }

    const checkDiagonal = (board) => {
        const crossWin = 1;
        const circleWin = -1;

        // No fancy stuff, just index checking
        const top_left_to_bottom = (board[0][0] === board[1][1]) && (board[1][1] === board[2][2]) && (board[0][0] !== '-');
        const top_right_to_bottom = (board[0][2] === board[1][1]) && (board[1][1] === board[2][0]) && (board[0][2] !== '-');
        return {
            score: (top_left_to_bottom || top_right_to_bottom ) 
                ? board[1][1] === 'X'
                    ? crossWin
                    : circleWin
                : 0,
            diag_start: top_left_to_bottom  ? 'top-left': top_right_to_bottom ? 'top-right' : ''
        };
    }

    // Function to check a move's score with X's as the comparing point,
    // thus, 1 means X wins, -1 means O wins, 0 means a draw and null means nothing 
    // it also indicates where to place the stroke animation
    const moveScore = (board) => {
        const winHorizontal = checkHorizontal(board);
        const winVertical = checkVertical(board);
        const winDiagonal = checkDiagonal(board);

        // Helper stroke names for indices
        const horizontalStrokes = ['horizontal-top', 'horizontal-mid', 'horizontal-bottom'];
        const verticalStrokes = ['vertical-left', 'vertical-mid', 'vertical-right'];

        // In case of not winning, diag start has a default of an empty string, so no additional
        // stroke default is needed
        return {
            score: winHorizontal.score || winVertical.score || winDiagonal.score,
            stroke: (winHorizontal.score)
                ? horizontalStrokes[winHorizontal.row] 
                : (winVertical.score)
                    ? verticalStrokes[winVertical.row]
                    : winDiagonal.diag_start
        };
    }

    const placeMark = ({ target }) => {
        const [row, column] = target.id.slice(-3).split('-');
        let newGameInfo = {...gameInfo};
        //Checking for valid placing
        if(newGameInfo.board[row][column] === '-') {
            newGameInfo.board[row][column] = turn;
            // If board gets full, it may not be on our boards 
            //Checking move results with board scores
            const board = boards[generateKey(newGameInfo.board)];

            if(board?.score || emptyCells(newGameInfo.board) === 0) {
                const crossWin = 1;
                newGameInfo.score[board?.score ? turn : 'draws'] += 1;
                newGameInfo.gameOngoing = false;
                // Add class to board to prevent pointer events and display animation
                const boardElem = document.getElementById('game_board');
                if (board?.stroke && board.stroke !== '') {boardElem.classList.add(board.stroke)}
                boardElem.classList.add('game-end')
                if(board?.score && board.score !== 0) {
                    setWinner(getScorePlayer(turn));
                    boardElem.classList.add(board.score === crossWin ? 'cross-winner' : 'circle-winner')
                }

                // Time modal to give animation time to do it's thing
                setTimeout(() => {
                    setIsGameOver(true);
                    setGameInfo(newGameInfo);
                    localStorage.setItem('game', JSON.stringify(newGameInfo));
                }, 1000);
            }
            else {
                const nextTurn = turn === 'X' ? 'O': 'X';
                newGameInfo.currentTurn = nextTurn;
                setTurn(nextTurn);
            }
            
            setGameInfo(newGameInfo);
            localStorage.setItem('game', JSON.stringify(newGameInfo));
        }

    }

    return (
        <>
            {
                isGameOver 
                ? <WinModal
                winner={winner}
                winnerMark={turn} 
                voidGame={voidGame}
                Continue={Continue}/> 
                : <></>
            }
            <div className="board">
                <header className="board__header">
                    <img className="board__logo" src={logo}/>
                    <h1 className={turn === 'X' ? 'crossTurn' : 'circleTurn'}>
                        {turn === 'X' ? <Cross /> : <Circle />}'s Turn
                    </h1>
                    <Button 
                    icon={home}
                    aria_label={'Home'}
                    onClick={voidGame}
                    type="tertiary"/>
                </header>
                <main className="board__grid" id="game_board">
                    
                    {
                        gameInfo?.board.map((row, i) => (
                            row.map((cell, j) => (
                                <div 
                                className={`board__cell ${cell === '-' ? 'selection' : ''}`}
                                key={i+'-'+j}
                                id={'cell_'+i+'-'+j}
                                onClick={placeMark}>
                                    {
                                        cell === 'X' || (cell === '-' && turn === 'X')
                                        ? <Cross />
                                        : <Circle />
                                    }
                                </div>
                            ))
                        ))
                    }
                    <span className="board__grid__line" id="vertical-left" />
                    <span className="board__grid__line" id="vertical-right" />
                    <span className="board__grid__line" id="horizontal-top" />
                    <span className="board__grid__line" id="horizontal-bottom" />
                </main>
                <section className="board__score">
                    <div className="cross">
                        <h4>X ({getScorePlayer('X', true)})</h4>
                        <p>{gameInfo?.score?.X || 0}</p>
                    </div>
                    <div className="draws">
                        <h4>Draws</h4>
                        <p>{gameInfo?.score?.draws || 0}</p>
                    </div>
                    <div className="circle">
                        <h4>O ({getScorePlayer('O', true) || 0})</h4>
                        <p>{gameInfo?.score?.O}</p>        
                    </div>
                </section>
                <Footer />
            </div>
        </>
    )
}

export default Board;