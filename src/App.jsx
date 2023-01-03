import { useState } from "react";
import Board from "./components/Board";
import Menu from "./components/Menu";

function App() {

  const [ongoingMatch, setOngoingMatch] = useState(false);
  const [players, setPlayers] = useState(null);

  const setNewPlayers = (newPlayers) => {
    setPlayers(newPlayers)
  }

  return (
    <div className="App">
      {
        ongoingMatch
        ? <Board />
        : <Menu setNewPlayers={ setNewPlayers }/>
      }
    </div>
  );
}

export default App;
