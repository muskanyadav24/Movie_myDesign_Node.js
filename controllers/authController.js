const Customer = require("../models/customer");
const Movie = require("../models/movie");
const Theater = require("../models/theater");
const Screen = require("../models/screen");
const Show = require("../models/show");
const { sendOtpEmail, generateOtp } = require("../utils/mailerServics");
const bcrypt = require("bcrypt");
const passport = require("passport");

// LANDING PAGE
const landingPage = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res.redirect("/home");
    }

    let moviesList = await Movie.find();
    if (moviesList.length === 0) {
      const initialMoviesData = require("../utils/movieData");
      const cleanMovies = initialMoviesData.map(({ _id, ...rest }) => rest);
      moviesList = await Movie.insertMany(cleanMovies);
    }

    let theaters = await Theater.find();
    if (theaters.length === 0) {
      theaters = await Theater.insertMany([
        { name: "PVR Cinemas", location: "Downtown", theaterSeats: 200 },
        { name: "IMAX", location: "City Center", theaterSeats: 300 }
      ]);
    }

    res.render("landing", {
      movies: moviesList,
      totalMovies: moviesList.length,
      totalShows: 6,
      totalTickets: 120,
      totalCustomers: 45
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

// HOME PAGE
const index = async (req, res) => {
  try {
    const user = req.user;

    const movies = await Movie.find();
    const theaters = await Theater.find();
    const screens = await Screen.find();

    let shows = await Show.find()
      .populate("movieId")
      .populate("theaterId")
      .populate("screenId");

    res.render("index", {
      user,
      movies,
      theaters,
      screens,
      shows,
      totalMovies: movies.length,
      totalShows: shows.length,
      totalTickets: 120,
      totalCustomers: 45,
      topMovie: movies[0]?.title || "N/A",
      topTheater: theaters[0]?.name || "N/A"
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

// LOGIN PAGE
const loginPage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  res.render("pages/login", { error: null });
};

// REGISTER PAGE
const registerPage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  res.render("pages/register", { error: null });
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExist = await Customer.findOne({ email });
    if (userExist) {
      return res.render("pages/register", {
        error: "Email already registered"
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await Customer.create({
      name,
      email,
      password: hashPassword,
      phone
    });

    res.redirect("/login");

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

// LOGIN USER (PASSPORT)
const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);

    if (!user) {
      return res.render("pages/login", {
        error: "Invalid email or password"
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/home");
    });
  })(req, res, next);
};

// LOGOUT
const logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
};

// CHANGE PASSWORD
const changePasswordPage = (req, res) => {
  res.render("pages/changePassword");
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.render("pages/changePassword", {
        error: "Incorrect current password"
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.render("pages/changePassword", {
        error: "Passwords do not match"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.render("pages/changePassword", {
      success: "Password changed successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

// PROFILE
const profilePage = async (req, res) => {
  res.render("pages/profile", { user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = req.user;

    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    res.render("pages/profile", {
      user,
      success: "Profile updated successfully"
    });

  } catch (error) {
    res.render("pages/profile", {
      user: req.user,
      error: "Profile update failed"
    });
  }
};

// FORGOT PASSWORD
const forgotPasswordPage = (req, res) => {
  res.render("pages/forgotPassword");
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await Customer.findOne({ email });
  if (!user) {
    return res.render("pages/forgotPassword", {
      error: "Email not registered"
    });
  }

  const otp = generateOtp(4);
  console.log("OTP:", otp);

  user.resetOtp = otp;
  user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendOtpEmail(user.email, otp);

  res.cookie("resetUser", user._id.toString(), {
    httpOnly: true,
    maxAge: 10 * 60 * 1000
  });

  res.redirect("/verify-otp");
};

// VERIFY OTP
const verifyOtpPage = (req, res) => {
  res.render("pages/verifyOtp", { error: null });
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.cookies.resetUser;

    if (!userId) {
      return res.redirect("/forgot-password");
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.render("pages/verifyOtp", {
        error: "User not found"
      });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.render("pages/verifyOtp", {
        error: "OTP expired"
      });
    }
    if (user.resetOtpExpiry < Date.now()) {
      return res.render("pages/verifyOtp", {
        error: "OTP expired"
      });
    }

    if (user.resetOtp !== otp) {
      return res.render("pages/verifyOtp", {
        error: "Invalid OTP"
      });
    }

    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.redirect("/reset-password");

  } catch (error) {
    console.log("Verify OTP error:", error);
    res.status(500).send("Server Error");
  }
};

// RESET PASSWORD
const resetPasswordPage = (req, res) => {
  res.render("pages/resetPassword", { error: null });
};

const resetPassword = async (req, res) => {
  const { newPassword, confirmNewPassword } = req.body;
  const userId = req.cookies.resetUser;

  if (newPassword !== confirmNewPassword) {
    return res.render("pages/resetPassword", {
      error: "Passwords do not match"
    });
  }

  const user = await Customer.findById(userId);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.clearCookie("resetUser");
  res.redirect("/login");
};

// EXPORTS
module.exports = {landingPage,index,loginPage,registerPage,registerUser,loginUser,logoutUser,changePasswordPage,changePassword,profilePage,updateProfile,forgotPasswordPage,forgotPassword,verifyOtpPage,verifyOtp,resetPasswordPage,resetPassword};