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
    const [plays, setPlays] = useState({});

    useEffect(() => {
        let boardCopy = [];

        if(!gameInfo) {
            const storageData = JSON.parse(localStorage.getItem('game'));
            setGameInfo(storageData);
            setIsGameOver(!storageData.gameOngoing);
            
            // Clone array and generate plays
            boardCopy = storageData.board.map(row => [...row]);
            generatePlays(boardCopy);
        }
        else {
            // Clone array and generate plays
            boardCopy = gameInfo.board.map(row => [...row]);
            generatePlays(boardCopy);
        }

    }, [gameInfo]);

    // Function to generate possible plays based of a starting board and 
    // saving them in an object for memoization
    const generatePlays = (board) => {
        // First getting key for memoization
        // const key = generateKey(board);
        // let newPlays = {...plays};
        generateBoards(board, turn)
        
        // if(!newPlays[key]) {
        //     newPlays[key] = {nextMoves: [], avgScore: 0};
        //     // Generating next moves based on current board
        //     for(let row = 0; row < 3; row++) {
        //         for(let col = 0; col < 3; col++) {
        //             if(board[row][col] === '-') {
        //                 const newPlay = board.map(row => [...row]);;
        //                 newPlay[row][col] = turn;
        //                 newPlays[key].nextMoves.push(generateKey(newPlay));
        //             }
        //         }
        //     }
        //     setPlays(newPlays)
        // }

    }

    // Function that generates all possible boards from a starting board and initial turn
    const generateBoards = (board, turn) => {
        let boards = {};
        let lastRound = [cloneBoard(board)]
        let count = 0;
        
        while(!isFull(lastRound[0])) {
            let newRound = [];
            lastRound.forEach(genBoard => {
                const genBoard_key = generateKey(genBoard);

                if (!boards[genBoard_key]) {
                    boards[genBoard_key] = [];
                    // Generating next moves based on current board
                    for(let row = 0; row < 3; row++) {
                        for(let col = 0; col < 3; col++) {
                            if(genBoard[row][col] === '-') {
                                const newPlay = genBoard.map(row => [...row]);;
                                newPlay[row][col] = turn;
                                boards[genBoard_key].push(newPlay);
                                newRound.push(newPlay);
                                count += 1;
                            }
                        }
                    }
                }
                else {
                    newRound = boards[genBoard_key];
                }
            })
            lastRound = newRound;
            turn = turn === 'X' ? 'O' : 'X';
        }

        console.log(count);

    }

    // Little helper function that checks if a board is full
    const isFull = (board) => {
        const full =  board.reduce((isfull, row) => {
            return isfull && (row[0] !== '-') && (row[1] !== '-') && (row[2] !== '-');
        }, true);

        return full;
    }

    // Little helper function that copies a board
    const cloneBoard = (board) => {
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


    // Little function to get texts to show in score
    const getScorePlayer = (mark) => {
        // Starting assuming gamemode is vs CPU
        // and discarding possibilities
        if(mark === gameInfo?.players?.playerOne && gameInfo?.players?.CPU) {
            return '(YOU)';
        }

        if(gameInfo?.players?.CPU) {
            return '(CPU)';
        }

        // If the conditionals below are evaluated, gamemode
        // is player vs player
        if(mark === gameInfo?.players?.playerOne) {
            return '(P1)';
        }

        return '(P2)';
    }

    const Continue = () => {
        // TODO: add remaining logic
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
    }

    const checkHorizontal = (board) => {
        // Using reduce to check every row, the initial value is set to false
        // and then operated with each row evaluation, row -1 means no winning row,
        // that will be updated if needed to be able to perform an animation
        const horizontalWin = board.reduce((info, row, rowIndex) => {
            const rowEval = (row[0] === row[1]) && (row[1] === row[2]) && (row[0] !== '-');
            return {
                win: info.win || rowEval, 
                row: rowEval ? rowIndex : info.row
            };
        }, {win:false, row: -1});

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
        // No fancy stuff, just index checking
        const top_left_to_bottom = (board[0][0] === board[1][1]) && (board[1][1] === board[2][2]) && (board[0][0] !== '-');
        const top_right_to_bottom = (board[0][2] === board[1][1]) && (board[1][1] === board[2][0]) && (board[0][2] !== '-');
        return {
            win: top_left_to_bottom || top_right_to_bottom,
            diag_start: top_left_to_bottom ? 'top-left': top_right_to_bottom ? 'top-right' : ''
        };
    }

    // TODO: logic for turns, placing and game checking
    // Function to check if a move wins the game and getting info on where to place the stroke
    // animation
    const moveWins = (gameInfo) => {
        const winHorizontal = checkHorizontal(gameInfo.board);
        const winVertical = checkVertical(gameInfo.board);
        const winDiagonal = checkDiagonal(gameInfo.board);

        // Helper stroke names for indices
        const horizontalStrokes = ['horizontal-top', 'horizontal-mid', 'horizontal-bottom'];
        const verticalStrokes = ['vertical-left', 'vertical-mid', 'vertical-right'];

        // In case of not winning, diag start has a default of an empty string, so no additional
        // stroke default is needed
        return {
            moveWon: winHorizontal.win || winVertical.win || winDiagonal.win,
            stroke: winHorizontal.win 
                ? horizontalStrokes[winHorizontal.row] 
                : winVertical.win
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
            //Checking move results
            const {moveWon, stroke} = moveWins(newGameInfo);

            if(moveWon) {
                //TODO: crossing animation
                console.log(stroke);
                newGameInfo.score[turn] += 1;
                newGameInfo.gameOngoing = false;
                // Add class to board to prevent pointer events and display animation
                const board = document.getElementById('game_board');
                board.classList.add('game-end')
                board.classList.add(stroke)
                board.classList.add(turn === 'X' ? 'cross-winner' : 'circle-winner')

                // Time modal to give animation time to do it's thing
                setTimeout(() => {
                    // setIsGameOver(true);
                    setGameInfo(newGameInfo);
                    localStorage.setItem('game', JSON.stringify(newGameInfo));
                }, 3000);
            }
            else {
                setTurn(turn === 'X' ? 'O': 'X');
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
                winner={'CPU'}
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
                        <h4>X {getScorePlayer('X')}</h4>
                        <p>{gameInfo?.score?.X || 0}</p>
                    </div>
                    <div className="draws">
                        <h4>Draws</h4>
                        <p>{gameInfo?.score?.draws || 0}</p>
                    </div>
                    <div className="circle">
                        <h4>O {getScorePlayer('O') || 0}</h4>
                        <p>{gameInfo?.score?.O}</p>        
                    </div>
                </section>
                <Footer />
            </div>
        </>
    )
}

export default Board;