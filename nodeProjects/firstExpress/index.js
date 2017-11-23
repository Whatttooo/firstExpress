const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const config = require('./config/database');


mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open', () =>{
    console.log('connected to MongoDB :D')
});

db.on('error', (err) =>{
    console.log(err);
});


var app = express();

let Article = require('./models/article');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));


app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(expressValidator({
    errorFormatter: (param, msg, value) =>{
        var namespace = param.split('.'),
         root = namespace.shift(),
         formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() +']';
        }
        return{
            param: formParam,
            msg,
            value
        };
    }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
    res.locals.user = req.user || null;
    next();
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.get('/', (req, res) => {
    Article.find({}, (err, articles) =>{
        if(err){
            console.log(err);
        }else{
            res.render('index',{
                title: "Posts",
                articles
            });
        }
    }); 
});



let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(3030, () => {
    console.log('Server started at http://localhost:3030...');
});