const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const fs = require('fs');

const Game = require('./models/gameModel');

let app = express();

app.use(bodyParser.json());

app.use(cors());

app.use(express.static('game_poster'));

const db = require('./config/keys').mongoURI;

mongoose
    .connect(db)
    .then(() => console.log("MongoDB Connected ..."))
    .catch(err => console.log(err));

const port = process.env.PORT || 4001;

app.get("/", (req, res) => {
    // Request games (full list)
    console.log("Game list requested");
    Game.find().then(games => res.json(games)).catch(err => console.log);
});

app.get("/:id", (req, res) => {
    // Request game by id
    console.log("Game with id " + req.params.id + " requested");
    Game.findById(req.params.id).then(game => {
        if (game) {
            res.json(game);
        } else {
            res.send("game not found");
        }
    }).catch(err => console.log(err));
});

app.get("/:id/reviews", (req, res) => {
    // Get reviews of game
    Game.findById(req.params.id).then(game => {
        if (game) {
            res.send(game["reviews"]);
        } else {
            res.send("game not found");
        }
    }).catch(err => console.log(err));
})

app.post("/:id/reviews", (req, res) => {
    // Add review to game
    try {
        if (Number(req.body.rating) <= 5 && Number(req.body.rating) >= 0) {
            Game.findById(req.params.id).then(game => {
                if (game) {
                    number_of_reviews = game["reviews"].length || 0;
                    rating = game["rating"] || 0;
                    total_rating = game["reviews"].reduce((partialSum, review) => partialSum + Number(review.rating), 0);

                    user = JSON.parse(req.headers["user"]);

                    game["reviews"].push({
                        user_id: user.user_id,
                        username: user.username,
                        rating: Number(req.body.rating),
                        desc: req.body.desc
                    });

                    // Updating number of reviews and rating --------- TODO: REVIEW THIS
                    total_rating += Number(req.body.rating);
                    number_of_reviews += 1;
                    rating = total_rating / number_of_reviews;
                    game["rating"] = rating;
                    // ----------------------
                    game.save().then(() => {res.json({ success: true });console.log("added review")}).catch(err => { console.log(err); res.json({ success: false }) })
                } else {
                    res.send("game not found");
                }
            }).catch(err => console.log(err));
        } else {
            res.json({ success: false, message: "rating out of bounds" })
        }
    } catch {
        error => {
            console.log(error);
            res.status(500).send("unexpected error");
        }
    }
})

app.delete("/:game_id/reviews/:user_id", (req, res) => {
    Game.findById(req.params.id).then(game => {
        if (game) {
            //TODO: IMPLEMENT REVIEW DELETION AND ADD TO GATEWAY PATHS
        } else {
            res.send("game not found");
        }
    })
})

app.post("/", (req, res) => {
    // Add game
    let newGame = new Game({
        name: req.body.name,
        image: req.body.image
    });

    newGame.save().then((saved) => {
        res.json({ success: true });
        const file = fs.createWriteStream("game_poster/poster_" + saved._id + ".jpg");
        const request = http.get(saved.image, function (response) {
            response.pipe(file);

            file.on("finish", () => {
                file.close();
                console.log("Retrieved poster for new game");
            });
        });
    }).catch(err => { console.log(err); res.json({ success: false }) })
});

app.delete("/:id", (req, res) => {
    // Delete game
    Game.deleteOne({ _id: req.params.id }).then(() => res.json({ success: true })).catch(res.json({ success: false }))
})

app.listen(port, () => console.log(`Server started on port ${port}`));