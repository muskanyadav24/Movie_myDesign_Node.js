const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Customer = require("../models/customer");

passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            const user = await Customer.findOne({ email });
            if (!user) {
                return done(null, false, { message: "Invalid email" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Invalid password" });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Customer.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
