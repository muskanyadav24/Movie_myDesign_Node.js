const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater",
    },
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screen",
    },
    showId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Show",
    },
    seats: {
        type: Number,
        required: true
    },
    seatNumber: {
        type: String,
    },
    bookingDate: {
        type: String, // Storing as string for simplicity
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    theaterName: {
        type: String,
    },
    screenName: {
        type: String,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    }
});

module.exports = mongoose.model("Ticket", ticketSchema);
