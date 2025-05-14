// Basic ExpressJS Application
// [SECTION] Dependencies and Modules
const express = require('express');
const mongoose = require('mongoose');
// cors module/pckage - allows our backend application to be available to our frontend application
// allows us control the apps' cross origin resource sharing settings. Using the cors package will allow us to manipulate this and control what applications may use our app.
const cors = require('cors');

// [SECTION] Routes
const userRoute = require('./routes/user');
const postRoute = require('./routes/post');


// [SECTION] Environment Setup
// const port = 4000;
// use the "require" directive to load the package dotenv conifguration in order to use the environment variables. This helps in hiding sensitive information/credentials in our application
// Note: best practice is to create a .env and install dot env package at the start of your development
require('dotenv').config();

// [SECTION] Server Setup
// Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
// Step 1: https://blogappapi-6wqv.onrender.com
const app = express();

// [SECTION] MongoDB Connection
mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));

// you can also customize the options to meet your specific needs
const corsOptions = {
	// Origin of the request
	origin: ['http://localhost:8000', 'http://localhost:3000', 'https://blogapp-red-sigma.vercel.app/'], // allows requests from this client URL only. This is an array because multiple URL can be added for connection.
	// methods: ['GET', 'POST'], // allow only specified HTTP methods
	// allowedHeaders: ['Content-Type', 'Authorization'], // allow only specified headers
	credentials: true, // allow credentials (e.g. cookies, authorization headers)
	optionsSuccessStatus: 200 // provides a status code for successful OPTIONS request
}

// [SECTION] Middlewares
app.use(express.json());
app.use(cors(corsOptions));


// [SECTION] Backend Routes
// defines the "/users" endpoint will be incuded for all user routes in the users file. groups all routes inside the userRoutes under /users.
// https://blogappapi-6wqv.onrender.com/users
app.use('/users', userRoute);
app.use('/posts', postRoute);
// https://blogappapi-6wqv.onrender.com/enrollments

// Server Gateway Response
if(require.main === module) {
	app.listen(process.env.PORT, () => console.log(`API is now online on port ${process.env.PORT}`)); 
};

// In creating APIS, exporting modules in "index.js" file is omitted
module.exports = {app, mongoose};