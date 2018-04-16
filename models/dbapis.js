var User = require('./../models/users');
var Books = require('./../models/books');
var Category = require('./../models/category')
var bc = require('bcrypt');

module.exports = {
    getUserByID: function(id, cb) {
        User.findById(id, function(err, res) {
            if(err) {
                console.log(err.message)
            }
            if(!err && res){
                cb(null, res);
            }
        })
    },
    getUserByName: function(email, cb) {
        var q = {email: email}
        User.findOne(q, function(err, res) {
            if(err) {
                console.log(err.message)
            }

            cb(null, res);
        })
    },
    saveUserToDB: function(UserDetails, cb) {
        bc.hash(UserDetails.password, 10, (err, hash)=>{
            UserObject = Object.assign({}, UserDetails, {password: hash});
            UserObject = new User(UserObject);
            UserObject.save(function(err, res) {
                if(err) {
                    console.log(err.message)
                }
                    cb(null, res);
            })
        })
    },
    comparePassword: function(enteredPassword, hash, cb) {
        bc.compare(enteredPassword, hash, function(err, flag){
            if(err) {
                console.log(err.message)
            }
            if(flag) {
                cb(null, flag);
            }
        })
    },
    getBookById: function(id, cb) {
        Books.findById(id, function(err, res) {
            if(err) {
                console.log(err.message)
            }
            cb(null, res);
        })
    },
    getBooksByCategory: function(q, cb) {
        Books.find(q, (err, res)=> {
            if(err) {
                console.log(err.message);
            }
            cb(res);
        })
    },
    getAllBooks: function(cb) {
        Books.find({}, (err, res)=> {
            if(err) {
                console.log(err.message);
            }
            cb(res);
        })
    },
    getAllCategory: function(cb) {
        Category.find({}, (err, res)=> {
            if(err) {
                console.log(err.message);
            }
            cb(res);
        })
    },
    saveBookToDB: function(bookObject, cb) {
        Book = new Books(bookObject);
        Book.save(function(err, res) {
            if(err) {
                console.log(err.message)
            }
                cb(res);
        })
    },
    saveCategoryToDB: function(catObj, cb) {
        Cat = new Category(catObj);
        Cat.save(function(err, res) {
            if(err) {
                console.log(err.message)
            }
            cb(res);
        })
    },
    getAdmin: function(q, cb) {
        User.findOne(q, function(err, res) {
            if(err) {
                console.log(err.message)
            }
            cb(res);
        })
    },
    updateBook: function(id, d, cb) {
        Books.findByIdAndUpdate(id, {$set: d}, { new: true }, (err, update) => {
            if(err){
                console.log(err);
            }
            cb(update);
        })
    },
    removeBook: function(id, cb) {
        Books.findByIdAndRemove(id, { rawResult: true }, (err, update) => {
            if(err){
                console.log(err);
            }
            cb(update);
        })
    },
}