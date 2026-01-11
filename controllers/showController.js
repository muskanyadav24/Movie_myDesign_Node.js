const Show = require("../models/show");
const Movie = require("../models/movie");
const Theater = require("../models/theater");
const Screen = require("../models/screen");

const listShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate("movieId")
            .populate("theaterId")
            .populate("screenId");
        res.render("pages/shows", { shows });
    } catch (error) {
        console.error("Shows error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const addShowPage = async (req, res) => {
    try {
        const movies = await Movie.find();
        const theaters = await Theater.find();
        const screens = await Screen.find();

        res.render("pages/addShow", { movies, theaters, screens });
    } catch (error) {
        console.error("Shows error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const addShow = async (req, res) => {
    try {
        const { movieId, theaterId, screenId, showTime, seats } = req.body;

        await Show.create({
            movieId,
            theaterId,
            screenId,
            showTime,
            seats
        });

        res.redirect("/shows");
    } catch (error) {
        console.log("Add Show Error:", error);
        res.status(500).send("Server Error - Failed to add show");
    }
};

module.exports = {
    listShows,
    addShowPage,
    addShow
};
