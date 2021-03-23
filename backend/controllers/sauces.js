const Sauce = require('../models/sauce');
const fs = require('fs');
const { read } = require('fs/promises');


exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        sauces => {
            const mappedSauces = sauces.map((sauce) => {
                if (!sauce) {
                    return res.status(404).send(new Error('Bad request!'));
                }
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
    Sauce.findById(req.params.id)
        .then(sauce => {
            console.log(sauce)
            if (!sauce) {
                return res.status(404).send(new Error('Bad request!'));
            }
            res.status(200).json(sauce);
        })
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    if (!req.body.sauce ||
        !sauceObject.name ||
        !sauceObject.manufacturer ||
        !sauceObject.description ||
        !sauceObject.mainPepper ||
        !sauceObject.heat

    ) {
        return res.status(400).send(new Error('Bad request!'));
    }
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    });
    console.log(sauceObject.userId)
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce Créée  !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    if (req.file != null) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            });
    } else {
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }));
    }
    console.log(req.file)
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
            const userId = req.body.userId;

            const arrayOfLikes = sauce.usersLiked;
            const userIndexInLikes = arrayOfLikes.indexOf(userId)
            const like = sauce.likes + addLike;




            const arrayOfDislikes = sauce.usersDisliked
            const userIndexInDislikes = arrayOfDislikes.indexOf(userId)
            const dislike = sauce.dislikes - addLike;

            if (addLike == 1) {
                arrayOfLikes.push(userId);
                Sauce.updateOne({ _id: req.params.id }, {
                        usersLiked: arrayOfLikes,
                        likes: like,
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({ message: 'Like àjouté !' }))
                    .catch(error => res.status(400).json({ error }));

            } else if (addLike == -1) {
                arrayOfDislikes.push(userId);
                Sauce.updateOne({ _id: req.params.id }, {
                        usersDisliked: arrayOfDislikes,
                        dislikes: dislike,
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({ message: 'Avis modifié !' }))
                    .catch(error => res.status(400).json({ error }));
            } else {

                const FinalLikesArray = arrayOfLikes.splice(userIndexInLikes, 1)
                const likeAfterModif = JSON.parse(arrayOfLikes.length) - JSON.parse(FinalLikesArray.length);
                const resultLike = like + likeAfterModif;

                const FinalDislikesArray = arrayOfDislikes.splice(userIndexInDislikes, 1)
                const dislikeAfterModif = JSON.parse(arrayOfDislikes.length) - JSON.parse(FinalDislikesArray.length);
                const resultDislike = dislike + dislikeAfterModif;

                Sauce.updateOne({ _id: req.params.id }, {
                        usersLiked: arrayOfLikes,
                        usersDisliked: arrayOfDislikes,
                        likes: resultLike,
                        dislikes: resultDislike,
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({ message: 'dislike !' }))
                    .catch(error => res.status(400).json({ error }));

            }
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