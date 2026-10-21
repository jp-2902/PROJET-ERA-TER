const mongoose =
  require("mongoose");

const readline =
  require("readline");

require("dotenv").config();

const User =
  require("../models/User");

// ============================================================
// READLINE
// ============================================================

const rl =
  readline.createInterface({
    input:
      process.stdin,

    output:
      process.stdout,
  });

// ============================================================
// QUESTION HELPER
// ============================================================

const askQuestion =
  (question) =>
    new Promise(
      (resolve) => {
        rl.question(
          question,
          (answer) => {
            resolve(
              answer.trim()
            );
          }
        );
      }
    );

// ============================================================
// MAIN
// ============================================================

async function promoteAdmin() {
  try {
    // ========================================================
    // DATABASE CONNECTION
    // ========================================================

    if (
      !process.env.MONGO_URI
    ) {
      throw new Error(
        "MONGO_URI is missing from your .env file."
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "\nMongoDB connected."
    );

    // ========================================================
    // ASK EMAIL
    // ========================================================

    const email =
      await askQuestion(
        "\nEnter the email of the account to promote to admin: "
      );

    if (!email) {
      throw new Error(
        "Email is required."
      );
    }

    // ========================================================
    // FIND USER
    // ========================================================

    const user =
      await User.findOne({
        email:
          email
            .toLowerCase()
            .trim(),
      });

    if (!user) {
      console.log(
        "\nNo account found with this email."
      );

      return;
    }

    // ========================================================
    // ALREADY ADMIN
    // ========================================================

    if (
      user.role ===
      "admin"
    ) {
      console.log(
        "\nThis account is already an administrator."
      );

      console.log(
        `Email: ${user.email}`
      );

      return;
    }

    // ========================================================
    // CONFIRM
    // ========================================================

    console.log(
      "\nAccount found:"
    );

    console.log(
      `Name: ${user.firstName} ${user.lastName}`
    );

    console.log(
      `Email: ${user.email}`
    );

    console.log(
      `Current role: ${user.role}`
    );

    const confirmation =
      await askQuestion(
        "\nPromote this account to administrator? (yes/no): "
      );

    if (
      confirmation.toLowerCase() !==
        "yes" &&
      confirmation.toLowerCase() !==
        "y"
    ) {
      console.log(
        "\nOperation cancelled."
      );

      return;
    }

    // ========================================================
    // PROMOTE USER
    // ========================================================

    user.role =
      "admin";

    user.isActive =
      true;

    await user.save();

    // ========================================================
    // SUCCESS
    // ========================================================

    console.log(
      "\n======================================"
    );

    console.log(
      "ADMIN ACCOUNT CREATED SUCCESSFULLY"
    );

    console.log(
      "======================================"
    );

    console.log(
      `Name: ${user.firstName} ${user.lastName}`
    );

    console.log(
      `Email: ${user.email}`
    );

    console.log(
      `Role: ${user.role}`
    );

    console.log(
      `Active: ${user.isActive}`
    );

    console.log(
      "\nYou can now use this account as the Messina Gallery administrator."
    );
  } catch (error) {
    console.error(
      "\nADMIN PROMOTION ERROR:"
    );

    console.error(
      error.message
    );
  } finally {
    // ========================================================
    // CLOSE
    // ========================================================

    rl.close();

    await mongoose.disconnect();

    process.exit(0);
  }
}

// ============================================================
// START
// ============================================================

promoteAdmin();