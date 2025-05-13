// [SECTION] Dependencies and Modules
const User = require('../models/User');
// use the "require" directive to load bcryptjs module/package that allows us to encrypt information
const bcrypt = require('bcryptjs');
const auth = require('../auth');
const { errorHandler } = require('../auth');

// [SECTION] Activity Solution
// controller function for checking if the user email already exists in the database


// controller function to register a user
module.exports.registerUser = (req, res) => {
    // Check if email exists in the request body
    if (!req.body.email) {
        return res.status(400).send({ message: 'Email is required' });
    }

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Invalid email format' });
    }
    
    // Checks if the mobile number has the correct number of characters
    
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        // If the password is not atleast 8 characters, send a message back to the postman/client
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });

    // If all needed requirements are achieved
    } else {

        // created a variable named "newuser" that will store the instance of the User object
        let newUser = new User({
            email : req.body.email,
            username: req.body.username,
            // .hashSync() method - responsible for hashing/encrypting our information
            // It accepts 2 arguments, the first argument is the information to be hashed and the second argument is the number of salt rounds
            // salt rounds - number of times that the information is hashed
            password : bcrypt.hashSync(req.body.password, 12)
        });

        // Using save() method, save the document "newUser" in the "courses" collection
        return newUser.save()
        // If the documents is saved successfully, the document will be sent as a response back to the client/postman
        .then((result) => res.status(201).send({
            message: 'Registered Successfully'            
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

// controller function for user authentication
/*
    reqBody = {
        email: "halmonte@mail.com",
        password: "user1234"
    }
*/
module.exports.loginUser = (req, res) => {

    // if the email contains "@"
    if(req.body.email.includes("@")) {

        // use the .findOne() method to find the first document in the users collection that matches the email given in the request body
        // it will return the document and store it in the variable "result"
        // User.findOne({ email : "halmonte@mail.com" })
        /*
            result = {
                firstName: "Hillary",
                lastName: "Almonte",
                email: "halmonte@mail.com",
                password: "$2b$12$v1HKMytZxXe0ifk2IagWbudr.3FOH0Zj4IlmSMlRYMWmSfkHS4qwm",
                isAdmin: false,
                mobileNo: "09123456789",
                _id: "67ecab6355c861bb1cd66c74",
                __v: 0
            }
        */
        return User.findOne({ email: req.body.email }).then(result => {

            // if there is no document found
            if(result == null) {

                return res.status(404).send({ message: 'No email found' });

            // else, a document with the same email is found
            } else {

                // .compareSync() method will cpmpare the given arguments to check if it matches. It compares the non-encrypted password to the encrypted password
                // it will return true if the paassword matches
                // bcrypt.compareSync("user1234", "$2b$12$v1HKMytZxXe0ifk2IagWbudr.3FOH0Zj4IlmSMlRYMWmSfkHS4qwm")
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                // if the password is correct
                if(isPasswordCorrect) {

                    // generate an access token using the createAccessToken function we created in the auth.js
                    // It will also send the user details as the argument
                    /*
                        access: auth.createAccessToken({
                            firstName: "Hillary",
                            lastName: "Almonte",
                            email: "halmonte@mail.com",
                            password: "$2b$12$v1HKMytZxXe0ifk2IagWbudr.3FOH0Zj4IlmSMlRYMWmSfkHS4qwm",
                            isAdmin: false,
                            mobileNo: "09123456789",
                            _id: "67ecab6355c861bb1cd66c74",
                            __v: 0
                        })
                    */
                    /*
                        access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWNhYjYzNTVjODYxYmIxY2Q2NmM3NCIsImVtYWlsIjoiaGFsbW9udGVAbWFpbC5jb20iLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzQzNTcxNjcxfQ.O3zXpX66x3wYCXB9oV4UVRK_0zKvXDsIv-3-cVtFqdw"
                    */
                    return res.status(200).send({ 
                        
                        access : auth.createAccessToken(result)
                    })

                // if the password is incorrect
                } else {
                    return res.status(401).send({ message: 'Incorrect email or password' });
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    } else {
        return res.status(400).send({ message: 'Invalid email format' });
    }
}

// controller function to retrieve user details
/*
    userId = {
        id: "67ecab6355c861bb1cd66c74"
    }
*/
module.exports.getProfile = (req, res) => {

    // We called the User constant variable which contains the "require" directive to load the user model. This will allows access to the "users" collectiion in our database.
    // We chained findById() to find the document in the "users" collection that conatins the same "_id" value as the one given in the req.user.id
    // return User.findOne({ _id: req.user.id})
    return User.findById(req.user.id)
    // If it finds a document with the correct id, it will then return the document found and saved it in the variable "user"
    // If it did not find a document with the same id value, it will return null and save it in the variable "user"
    .then(user => {
        // if there is no user document found
        if(!user) {
            return res.status(200).send({ message: 'invalid signature' })
        } else {
            

            // temporarily set the password to an empty string so the password will not be displayed when sent back to the client
            user.password = "";
            
            // .status(status_code) is chained to send the HTTP status code together with the response back to the client
            // 200 status code means OK. This means that the request is successful and the resource has been fetched and transmitted back to the client
            // .send() is chanied to send the response back to the client
            // In this case, the document with the empty string password is send back to postman/client
            return res.status(200).send({
                user: user
            });
        }
    })
    .catch(err => errorHandler(err, req, res));
};
