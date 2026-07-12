const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
        default: 'Safety Officer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
