import "./App.css";

function Tile(props) {
    const {number, piece, onPress} = props;
    return <div className={"tile " + (number%2===1 ? "tile-black" : "tile-white")} onClick={onPress}>
                <div className={piece === 0 ? "" :
                    (piece === 2 ? "piece piece-black" : 
                        (piece === 1 ? "piece piece-white" :
                            ("potential " + (number%2===1 ? "potential-black" : "potential-white"))
                        )
                    )}>
                </div>
            </div>
}

export default Tile;