// [SECTION] Dependencies and Modules
const express = require('express');
const userController = require('../controllers/user');
// Import the auth module and deconstruct it to access the verify() method
// auth.verify => verify
const { verify } = require('../auth');

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Activity Solution


// this route expects to receive a POST request at the URI "/register"
// https://blogappapi-6wqv.onrender.com/users/register
router.post("/register", userController.registerUser);

// Route for user authentication
// thies route expects to receive a POST request at the URI "/login"
// POST localhost:4000/users/login
router.post("/login", userController.loginUser)

// When you access the URL "/details", it will verify if you are logged in by checking if the token is legitimate before retrieveing the user details
// localhost:4000/users/details
// getProfile mcontroller method that is passed as a middlware
// the "req" and "res" objects in the verify (e.g. req.user) will still be accessible to getProfile
router.get("/details", verify, userController.getProfile)



module.exports = router;