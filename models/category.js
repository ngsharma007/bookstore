var mongoose = require('mongoose');

var CategorySchema = mongoose.Schema({
    category: {
        type: String,
        index: true
    },
});

module.exports = mongoose.model('Category', CategorySchema);