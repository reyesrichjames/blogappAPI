// Activity Solution
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({   
    
    email: {
        type: String,
        required: [true, 'Email is Required']
    },
    username: {
        type: String,
        required: [true, 'Username is Required']
    },
    password: {
        type: String,
        required: [true, 'Password is Required']
    },
    profilePic: {
        type: String,
        default: 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }    
});

// By accessing the User using mongoose.model, we will have a connection to the users collection in our database
module.exports = mongoose.model('User', userSchema);