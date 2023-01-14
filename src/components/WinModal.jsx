import Cross from './utils/Cross';
import Circle from './utils/Circle';
import Button from './utils/Button';

const WinModal = ({ winner, winnerMark, voidGame, Continue }) => (
    <div className="win-modal">
        <div>
            <h3>{winner ? `${winner} won!` : 'You tied!'}</h3>
            <h2 className={winner ? winnerMark === 'X' ? 'win-cross' : 'win-circle' : 'draw'}>
                {winner ? winnerMark === 'X' ? <Cross /> : <Circle /> : ''} { winner ? 'Takes the win': "It's a draw"}
            </h2>
            <span className="win-modal__actions">
                <Button 
                text={'Quit'}
                type={'tertiary'}
                onClick={voidGame}
                />
                <Button 
                text={'Next Round'}
                type={'primary'}
                onClick={Continue}
                />
            </span>
        </div>
    </div>
);

export default WinModal;