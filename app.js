const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/database');


/* ---------- Data Base ---------- */
mongoose.connect(config.database);
let db = mongoose.connection;
// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
})
// Check for db errors
db.on('error', function(err){
  console.log(err);
});

/* ---------- End of DB ---------- */

// Init app
const app = express();

// Bring in models from db
let Article = require('./models/article');
let User = require('./models/user');

/* ---------- Load Body Parser ---------- */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
/* ---------- End of Body Parser ---------- */

//Load View Engine
// folder, join to
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Set public folder for usage
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator());

//Passport config
require('./config/passport')(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


//Home Route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){ // {} means every object

  /* -------------- render view ---------------- */
  if(err){
      console.log(err)
    } else {
      res.render('index', {
        title: 'Articles', // Name of h1
        articles: articles,
        });
    }
  })
});


//Route files
let articles = require('./routes/articles');
app.use('/articles', articles);

let users = require('./routes/users');
app.use('/users', users);

let profile = require('./routes/profile');
app.use('/profile', profile);

//Start Server
app.listen(3000, function(){
  console.log('server started on port 3000');
});
