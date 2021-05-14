const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PostModel = require('./models/post');

const app = express();

mongoose.connect(
  'mongodb+srv://matheeshaYapa:M3AsDWj8kOVlloe6@cluster0.ubipj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {useNewUrlParser: true, useUnifiedTopology: true}
)
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((error) => {
    console.log(error);
    console.log('Connection Failed!');
  });

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = new PostModel({
    title: req.body.title,
    content: req.body.content
  });
  console.log(post);
  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.get('/api/posts', (req, res, next) => {
  const posts = [
    {id: 1, title: 'First Serverside Post', content: 'example content'},
    {id: 2, title: 'Second Serverside Post', content: '2nd example content'},
  ];
  res.status(200).json({
    message: 'Posts fetched successfully',
    posts
  });
});

module.exports = app;

// M3AsDWj8kOVlloe6
