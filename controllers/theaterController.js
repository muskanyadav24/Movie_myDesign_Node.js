const Theater = require("../models/theater");

const listTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find();
        res.render("pages/theaters", { theaters });
    } catch (error) {
        console.error("Theaters error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const addTheaterPage = (req, res) => {
    res.render("pages/addTheater");
};

const addTheater = async (req, res) => {
    try {
        const { name, location, theaterSeats } = req.body;
        await Theater.create({
            name,
            location,
            theaterSeats
        });
        res.redirect("/theaters");
    } catch (error) {
        console.log("Add Theater Error:", error);
        res.render("pages/addTheater", { error: "Failed to add theater" });
    }
};

const editTheaterPage = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        res.render("pages/editTheater", { theater });
    } catch (error) {
        console.error("Theaters error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const updateTheater = async (req, res) => {
    try {
        const { name, location, theaterSeats } = req.body;
        await Theater.findByIdAndUpdate(req.params.id, {
            name,
            location,
            theaterSeats
        });
        res.redirect("/theaters");
    } catch (error) {
        console.error("Theaters error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const deleteTheater = async (req, res) => {
    try {
        await Theater.findByIdAndDelete(req.body.id);
        res.redirect("/theaters");
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    listTheaters,
    addTheaterPage,
    addTheater,
    editTheaterPage,
    updateTheater,
    deleteTheater
};
