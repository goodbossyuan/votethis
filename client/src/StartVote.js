import React, { Component } from 'react';
import logo from './logo.svg';
import './index.css';
import { Formik, Field, Form } from 'formik';

class StartVote extends Component {
  constructor(props) {
          super(props);
          this.state = ({
                  state:'',
          });
  }

  handleStart(values) {
     fetch('/startvote', {
       method: 'POST',
       headers: {'Accept': 'application/json',
                 'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         numvoters: values.numvoters,
         candidates: values.candidates,
       })
     })
     .then(res => res.json())
     .then(data => {
        this.props.setState({
           state:'result',
           code: data.code,
        });
     });
  }

  startvote() {
    return (
      <div>
          <Formik
             initialValues={{password:''}}
             onSubmit={(values, { setSubmitting }) => {
                 setTimeout(() => {
                       {this.handleStart(values)};
                       setSubmitting(false);
                 }, 100);
             }}
         
             render ={({ errors, touched, isSubmitting }) => (
              <Form className='form-group'>
                <div><Field className='form-control' type='text' name='candidates' placeholder='array of candidate' /> </div>
                <div><Field className='form-control' type='text' name='numvoters' placeholder='number of voters' /> </div>
                <button className='btn btn-primary' type="submit" disabled={isSubmitting}>Start!</button> 
                <button className='btn btn-secondary' onClick={()=> this.props.setState({state:'menu'})}> Back </button>
              </Form>
             )}
          /> 
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
             Start a vote!
          </p>
          <div className="zipcodeInput">
              { this.startvote() }
          </div>
        </header>
      </div>
    )
  }
}

export default StartVote;
