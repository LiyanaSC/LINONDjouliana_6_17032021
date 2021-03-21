const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const passwordValidator = require('password-validator');
const validator = require("email-validator");


const schema = new passwordValidator();

schema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().not().spaces()



exports.createUser = (req, res, next) => {
    if (schema.validate(req.body.password) == false) {
        return res.status(406).send(new Error('password insecure try again'));
    } else if (validator.validate(req.body.email) == false) {
        return res.status(406).send(new Error('not an email'));
    } else if (!req.body.email ||
        !req.body.password) {
        return res.status(400).send(new Error('Bad request!'));
    }
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })

            user.save()
                .then(() => res.status(201).json({ message: 'nouvel(le) utilisateur/trice enregistré(e) !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }))
}

exports.logUser = (req, res, next) => {
    if (schema.validate(req.body.password) == false) {
        return res.status(406).send(new Error('password insecure try again'));
    } else if (validator.validate(req.body.email) == false) {
        return res.status(406).send(new Error('not a email'));
    }
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user == undefined) {
                res.status(401).send(new Error('utilisateur inconnus'));

            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ error: 'mot de passe incorrect' });
                        }
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign({ userId: user._id },
                                'RANDOM_TOKEN_SECRET', { expiresIn: '1h' }
                            )
                        });
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};