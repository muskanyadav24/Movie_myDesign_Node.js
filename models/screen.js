const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater",
        required: true
    },
    seats: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Screen", screenSchema);