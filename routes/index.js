var express = require('express');
var router = express.Router();
var API = require('./../models/dbapis');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Admin = require('./admin/index');
var _ = require('async');

/* GET home page. */
router.get('/', ensureAuth, function (req, res, next) {
  var cart = req.session.cart || { };     
  var finalTotal = 0;
  Object.keys(cart).map((key)=>{
    finalTotal += cart[key].total;
  })

  API.getAllBooks((books) => {
    res.render('index', { path: 'home', title: 'Book Store', books: books, cart_total: finalTotal });
  })
});

// GET Sign up page
router.get('/signup', function (req, res, next) {
  res.render('includes/signup/signup', { path: 'signup', title: 'Book Store' });
});

// POST /signup
router.post('/signup', function (req, resEx, next) {
  const username = req.body.username || '';
  const email = req.body.email || '';
  const password = req.body.password || '';
  const profile_picture = req.body.profile_picture || '';

  const UserDetails = {
    username: username,
    email: email,
    password: password,
    name: username,
    isAdmin: false
  }

  API.saveUserToDB(UserDetails, (err, res) => {
    if (err) {
      console.log(err);
      resEx.render('includes/misc/intermediate.ejs', {
        title: 'Error', path: 'intermediate', class:
          "fas fa-times-circle fa-5x", message: "Failed"
      })
    }

    if (!err && res) {
      resEx.render('includes/misc/intermediate.ejs', {
        title: 'Success', path: 'intermediate', class:
          "fas fa-check-circle fa-5x", message: "Sucess"
      })
    }
  });
});

// GET Log in page
router.get('/login', function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.isAdmin = false;
    res.render('includes/login/login', { path: 'login', title: 'Book Store' });
  } else {
    res.redirect('/');
  }
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  API.getUserByID(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(
  function (username, password, done) {
    API.getUserByName(username, function (err, user) {
      if (user.isAdmin) {
        console.log("Admin Cant log in to user section");
        return done(null, false, { message: "Admin User!" });
      }
      if (err) {
        console.log(err.message);
      }
      if (!user) {
        console.log("unknown user");
        return done(null, false, { message: "Unknown User!" });
      }

      API.comparePassword(password, user.password, function (err, flag) {
        if (err) {
          console.log(err.message);
        }
        if (flag) {
          console.log("authenticated!");
          return done(null, user);
        } else {
          console.log("Invalid password!");
          return done(null, false, { message: "Invalid password!" });
        }
      })
    })
  }
))

function ensureAuth(req, res, next) {
  if (req.isAuthenticated() && req.session.isAdmin == false) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// post for user searchterms 
router.post('/user/search', ensureAuth, function (reqEx, resEx, nexy) {
  API.getAllBooks((books) => {
    var newbooks = books.filter(o => o.title.toLowerCase().indexOf(reqEx.body.searchdata.toLowerCase()) >= 0);
    resEx.render('index', { path: 'home', title: 'Book Store', books: newbooks });
  })
})

// post for admin searchterms 
router.post('/admin/search', Admin.ensureAdminCheck, function (reqEx, resEx, nexy) {
  API.getAllBooks((books) => {
    var newbooks = books.filter(o => o.title.toLowerCase().indexOf(reqEx.body.searchdata.toLowerCase()) >= 0);
    resEx.render('admin/listbooks.ejs', { path: 'admin', title: 'Admin Dashboard', books: newbooks })
  })
})

// post for user searchterms 
router.post('/guest/search', function (reqEx, resEx, nexy) {
  API.getAllBooks((books) => {
    var newbooks = books.filter(o => o.title.toLowerCase().indexOf(reqEx.body.searchdata.toLowerCase()) >= 0);
    resEx.render('includes/guests/guest.ejs', { path: 'guest', title: 'Book Store', books: newbooks });
  })
})

// POST /login
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function (req, res, next) {
  req.session.isAdmin = false;
  res.redirect('/');
});

// GET logout
router.get('/logout', ensureAuth, function (req, res, next) {
  req.logout();
  res.redirect('/login');
  req.session.cart = [];
});

// GET logout
router.get('/guest', function (req, res, next) {
  API.getAllBooks((books) => {
    res.render('includes/guests/guest.ejs', { title: 'Book Store', path: 'guest', books: books });
  })
});

router.get('/guest/show/:id', function (req, res, next) {
  var id = req.params.id;
  if (id) {
    API.getBookById(id, (err, book) => {
      if (book) {
        API.updateBook(id, { no_of_views: (book.no_of_views ? book.no_of_views : 0) + 1 }, (updatedBook) => {
          res.render('includes/guests/guest_show.ejs', { title: 'Book Store', path: 'guest', book: book });
        })
      }
    })
  }
});

// GET book show
router.get('/book/show/:id', ensureAuth, function (req, res, next) {
  var id = req.params.id;
  var finalTotal = 0;
  var cart = req.session.cart || {};
  Object.keys(cart).map((key)=>{
    finalTotal += cart[key].total;
  })
  if (id) {
    API.getBookById(id, (err, book) => {
      if (book) {
        API.updateBook(id, { no_of_views: (book.no_of_views ? book.no_of_views : 0) + 1 }, (updatedBook) => {
          res.render('includes/books/show.ejs', { title: 'Book Store', path: '', book: book , cart_total: finalTotal});
        })
      }
      else
        res.render('includes/books/not_found.ejs', { title: 'Book Store', path: 'home', book: [], cart_total: finalTotal });
    })
  }
});

// GET remove book from cart
router.get('/cart/remove/:id', ensureAuth, function (req, res, next) {
  var id = req.params.id;
  var cart = req.session.cart || {};
  if (cart[id].total > 1) {
    cart[id].total = cart[id].total - 1;

    API.getBookById(id, (err, book) => {
      if (book) {
        API.updateBook(id, { total_number_of_books: (book.total_number_of_books ? book.total_number_of_books : 0) + 1 }, ()=>{});
        req.session.cart = cart;
      }
    });
  } else {
    API.getBookById(id, (err, book) => {
      if (book) {
        API.updateBook(id, { total_number_of_books: (book.total_number_of_books ? book.total_number_of_books : 0) + 1 }, ()=>{});
        req.session.cart = cart;
      }
    });
    delete cart[id];
    req.session.cart = cart;
  }
  res.redirect('/cart')
});

// GET logout
router.get('/cart', ensureAuth, function (req, res, next) {
  const cart = req.session.cart || {};
  var finalCart = [];
  Object.keys(cart).map((key)=>{
    finalCart.push(cart[key])
  })

  var finalTotal = 0;
  var totalPrice = 0;
  Object.keys(cart).map((key)=>{
    finalTotal += cart[key].total;
    totalPrice += cart[key].items.price * cart[key].total;
  })

  res.render('includes/books/cart.ejs', { title: 'Book Store', path: '', books: finalCart, cart_total: finalTotal || 0 , cart_price: totalPrice});
});

router.get('/cart/checkout', ensureAuth, function (req, res, next) {
  const cart = req.session.cart || {};
  var finalCart = [];
  Object.keys(cart).map((key)=>{
    finalCart.push(cart[key])
  })

  var finalTotal = 0;
  var totalPrice = 0;
  Object.keys(cart).map((key)=>{
    finalTotal += cart[key].total;
    totalPrice += cart[key].items.price * cart[key].total;
    console.log(cart[key].items)
    API.updateBook(key, { total_number_of_books_bought: (cart[key].items.total_number_of_books_bought || cart[key].items.total_number_of_books_bought == 0) ? cart[key].items.total_number_of_books_bought + cart[key].total : 0 }, ()=> {})
  })


  delete req.session.cart;
  res.render('includes/books/checkout.ejs', { title: 'Book Store', path: '', books: finalCart, cart_total:  0 , cart_price: totalPrice});
});

router.post('/cart/add/:id', ensureAuth, (req, res, next) => {
  var cart = req.session.cart || { };
  const id = req.params.id;
  if (id) {
    API.getBookById(id, (err, book) => {
      if (book) {
        API.updateBook(id, { fav_count: (book.fav_count ? book.fav_count : 0) + 1, total_number_of_books: (book.total_number_of_books ? book.total_number_of_books : 0) - 1 }, ()=>{});
        if(!cart[id]){
          cart[id] = {};
          cart[id]['items'] = {};
          cart[id]['total'] = 0;
        }
        cart[id].items = book;
        cart[id].total = (cart[id].total || cart[id].total == 0) ? cart[id].total + 1 : 0;
        req.session.cart = cart
      }
      var finalTotal = 0;
      Object.keys(cart).map((key)=>{
        finalTotal += cart[key].total;
      })
      res.json({ total: finalTotal || 0 })
    })
  }
})


//  admin part

router.get('/admin', function (req, res, next) {
  res.render('admin/login.ejs', { title: "Admin Page", path: 'admin' })
});

router.get('/admin/logout', function (req, res, next) {
  if (req.session.isAdmin) {
    req.session.isAdmin = false;
  }
  res.redirect('/admin');
});

router.post('/admin/login', Admin.ensureAdmin, function (req, res, next) {
  res.redirect('/admin/listbooks')
});

router.get('/admin/listbooks', Admin.ensureAdminCheck, function (req, res, next) {
  API.getAllBooks(function (books) {
    _.sortBy(books, function (x, callback) {
        callback(null, x.price);
    }, function (err, result) {
        res.render('admin/listbooks.ejs', { path: 'admin', title: 'Admin Dashboard', books: result })
    });
  })
});

router.get('/admin/edit/:id', Admin.ensureAdminCheck, function (req, res, next) {
  var id = req.params.id;
  if (id) {
    API.getBookById(id, (err, book) => {
      if (book) {
        API.getAllCategory((cats) => {
          res.render('admin/editbook.ejs', { title: 'Book Store', path: 'admin', book: book, categories: cats });
        })
      }
    })
  }
});

router.get('/admin/report/:id', Admin.ensureAdminCheck, function (req, res, next) {
  var id = req.params.id;
  if (id) {
    API.getBookById(id, (err, book) => {
      if (book) {
          res.render('admin/report.ejs', { title: 'Book Store', path: 'admin', book: book });
      }
    })
  }
});

router.get('/admin/add/', Admin.ensureAdminCheck, function (req, res, next) {
  API.getAllCategory((cats) => {
    res.render('admin/addbook.ejs', { title: 'Book Store', path: 'admin', categories: cats });
  })
});

router.get(['/admin/checkbycat/:q', '/admin/checkbycat/'], Admin.ensureAdminCheck, function (req, res, next) {
  console.log(req.params);
  var cat_send = {};
  if(req.params.q == undefined){
    API.getAllCategory((cats) => {
      cats.map((e, i)=>{
        API.getBooksByCategory({category: e.category}, (books) => {
          cat_send[e.category] = books.length;
          if( i + 1 == cats.length){
            console.log(cat_send)
            res.render('admin/categories.ejs', { title: 'Book Store', path: 'admin', categories: cats, category_books: cat_send });
          }
        })  
      });
    })
  } else {
    API.getBooksByCategory({category: req.params.q}, (books) => {
      res.render('admin/categories.ejs', { title: 'Book Store', path: 'admin', books: books });
    })
  }
});

router.get('/admin/show/:id', Admin.ensureAdminCheck, function (req, res, next) {
  var id = req.params.id;
  if (id) {
    API.getBookById(id, (err, book) => {
      if (book) {
        res.render('admin/showbook.ejs', { title: 'Book Store', path: 'admin', book: book });
      }
    })
  }
});

router.post('/admin/order/', Admin.ensureAdminCheck, function (req, res, next) {
  var order = req.body.order;
  var kind = req.body.kind == "views" ? "no_of_views" : req.body.kind == "favorite" ? "fav_count" : req.body.kind == "remain" ? "total_number_of_books" : req.body.kind == "sold" ? "total_number_of_books_bought" : req.body.kind;

  API.getAllBooks((books) => {
    _.sortBy(books, function (x, callback) {
      if(order == 0)
        callback(null, (x[kind]));
      else
        callback(null, (x[kind])*-1);
    }, function (err, result) {
        res.render('admin/listbooks.ejs', {path: 'admin', title: 'Admin Dashboard', books: result, order: order, kind: kind})
    });
  })
});

router.post('/admin/add/', Admin.ensureAdminCheck, function (req, res, next) {
  console.log(req.body)
  const title = req.body.title || "no title available";
  const desc = req.body.descBook || "no desc available";
  const price = req.body.price || 0;
  const author = req.body.author || "no author found";
  const bookid = req.body.bookid || "";
  const edition = req.body.edition || "";
  const publisher = req.body.publisher || "";
  const isbn = req.body.isbn || "";
  const noofbooks = req.body.noofbooks || 1;
  const mime = req.files[0] ? req.files[0].mimetype.split('/')[1] : 'png';
  const filename = req.files.length ? "/images/" + req.files[0].filename : '/images/defaultImage';
  const newcategory = (req.body.newcategorybook && req.body.newcategorybook.length) > 0 ? req.body.newcategorybook : "";
  const category = newcategory.length > 0 ? newcategory : req.body.category;

  if (newcategory) {
    API.saveCategoryToDB({ category: newcategory }, (catob) => {})
  }

  const updateBookDetails = {
    title: title,
    desc: desc,
    price: price,
    author: author,
    edition: edition,
    publisher: publisher,
    isbn: isbn,
    image_path: filename,
    category: category,
    no_of_views: 0,
    fav_count: 0,
    total_number_of_books_bought: 0,
    total_number_of_books: noofbooks
  };

  API.saveBookToDB(updateBookDetails, (updatedBook) => {
    if (updatedBook) {
      res.redirect('/admin/listbooks');
    }
  })
});

router.post('/admin/delete', Admin.ensureAdminCheck, function (req, res, next) {
  const bookid = req.body.bookid;
  if (bookid) {
    API.removeBook(bookid, (book) => {
      if (book)
        res.redirect('/admin/listbooks')
    })
  }
});

router.post('/admin/edit/', Admin.ensureAdminCheck, function (req, res, next) {
  const title = req.body.title || "no title available";
  const desc = req.body.descBook || "no desc available";
  const price = req.body.price || 0;
  const author = req.body.author || "no author found";
  const edition = req.body.edition || "null";
  const isbn = req.body.isbn || "null";
  const publisher = req.body.publisher || "";
  const bookid = req.body.bookid;
  const noofbooks = req.body.noofbooks;
  const newcategory = (req.body.newcategorybook && req.body.newcategorybook.length) > 0 ? req.body.newcategorybook : "";
  const category = newcategory.length > 0 ? newcategory : req.body.category;
  const mime = req.files[0] ? req.files[0].mimetype.split('/')[1] : 'png';
  var currentBook = {};

  if (newcategory) {
    API.saveCategoryToDB({ category: newcategory }, (catob) => {})
  }
  
  API.getBookById(bookid, (err, book) => {
    if (book) {
      currentBook = book;
      const filename = req.files.length ? "/images/" + req.files[0].filename : (currentBook.image_path ? currentBook.image_path : '/images/defaultImage');

      const updateBookDetails = {
        title: title,
        desc: desc,
        price: price,
        author: author,
        isbn: isbn,
        edition: edition,
        publisher: publisher,
        category: category,
        image_path: filename,
        total_number_of_books: noofbooks

      };
      API.updateBook(bookid, updateBookDetails, (updatedBook) => {
        res.render('admin/showbook.ejs', { title: 'Book Store', path: 'admin', book: updatedBook });
      })
    }
  })
});

module.exports = router;
