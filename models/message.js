const { Schema, model, default: mongoose  } = require("mongoose");

const chatSchema = new Schema({
    sendby: {
        type: mongoose.Schema.Types.ObjectId, ref: "user",
        required: [true, 'sendby id Required'],
    },
    sendto: {
        type: mongoose.Schema.Types.ObjectId, ref: "user",
        required: [true, 'sendto id Required'],
    },
    message: {
        type: String,
        required: [true, 'Message is Required'],
    },
}, { timestamps: true });

// Compile model from schema
module.exports = chatModel = model("chat", chatSchema);