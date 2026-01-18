const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    },
    resetOtp: {
        type: String,
        default: null,
    },
    resetOtpExpiry: {
        type: Date,
        default: null,
    }

});

const Customer = mongoose.model("Customer", userSchema);

module.exports = Customer;
