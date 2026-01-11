// auth middleware
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next(); 
    }
    return res.redirect("/login"); 
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
