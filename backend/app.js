const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect(
  `mongodb+srv://matheeshaYapa:${process.env.MONGO_ATLAS_PW}@cluster0.ubipj.mongodb.net/meanApp?w=majority`,
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
)
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((error) => {
    console.log(error);
    console.log('Connection Failed!');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images', express.static(path.join('images')));

// could be commented if 2 servers are used for frontend and backend separately
app.use('/', express.static(path.join(__dirname, 'mean-app-angular')));


// below are commented because, not required because the app is deployed to the same server. Other wise this should be uncommented

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
//   next();
// });

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

// could be commented if 2 servers are used for frontend and backend separately
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'mean-app-angular', 'index.html'));
});

module.exports = app;

// M3AsDWj8kOVlloe6
