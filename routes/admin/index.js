var API = require('./../../models/dbapis');

module.exports = {
    ensureAdmin: (req, res, next)=> {
        const username = req.body.username;
        const password = req.body.password;
        API.getAdmin({email: username, password: password, isAdmin: true}, (d) => {
            if(d){
                req.session.isAdmin = true;
                return next();
            } else {
                req.session.isAdmin = false;
                res.redirect('/admin');
            }
        })
  },
  ensureAdminCheck: (req, res, next)=> {
        if(req.session.isAdmin){
            req.session.isAdmin = true;
            return next();
        } else {
            req.session.isAdmin = false;
            res.redirect('/admin');
        }
    }
}