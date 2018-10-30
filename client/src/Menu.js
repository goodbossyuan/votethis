import React, { Component } from 'react';
import logo from './logo.svg';
import './index.css';
import { CSSTransitionGroup } from 'react-transition-group';

class Menu extends Component {
  constructor(props) {
          super(props);
          this.state = ({
                  state:'',
          });
  }

  withdraw() {
    fetch('/withdraw')
    .then(res => {
      this.setState({state:"I'm rich!"}); 
    });
  }
  menu() {
    return (
     <div>
       <button className='btn btn-primary btn-lg' onClick={()=> this.props.setState({state:'start'})}> Start a vote </button>
       <button className='btn btn-primary btn-lg' onClick={()=> this.props.setState({state:'vote'})}> Participate a vote </button>
       <button className='btn btn-primary btn-lg' onClick={()=> this.props.setState({state:'result'})}> Check result </button>
     <div>
       <button className='btn btn-danger btn-lg' onClick={()=> this.withdraw()}> BE RICH! </button>
       <span> {this.state.state} </span>
     </div>
     <div>
       <button className='btn btn-warning btn-lg' onClick={()=> this.props.setState({state:'home'})}> Logout </button>
     </div>
     </div>
    );
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Please select
          </p>
             <div className="zipcodeInput">
              { this.menu() } 
             </div>
        </header>
      </div>
    )
  }
}

export default Menu;
