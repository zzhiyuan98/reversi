import "./App.css";
import Gameboard from "./Gameboard";
import Leaderboard from "./Leaderboard";

function App() {
  document.title = 'Reversi | SI 579 Final Project'
  return (
    <main>
      <div className="big-container">
        <div className="hidden"><Leaderboard /></div>
        <Gameboard />
        <Leaderboard />
      </div>
    </main> 
  );
}
export default App;
