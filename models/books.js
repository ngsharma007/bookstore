var mongoose = require('mongoose');

var BookSchema = mongoose.Schema({
    title: {
        type: String,
        index: true
    },
    author: {
        type: String,
    },
    desc: {
        type: String,
    },
    price: {
        type: String,
    },
    image_path: {
        type: String
    },
    no_of_views:{
        type: Number
    },
    fav_count:{
        type: Number
    },
    edition: {
        type: String,
    },
    publisher: {
        type: String,
    },
    isbn: {
        type: String,
    },
    category: {
        type: String,
    },
    total_number_of_books: {
        type: Number,
    },
    total_number_of_books_bought: {
        type: Number,
    }
});

module.exports = mongoose.model('Book', BookSchema);