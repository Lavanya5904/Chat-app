const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the model name for users
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the model name for users
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // Additional fields can be added here if needed
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
