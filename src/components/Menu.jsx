import { useState } from 'react';
import logo from '../assets/img/logo.svg';
import Footer from './Footer';
import Button from './utils/Button';
import Circle from './utils/Circle';
import Cross from './utils/Cross';

const Menu = ({ startGame }) => {

    const [playerOne, setPlayerOne] = useState('X');

    const changePlayerOneMark = (event) => {
        setPlayerOne(event.target.value);
    }

    const startNewGame = (gameMode) => {
        // TODO: game start logic
        const players = {
            playerOne
        };
        const opponent = playerOne === 'X' ? 'O' : 'X';
        if (gameMode === 'VS CPU') {
            players.CPU = opponent;
        }
        else {
            players.playerTwo = opponent;
        }

        startGame(players, gameMode);
    }

    return (
        <div className="menu">
            <header className="menu__header">
                <img src={ logo } alt=""/>
                <h1>Tic Tac Toe</h1>
            </header>
            <main className="menu__selection">
                <div className="menu__selection__mark">
                    <h3>Pick player's 1 mark</h3>
                    <input
                    type="radio"
                    name="mark"
                    id="mark-X"
                    value="X"
                    onChange={changePlayerOneMark}
                    defaultChecked
                    />
                    <label htmlFor="mark-X" >
                        <div className="menu__selection__slider" />
                        <Cross type={'selection'}/>
                    </label>
                    <input
                    type="radio"
                    name="mark"
                    id="mark-O" value="O"
                    onChange={changePlayerOneMark}
                    />
                    <label htmlFor="mark-O" >
                        <Circle type={'selection'} />
                    </label>
                    <p className="menu__tip">Remember: X goes first</p>
                </div>
                <div className="menu__actions">
                    <Button
                    additionalClasses={'button--vsCPU'}
                    onClick={() => startNewGame('VS CPU')}
                    text={'New game: VS CPU'}/>
                    <Button
                    additionalClasses={'button--vsPlayer'}
                    onClick={() => startNewGame('VS Player')}
                    text={'New game: VS Player'}
                    type={'secondary'}/>
                </div>
            </main>
            <Footer />
        </div>
    )
};

export default Menu;