const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');
const passportConfig = require('./config/passport');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});