const Movie = require("../models/movie");
const Review = require("../models/review");

const getMovieDetails = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        // Fetch reviews and populate user details
        const reviews = await Review.find({ movieId: req.params.id }).populate("customerId").sort({ createdAt: -1 });

        res.render("pages/movieDetails", { movie, reviews, user: req.user });
    } catch (error) {
        console.error("Movie controller error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const listMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.render("pages/movies", { movies });
    } catch (error) {
        console.error("Movie controller error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const addMoviePage = (req, res) => {
    res.render("pages/addMovie");
};

const addMovie = async (req, res) => {
    try {
        const { title, year, desc, image } = req.body;

        await Movie.create({
            title,
            year,
            desc,
            image
        });

        res.redirect("/movies");
    } catch (error) {
        console.log(error);
        res.render("pages/addMovie", { error: "Failed to add movie" });
    }
};

const editMoviePage = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        res.render("pages/editMovie", { movie });
    } catch (error) {
        console.error("Movie controller error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const updateMovie = async (req, res) => {
    try {
        const { title, year, desc, image } = req.body;
        await Movie.findByIdAndUpdate(req.params.id, {
            title,
            year,
            desc,
            image
        });
        res.redirect("/movies");
    } catch (error) {
        console.error("Movie controller error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.body.id);
        res.redirect("/movies");
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    listMovies,
    getMovieDetails,
    addMoviePage,
    addMovie,
    editMoviePage,
    updateMovie,
    deleteMovie
};
