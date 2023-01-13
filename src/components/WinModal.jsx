import Cross from './utils/Cross';
import Circle from './utils/Circle';
import Button from './utils/Button';

const WinModal = ({ winner, winnerMark, voidGame, Continue }) => (
    <div className="win-modal">
        <div>
            <h3>{winner} won!</h3>
            <h2 className={winnerMark === 'X' ? 'win-cross' : 'win-circle'}>
                {winnerMark === 'X' ? <Cross /> : <Circle />} Takes the win
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