const express = require('express');
const router = express.Router();

//Bring in article model
let Article = require('../models/article');
//Bring in user model
let User = require('../models/user');

//Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_article', {
    title: 'Add Article'
  })
})

//Add Submit POST Route
router.post('/add', function(req, res){
  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('add_article', {
      title: 'Add Article',
      errors:errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.authorName = req.user.name;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return
      } else {
        req.flash('success', 'Article Added');
        res.redirect('/');
      }
    });
  }

});


//Load Edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
      article: article
    });
  });
})


//Update Submit POST Route
router.post('/edit/:id', function(req, res){
  let article = {}; //local var for article, getting data from below code
  article.title = req.body.title;
  //article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id};  // getting matching _id

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return
    } else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});


//Delete request
router.delete('/:id', function(req, res){

  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

//Get Single Article Route
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
})

//Access controls
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}


module.exports = router;