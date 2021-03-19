const Sauce = require('../models/sauce');
const fs = require('fs');
const { read } = require('fs/promises');


exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        sauces => {
            const mappedSauces = sauces.map((sauce) => {
                return sauce;
            });
            res.status(200).json(mappedSauces);
        }
    ).catch(error => res.status(500).json({ error }));


    /*  Sauce.find()
         .then(sauces => res.status(200).json(sauces))
         .catch(error => res.status(400).json({ error }));
        
         */
};

exports.getOneSauce = (req, res, next) => {
    if (!{...req.body }) {
        return res.status(400).send(new Error('Bad request!'));
    }
    Sauce.findById(req.params.id)
        .then(sauce => {
            res.status(200).json(sauce);
        })
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce Créée  !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));

};

exports.likedSauce = (req, res, next) => {

    Sauce.findById({ _id: req.params.id, })
        .then(sauce => {

            const addLike = req.body.like;
            const addDislike = req.body.dislike;

            const like = sauce.likes + addLike;
            const dislike = sauce.dislikes + addDislike;

            const usersvote = req.body.userId;
            const arrayOfLikes = sauce.usersLiked;
            const deleteLikes = arrayOfLikes.indexOf(usersvote)

            console.log("ici", arrayOfLikes, deleteLikes)
            if (addLike === 1) {
                arrayOfLikes.push(usersvote)
                console.log("parlà", arrayOfLikes)
                Sauce.updateOne({ _id: req.params.id }, {
                        likes: like,
                        usersLiked: arrayOfLikes,
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({ message: 'Avis modifié !' }))
                    .catch(error => res.status(400).json({ error }));


            } else {

            }
            console.log("à la fin", arrayOfLikes)

        })
        .catch(error => res.status(400).json({ error }))





    /* 
        console.log(req.params, req.body)
    , { upsert: true }
            Sauce.updateOne({ _id: req.params.id }, {...req.body, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Avis modifié !' }))
                .catch(error => res.status(400).json({ error }));

           */
}