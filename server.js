const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ejs = require("ejs");
const authRoute = require("./routes/authRoute");
const connectDB = require("./db/movieDB");

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

app.use((req, res, next) => {
    if (req.session) {
        req.user = req.session.user || null;
        res.locals.userRole = req.session.role || null;
    } else {
        req.user = null;
        res.locals.userRole = null;
    }
    next();
});

app.get("/test-error", (req, res) => {
    throw new Error("Test Error Success");
});

app.use("/", authRoute);

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.stack);
    res.status(500).send("Global Server Error: " + err.message);
});

app.listen(8000, () => {
    console.log("Server started on http://localhost:8000");
});
