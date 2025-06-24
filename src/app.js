const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
var cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

// Import routes and middleware
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve .well-known directory files
app.use('/.well-known', express.static(path.join(__dirname, '../public/.well-known')));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;