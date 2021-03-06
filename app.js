require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var app = express();

// Mongoose stuff
// var mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/calendardb');
// mongoose.set('debug', true); //TODO: Remove Me for production!

// Set up middleware
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'client', 'build')));

app.use(function(req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.currentUser = req.user;
  next();
});
app.get('/',function(req,res){
  // Connection URI
const uri =process.env.MONGODB_URI;
// Create a new MongoClient
const client = new MongoClient(uri);
  async function run() {
    try {
      // Connect the client to the server
      await client.connect();
      // Establish and verify connection
      // await client.db("admin").command({ ping: 1 });
      console.log("Connected successfully to server");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
});
// Controllers
// app.use('/auth', require('./routes/booking.js'));
// app.use('/calendar', require('./routes/calendar').router);
// app.use('/calendar/event', require('./routes/event'));

// app.get('*', function(req, res, next) {
// 	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
// });



module.exports = app;