const nodemailer =require("nodemailer")
require('dotenv').config()

export const GET = async (request, { params }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreply4313@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
      from: "noreply4313@gmail.com",
      to: "jesseogunlaja@gmail.com",
      subject: "Task Tracker: Verification Code",
      text: `Verification Code: ${12345678}`
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return new Response(`${error}`, { status: 500 });
      } else {
        return new Response(JSON.stringify({ message: "Message sent succesfully"}), { status: 200})
      }
    });
};
