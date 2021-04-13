var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require("passport");
const config = require('./config/database');

//passport config:
require('./config/passport')(passport)
//mongoose
mongoose.connect('[mongodb_code]',{useNewUrlParser: true, useUnifiedTopology : true})
.then(() => console.log('db1 connected,,'))
.catch((err)=> console.log(err));
  
// New Code8888
var monk = require('monk');
var db = monk(config.database);
db.then(() =>{
	console.log("Db2 connected");	
}).catch((e)=>{
	console.error("Error !",e);
});

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var apiRouter = require('./routes/api');
// var xadmin = require('./routes/xadmin');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(expressEjsLayout);

// Express Session Middleware
// app.use(session({
//   secret: 'keyboard cat',
//   resave: true,
//   saveUninitialized: true
// }));

app.use(logger('dev'));
app.use(express.json());
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
//express session

var fileStoreOptions = {}


//express session
// app.use(session({
//     secret : 'secret',
//     resave : true,
//     saveUninitialized : true
// }));
app.use(passport.initialize());
app.use(session({
    secret : 'secret',
    resave : false,
    saveUninitialized : false,
    store: new FileStore(fileStoreOptions)
}));
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
    })


// Passport Config
// require('./config/passport')(passport);
// Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', indexRouter);
// app.use('/api', apiRouter);
// app.use('/x-admin', xadmin);
// // app.use('/users', usersRouter);
// app.use('/users',require('./routes/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
 