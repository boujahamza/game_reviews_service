const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const Game = require('./models/gameModel');

let app = express();

app.use(bodyParser.json());

app.use(cors());

app.use(express.static('game_poster'));

const db = require('./config/keys').mongoURI;

mongoose
    .connect(db)
    .then(()=>console.log("MongoDB Connected ..."))
    .catch(err=>console.log(err));

const port = process.env.PORT || 5000 ;

app.get("/games", (req,res)=>{
    // Request games (full list)
    console.log("Game list requested");
    Game.find().then(games => res.json(games)).catch(err=>console.log);
});

app.get("/games/:id", (req,res)=>{
    // Request game by id
    console.log("Game with id "+req.params.id+" requested");
    Game.findById(req.params.id).then(game => {
        if(game){
            res.json(game);
        }else{
            res.send("game not found");
        }
    }).catch(err=>console.log(err));
});

app.get("/games/:id/reviews",(req,res)=>{
    // Get reviews of game
    Game.findById(req.params.id).then(game => {
        if(game){
            res.send(game["reviews"]);
        }else{
            res.send("game not found");
        }
    }).catch(err=>console.log(err));
})

app.post("/games/:id/reviews",(req,res)=>{
    // Add review to game
    if(Number(req.body.rating) <= 5 && Number(req.body.rating) >= 0) {
        Game.findById(req.params.id).then(game => {
            if(game){
                number_of_reviews = game["number_of_reviews"] || 0;
                rating = game["rating"] || 0;
                total_rating = game["total_rating"] || 0;
                game["reviews"].push({
                    //user_id: req.body.user_id,
                    user_id: req.header("userId"),
                    rating: Number(req.body.rating),
                    desc: req.body.desc
                });
                // Updating number of reviews and rating --------- TODO: REVIEW THIS
                total_rating += req.body.rating;
                number_of_reviews += 1;
                rating = total_rating/number_of_reviews;
                game["rating"] = rating;
                game["total_rating"] = total_rating;
                game["number_of_reviews"] = number_of_reviews;
                // ----------------------
                game.save().then(()=>res.json({success:true})).catch(err=>{console.log(err);res.json({success:false})})
            }else{
                res.send("game not found");
            }
        }).catch(err=>console.log(err));
    }else{
        res.json({success: false, message: "rating out of bounds"})
    }
    
})

app.post("/games", (req,res)=>{
    // Add game
    let newGame = new Game({
        name: req.body.name,
        rating: req.body.rating
    });
    newGame.save().then(()=>res.json({success:true})).catch(res.json({success:false}))
});

app.delete("/games/:id", (req,res)=>{
    // Delete game
    Game.deleteOne({_id: req.params.id}).then(()=>res.json({success:true})).catch(res.json({success:false}))
})

app.listen(port, () => console.log(`Server started on port ${port}`));