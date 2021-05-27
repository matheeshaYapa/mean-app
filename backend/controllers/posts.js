const Post = require('../models/post');

exports.createPost = (req, res, next) => {
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
}

exports.updatePost = (req, res, next) => {
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
  console.log(post);
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(
    result => {
      console.log(result);
      if (result.n > 0) {
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
}

exports.getPosts = (req, res, next) => {
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
}

exports.getPostById = (req, res, next) => {
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
}

exports.deletePost = (req, res, next) => {
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
}
