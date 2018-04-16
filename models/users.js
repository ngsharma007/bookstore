var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_LINK);

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    email: {
        type: String,
        unique : true,
        required : true
    },
    name: {
        type: String
    },
    profile_image: {
        type: String
    },
    isAdmin: {
        type: Boolean
    }
});

module.exports = mongoose.model('User', UserSchema);