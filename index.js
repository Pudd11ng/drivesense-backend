const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');
const { connectDB } = require('./src/config/database');
const passportConfig = require('./src/config/passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});