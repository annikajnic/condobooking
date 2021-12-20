const compression = require('compression')
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()
const Schedule = require('./models/schema.js')

const app = express()
const appPage = path.join(__dirname, '../../public/index.html')

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.disable('etag')
// Allows the use of files.
app.use(express.static(__dirname + './../../'))

// SERVES STATIC HOMEPAGE
// Changed path-route for compatibility with
// React-Router-Dom pkg
app.get('/', function(req, res) {
  res.sendFile(appPage)
})


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})


// Article API
app.get('/api/bookings', function(req, res) {
  Schedule.find(function(err, arr) {
    if (err)
      return next(err)
    res.json(arr)
  })
})

// Master Article Page and where once can post
app.route('/bookings').get(function(req, res) {
  res.sendFile(appPage)
}).post(function(req, res, next) {
  console.log(req.body)
  Schedule.create(req.body)
  res.end('Schedule Created')
})


// Routes to individual Articles using the ID parameter
app.route('/bookings/:id').get(function(req, res, next) {
  res.sendFile(appPage)
}).delete(function(req, res) {
  Schedule.findByIdAndRemove({
    _id: req.params.id
  }, function(err, art) {
    res.end()
  })
})
// // This section will help you get a list of all the bookings
// app.route('/bookings').get(function (req, res) {
//   const db_connect = dbo.returnClient()

//   console.log(db_connect )
  
//   db_connect
//     .db('bookingSchedule')
//     .collection('dates')
//     .find({})
//     .toArray(function (err, result) {
//       if (err) throw err
//       res.json(result)
//     })
// })

// app.route('/booking/add').post(function (req, response) {
//   let db_connect = dbo.returnClient()
//   let myobj = {
//     date: req.body.date
//   }
//   db_connect.db('bookingSchedule').collection('bookingSchedule').insertOne(myobj, function (err, res) {
//     if (err) throw err
//     response.json(res)
//   })
// })

// // This section will help you delete a record
// app.route('/:date').delete((req, response) => {
//   let db_connect = dbo.returnClient()
//   let myquery = { _id: ObjectId( req.params.id )}
//   db_connect.db('bookingSchedule').collection('bookingSchedule').deleteOne(myquery, function (err, obj) {
//     if (err) throw err
//     console.log('1 document deleted')
//     response.status(obj)
//   })
// })

// Mongoose - MongoDB connector
const mongoDB = process.env.ATLAS_URI
// Set up default Mongoose Connection
mongoose.connect(mongoDB).then(console.log('Establishing connection...'))
// Get Mongoose to use global promise LIbrary
mongoose.Promise = global.Promise
// Get default connection
const db = mongoose.connection
// Connection and Error Handlers
db.on('open', function(ref) {
  console.log('Open connection to Mongo Server...')
})
db.on('connected', function(ref) {
  console.log('Connected to Mongo Server.')
})
db.on('reconnect', function(ref) {
  console.log('Reconnected to Mongo Server')
})
db.on('error', console.error.bind(console, 'MongoDB connection error:'))


app.listen(3000, () => console.log('Running on Port 3000... Do not forget to run \'npm run dev\' in another terminal!'))




// const express = require('express');
// const app = express();
// const port = process.env.PORT || 6000;
// const booking = require('./routes/booking');
// const path = require('path');
// const router = express.Router();
// const dbo = require("./db/conn");

// const { MongoClient } = require("mongodb");

// app.use(express.static(__dirname + '/public'));
// app.get('/',function(req,res){
//   // Connection URI
// const uri =process.env.MONGODB_URI;
// // Create a new MongoClient
// const client = new MongoClient(uri);
// async function run() {
//   try {
//     // Connect the client to the server
//     await client.connect();
//     // Establish and verify connection
//     // await client.db("admin").command({ ping: 1 });
//     console.log("Connected successfully to server");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
//   res.sendFile('index.html', { root: __dirname });
// });

// app.use('/booking', booking);

// /* Error handler middleware */
// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   console.error(err.message, err.stack);
//   res.status(statusCode).json({ message: err.message });
//   return;
// });




 
// app.listen(port, () => {
//   // perform a database connection when server starts
//   dbo.connectToServer(function (err) {
//     if (err) console.error(err);
 
//   });
//   console.log(`Server is running on port: ${port}`);
// });
 