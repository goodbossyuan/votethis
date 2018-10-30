import React, { Component } from 'react';
import logo from './logo.svg';
import './index.css';
import { Formik, Field, Form } from 'formik';

class Main extends Component {

  constructor(props) {
     super(props);
     this.state = {
        privK:''
     };
  }
  handlePrep(values) {
     fetch('/prep', {
       method: 'POST',
       headers: {'Accept': 'application/json',
                 'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         privK: values.privK,
       })
     }).then(() => {
        this.props.setState({state:'menu'});
     });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Welcome to VoteThis!
          </p>
          <div className="form-group">
          <Formik
             initialValues={{privK:''}}
             onSubmit={(values, { setSubmitting }) => {
                 setTimeout(() => {
                       {this.handlePrep(values)};
                       setSubmitting(false);
                 }, 400);
             }}
         
             render ={({ errors, touched, isSubmitting }) => (
              <Form>
                <Field type='password' name='privK' placeholder='private key' />
                <button className='btn btn-lg btn-primary' type="submit" disabled={isSubmitting}>ENTER</button> 
              </Form>
             )}
          /> 
          </div>
        </header>
      </div>
    )
  }
}

export default Main;
