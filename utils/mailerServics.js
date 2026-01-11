const nodemailer = require("nodemailer");

// Transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muskanyadav92163@gmail.com", // email
    pass: "sdphbudsmjvrietb", // app password
  },
});

// Send OTP Email
const sendOtpEmail = async (toEmail, otp, name = "User") => {
  await transporter.sendMail({
    from: `"Support Team" <${"muskanyadav92163@gmail.com"}>`,
    to: toEmail,
    subject: "Welcome to RealCinema – Verify Your OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color:#e50914;">Welcome to RealCinema 🎬</h2>

        <p>Hi <b>${name}</b>,</p>

        <p>We're happy to have you with us!  
        Please use the OTP below to verify your request:</p>

        <div style="
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #000;
          background: #f4f4f4;
          padding: 15px;
          width: fit-content;
        ">
          ${otp}
        </div>

        <p style="margin-top: 20px;">
          This OTP is valid for <b>10 minutes</b>.
        </p>

        <p class="small-text">
          If you did not request this, please ignore this email.
        </p>

        <br>
        <p>Thanks,<br><b>RealCinema Team 🎬</b></p>
      </div>
    `,
  });
};

// Generate OTP
const generateOtp = (length) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

module.exports = {
  sendOtpEmail,
  generateOtp,
};