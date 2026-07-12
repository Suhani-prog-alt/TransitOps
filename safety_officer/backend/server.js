require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));

const PORT = process.env.PORT || 5002; // Using 5002 since Dispatcher might be 5000, Finance 5001, etc.

app.listen(PORT, () => console.log(`Safety Officer Server started on port ${PORT}`));
