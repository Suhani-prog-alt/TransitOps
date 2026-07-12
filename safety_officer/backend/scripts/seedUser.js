require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'safety@transitops.com' });
        if (existingUser) {
            console.log('User already exists!');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const newUser = new User({
            name: 'Safety Admin',
            email: 'safety@transitops.com',
            password: hashedPassword,
            role: 'Safety Officer'
        });

        await newUser.save();
        console.log('Safety Officer user seeded successfully!');
        console.log('Email: safety@transitops.com');
        console.log('Password: password123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUser();
