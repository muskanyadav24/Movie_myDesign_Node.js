// auth middleware
const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = authMiddleware;



// const authMiddleware = (req, res, next) => {

//     if (req.session.user) {
//         req.user = req.session.user;
//         next();
//     } else {
//         res.redirect("/login");
//     }
// };

// module.exports = authMiddleware;
