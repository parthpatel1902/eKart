// express app setup
const express = require('express');
const app = express();
app.use(express.json());
const session = require('express-session');
const userFrontendRouter = require('./routes/R_frontend_user');
const adminRouter = require('./routes/R_admin');
const adminFrontendRouter = require('./routes/R_frontend_admin');
const userRouter = require('./routes/R_user')

// require the ejs files
const ejs = require('ejs');

// connection with mongodb
require('./db/conn');

// use session for login-logout
app.use(session({
  secret: 'usermanagment', // Change this to your own secret key
  resave: false,
  saveUninitialized: true,
  // Additional options can be configured here
}));

// Router setup
app.use(userFrontendRouter);
app.use(adminRouter);
app.use(adminFrontendRouter);
app.use(userRouter);


// body-parser 
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));


// Serving static files
const path = require("path");
app.use(express.static(path.join(__dirname,"./templates/views")))
app.use(express.static(path.join(__dirname,"./src")))
app.use(express.static(path.join(__dirname,'./uploads')));
app.use(express.static(path.join(__dirname,'./public')));
const partialsPath = path.join(__dirname, "./templates/partials");
const viewPath = path.join(__dirname, "./templates/views");
app.set('view engine', 'ejs');
app.set('views', viewPath);

// cors policy set
const cors = require("cors");
app.use(
    cors({
      origin: "*",
      credentials: true,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// server Running
require('dotenv').config();
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
});


