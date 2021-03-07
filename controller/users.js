const User = require('../models/user');

module.exports.registerForm= (req, res) => {
    res.render('users/register');
};

module.exports.registerNewUser= async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;
        const user = new User({
            email,
            username
        });
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the campground');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.loginForm= (req, res) => {
    res.render('users/login');
};

module.exports.login= (req, res) => {
    req.flash('success', 'You are logged in');
    const redirectUrl= req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
};

module.exports.logout= (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/campgrounds');
};