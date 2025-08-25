// index.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let otpStore = {}; 

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'satwiksaxena41@gmail.com', 
      pass: 'nbwthspzcpcvwgci'
    }
  });

  const mailOptions = {
    from: 'satwiksaxena41@gmail.com',
    to: email,
    subject: 'Your One-Time Password (OTP) for ReLoadX',
    text: `Dear user,

You requested a One-Time Password (OTP) to verify your email address for ReLoadX.

Your OTP is: ${otp}

Please enter this code in the app to complete your verification. This OTP is valid for a short time and should not be shared with anyone.

If you did not request this, please ignore this email.

Thank you,
ReLoadX Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Email failed', error: error.toString() });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  console.log("Received email:", normalizedEmail);
  console.log("Received OTP:", otp);
  console.log("Stored OTP:", otpStore[normalizedEmail]);

  if ((otpStore[normalizedEmail] || '').toString().trim() === otp.toString().trim()) {
    delete otpStore[normalizedEmail];
    return res.status(200).json({ message: 'OTP verified!' });
  } else {
    return res.status(200).json({ message: 'Invalid OTP' });
  }
});





console.log("Preparing to start server...");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
