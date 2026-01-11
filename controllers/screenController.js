const Screen = require("../models/screen");
const Theater = require("../models/theater");

const listScreens = async (req, res) => {
    try {
        const screens = await Screen.find().populate("theaterId");
        res.render("pages/screens", { screens });
    } catch (error) {
        console.error("Screens error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const addScreenPage = async (req, res) => {
    try {
        const theaters = await Theater.find();
        res.render("pages/addScreen", { theaters });
    } catch (error) {
        console.error("Screens error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const addScreen = async (req, res) => {
    try {
        const { name, theaterId, seats } = req.body;
        await Screen.create({
            name,
            theaterId,
            seats
        });
        res.redirect("/screens");
    } catch (error) {
        console.log("Add Screen Error:", error);
        const theaters = await Theater.find();
        res.render("pages/addScreen", { theaters, error: "Failed to add screen" });
    }
};

const editScreenPage = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);
        const theaters = await Theater.find();
        res.render("pages/editScreen", { screen, theaters });
    } catch (error) {
        console.error("Screens error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const updateScreen = async (req, res) => {
    try {
        const { name, theaterId, seats } = req.body;
        await Screen.findByIdAndUpdate(req.params.id, {
            name,
            theaterId,
            seats
        });
        res.redirect("/screens");
    } catch (error) {
        console.error("Screens error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const deleteScreen = async (req, res) => {
    try {
        await Screen.findByIdAndDelete(req.body.id);
        res.redirect("/screens");
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

module.exports = { listScreens, addScreenPage, addScreen, editScreenPage, updateScreen, deleteScreen };
