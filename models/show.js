const mongoose = require("mongoose");

const showSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater",
        required: true
    },
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screen",
        required: true
    },
    showTime: {
        type: Date,
        required: true
    },
    seats: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Show", showSchema);
