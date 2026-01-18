
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");

const authRoute = require("./routes/authRoute");
const connectDB = require("./db/movieDB");
const passport = require("./config/passport");

const app = express();

connectDB();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoute);

app.listen(8001, () => {
    console.log("Server started on http://localhost:8001");
});
