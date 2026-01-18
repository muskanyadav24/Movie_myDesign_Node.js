const express = require("express");
const router = express.Router();

// auth controller
const {landingPage,index,registerPage,registerUser,loginPage,loginUser,logoutUser,changePasswordPage,changePassword,profilePage,updateProfile,forgotPasswordPage,forgotPassword,verifyOtpPage,verifyOtp,resetPasswordPage,resetPassword
} = require("../controllers/authController");

// booking controller
const {bookingPage,bookTicket,myBookings,deleteBooking } = require("../controllers/bookingController");

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

// AUTH MIDDLEWARE (Passport)
const authMiddleware = require("../middlewares/authMiddleware");

// LANDING PAGE (Public)
router.get("/", landingPage);

// AUTH PAGES (Public)
router.get("/register", registerPage);
router.post("/register", registerUser);

router.get("/login", loginPage);
router.post("/login", loginUser);

router.get("/logout", logoutUser);

// PASSWORD RECOVERY (Public)
router.get("/forgot-password", forgotPasswordPage);
router.post("/forgot-password", forgotPassword);

router.get("/verify-otp", verifyOtpPage);
router.post("/verify-otp", verifyOtp);

router.get("/reset-password", resetPasswordPage);
router.post("/reset-password", resetPassword);

// PROTECTED ROUTES
// HOME
router.get("/home", authMiddleware, index);

// CHANGE PASSWORD
router.get("/changePassword", authMiddleware, changePasswordPage);
router.post("/changePassword", authMiddleware, changePassword);

// PROFILE
router.get("/profile", authMiddleware, profilePage);
router.post("/update-profile", authMiddleware, updateProfile);

// BOOKINGS
router.get("/booking/:showId", authMiddleware, bookingPage);
router.post("/booking", authMiddleware, bookTicket);

router.get("/my-bookings", authMiddleware, myBookings);
router.post("/delete-booking", authMiddleware, deleteBooking);

// MOVIES
router.get("/movies", authMiddleware, listMovies);
router.get("/movie/:id", authMiddleware, getMovieDetails);

// SHOWS
router.get("/shows", authMiddleware, listShows);

// THEATERS
router.get("/theaters", authMiddleware, listTheaters);

// SCREENS
router.get("/screens", authMiddleware, listScreens);

// REVIEWS
router.get("/reviews", authMiddleware, reviewsPage);
router.post("/reviews", authMiddleware, addReview);

module.exports = router;