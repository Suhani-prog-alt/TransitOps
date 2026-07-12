require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const usersToSeed = [
    {
        userId: 'FM-1',
        name: 'Fleet Manager',
        email: 'fleet@transitops.com',
        password: 'password123',
        role: 'Fleet Manager'
    },
    {
        userId: 'D-1',
        name: 'Dispatcher',
        email: 'dispatcher@transitops.com',
        password: 'password123',
        role: 'Dispatcher'
    },
    {
        userId: 'SO-1',
        name: 'Safety Officer',
        email: 'safety@transitops.com',
        password: 'password123',
        role: 'Safety Officer'
    },
    {
        userId: 'FA-1',
        name: 'Financial Analyst',
        email: 'analyst@transitops.com',
        password: 'bheemKeLaddu',
        role: 'Financial Analyst'
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Clear existing users to prevent duplicate errors while testing
        await User.deleteMany({});
        console.log('Cleared existing users.');

        for (let userData of usersToSeed) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            
            const newUser = new User({
                ...userData,
                password: hashedPassword
            });
            await newUser.save();
            console.log(`Seeded user: ${userData.role} (${userData.email})`);
        }

        console.log('All users seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
