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
    const [isGameOver, setIsGameOver] = useState(true);
    const turn = 'O';

    const testBoard = [
        ['O', '-', '-'],
        ['-', 'X', '-'],
        ['-', '-', '-']
    ];

    useEffect(() => {
        if(!gameInfo) {
            const storageData = JSON.parse(localStorage.getItem('game'));
            setGameInfo(storageData);
        }
    }, [gameInfo]);


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
        setIsGameOver(false);
        // TODO: add remaining logic
    }

    // TODO: logic for turns, placing and game checking

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
                <main className="board__grid">
                    
                    {
                        testBoard.map((row, i) => (
                            row.map((cell, j) => (
                                <div className={`board__cell ${cell === '-' ? 'selection' : ''}`} key={i+'-'+j}>
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