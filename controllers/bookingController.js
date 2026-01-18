const Show = require("../models/show");
const Ticket = require("../models/ticket");
const Customer = require("../models/customer");
const Movie = require("../models/movie");
const Theater = require("../models/theater");
const Screen = require("../models/screen");

const { sendBookingEmail } = require("../utils/mailerServics");

// =======================
// BOOKING PAGE
// =======================
const bookingPage = async (req, res) => {
  try {
    const id = req.params.showId;
    const customer = await Customer.findById(req.user);
    const theaters = await Theater.find();
    const screens = await Screen.find();

    let show = null;
    let movie = null;

    try {
      show = await Show.findById(id).populate("movieId theaterId screenId");
      if (show) movie = show.movieId;
    } catch {}

    if (!movie) {
      try {
        movie = await Movie.findById(id);
      } catch {}
    }

    if (!show && movie) {
      show = await Show.findOne({ movieId: movie._id }).populate("theaterId screenId");
    }

    if (!movie) return res.redirect("/");

    res.render("pages/booking", {
      show,
      movie,
      theater: show ? show.theaterId : null,
      screen: show ? show.screenId : null,
      user: customer,
      theaters,
      screens
    });
  } catch (error) {
    console.log("Booking Page Error:", error);
    res.redirect("/");
  }
};

// =======================
// BOOK TICKET + SEND EMAIL
// =======================
const bookTicket = async (req, res) => {
  try {
    const {
      showId,
      movieId,
      seats,
      seatNumber,
      theaterId,
      screenId,
      date,
      time
    } = req.body;

    const customerId = req.user._id; // ✅ FIXED
    const seatCount = parseInt(seats, 10);

    if (!seatCount || seatCount <= 0) {
      throw new Error("Invalid seat count");
    }

    let movieTitle = "";
    let poster = "";
    let theaterName = "";
    let screenName = "";
    let bookingDate = "";
    let showTime = "";
    let pricePerSeat = 100;

    // 🎬 FROM SHOW
    if (showId && showId !== "manual") {
      const show = await Show.findById(showId)
        .populate("movieId theaterId screenId");

      if (!show) throw new Error("Show not found");

      movieTitle = show.movieId.title;
      poster = show.movieId.image;
      theaterName = show.theaterId.name;
      screenName = show.screenId.name;
      bookingDate = new Date(show.showTime).toLocaleDateString();
      showTime = new Date(show.showTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      pricePerSeat = show.price || show.movieId.price || 100;
    }
    // 📝 MANUAL BOOKING
    else {
      const movie = await Movie.findById(movieId);
      const theater = await Theater.findById(theaterId);
      const screen = await Screen.findById(screenId);

      if (!movie || !theater || !screen) {
        throw new Error("Invalid booking data");
      }

      movieTitle = movie.title;
      poster = movie.image;
      theaterName = theater.name;
      screenName = screen.name;
      bookingDate = date || new Date().toLocaleDateString();
      showTime = time || "N/A";
      pricePerSeat = movie.price || 100;
    }

    const totalPrice = pricePerSeat * seatCount;

    // 🎟️ SAVE TICKET
    await Ticket.create({
      movieId,
      theaterId,
      screenId,
      showId: showId !== "manual" ? showId : null,
      seats: seatCount,
      seatNumber,
      bookingDate,
      movieTitle,
      poster,
      theaterName,
      screenName,
      customerId,
      price: totalPrice
    });

    // 📧 SEND EMAIL (IMPORTANT PART)
    const customer = await Customer.findById(customerId);

    console.log("📧 Sending booking email to:", customer.email);

    await sendBookingEmail(customer.email, {
      name: customer.name,
      movieName: movieTitle,
      showDate: bookingDate,
      showTime: showTime,
      seats: seatNumber || seatCount,
      price: totalPrice
    });

    console.log("✅ Booking email sent");

    res.redirect("/my-bookings");

  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).send("Booking failed");
  }
};

// =======================
// MY BOOKINGS
// =======================
const myBookings = async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user });
    res.render("pages/myBookings", { tickets });
  } catch (error) {
    console.error("Booking controller error:", error);
    res.status(500).send("Server Error: " + error.message);
  }
};

// =======================
// DELETE BOOKING
// =======================
const deleteBooking = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.body.ticketId);
    res.redirect("/my-bookings");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  bookingPage,
  bookTicket,
  myBookings,
  deleteBooking
};
