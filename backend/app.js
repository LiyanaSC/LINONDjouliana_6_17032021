const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const usersRoutes = require('./routes/users');
const sauceRoutes = require('./routes/sauces');

const app = express();
const rateLimit = require("express-rate-limit");


mongoose.connect('mongodb+srv://utilisateur:enter@cluster0.pfyiz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 2
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/api/auth', usersRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(limiter);



module.exports = app;