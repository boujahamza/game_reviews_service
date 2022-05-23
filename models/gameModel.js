const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    name: {type:String,required:true},
    image: {type:String,default:"http://localhost:4000/games/default_poster.png"},
    rating: { type: Number, default: 0 },
    reviews: Array,
});

module.exports = gameModel = mongoose.model('game', gameSchema);

