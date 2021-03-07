if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const session= require('express-session');
const flash= require('connect-flash');
const ejsMate = require('ejs-mate');
const passport= require('passport');
const localStrategy= require('passport-local');
const mongoSanitize= require('express-mongo-sanitize');

const Campground = require('./models/campground');
const Review= require('./models/review');
const {campgroundSchema, reviewSchema}= require('./schemas')
const User=  require('./models/user');

const catchAsync= require('./utils/catchAsync');
const ExpressError= require('./utils/ExpressError');


const campgroundRoutes= require('./routes/campground');
const reviewRoutes= require('./routes/reviews');
const userRoutes= require('./routes/users');

const MongoStore = require('connect-mongo').default;

const dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const app = express();
const router= express.Router();


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
});

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith:'_'
}));

const secret= process.env.SECRET || 'thisshouldbeabettersecret';

const store= MongoStore.create({ 
        mongoUrl: dbUrl,
        touchAfter: 24* 3600
    });

store.on('error', function(e){
    console.log('Session Store error', e);
});


//Sesion Setup

const sessionConfig= {
    secret,
    resave: false,
    saveUninitialized: true,
    store,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60* 24 * 7,
        maxAge: 1000*60*60*24*7
    }
};

app.use(session(sessionConfig));
app.use(flash());



//passport setup
app.use(passport.initialize());
app.use(passport.session());
//specifying a strategy to authenticate requests
passport.use(new localStrategy(User.authenticate()));

//Specifying technique to serialize and deserialize a user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//storing some values on some variables to use them on templates
app.use((req, res, next)=>{
    res.locals.currentUser= req.user;
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    next();
});

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//********************Routes**************************************/
app.get('/', (req, res)=>{
    res.render('home');
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);





app.all('*', (req, res, next)=>{
    next(new ExpressError("Page not found!!", 404));
})

app.use((err, req, res, next)=>{
    const {statusCode= 500}= err;
    if(!err.message) err.message= "Something went wrong!!!";
    res.status(statusCode).render('error', {err});
})
//To listen to a port
const port= process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
