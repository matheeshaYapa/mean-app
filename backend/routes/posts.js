const express = require('express');
const multer = require('multer');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid Mime Type');
    if (isValid) {
      error = null;
    }
    callback(error, 'backend/images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + extension);
  }
});

router.post('',
  checkAuth,
  multer({storage: storage}).single('image'),
  (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  })
    .catch(error => {
      res.status(500).json({message: 'Failed to create post!'});
    });
});

router.put('/:id',
  checkAuth,
  multer({storage: storage}).single('image'),
  (req, res, next) => {
  let imagePath = '';
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  } else {
    imagePath = req.body.image;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(
    result => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: 'Post updated successfully!'
        });
      } else {
        res.status(401).json({
          message: 'Not Authorized!'
        });
      }
    }
  )
    .catch(error => {
      res.status(500).json({message: 'Failed to update post'});
    });
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.size;
  const currentPage = +req.query.page;

  const postQuery = Post.find();
  let fetchedPosts = [];

  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }

  postQuery.then(documents => {
    fetchedPosts = documents;
    return Post.countDocuments();
  })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(err => {
      res.status(500).json({message: 'Failed to retrieve post'});
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found'});
    }
  })
    .catch(err => {
      res.status(500).json({message: 'Failed to retrieve post list'});
    });
});

router.delete('/:id',
  checkAuth,
  (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {

    if (result.n > 0) {
      res.status(200).json({
        message: 'Post deleted successfully!'
      });
    } else {
      res.status(401).json({
        message: 'Not Authorized!'
      });
    }

  })
    .catch(err => {
      res.status(500).json({message: 'Failed to delete post'});
    });
});

module.exports = router;
