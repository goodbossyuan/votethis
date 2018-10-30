import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './Main.js';
import StartVote from './StartVote.js';
import VoteResult from './VoteResult.js';
import Menu from './Menu.js';
import Vote from './Vote.js';
import { Switch, Route } from 'react-router-dom'

class App extends Component {
  constructor(props) {
     super(props);
     this.state = ({
        state:'home',
        code:'code',
     });
     this.setState = this.setState.bind(this);
  }

  stateMachine(state) {
    switch(state) {
       case "start":
          return <StartVote setState={this.setState}/>;
       case "result":
          return <VoteResult setState={this.setState} code={this.state.code}/>;
       case "vote":
          return <Vote setState={this.setState}/>;
       case "menu":
          return <Menu setState={this.setState}/>;
       default:
          return <Main setState={this.setState}/>
    }
  }
  render() {
    return (
      <div>
          {this.stateMachine(this.state.state)}
      </div>
    )
  }
}

export default App;
