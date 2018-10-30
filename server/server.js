const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// add & configure middleware
app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware')
    console.log(req.sessionID)
    return uuid() // use UUIDs for session IDs
  },
  secret: "Schrodinger's cat",
  resave: false,
  saveUninitialized: true
}));

require('./routes')(app);

app.get('/', (req, res) => {
    res.send('PORT 5000');
})

app.listen(port, (err) => {
    if(err) { console.log(err) };
    console.log('Listening on port ' + port);
})
