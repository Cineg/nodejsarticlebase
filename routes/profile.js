const express = require('express');
const router = express.Router();

// Bring in User model
let User = require('../models/user');

//profile route
router.get('/:id', ensureAuthenticated, function(req, res, user){
  const userLogged = req.user;

  if(userLogged._id == req.params.id){
    User.findById(req.params.id, function(err, user){
        res.render('profile', {
          name: user.username,
          email: user.email,
          about: user.about,
          username: user.name,
          userLogged: req.user._id
        });
        console.log(userLogged.username + " is at " + user.username + " profile")
      });
  } else {
    User.findById(req.params.id, function(err, user){
      res.render('profile', {
        name: user.username,
        email: user.email,
        about: user.about,
        username: user.name
      });
      console.log(userLogged.username + " is viewing "+ user.username + " profile")
    });
  }
})



//Edit form
router.get('/edit/:id', function(req, res, user){
  const userLogged = req.user;


  User.findById(req.params.id, function(err, user){
    console.log(userLogged.username + " is editting " + user.username + " profile")
    res.render('edit_profile', {
      name: user.username,
      email: user.email,
      about: user.about,
      userLogged: req.user._id
    } );
  });

})

//edit profile route
router.post('/edit/:id', function(req, res){
  const userLogged = req.user;


    let query = {_id:req.params.id};

  //new var for user data from post request
  let editedProfile = {};
    editedProfile.name = req.body.username;
    editedProfile.email = req.body.email;
    editedProfile.about = req.body.about;

  User.update(query, editedProfile, function(err){
    if(err){
      console.log(err);
      return
    } else {
      req.flash('success', 'Profile Edited');
      res.redirect('/profile/'+userLogged._id);
    }
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
