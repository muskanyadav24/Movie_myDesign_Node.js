const Customer = require("../models/customer");
const Movie = require("../models/movie");
const Theater = require("../models/theater");
const Screen = require("../models/screen");
const Show = require("../models/show");
const movies = require("../utils/movieData");
const { sendOtpEmail, generateOtp } = require("../utils/mailerServics");
const bcrypt = require("bcrypt");

const landingPage = async (req, res) => {
    try {
        if (req.session && req.session.user) {
            return res.redirect("/home");
        }
        // Fetch movies from DB
        let moviesList = await Movie.find();

        // Seed Movies if empty
        if (moviesList.length === 0) {
            const initialMoviesData = require("../utils/movieData");
            const cleanMovies = initialMoviesData.map(m => {
                const { _id, ...rest } = m;
                return rest;
            });
            moviesList = await Movie.insertMany(cleanMovies);
        }

        const movies = moviesList;

        // Seed Theaters if empty
        let theaters = await Theater.find();
        if (theaters.length === 0) {
            theaters = await Theater.insertMany([
                { name: "PVR Cinemas", location: "Downtown", theaterSeats: 200 },
                { name: "IMAX", location: "City Center", theaterSeats: 300 }
            ]);
        }

        const totalMovies = movies.length;
        const totalShows = 6;
        const totalTickets = 120;
        const totalCustomers = 45;

        res.render("landing", { movies, totalMovies, totalShows, totalTickets, totalCustomers });

    } catch (error) {
        console.error("Error in landingPage controller:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const index = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        const user = await Customer.findById(req.user);
        if (!user) {
            req.session.destroy();
            return res.redirect("/login");
        }

        // Fetch movies from DB
        let moviesList = await Movie.find();

        // Seed Movies if empty
        if (moviesList.length === 0) {
            const initialMoviesData = require("../utils/movieData");
            const cleanMovies = initialMoviesData.map(m => {
                const { _id, ...rest } = m;
                return rest;
            });
            moviesList = await Movie.insertMany(cleanMovies);
        }

        const movies = moviesList;

        // Seed Theaters if empty
        let theaters = await Theater.find();
        if (theaters.length === 0) {
            theaters = await Theater.insertMany([
                { name: "PVR Cinemas", location: "Downtown", theaterSeats: 200 },
                { name: "IMAX", location: "City Center", theaterSeats: 300 }
            ]);
        }

        // Seed Screens if empty
        let screens = await Screen.find();
        if (screens.length === 0 && theaters.length > 0) {
            // Create screens for the first theater
            screens = await Screen.insertMany([
                { name: "Screen 1", theaterId: theaters[0]._id, seats: 100 },
                { name: "Screen 2", theaterId: theaters[0]._id, seats: 100 }
            ]);
        }

        const totalMovies = movies.length;
        const totalShows = 6;
        const totalTickets = 120;
        const totalCustomers = 45;
        const topMovie = movies.length > 0 ? movies[0].title : "N/A";
        const topTheater = theaters.length > 0 ? theaters[0].name : "N/A";

        // Seed Shows if empty
        let showsList = await Show.find().populate("movieId").populate("theaterId").populate("screenId");
        if (showsList.length === 0 && movies.length > 0 && theaters.length > 0 && screens.length > 0) {
            const today = new Date();
            const newShows = [
                {
                    movieId: movies[0]._id,
                    theaterId: theaters[0]._id,
                    screenId: screens[0]._id,
                    showTime: new Date(new Date().setHours(19, 0, 0)),
                    seats: 100
                }
            ];

            if (theaters.length > 1 && screens.length > 1) {
                newShows.push({
                    movieId: movies[0]._id,
                    theaterId: theaters[1]._id,
                    screenId: screens[1]._id,
                    showTime: new Date(new Date().setHours(21, 30, 0)),
                    seats: 150
                });
            }

            await Show.insertMany(newShows);
            // Re-fetch to populate
            showsList = await Show.find().populate("movieId").populate("theaterId").populate("screenId");
        }

        const shows = showsList;

        res.render("index", { user, movies, totalMovies, totalShows, totalTickets, totalCustomers, shows, topMovie, topTheater });

    } catch (error) {
        console.error("Error in index controller:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

// =======================
// LOGIN PAGE
// =======================
const loginPage = (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect("/home");
    }
    const returnTo = req.query.returnTo || "";
    res.render("pages/login", { returnTo, error: null });
};

// =======================
// REGISTER PAGE
// =======================
const registerPage = (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect("/home");
    }
    const returnTo = req.query.returnTo || "";
    res.render("pages/register", { returnTo, error: null });
};

// =======================
// REGISTER USER
// =======================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExist = await Customer.findOne({ email });
        const returnToVal = req.body.returnTo || "";

        if (userExist) {
            return res.render("pages/register", {
                error: "Email already registered",
                returnTo: returnToVal
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await Customer.create({
            name,
            email,
            password: hashPassword,
            phone
        });

        const returnTo = req.body.returnTo || "";
        res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res) => {
    try {
        const { email, password, returnTo } = req.body;
        console.log("Login attempt for:", email);

        if (!email || !password) {
            return res.render("pages/login", {
                error: "Email and password are required",
                returnTo: returnTo || ""
            });
        }

        const user = await Customer.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.render("pages/login", {
                error: "Invalid credentials",
                returnTo: returnTo || ""
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.render("pages/login", {
                error: "Invalid credentials",
                returnTo: returnTo || ""
            });
        }
        console.log("Login successful, redirecting...");

        req.session.user = user._id;
        req.session.role = user.role;

        if (returnTo) {
            return res.redirect(returnTo);
        }

        // Redirect to home page
        res.redirect("/home");

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

// =======================
// LOGOUT
// =======================
const logoutUser = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

const changePasswordPage = (req, res) => {
    res.render("pages/changePassword");
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user;

        const user = await Customer.findById(userId);

        // 1. Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.render("pages/changePassword", {
                error: "Incorrect current password"
            });
        }

        // 2. Check if new password and confirm password match
        if (newPassword !== confirmNewPassword) {
            return res.render("pages/changePassword", {
                error: "New password and Confirm password do not match"
            });
        }

        // 3. Update password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        res.render("pages/changePassword", {
            success: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

const profilePage = async (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }

    const user = await Customer.findById(req.user);
    res.render("pages/profile", { user });

    // try {
    //     const user = await Customer.findById(req.user);

    //     res.render("pages/profile", { user });
    //   } catch (error) {
    //     console.log(error);
    //     res.status(500).send("Server Error");
    //   }

};

// const userId = req.cookies.userid;
//   if (!userId) return res.redirect("/login");

//   const user = await User.findById(userId);
//   res.render("pages/profile", { user });


const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.user;

        const user = await Customer.findById(userId);

        user.name = name;
        user.email = email;
        user.phone = phone;

        await user.save();

        res.render("pages/profile", {
            user,
            success: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Update profile error:", error);
        const user = await Customer.findById(req.user);
        res.render("pages/profile", {
            user,
            error: "Failed to update profile: " + error.message
        });
    }
};

const forgotPasswordPage = (req, res) => {
    res.render("pages/forgotPassword");
};


const forgotPassword = async (req, res) => {

  const {email} = req.body;

  const user = await Customer.findOne({ email });
  if (!user) {
    return res.render("pages/forgotPassword", {
      error: "Email not registered",
    });
  }

  const otp = generateOtp(4);
  console.log("OTP : ", otp);

  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  await sendOtpEmail(user.email, otp);

  res.cookie("resetUser", user._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 60 * 1000),
  });

  res.redirect("/verify-otp");
};

const verifyOtpPage = (req, res) => {
  res.render("pages/verifyOtp", {
    error: null
  });
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.cookies.resetUser;

  if (!userId) {
    return res.redirect("/forgot-password");
  }

  const user = await Customer.findById(userId);

  if (!user || !user.resetOtp || !user.resetOtpExpiry) {
    return res.render("pages/verifyOtp", {
      error: "OTP expired",
    });
  }

  // OTP expiry check
  const now = new Date();

  if (user.resetOtpExpiry < now) {
    return res.render("pages/verifyOtp", {
      error: "OTP expired",
    });
  }

  // OTP match check
  if (otp !== user.resetOtp) {
    return res.render("pages/verifyOtp", {
      error: "Invalid OTP",
    });
  }

  // Clear OTP
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.redirect("/reset-password");
};

const resetPasswordPage = (req, res) => {
  res.render("pages/resetPassword", {error: null});
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    const userId = req.cookies.resetUser;
    if (!userId) return res.redirect("/forgot-password");

    if (newPassword !== confirmNewPassword) {
      return res.render("pages/resetPassword", {
        error: "Passwords do not match"
      });
    }

    const user = await Customer.findById(userId);
    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;
    await user.save();

    // clear cookie after reset
    res.clearCookie("resetUser");

    res.redirect("/login");

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};


module.exports = {
    landingPage, index, loginPage, registerPage, registerUser, loginUser, logoutUser, changePasswordPage, changePassword, profilePage, updateProfile, forgotPasswordPage, forgotPassword, verifyOtpPage, verifyOtp,resetPasswordPage, resetPassword };
