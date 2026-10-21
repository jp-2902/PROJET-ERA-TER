const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Messina Gallery" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error.message);
    return null;
  }
};

const sendWelcomeEmail = async (userEmail, firstName = "") => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #10233D;">
      <h2 style="color: #168BE8;">Messina Gallery</h2>

      <p>Hello${firstName ? ` ${firstName}` : ""},</p>

      <p>
        Welcome to <strong>Messina Gallery</strong>.
      </p>

      <div style="background: #F1F7FC; padding: 20px; border-left: 4px solid #168BE8; margin: 20px 0;">
        <strong style="color: #168BE8;">
          Account created successfully
        </strong>

        <br><br>

        Your account has been successfully created.
      </div>

      <p>
        You can now discover artworks, artists and collections.
      </p>

      <p>
        Best regards,<br>
        <strong>The Messina Gallery Team</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #DCE9F3; margin: 30px 0;">

      <p style="font-size: 11px; color: #8A96A2; text-align: center;">
        © ${new Date().getFullYear()} Messina Gallery
      </p>
    </div>
  `;

  return sendEmail(
    userEmail,
    "Welcome to Messina Gallery",
    html
  );
};

const sendLoginEmail = async (userEmail, firstName = "") => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #10233D;">
      <h2 style="color: #168BE8;">Messina Gallery</h2>

      <p>Hello${firstName ? ` ${firstName}` : ""},</p>

      <p>
        A new login to your
        <strong>Messina Gallery</strong>
        account has been detected.
      </p>

      <div style="background: #F1F7FC; padding: 20px; border-left: 4px solid #168BE8; margin: 20px 0;">
        <strong style="color: #168BE8;">
          Successful login
        </strong>

        <br><br>

        Someone has just logged in to your account.
      </div>

      <p>
        If this was you, no action is required.
      </p>

      <p>
        If you do not recognize this login,
        we recommend changing your password immediately.
      </p>

      <p>
        Best regards,<br>
        <strong>The Messina Gallery Team</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #DCE9F3; margin: 30px 0;">

      <p style="font-size: 11px; color: #8A96A2; text-align: center;">
        © ${new Date().getFullYear()} Messina Gallery
      </p>
    </div>
  `;

  return sendEmail(
    userEmail,
    "New login detected - Messina Gallery",
    html
  );
};

const sendAccountUpdatedEmail = async (userEmail, firstName = "") => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #10233D;">
      <h2 style="color: #168BE8;">Messina Gallery</h2>

      <p>Hello${firstName ? ` ${firstName}` : ""},</p>

      <p>
        Your <strong>Messina Gallery</strong>
        account information has been updated.
      </p>

      <div style="background: #F1F7FC; padding: 20px; border-left: 4px solid #168BE8; margin: 20px 0;">
        <strong style="color: #168BE8;">
          Account updated
        </strong>

        <br><br>

        Your account information has been successfully modified.
      </div>

      <p>
        If you made this change, no action is required.
      </p>

      <p>
        If you did not make this change,
        please secure your account.
      </p>

      <p>
        Best regards,<br>
        <strong>The Messina Gallery Team</strong>
      </p>
    </div>
  `;

  return sendEmail(
    userEmail,
    "Your Messina Gallery account has been updated",
    html
  );
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendLoginEmail,
  sendAccountUpdatedEmail,
};
