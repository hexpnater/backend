const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is Required'],
    },
    firstname: {
        type: String,
        required: [true, 'Firstname is Required'],
        trim: true,
        lowercase: true,
        // minLength: 4,
        // maxLength: 15
    },
    lastname: {
        type: String,
        required: [true, 'Lastname is Required'],
        trim: true,
        lowercase: true,
        // minLength: 4,
        // maxLength: 15
    },
    name: {
        type: String,
        trim: true,
        lowercase: true,
        // minLength: 4,
        // maxLength: 15
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Password is Required'],
        trim: true,
        minLength: 6,
    },
    phone: {
        type: String,
    },
    plateno: {
        type: String,
    },
    plateprovince: {
        type: String,
    },
    image: {
        type: String,
    },
    token: {
        type: String,
    },
    isverify: {
        type: Boolean, default: false
    },
    messageAvailaibility: {
        type: Boolean, default: true
    },
    otp: {
        type: String,
        default: 0
    },
    isotpverify: {
        type: Boolean, default: false
    },
    role: {
        type: String,
        default: "user"
    },
}, { timestamps: true });

// Compile model from schema
module.exports = userModel = model("user", userSchema);