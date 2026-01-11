const Show = require("../models/show");
const Ticket = require("../models/ticket");
const Customer = require("../models/customer");
const Movie = require("../models/movie");
const Theater = require("../models/theater");
const Screen = require("../models/screen");

const bookingPage = async (req, res) => {
    try {
        const id = req.params.showId;
        const customer = await Customer.findById(req.user);
        const theaters = await Theater.find();
        const screens = await Screen.find();

        let show = null;
        let movie = null;

        // Try as Show ID
        try {
            show = await Show.findById(id).populate("movieId theaterId screenId");
            if (show) movie = show.movieId;
        } catch (e) { }

        // If not a show, maybe it's a Movie ID
        if (!movie) {
            try {
                movie = await Movie.findById(id);
            } catch (e) { }
        }

        // Pre-select first show if it exists for this movie
        if (!show && movie) {
            show = await Show.findOne({ movieId: movie._id }).populate("theaterId screenId");
        }

        if (!movie) {
            return res.redirect("/");
        }

        res.render("pages/booking", {
            show,
            movie,
            theater: show ? show.theaterId : null,
            screen: show ? show.screenId : null,
            user: customer,
            theaters,
            screens
        });
    } catch (error) {
        console.log("Booking Page Error:", error);
        res.redirect("/");
    }
};

const bookTicket = async (req, res) => {
    try {
        const { showId, movieId, seats, seatNumber, theaterId, screenId, date, time } = req.body;
        const customerId = req.user;

        let movieTitle, poster, theaterName, screenName, bookingDate;

        if (showId && showId !== "manual") {
            const show = await Show.findById(showId).populate("movieId theaterId screenId");
            movieTitle = show.movieId.title;
            poster = show.movieId.image;
            theaterName = show.theaterId.name;
            screenName = show.screenId.name;
            bookingDate = new Date(show.showTime).toLocaleDateString();
        } else {
            // Manual entry fallback
            const movie = await Movie.findById(movieId);
            const theater = await Theater.findById(theaterId);
            const screen = await Screen.findById(screenId);

            movieTitle = movie.title;
            poster = movie.image;
            theaterName = theater.name;
            screenName = screen.name;
            bookingDate = date || new Date().toLocaleDateString();
        }

        await Ticket.create({
            movieId: movieId || null,
            theaterId: theaterId || null,
            screenId: screenId || null,
            showId: (showId && showId !== "manual") ? showId : null,
            seats,
            seatNumber,
            bookingDate,
            movieTitle,
            poster,
            theaterName,
            screenName,
            customerId
        });

        res.redirect("/my-bookings");
    } catch (error) {
        console.log("Booking Error:", error);
        res.status(500).send("Server Error - Could not complete booking");
    }
};

const myBookings = async (req, res) => {
    try {
        const tickets = await Ticket.find({ customerId: req.user });
        // We can't populate('movieId') easily if they are not in DB.
        // For this demo, let's just pass the tickets.
        res.render("pages/myBookings", { tickets });
    } catch (error) {
        console.error("Booking controller error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const deleteBooking = async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.body.ticketId);
        res.redirect("/my-bookings");
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    bookingPage,
    bookTicket,
    myBookings,
    deleteBooking
};

