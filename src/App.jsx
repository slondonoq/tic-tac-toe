import { useEffect, useState } from "react";
import Board from "./components/Board";
import Menu from "./components/Menu";

function App() {

  const [ongoingMatch, setOngoingMatch] = useState(false);
  const [players, setPlayers] = useState(null);

  // Get info from local storage if page is reload
  // to be able to keep playing after closing or reloading
  useEffect (() => {
    const game = localStorage.getItem('game');
    if (game) {
      setOngoingMatch(true);
      setPlayers(JSON.parse(game).players);
    }
  }, [])

  // Set necessary data to local storage and change hooks
  // as needed 
  const startGame = (newPlayers, gameMode) => {
    const gameInfo = {
      players: newPlayers,
      board: [
        ['-', '-', '-'],
        ['-', '-', '-'],
        ['-', '-', '-']

      ]
    }
    setPlayers(newPlayers);
    setOngoingMatch(true);

    localStorage.setItem('game', JSON.stringify(gameInfo));
  }

  const voidGame = () => {
    localStorage.removeItem('game');
    setOngoingMatch(false);
    setPlayers(null);
  }

  return (
    <div className="App">
      {
        ongoingMatch
        ? <Board players={ players } voidGame={ voidGame }/>
        : <Menu startGame={ startGame }/>
      }
    </div>
  );
}

export default App;
