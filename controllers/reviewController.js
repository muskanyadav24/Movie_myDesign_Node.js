const Movie = require("../models/movie");

// TEMP reviews (later DB me daal sakte ho)
let reviews = [];

const reviewsPage = async (req, res) => {
    const movies = await Movie.find();

    res.render("pages/reviews", {
        movies,
        reviews
    });
};

const addReview = (req, res) => {
    const { movieTitle, rating, comment } = req.body;

    reviews.push({
        movieTitle,
        rating: Number(rating),
        comment,
        userName: "Anonymous" // later session user
    });

    res.redirect("/reviews");
};

module.exports = {
    reviewsPage,
    addReview
};
