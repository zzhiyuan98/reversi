import { useState, useEffect } from "react";
import { getLeaderboard } from "./LeaderData";
import "./App.css"

function Leaderboard(){
    const leaderboard = getLeaderboard();
    const [leaders, setLeaders] = useState(leaderboard.getLeadersCopy());

    useEffect(()=>{
        leaderboard.subscribeToUpdates(()=>{
            setLeaders(leaderboard.getLeadersCopy());
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <>
        <div className="leaderboard">
            <h3>Leaderboard</h3>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
                {leaders.map((item) => <Item key={item.key} name={item.name} score={item.score}/>)}
            </table>
        </div>
    </>
}

function Item(props) {
    const {name, score} = props;
    return <tr>
            <td className="player-name"><span className="player-name-span">{name}</span></td>
            <td>{score}</td>
        </tr>;
}

export default Leaderboard;
