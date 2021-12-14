import { useState } from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function PopUp(props) {
    const {mode, winner, score, onClose, onStart, onSubmit} = props;
    const [inputText, setInputText] = useState('');
    const [disabled, setDisabled] = useState(false);
    const handleChange = (event) => {
        setInputText(event.target.value);
      };
    return <div className="modal-background">
                <div className="content-box">
                    <span className="close" onClick={onClose}>&times;</span>
                    {mode === 'multiplayer' ? 
                        <>
                            <p className="congrats">{winner === 2 ? "Black" : "White"} won! </p>
                            <button type="button" onClick={onStart} className="btn btn-outline-dark">Start a new game! </button>
                        </>
                    :
                        <>
                            {winner === 2 ?
                                <>
                                    <p className="congrats special-congrats">You won! </p>                                                  
                                    <InputGroup id="submit-name">
                                        <FormControl type="text" placeholder="Enter your name" value={inputText} maxLength={15} onChange={handleChange}/>
                                        <button disabled={disabled} type="button" className="btn btn-outline-dark" onClick={()=>{
                                            onSubmit(inputText, score);
                                            setDisabled(true);
                                        }}>Submit</button>
                                    </InputGroup>
                                    <button type="button" onClick={onStart} className="btn btn-outline-dark">Start a new game! </button>
                                </>
                            :
                                <>
                                    <p className="congrats">Good game! </p>
                                    <button type="button" onClick={onStart} className="btn btn-outline-dark">Start a new game! </button>
                                </>
                            }
                        </>
                    }
                </div>
            </div>
}
export default PopUp;