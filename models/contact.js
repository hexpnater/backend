const { Schema, model, default: mongoose } = require("mongoose");

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is Required'],
    },
    email: {
        type: String,
        required: [true, 'Email is Required'],
    },
    subject: {
        type: String,
        required: [true, 'Subject is Required'],
    },
    message: {
        type: String,
        required: [true, 'Message is Required'],
    },
}, { timestamps: true });

// Compile model from schema
module.exports = contactModel = model("contact", contactSchema);