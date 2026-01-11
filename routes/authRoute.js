const express = require("express");
const router = express.Router();

// auth controller
const { landingPage,index, registerPage, registerUser, loginPage, loginUser, logoutUser, changePasswordPage, changePassword, profilePage, updateProfile, forgotPasswordPage, forgotPassword ,verifyOtpPage, verifyOtp,resetPasswordPage, resetPassword } = require("../controllers/authController");


// booking controller
const { bookingPage, bookTicket, myBookings, deleteBooking } = require("../controllers/bookingController");

// movies controller
const { listMovies, getMovieDetails } = require("../controllers/movieController");

// shows controller
const { listShows } = require("../controllers/showController");

// theaters controller
const { listTheaters } = require("../controllers/theaterController");

// screens controller
const { listScreens } = require("../controllers/screenController");

// reviews controller
const { reviewsPage, addReview } = require("../controllers/reviewController");

// auth middleware
const authMiddleware = require("../middlewares/authMiddleware");


// ROOT LANDING PAGE
router.get("/", landingPage);

// PROTECTED HOME
router.get("/home", authMiddleware, index);

// register
router.get("/register", registerPage);
router.post("/register", registerUser);

// LOGIN
router.get("/login", loginPage);
router.post("/login", loginUser);

// LOGOUT
router.get("/logout", logoutUser);

// change password
router.get("/changePassword", authMiddleware, changePasswordPage);
router.post("/changePassword", authMiddleware, changePassword);

// Forgot Password
router.get("/forgot-password", forgotPasswordPage);
router.post("/forgot-password", forgotPassword);
router.get("/verify-otp", verifyOtpPage);
router.post("/verify-otp", verifyOtp);
router.get("/reset-password", resetPasswordPage);
router.post("/reset-password", resetPassword);

// booking page
router.get("/booking/:showId", authMiddleware, bookingPage);
router.post("/booking", authMiddleware, bookTicket);

// my bookings
router.get("/my-bookings", authMiddleware, myBookings);
router.post("/delete-booking", authMiddleware, deleteBooking);

// profile
router.get("/profile", authMiddleware, profilePage);
router.post("/update-profile", authMiddleware, updateProfile);

// Movies
router.get("/movies", authMiddleware, listMovies);
router.get("/movie/:id", authMiddleware, getMovieDetails);

// Shows
router.get("/shows", authMiddleware, listShows);

// Theaters
router.get("/theaters", authMiddleware, listTheaters);

// Reviews
router.get("/reviews", authMiddleware, reviewsPage);
router.post("/reviews", authMiddleware, addReview);

// Screens
router.get("/screens", authMiddleware, listScreens);

module.exports = router;
