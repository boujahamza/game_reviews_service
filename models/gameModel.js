const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    name: {type:String,required:true},
    image: String,
    rating: Number,
    number_of_reviews: Number,
    reviews: Array,
});



module.exports = gameModel = mongoose.model('game', gameSchema);

