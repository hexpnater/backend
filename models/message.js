const { Schema, model, default: mongoose  } = require("mongoose");

const messageSchema = new Schema({
    sendby: {
        type: String,
        required: [true, 'sendby id Required'],
    },
    sendto: {
        type: String,
        required: [true, 'sendto id Required'],
    },
    message: {
        type: String,
        required: [true, 'Message is Required'],
    },
    date:{
        type: String,
    },
}, { timestamps: true });

// Compile model from schema
module.exports = messageModel = model("message", messageSchema);