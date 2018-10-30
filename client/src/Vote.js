import React, { Component } from 'react';
import logo from './logo.svg';
import './index.css';
import { Formik, Field, Form } from 'formik';

class Vote extends Component {
  constructor(props) {
          super(props);
          this.state = ({
                  state:'unprep',
                  data:{},
                  msg:'',
                  code:'',
          });
  }

  populateVote() {
     var candidates = this.state.data.candidates;
     if (candidates) {
       return (
         <div>
          <Formik
             initialValues={{candidate:''}}
             onSubmit={(values, { setSubmitting }) => {
                 setTimeout(() => {
                       {this.handleVote(values)};
                       setSubmitting(false);
                 }, 100);
             }}
         
             render ={({ errors, touched, isSubmitting }) => (
              <Form className='form-group'>
                {candidates.map( c => 
                     <div key={c}>
                       <label>
                       <Field  className='form-check-input' type='radio' name='candidate' value={c} text={c}/> 
                          {c}
                       </label>
	             </div>
                 )}
                <button type="submit" className='btn btn-primary' disabled={isSubmitting}>Start!</button> 
                <button className='btn btn-secondary' onClick={()=> this.props.setState({state:'menu'})}> Back </button>
              </Form>
             )}
          /> 
         </div>
       )
     }
  }

  handlePrep(values) {
     fetch('/prepvote', {
       method: 'POST',
       headers: {'Accept': 'application/json',
                 'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         code: values.code,
       })
     }).then((res) => {
        if (res.status == 202) {
           fetch('/voteresult?code='+values.code)
           .then(res2 => res2.json())
           .then(data => {
               this.setState({state:'preped', data:JSON.parse(data), code:values.code});
           });
        } else {
          this.setState({msg:'You voted already :/'});
        }
     });
  }

  handleVote(values) {
     fetch('/bumovote', {
       method: 'POST',
       headers: {'Accept': 'application/json',
                 'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         candidate: values.candidate,
         code: this.state.code,
       })
     }).then(() => {
        this.props.setState({state:'result', code:this.state.code});
     });
  }

  displayPrep() {
    return (
       <div>
          <Formik
             initialValues={{candidate:''}}
             onSubmit={(values, { setSubmitting }) => {
                 setTimeout(() => {
                       {this.handlePrep(values)};
                       setSubmitting(false);
                 }, 100);
             }}
         
             render ={({ errors, touched, isSubmitting }) => (
              <Form className='form-group'>
                <div><Field className='form-control' type='text' name='code' placeholder='which vote?' /> </div>
                <button className='btn btn-primary' type="submit" disabled={isSubmitting}>Start!</button> 
                <button className='btn btn-secondary' onClick={()=> this.props.setState({state:'menu'})}> Back </button>
              </Form>
             )}
          /> 
      </div>
    )
  }
  startvote() {
    return (
      <div>
         {this.state.state=='unprep'?this.displayPrep():this.populateVote()}
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
             Vote Time!
          </p>
          <div className="zipcodeInput">
              { this.startvote() }
          </div>
          <div>
            {this.state.msg}
          </div>
        </header>
      </div>
    )
  }
}

export default Vote;
