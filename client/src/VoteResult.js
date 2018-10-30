import React, { Component } from 'react';
import './App.css';

class VoteResult extends Component {
  constructor(props) {
	  super(props);
	  this.state = ({
		  result:'{}',
	  });
  }

  checkresult() {
    fetch('/voteresult?code='+ this.props.code)
    .then(res => res.json())
    .then(data => {
	    this.setState({
		    result:JSON.parse(data)
	    });
    });
  }
  
  resultTable() {
     var result = this.state.result;
     if (result.candidates) {
       return (
           result.candidates.map( c => 
                     <div key={c}>
                       {c} : {result.result[c] > 0 ? result.result[c]:0}
	             </div>
           )
       )
     }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Result of {this.props.code}
          </p>
          <p>
              { this.resultTable() }
          </p> 
 
          <button className='btn btn-primary' onClick={ () => this.checkresult() }>Check</button> 
          <button className='btn btn-secondary' onClick={ () => this.props.setState({state:"menu"})}>BACK</button> 
        </header>
      </div>
    );
  }
}

export default VoteResult;
